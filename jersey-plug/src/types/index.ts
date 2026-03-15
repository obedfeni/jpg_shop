export interface Variant {
  name: string;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image1: string;
  image2?: string;
  image3?: string;
  description?: string;
  category?: string;
  status: 'In Stock' | 'Out of Stock';
  variants: Variant[];
}

export interface OrderItem {
  productId: number;
  productName: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface Order {
  id: number;
  reference: string;
  customerName: string;
  phone: string;
  location: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
  timestamp: string;
  items: OrderItem[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthUser {
  username: string;
  token: string;
}
