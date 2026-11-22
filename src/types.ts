export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  description: string;
  categoryId: number;
  categoryName: string;
  publisherId: number;
  publisherName: string;
  price: number;
  originalPrice: number;
  stockQuantity: number;
  coverImage: string;
  pageCount: number;
  language: string;
  publicationYear: number;
  rating: number;
  ratingCount: number;
  tentativeDeliveryDate: string;
  isFeatured: boolean;
  isBestSeller: boolean;
}

export interface BookDetail extends Book {
  relatedProducts: Book[];
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  bannerUrl: string;
}

export interface Publisher {
  id: number;
  slug: string;
  name: string;
  country: string;
  logoUrl: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'GUEST' | 'REGISTERED' | 'STORE_ADMIN';
  giftPointsBalance: number;
  giftPointsValue?: number;
}

export interface Address {
  id: number;
  recipientName: string;
  phoneNumber: string;
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'isDefault'>;

export interface CartLine {
  book: Book;
  quantity: number;
  itemTotal: number;
}

export interface Cart {
  items: CartLine[];
  subtotal: number;
  itemCount: number;
}

export interface OrderItem {
  id: number;
  bookId: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
  coverImage: string;
  totalPrice: number;
}

export type OrderStatus = 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: number;
  orderNumber: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotalAmount: number;
  shippingFee: number;
  taxAmount: number;
  giftPointsRedeemed: number;
  giftPointsDiscount: number;
  couponCode?: string;
  couponDiscount: number;
  totalAmount: number;
  status: OrderStatus;
  cancellationDeadline: string;
  isEligibleForCancellation: boolean;
  paymentMethod: string;
  paymentReference: string;
  trackingNumber: string;
  tentativeDeliveryDate: string;
  createdAt: string;
}

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'NET_BANKING' | 'GIFT_WALLET';

export interface CouponResult {
  valid: boolean;
  discountPercentage: number;
  discountAmount: number;
  message: string;
}
