// src/jsx-runtime.ts
/// <reference types="vite/client" />

// =============================
// 🔹 TYPES & INTERFACES
// =============================
export type VNodeChild = VNode | string | number | null | undefined | boolean;
export type VNodeChildren = Array<VNode | string | number>;
export const Fragment = Symbol("fragment");

export interface ComponentProps {
  children?: VNodeChildren;
  [prop: string]: any;
}

export type ComponentFunction<P = any> = (props: P & ComponentProps) => VNode;

export interface VNode {
  type: string | ComponentFunction<any> | typeof Fragment;
  props: Record<string, any>;
  children: VNodeChildren;
}

// =============================
// 🔹 STATE MANAGEMENT
// =============================
let currentComponent: ComponentFunction | null = null;
let stateMap = new WeakMap<ComponentFunction, any[]>();
let componentRootMap = new WeakMap<
  ComponentFunction,
  { container: HTMLElement; vnode: VNode }
>();
let stateIndex = 0;

// =============================
// 🔹 PERFORMANCE OPTIMIZATION
// =============================

// --- Object Pooling for VNodes ---
const vnodePool: VNode[] = [];
function getVNodeFromPool(): VNode {
  return vnodePool.pop() || { type: "", props: {}, children: [] };
}
function releaseVNode(vnode: VNode) {
  vnode.type = "";
  vnode.props = {};
  vnode.children = [];
  vnodePool.push(vnode);
}

// --- Event Delegation Map ---
const delegatedEvents = new Map<string, boolean>();

// =============================
// 🔹 HELPERS
// =============================
function flattenAndFilterChildren(children: VNodeChild[]): VNodeChildren {
  const flat = children.flat(Infinity) as any[];
  const filtered: (VNode | string | number)[] = [];
  for (const c of flat) {
    if (c === false || c === null || c === undefined) continue;
    if (typeof c === "boolean") continue;
    filtered.push(c as VNode | string | number);
  }
  return filtered;
}

// =============================
// 🔹 CREATE ELEMENT
// =============================
export function createElement(
  type: string | ComponentFunction<any> | typeof Fragment,
  props: Record<string, any> | null,
  ...children: VNodeChild[]
): VNode {
  const vnode = getVNodeFromPool();
  const finalProps = props ? { ...props } : {};
  const flatChildren = flattenAndFilterChildren(children);
  finalProps.children = flatChildren;

  vnode.type = type;
  vnode.props = finalProps;
  vnode.children = flatChildren;

  return vnode;
}

export function createFragment(
  props: Record<string, any> | null,
  ...children: VNodeChild[]
): VNode {
  return createElement(Fragment, props, ...children);
}

// =============================
// 🔹 DOM RENDERING SYSTEM
// =============================
function setAttributes(element: HTMLElement, props: Record<string, any>): void {
  Object.keys(props).forEach((key) => {
    const value = props[key];
    if (value == null || key === "children") return;

    // --- Event Delegation ---
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      const eventAttr = `data-event-${eventType}`;
      element.setAttribute(eventAttr, "true");

      if (!delegatedEvents.has(eventType)) {
        delegatedEvents.set(eventType, true);
        document.addEventListener(eventType, (e) => {
          let target = e.target as HTMLElement | null;
          while (target) {
            if (target.hasAttribute(eventAttr)) {
              const handler = (props as any)[
                `on${eventType[0].toUpperCase()}${eventType.slice(1)}`
              ];
              if (handler) handler.call(target, e);
              break;
            }
            target = target.parentElement;
          }
        });
      }
      return;
    }

    // --- Class Handling ---
    if (key === "className") {
      element.setAttribute("class", String(value));
      return;
    }

    // --- Style Handling ---
    if (key === "style") {
      if (typeof value === "string") {
        element.setAttribute("style", value);
      } else if (typeof value === "object") {
        const styleString = Object.entries(value)
          .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`)
          .join(";");
        element.setAttribute("style", styleString);
      }
      return;
    }

    // --- Ref Support ---
    if (key === "ref" && typeof value === "function") {
      value(element);
      return;
    }

    // --- Default Case ---
    try {
      (element as any)[key] = value;
    } catch {
      element.setAttribute(key, String(value));
    }
  });
}

export function renderToDOM(
  vnode: VNode | string | number | boolean | null | undefined
): Node {
  if (vnode === null || vnode === undefined || vnode === false)
    return document.createComment("");

  if (typeof vnode === "string" || typeof vnode === "number")
    return document.createTextNode(String(vnode));

  const { type, props, children } = vnode as VNode;

  if (type === Fragment) {
    const fragment = document.createDocumentFragment();
    (children || []).forEach((child) =>
      fragment.appendChild(renderToDOM(child))
    );
    return fragment;
  }

  if (typeof type === "function") {
    const component = type as ComponentFunction<any>;
    const prevComponent = currentComponent;
    const prevStateIndex = stateIndex;
    currentComponent = component;
    stateIndex = 0;

    const renderedVNode = component(props as ComponentProps);

    currentComponent = prevComponent;
    stateIndex = prevStateIndex;

    return renderToDOM(renderedVNode);
  }

  const element = document.createElement(type as string);
  setAttributes(element, props || {});

  (children || []).forEach((child) => {
    element.appendChild(renderToDOM(child));
  });

  return element;
}

// =============================
// 🔹 MOUNT (Batch DOM Updates)
// =============================
export function mount(vnode: VNode, container: HTMLElement): void {
  if (typeof vnode.type === "function") {
    componentRootMap.set(vnode.type as ComponentFunction, { container, vnode });
  }

  const fragment = document.createDocumentFragment();
  fragment.appendChild(renderToDOM(vnode));

  container.innerHTML = "";
  container.appendChild(fragment);
}

// =============================
// 🔹 SIMPLE useState HOOK
// =============================
export function useState<T>(initialValue: T): [() => T, (newValue: T) => void] {
  if (!currentComponent) {
    throw new Error("useState must be called inside a functional component.");
  }

  const component = currentComponent;
  const componentStates = stateMap.get(component) || [];
  stateMap.set(component, componentStates);

  const localIndex = stateIndex++;
  if (componentStates[localIndex] === undefined) {
    componentStates[localIndex] = initialValue;
  }

  const getter = (): T => componentStates[localIndex] as T;

  const setter = (newValue: T) => {
    if (componentStates[localIndex] === newValue) return;
    componentStates[localIndex] = newValue;

    const rootInfo = componentRootMap.get(component);
    if (rootInfo) {
      const newVNode = (component as ComponentFunction<any>)(
        rootInfo.vnode.props || {}
      );
      componentRootMap.set(component, {
        container: rootInfo.container,
        vnode: newVNode,
      });
      mount(newVNode, rootInfo.container);
    }
  };

  return [getter, setter];
}
