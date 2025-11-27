export type UserRole = 'user' | 'admin';
export type ProductCategory = 'millets' | 'rice' | 'flour' | 'flakes' | 'sugar' | 'honey' | 'laddus';
export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

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
}

export interface Order {
  id: string;
  user_id: string | null;
  items: OrderItem[];
  total_amount: number;
  shipping_cost: number;
  currency: string;
  status: OrderStatus;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_city: string | null;
  customer_state: string | null;
  shipping_address: string | null;
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
