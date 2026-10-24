export type Role = 'Customer' | 'Dealer' | 'Admin';
export type DealerStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type ServiceStatus = 'requested' | 'scheduled' | 'completed' | 'cancelled';

export interface UserDoc {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: Role;
  dealerStatus?: DealerStatus;
  businessName?: string;
  gstin?: string;
  city?: string;
  referralCode?: string;
  referralCredits?: number;
  fcmToken?: string;
  createdAt?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  image?: string;
  qty: number;
  unitPrice: number;
}

export interface OrderDoc {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  role?: 'Customer' | 'Dealer';
  items: OrderItem[];
  subtotal?: number;
  discount?: number;
  total: number;
  address?: { label?: string; line?: string; lat?: number; lng?: number; phone?: string };
  paymentId?: string;
  paymentStatus?: 'paid' | 'pending';
  paymentMethod?: 'razorpay' | 'cod';
  status: OrderStatus;
  isBulk?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface ServiceDoc {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  type?: string;
  productName?: string;
  date?: string;
  slot?: string;
  address?: { line?: string; lat?: number; lng?: number };
  notes?: string;
  status: ServiceStatus;
  adminNote?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface ProductDoc {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  mrp?: number;
  price: number;
  wholesalePrice?: number;
  minBulkQty?: number;
  image?: string;
  stock: number;
}

export type NotifyKind =
  | 'order_placed'
  | 'order_status'
  | 'dealer_decision'
  | 'service_booked'
  | 'service_update';
