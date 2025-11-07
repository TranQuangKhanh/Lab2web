// src/data-service.ts

// --- Interface cho điểm dữ liệu trên biểu đồ ---
export interface DataPoint {
  id: number;
  category: string;
  value: number;
  timestamp: number; // thời gian dạng epoch ms
}

// Hàm callback cho việc cập nhật dữ liệu
type Subscriber = (data: DataPoint[]) => void;

// --- DataService: tạo mock data, cập nhật realtime, lọc dữ liệu ---
export class DataService {
  private data: DataPoint[] = [];
  private subscribers = new Set<Subscriber>();
  private intervalId: number | null = null;
  private categories: string[] = ["A", "B", "C", "D"];

  constructor(initialCount = 30) {
    this.data = this.generateMockData(initialCount);
  }

  // ✅ Sinh dữ liệu giả lập ban đầu
  generateMockData(n: number): DataPoint[] {
    const now = Date.now();
    const data: DataPoint[] = [];
    for (let i = 0; i < n; i++) {
      const ts = now - (n - i) * 60 * 60 * 1000; // mỗi giờ 1 điểm
      data.push({
        id: ts,
        category: this.categories[i % this.categories.length],
        value: Math.round(20 + Math.random() * 80),
        timestamp: ts,
      });
    }
    this.data = data;
    return data;
  }

  // ✅ Lấy toàn bộ dữ liệu hiện tại
  getAll(): DataPoint[] {
    return [...this.data];
  }

  // ✅ Cho phép component đăng ký theo dõi dữ liệu
  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    fn(this.getAll()); // gửi dữ liệu hiện tại ngay khi subscribe
    return () => {
      this.subscribers.delete(fn);
    };
  }

  // ✅ Gửi thông báo cập nhật đến tất cả subscriber
  private notify() {
    const snapshot = this.getAll();
    for (const s of Array.from(this.subscribers)) {
      try {
        s(snapshot);
      } catch (e) {
        console.warn("DataService subscriber error", e);
      }
    }
  }

  // ✅ Bắt đầu mô phỏng cập nhật realtime
  startRealtime(intervalMs = 2000) {
    if (this.intervalId != null) return;
    this.intervalId = window.setInterval(
      () => this.pushRandomPoint(),
      intervalMs
    );
  }

  // ✅ Dừng cập nhật realtime
  stopRealtime() {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ✅ Thêm 1 điểm ngẫu nhiên mới
  pushRandomPoint() {
    const ts = Date.now();
    const dp: DataPoint = {
      id: ts,
      category:
        this.categories[Math.floor(Math.random() * this.categories.length)],
      value: Math.round(10 + Math.random() * 90),
      timestamp: ts,
    };

    // Giới hạn chiều dài dữ liệu để tránh overflow
    this.data.push(dp);
    if (this.data.length > 200) this.data.shift();

    this.notify();
  }

  // ✅ Lọc theo danh mục
  filterByCategory(category?: string): DataPoint[] {
    if (!category) return this.getAll();
    return this.getAll().filter((d) => d.category === category);
  }

  // ✅ Lọc theo khoảng thời gian
  filterByDateRange(from?: number, to?: number): DataPoint[] {
    let res = this.getAll();
    if (from != null) res = res.filter((d) => d.timestamp >= from);
    if (to != null) res = res.filter((d) => d.timestamp <= to);
    return res;
  }

  // ✅ Lọc kết hợp theo category + thời gian
  query(options?: {
    category?: string;
    from?: number;
    to?: number;
  }): DataPoint[] {
    let res = this.getAll();

    if (options?.category) {
      res = res.filter((d) => d.category === options.category);
    }
    if (options?.from != null) {
      res = res.filter((d) => d.timestamp >= options.from!);
    }
    if (options?.to != null) {
      res = res.filter((d) => d.timestamp <= options.to!);
    }

    return res;
  }
}

// ✅ Tạo sẵn một instance mặc định để dùng trong app
export const defaultDataService = new DataService(40);
