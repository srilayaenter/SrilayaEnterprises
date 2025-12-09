export type UserRole = 'user' | 'admin';
export type ProductCategory = 'millets' | 'rice' | 'flour' | 'flakes' | 'sugar' | 'honey' | 'laddus';
export type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
export type OrderType = 'online' | 'instore';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  vendor_id: string | null;
  min_stock_threshold: number;
  reserved_stock: number;
  expiry_date: string | null;
  expiry_alert_days: number;
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
  vendor?: Vendor;
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
  payment_method: string | null;
  payment_details: any | null;
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
  is_cancelled: boolean;
  cancellation_requested_at: string | null;
  cancellation_reason: string | null;
  estimated_delivery: string | null;
  tracking_number: string | null;
  actual_delivery_at: string | null;
  can_be_modified: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem extends OrderItem {
  product_id: string;
  variant_id: string;
}

export interface OrderModification {
  id: string;
  order_id: string;
  modified_by: string;
  modification_type: string;
  old_value: any;
  new_value: any;
  notes: string | null;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
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
  vendor_id: string | null;
  purchase_order_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number: string | null;
  purpose: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorPaymentWithDetails extends VendorPayment {
  vendor?: Vendor;
  purchase_order?: PurchaseOrder;
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
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  payment_date: string | null;
  payment_reference: string | null;
  paid_amount: number;
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

// Security Types
export interface SecurityAuditLog {
  id: string;
  user_id: string | null;
  event_type: string;
  event_description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  success: boolean;
  failure_reason: string | null;
  created_at: string;
}

export interface AccountLockout {
  id: string;
  user_id: string | null;
  email: string;
  locked_until: string;
  reason: string | null;
  created_at: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

// Backup and Recovery Types
export type BackupType = 'full' | 'incremental' | 'manual';
export type BackupStatus = 'in_progress' | 'completed' | 'failed' | 'verified';
export type RestoreType = 'full' | 'partial' | 'point_in_time';
export type RestoreStatus = 'in_progress' | 'completed' | 'failed';

export interface BackupMetadata {
  id: string;
  backup_name: string;
  backup_type: BackupType;
  backup_size_bytes: number | null;
  backup_location: string | null;
  backup_status: BackupStatus;
  tables_included: string[] | null;
  row_counts: Record<string, number>;
  checksum: string | null;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
  verified_at: string | null;
}

export interface BackupSchedule {
  id: string;
  schedule_name: string;
  backup_type: BackupType;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time_of_day: string | null;
  day_of_week: number | null;
  day_of_month: number | null;
  is_active: boolean;
  retention_days: number;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackupRestoreHistory {
  id: string;
  backup_id: string | null;
  restore_type: RestoreType;
  tables_restored: string[] | null;
  restore_status: RestoreStatus;
  rows_restored: Record<string, number>;
  error_message: string | null;
  restored_by: string | null;
  started_at: string;
  completed_at: string | null;
}

// Performance Monitoring Types
export interface PerformanceMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  metadata: Record<string, any>;
  recorded_at: string;
}

export interface TableSize {
  table_name: string;
  row_count: number;
  total_size: string;
  table_size: string;
  indexes_size: string;
}

export interface IndexUsage {
  table_name: string;
  index_name: string;
  index_scans: number;
  rows_read: number;
  index_size: string;
}

export interface DatabaseStats {
  [tableName: string]: {
    row_count: number;
    total_size: number;
  };
}

// ============================================================================
// INVENTORY MANAGEMENT TYPES
// ============================================================================

export type StockMovementType = 'reserve' | 'release' | 'finalize' | 'adjustment' | 'restock';
export type InventoryAlertType = 'low_stock' | 'expiring' | 'expired' | 'out_of_stock';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: StockMovementType;
  quantity: number;
  order_id: string | null;
  previous_stock: number;
  new_stock: number;
  previous_reserved: number;
  new_reserved: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface InventoryAlert {
  id: string;
  product_id: string;
  alert_type: InventoryAlertType;
  severity: AlertSeverity;
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface LowStockProduct {
  product_id: string;
  product_name: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  min_threshold: number;
}

export interface ExpiringProduct {
  product_id: string;
  product_name: string;
  expiry_date: string;
  days_until_expiry: number;
  current_stock: number;
}

export interface StockReservationResult {
  success: boolean;
  message: string;
  reserved_quantity?: number;
  available_stock?: number;
}

// ============================================================================
// CUSTOMER COMMUNICATION TYPES
// ============================================================================

export type CommunicationType = 
  | 'order_confirmation'
  | 'shipping_notification'
  | 'delivery_confirmation'
  | 'promotional'
  | 'newsletter'
  | 'password_reset'
  | 'account_verification'
  | 'other';

export type CommunicationChannel = 'email' | 'sms' | 'push' | 'in_app';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';

export interface CommunicationPreferences {
  id: string;
  user_id: string;
  email: string;
  phone: string | null;
  
  // Email preferences
  email_order_confirmation: boolean;
  email_shipping_updates: boolean;
  email_delivery_confirmation: boolean;
  email_promotional: boolean;
  email_newsletter: boolean;
  
  // SMS preferences
  sms_order_confirmation: boolean;
  sms_shipping_updates: boolean;
  sms_delivery_confirmation: boolean;
  
  // General preferences
  language: string;
  timezone: string;
  
  created_at: string;
  updated_at: string;
}

export interface CommunicationLog {
  id: string;
  user_id: string | null;
  order_id: string | null;
  
  // Communication details
  type: CommunicationType;
  channel: CommunicationChannel;
  status: CommunicationStatus;
  
  // Recipient details
  recipient_email: string | null;
  recipient_phone: string | null;
  recipient_name: string | null;
  
  // Content
  subject: string | null;
  message: string | null;
  template_id: string | null;
  template_data: Record<string, any> | null;
  
  // Tracking
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  
  // Error handling
  error_message: string | null;
  retry_count: number;
  
  // Metadata
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  user_id: string | null;
  
  // Subscription details
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
  
  // Preferences
  categories: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  
  // Tracking
  confirmation_token: string | null;
  confirmed_at: string | null;
  last_sent_at: string | null;
  
  // Metadata
  source: string | null;
  metadata: Record<string, any> | null;
  
  created_at: string;
  updated_at: string;
}

export interface PromotionalCampaign {
  id: string;
  
  // Campaign details
  name: string;
  subject: string;
  content: string;
  template_id: string | null;
  
  // Targeting
  target_audience: string;
  segment_criteria: Record<string, any> | null;
  
  // Scheduling
  status: CampaignStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  
  // Tracking
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  unsubscribed_count: number;
  
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

