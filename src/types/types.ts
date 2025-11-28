export type UserRole = 'user' | 'admin';
export type ProductCategory = 'millets' | 'rice' | 'flour' | 'flakes' | 'sugar' | 'honey' | 'laddus';
export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';
export type OrderType = 'online' | 'instore';

export interface Profile {
  id: string;
  email: string | null;
  nickname: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  role: UserRole;
  points_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  base_price: number;
  product_code: string | null;
  image_url: string | null;
  stock: number;
  weight_per_kg: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  packaging_size: string;
  price: number;
  stock: number;
  weight_kg: number;
  cost_price: number;
  discount_percentage: number;
  created_at: string;
}

export interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  packaging_size?: string;
  product_id?: string;
  variant_id?: string;
  discount_percentage?: number;
  original_price?: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  items: OrderItem[];
  total_amount: number;
  shipping_cost: number;
  gst_rate: number;
  gst_amount: number;
  currency: string;
  status: OrderStatus;
  order_type: OrderType;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_city: string | null;
  customer_state: string | null;
  shipping_address: string | null;
  points_earned: number;
  points_used: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem extends OrderItem {
  product_id: string;
  variant_id: string;
}

export interface ShippingRate {
  id: string;
  store_state: string;
  store_city: string;
  local_rate_min: number;
  local_rate_max: number;
  interstate_rate_min: number;
  interstate_rate_max: number;
  created_at: string;
  updated_at: string;
}

export type VendorStatus = 'active' | 'inactive';
export type TransactionType = 'purchase' | 'payment' | 'return';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'card';
export type ServiceType = 'courier' | 'freight' | 'local_delivery';
export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled';

export interface Vendor {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstin: string | null;
  payment_terms: string;
  status: VendorStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorTransaction {
  id: string;
  vendor_id: string;
  transaction_type: TransactionType;
  amount: number;
  payment_method: PaymentMethod | null;
  reference_number: string | null;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

export interface VendorWithTransactions extends Vendor {
  transactions?: VendorTransaction[];
  total_purchases?: number;
  total_payments?: number;
  balance?: number;
}

export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type QualityCheckStatus = 'pending' | 'passed' | 'failed';

export interface VendorSupplyItem {
  product_id: string;
  product_name: string;
  variant_id?: string;
  packaging_size: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface VendorSupply {
  id: string;
  vendor_id: string;
  supply_date: string;
  invoice_number: string | null;
  items: VendorSupplyItem[];
  total_amount: number;
  payment_status: PaymentStatus;
  payment_date: string | null;
  quality_check_status: QualityCheckStatus;
  quality_notes: string | null;
  delivery_notes: string | null;
  received_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorSupplyWithDetails extends VendorSupply {
  vendor?: Vendor;
  receiver?: Profile;
}

export interface HandlerPayment {
  id: string;
  shipment_id: string;
  handler_id: string;
  order_id: string;
  payment_amount: number;
  payment_date: string | null;
  payment_method: string | null;
  payment_status: PaymentStatus;
  transaction_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HandlerPaymentWithDetails extends HandlerPayment {
  handler?: ShipmentHandler;
  shipment?: Shipment;
  order?: Order;
}

export interface ShipmentHandler {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  service_type: ServiceType;
  coverage_area: string | null;
  status: VendorStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentHandlerTransaction {
  id: string;
  handler_id: string;
  amount: number;
  payment_method: PaymentMethod | null;
  reference_number: string | null;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

export interface ShipmentHandlerWithTransactions extends ShipmentHandler {
  transactions?: ShipmentHandlerTransaction[];
  total_amount?: number;
}

export interface Shipment {
  id: string;
  order_id: string;
  handler_id: string | null;
  tracking_number: string | null;
  status: ShipmentStatus;
  shipped_date: string | null;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  return_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentWithDetails extends Shipment {
  order?: Order;
  handler?: ShipmentHandler;
}

export interface VendorPayment {
  id: string;
  vendor_name: string;
  vendor_contact: string | null;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number: string | null;
  purpose: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HandlerPaymentSummary {
  handler_id: string;
  handler_name: string;
  service_type: string;
  total_payments: number;
  total_amount_paid: number;
  last_payment_date: string | null;
}

export interface VendorPaymentSummary {
  vendor_name: string;
  vendor_contact: string | null;
  total_payments: number;
  total_amount_paid: number;
  last_payment_date: string | null;
}

export type PurchaseOrderStatus = 'ordered' | 'confirmed' | 'shipped' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  product_id: string;
  product_name: string;
  variant_id?: string;
  packaging_size?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  order_date: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  total_amount: number;
  shipping_cost: number;
  notes: string | null;
  ordered_by: string | null;
  vendor_supply_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderWithDetails extends PurchaseOrder {
  vendor?: Vendor;
  ordered_by_profile?: Profile;
  vendor_supply?: VendorSupply;
}

// Wishlist Types
export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  variant_id?: string;
  created_at: string;
}

export interface WishlistWithProduct extends Wishlist {
  product?: Product;
  variant?: ProductVariant;
}

// Product Reviews Types
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: ReviewRating;
  title?: string;
  comment?: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductReviewWithUser extends ProductReview {
  user?: Profile;
}

export interface ReviewVote {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

export interface ProductRating {
  average_rating: number;
  review_count: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Loyalty Points Types
export type LoyaltyTransactionType = 'earned' | 'redeemed' | 'expired' | 'adjusted';

export interface LoyaltyPoint {
  id: string;
  user_id: string;
  points: number;
  transaction_type: LoyaltyTransactionType;
  order_id?: string;
  description?: string;
  expires_at?: string;
  created_at: string;
}

export interface LoyaltyPointWithOrder extends LoyaltyPoint {
  order?: Order;
}

export interface PointsBalance {
  total_points: number;
  expiring_soon: number;
  expiring_date?: string;
}

// Notifications Types
export type NotificationType = 'order' | 'promotion' | 'points' | 'product' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

// Chat Types
export type ConversationStatus = 'open' | 'closed';

export interface ChatConversation {
  id: string;
  user_id: string;
  status: ConversationStatus;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface ChatConversationWithUser extends ChatConversation {
  user?: Profile;
  unread_count?: number;
  last_message?: ChatMessage;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ChatMessageWithSender extends ChatMessage {
  sender?: Profile;
}


