export type Role = 'Customer' | 'Dealer' | 'Admin';
export type DealerStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type Category = 'Purifiers' | 'Dispensers' | 'Pumps' | 'Filters' | 'Spares';
export const CATEGORIES: Category[] = ['Purifiers', 'Dispensers', 'Pumps', 'Filters', 'Spares'];

export interface Address { label: string; line: string; lat: number; lng: number; phone: string }

export interface UserDoc {
  name: string; email: string; phone: string; role: Role; dealerStatus: DealerStatus;
  businessName?: string; gstin?: string; city?: string;
  referralCode: string; referredBy?: string; referralCredits: number;
  addresses?: Address[]; fcmToken?: string; createdAt: number;
}

export interface Product {
  id: string; name: string; brand: string; category: Category; description: string; specs: string[];
  mrp: number; price: number; wholesalePrice: number; minBulkQty: number;
  image: string; images: string[]; stock: number; rating: number; reviews: number; featured: boolean;
}

export interface OrderItem { productId: string; name: string; image: string; qty: number; unitPrice: number }
export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export interface Order {
  id: string; userId: string; userName: string; userEmail: string; userPhone: string; role: 'Customer' | 'Dealer';
  items: OrderItem[]; subtotal: number; discount: number; deliveryFee?: number; total: number;
  address: Address; paymentId: string; paymentStatus: 'paid' | 'pending'; paymentMethod: 'razorpay' | 'cod';
  status: OrderStatus; isBulk: boolean; createdAt: number; updatedAt: number;
}

export type ServiceType = 'Installation' | 'Repair' | 'Filter change' | 'AMC';
export interface ServiceReq {
  id: string; userId: string; userName: string; userEmail: string; userPhone: string;
  type: ServiceType; productName: string; date: string; slot: '10-12' | '12-3' | '3-6';
  address: { line: string; lat: number; lng: number }; notes: string;
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled'; adminNote?: string; createdAt: number; updatedAt: number;
}
