import { supabase } from './supabase';
import type { 
  Product, 
  ProductVariant, 
  ProductWithVariants, 
  Order, 
  Profile, 
  ProductCategory, 
  ShippingRate, 
  OrderStatus,
  Vendor,
  VendorTransaction,
  VendorWithTransactions,
  VendorSupply,
  VendorSupplyWithDetails,
  PaymentStatus,
  QualityCheckStatus,
  ShipmentHandler,
  ShipmentHandlerTransaction,
  ShipmentHandlerWithTransactions,
  Shipment,
  ShipmentWithDetails,
  HandlerPayment,
  HandlerPaymentWithDetails,
  VendorPayment,
  VendorPaymentSummary,
  PurchaseOrder,
  PurchaseOrderWithDetails,
  PurchaseOrderStatus
} from '@/types/types';

export const productsApi = {
  async getAll(category?: ProductCategory): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<ProductWithVariants | null> {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (productError) throw productError;
    if (!product) return null;

    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .order('price', { ascending: true });

    if (variantsError) throw variantsError;

    return {
      ...product,
      variants: Array.isArray(variants) ? variants : []
    };
  },

  async search(searchTerm: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .ilike('name', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create product');
    return data;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update product');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const variantsApi = {
  async getByProductId(productId: string): Promise<ProductVariant[]> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('price', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(variant: Omit<ProductVariant, 'id' | 'created_at'>): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .insert(variant)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create variant');
    return data;
  },

  async update(id: string, updates: Partial<ProductVariant>): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update variant');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const ordersApi = {
  async getMyOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByType(orderType: 'online' | 'instore'): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_type', orderType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getOnlineOrders(): Promise<Order[]> {
    return ordersApi.getByType('online');
  },

  async getInstoreOrders(): Promise<Order[]> {
    return ordersApi.getByType('instore');
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update order status');
    return data;
  }
};

export const profilesApi = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update profile');
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async promoteToAdmin(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to promote user');
    return data;
  },

  async createCustomer(customerData: {
    email: string;
    password: string;
    nickname: string;
    phone: string;
    address: string;
    role: 'user' | 'admin';
  }): Promise<Profile> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: customerData.email,
      password: customerData.password,
      options: {
        data: {
          nickname: customerData.nickname,
          phone: customerData.phone,
          address: customerData.address
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Update profile with additional details
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        nickname: customerData.nickname,
        phone: customerData.phone,
        address: customerData.address,
        role: customerData.role
      })
      .eq('id', authData.user.id)
      .select()
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profileData) throw new Error('Failed to update profile');
    
    return profileData;
  }
};

export const shippingApi = {
  async getRates(): Promise<ShippingRate[]> {
    const { data, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getConfig(): Promise<ShippingRate | null> {
    const { data, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateConfig(id: string, updates: Partial<ShippingRate>): Promise<ShippingRate> {
    const { data, error } = await supabase
      .from('shipping_rates')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update shipping configuration');
    return data;
  },

  async calculateShipping(customerState: string, customerCity: string, totalWeight: number): Promise<number> {
    const { data, error } = await supabase
      .rpc('calculate_shipping_cost', {
        p_customer_state: customerState,
        p_customer_city: customerCity,
        p_total_weight: totalWeight
      });

    if (error) throw error;
    return data || 0;
  }
};

export const adminApi = {
  async getInventoryStats() {
    const { data, error } = await supabase
      .rpc('get_inventory_stats');

    if (error) throw error;
    return data;
  },

  async getLowStockProducts(threshold: number = 20): Promise<Array<{
    product_name: string;
    packaging_size: string;
    stock: number;
    category: string;
  }>> {
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        stock,
        packaging_size,
        product_id,
        products!inner(name, category)
      `)
      .lt('stock', threshold)
      .order('stock', { ascending: true });

    if (error) throw error;
    
    return Array.isArray(data) ? data.map((item: any) => ({
      product_name: item.products.name,
      packaging_size: item.packaging_size,
      stock: item.stock,
      category: item.products.category
    })) : [];
  },

  async bulkUpdateStock(updates: Array<{ id: string; stock: number }>): Promise<void> {
    const promises = updates.map(({ id, stock }) =>
      supabase
        .from('product_variants')
        .update({ stock })
        .eq('id', id)
    );

    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      throw new Error(`Failed to update ${errors.length} variants`);
    }
  }
};

// Vendor Management API
export const vendorsApi = {
  async getAll(): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<VendorWithTransactions | null> {
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (vendorError) throw vendorError;
    if (!vendor) return null;

    const { data: transactions, error: transError } = await supabase
      .from('vendor_transactions')
      .select('*')
      .eq('vendor_id', id)
      .order('transaction_date', { ascending: false });

    if (transError) throw transError;

    const total_purchases = transactions?.filter(t => t.transaction_type === 'purchase').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const total_payments = transactions?.filter(t => t.transaction_type === 'payment').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const balance = total_purchases - total_payments;

    return {
      ...vendor,
      transactions: Array.isArray(transactions) ? transactions : [],
      total_purchases,
      total_payments,
      balance
    };
  },

  async create(vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor> {
    const { data, error } = await supabase
      .from('vendors')
      .insert(vendor)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create vendor');
    return data;
  },

  async update(id: string, vendor: Partial<Vendor>): Promise<Vendor> {
    const { data, error } = await supabase
      .from('vendors')
      .update(vendor)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update vendor');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const vendorTransactionsApi = {
  async getAll(vendorId?: string): Promise<VendorTransaction[]> {
    let query = supabase
      .from('vendor_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(transaction: Omit<VendorTransaction, 'id' | 'created_at'>): Promise<VendorTransaction> {
    const { data, error } = await supabase
      .from('vendor_transactions')
      .insert(transaction)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create transaction');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Vendor Supplies Management API
export const vendorSuppliesApi = {
  async getAll(): Promise<VendorSupply[]> {
    const { data, error } = await supabase
      .from('vendor_supplies')
      .select('*')
      .order('supply_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<VendorSupply | null> {
    const { data, error } = await supabase
      .from('vendor_supplies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByVendor(vendorId: string): Promise<VendorSupply[]> {
    const { data, error } = await supabase
      .from('vendor_supplies')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('supply_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByPaymentStatus(status: PaymentStatus): Promise<VendorSupply[]> {
    const { data, error } = await supabase
      .from('vendor_supplies')
      .select('*')
      .eq('payment_status', status)
      .order('supply_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByQualityStatus(status: QualityCheckStatus): Promise<VendorSupply[]> {
    const { data, error } = await supabase
      .from('vendor_supplies')
      .select('*')
      .eq('quality_check_status', status)
      .order('supply_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(supply: Omit<VendorSupply, 'id' | 'created_at' | 'updated_at'>): Promise<VendorSupply> {
    const { data, error } = await supabase
      .from('vendor_supplies')
      .insert(supply)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create vendor supply');
    return data;
  },

  async update(id: string, updates: Partial<VendorSupply>): Promise<VendorSupply> {
    const { data, error } = await supabase
      .from('vendor_supplies')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update vendor supply');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_supplies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getSuppliesWithDetails(): Promise<VendorSupplyWithDetails[]> {
    const { data, error } = await supabase
      .from('vendor_supplies')
      .select(`
        *,
        vendor:vendors(*),
        receiver:profiles(*)
      `)
      .order('supply_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};

// Shipment Handler Management API
export const shipmentHandlersApi = {
  async getAll(): Promise<ShipmentHandler[]> {
    const { data, error } = await supabase
      .from('shipment_handlers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<ShipmentHandlerWithTransactions | null> {
    const { data: handler, error: handlerError } = await supabase
      .from('shipment_handlers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (handlerError) throw handlerError;
    if (!handler) return null;

    const { data: transactions, error: transError } = await supabase
      .from('shipment_handler_transactions')
      .select('*')
      .eq('handler_id', id)
      .order('transaction_date', { ascending: false });

    if (transError) throw transError;

    const total_amount = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    return {
      ...handler,
      transactions: Array.isArray(transactions) ? transactions : [],
      total_amount
    };
  },

  async create(handler: Omit<ShipmentHandler, 'id' | 'created_at' | 'updated_at'>): Promise<ShipmentHandler> {
    const { data, error } = await supabase
      .from('shipment_handlers')
      .insert(handler)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create shipment handler');
    return data;
  },

  async update(id: string, handler: Partial<ShipmentHandler>): Promise<ShipmentHandler> {
    const { data, error } = await supabase
      .from('shipment_handlers')
      .update(handler)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update shipment handler');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('shipment_handlers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const shipmentHandlerTransactionsApi = {
  async getAll(handlerId?: string): Promise<ShipmentHandlerTransaction[]> {
    let query = supabase
      .from('shipment_handler_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (handlerId) {
      query = query.eq('handler_id', handlerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(transaction: Omit<ShipmentHandlerTransaction, 'id' | 'created_at'>): Promise<ShipmentHandlerTransaction> {
    const { data, error } = await supabase
      .from('shipment_handler_transactions')
      .insert(transaction)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create transaction');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('shipment_handler_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Shipment Tracking API
export const shipmentsApi = {
  async getAll(): Promise<ShipmentWithDetails[]> {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        order:orders(*),
        handler:shipment_handlers(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<ShipmentWithDetails | null> {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        order:orders(*),
        handler:shipment_handlers(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByOrderId(orderId: string): Promise<Shipment | null> {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByTrackingNumber(trackingNumber: string): Promise<ShipmentWithDetails | null> {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        order:orders(*),
        handler:shipment_handlers(*)
      `)
      .eq('tracking_number', trackingNumber)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>): Promise<Shipment> {
    const { data, error } = await supabase
      .from('shipments')
      .insert(shipment)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create shipment');
    return data;
  },

  async update(id: string, shipment: Partial<Shipment>): Promise<Shipment> {
    console.log('Updating shipment:', id, 'with data:', shipment);
    const { data, error } = await supabase
      .from('shipments')
      .update(shipment)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Failed to update shipment: ${error.message}`);
    }
    if (!data) {
      console.error('No data returned from update');
      throw new Error('Failed to update shipment: No data returned');
    }
    console.log('Shipment updated successfully:', data);
    return data;
  },

  async updateStatus(id: string, status: string, notes?: string): Promise<Shipment> {
    const updateData: Partial<Shipment> = { status: status as any };
    
    if (status === 'delivered') {
      updateData.actual_delivery_date = new Date().toISOString();
    }
    
    if (notes) {
      updateData.notes = notes;
    }

    return this.update(id, updateData);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const handlerPaymentsApi = {
  async getAll(): Promise<HandlerPayment[]> {
    const { data, error } = await supabase
      .from('handler_payments')
      .select('*')
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<HandlerPayment | null> {
    const { data, error } = await supabase
      .from('handler_payments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByHandler(handlerId: string): Promise<HandlerPayment[]> {
    const { data, error } = await supabase
      .from('handler_payments')
      .select('*')
      .eq('handler_id', handlerId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByShipment(shipmentId: string): Promise<HandlerPayment[]> {
    const { data, error } = await supabase
      .from('handler_payments')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByPaymentStatus(status: PaymentStatus): Promise<HandlerPayment[]> {
    const { data, error } = await supabase
      .from('handler_payments')
      .select('*')
      .eq('payment_status', status)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getWithDetails(): Promise<HandlerPaymentWithDetails[]> {
    const { data, error } = await supabase
      .from('handler_payments')
      .select(`
        *,
        handler:shipment_handlers(id, name, contact_person, phone),
        shipment:shipments(id, tracking_number, status),
        order:orders(id, order_number, total_amount)
      `)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(payment: Omit<HandlerPayment, 'id' | 'created_at' | 'updated_at'>): Promise<HandlerPayment> {
    const { data, error } = await supabase
      .from('handler_payments')
      .insert(payment)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create handler payment');
    return data;
  },

  async update(id: string, updates: Partial<HandlerPayment>): Promise<HandlerPayment> {
    const { data, error } = await supabase
      .from('handler_payments')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update handler payment');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('handler_payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTotalPaidToHandler(handlerId: string): Promise<number> {
    const { data, error } = await supabase
      .from('handler_payments')
      .select('payment_amount')
      .eq('handler_id', handlerId)
      .eq('payment_status', 'paid');

    if (error) throw error;
    if (!Array.isArray(data)) return 0;
    
    return data.reduce((sum, payment) => sum + Number(payment.payment_amount), 0);
  },

  async getPendingPayments(): Promise<HandlerPayment[]> {
    const { data, error } = await supabase
      .from('handler_payments')
      .select('*')
      .eq('payment_status', 'pending')
      .order('payment_date', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};

export const vendorPaymentsApi = {
  async getAll(): Promise<VendorPayment[]> {
    const { data, error } = await supabase
      .from('vendor_payments')
      .select('*')
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<VendorPayment | null> {
    const { data, error } = await supabase
      .from('vendor_payments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByVendor(vendorName: string): Promise<VendorPayment[]> {
    const { data, error } = await supabase
      .from('vendor_payments')
      .select('*')
      .eq('vendor_name', vendorName)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getSummary(): Promise<VendorPaymentSummary[]> {
    const { data, error } = await supabase
      .from('vendor_payment_summary')
      .select('*')
      .order('total_amount_paid', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(payment: Omit<VendorPayment, 'id' | 'created_at' | 'updated_at'>): Promise<VendorPayment> {
    const { data, error } = await supabase
      .from('vendor_payments')
      .insert(payment)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create vendor payment');
    return data;
  },

  async update(id: string, updates: Partial<VendorPayment>): Promise<VendorPayment> {
    const { data, error } = await supabase
      .from('vendor_payments')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update vendor payment');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendor_payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTotalPaidToVendor(vendorName: string): Promise<number> {
    const { data, error } = await supabase
      .from('vendor_payments')
      .select('amount')
      .eq('vendor_name', vendorName);

    if (error) throw error;
    if (!Array.isArray(data)) return 0;
    
    return data.reduce((sum, payment) => sum + Number(payment.amount), 0);
  },

  async getUniqueVendors(): Promise<string[]> {
    const { data, error } = await supabase
      .from('vendor_payments')
      .select('vendor_name')
      .order('vendor_name', { ascending: true });

    if (error) throw error;
    if (!Array.isArray(data)) return [];
    
    const uniqueVendors = [...new Set(data.map(v => v.vendor_name))];
    return uniqueVendors;
  }
};

export const purchaseOrdersApi = {
  async getAll(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<PurchaseOrder | null> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getWithDetails(id: string): Promise<PurchaseOrderWithDetails | null> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        vendor:vendors(*),
        ordered_by_profile:profiles(*),
        vendor_supply:vendor_supplies(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllWithDetails(): Promise<PurchaseOrderWithDetails[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        vendor:vendors(*)
      `)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByVendor(vendorId: string): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByStatus(status: PurchaseOrderStatus): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('status', status)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getOutstanding(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .in('status', ['ordered', 'confirmed', 'shipped'])
      .order('expected_delivery_date', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(order: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(order)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create purchase order');
    return data;
  },

  async update(id: string, order: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update(order)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update purchase order');
    return data;
  },

  async updateStatus(id: string, status: PurchaseOrderStatus, actualDeliveryDate?: string): Promise<PurchaseOrder> {
    const updateData: Partial<PurchaseOrder> = { status };
    if (status === 'received' && actualDeliveryDate) {
      updateData.actual_delivery_date = actualDeliveryDate;
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update purchase order status');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async markAsReceived(id: string, supplyId: string | null = null): Promise<PurchaseOrder> {
    const today = new Date().toISOString().split('T')[0];
    const updateData: Partial<PurchaseOrder> = {
      status: 'received',
      actual_delivery_date: today,
      vendor_supply_id: supplyId
    };

    const { data, error } = await supabase
      .from('purchase_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to mark purchase order as received');
    return data;
  },

  async generatePONumber(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_po_number');

    if (error) throw error;
    return data as string;
  },

  async getTotalOrderValue(): Promise<number> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('total_amount');

    if (error) throw error;
    if (!Array.isArray(data)) return 0;

    return data.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
  },

  async getOrdersThisMonth(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('purchase_orders')
      .select('id', { count: 'exact', head: true })
      .gte('order_date', startOfMonth.toISOString().split('T')[0]);

    if (error) throw error;
    return data?.length || 0;
  }
};

// ============================================================================
// WISHLIST API
// ============================================================================

export const wishlistApi = {
  async addToWishlist(userId: string, productId: string, variantId?: string) {
    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        product_id: productId,
        variant_id: variantId
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async removeFromWishlist(userId: string, productId: string) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  async getWishlist(userId: string) {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        product:products(*),
        variant:product_variants(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async getWishlistCount(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return data?.length || 0;
  },

  async clearWishlist(userId: string) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
};

// ============================================================================
// PRODUCT REVIEWS API
// ============================================================================

export const reviewsApi = {
  async createReview(
    productId: string,
    userId: string,
    rating: number,
    title?: string,
    comment?: string
  ) {
    // Check if user purchased the product
    const { data: verifiedData } = await supabase
      .rpc('check_verified_purchase', {
        p_user_id: userId,
        p_product_id: productId
      });

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating,
        title,
        comment,
        verified_purchase: verifiedData || false
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateReview(
    reviewId: string,
    updates: { rating?: number; title?: string; comment?: string }
  ) {
    const { data, error } = await supabase
      .from('product_reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user:profiles(id, full_name, nickname)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getUserReviews(userId: string) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        product:products(id, name, image_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getAverageRating(productId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_product_average_rating', { p_product_id: productId });

    if (error) throw error;
    return Number(data) || 0;
  },

  async getReviewCount(productId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_product_review_count', { p_product_id: productId });

    if (error) throw error;
    return Number(data) || 0;
  },

  async markReviewHelpful(reviewId: string, userId: string) {
    const { data, error } = await supabase
      .from('review_votes')
      .insert({
        review_id: reviewId,
        user_id: userId
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async unmarkReviewHelpful(reviewId: string, userId: string) {
    const { error } = await supabase
      .from('review_votes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async hasUserVoted(reviewId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('review_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }
};

// ============================================================================
// LOYALTY POINTS API
// ============================================================================

export const loyaltyPointsApi = {
  async getPointsBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('profiles')
      .select('points_balance')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.points_balance || 0;
  },

  async getPointsHistory(userId: string) {
    const { data, error } = await supabase
      .from('loyalty_points')
      .select(`
        *,
        order:orders(id, total_amount, created_at)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async awardPoints(userId: string, orderId: string, orderAmount: number) {
    const { data, error } = await supabase
      .rpc('award_loyalty_points', {
        p_user_id: userId,
        p_order_id: orderId,
        p_order_amount: orderAmount
      });

    if (error) throw error;
    return data;
  },

  async redeemPoints(userId: string, orderId: string, points: number) {
    const { data, error } = await supabase
      .rpc('redeem_loyalty_points', {
        p_user_id: userId,
        p_order_id: orderId,
        p_points: points
      });

    if (error) throw error;
    return data;
  },

  calculatePointsEarned(orderAmount: number): number {
    return Math.floor(orderAmount / 10);
  },

  calculatePointsDiscount(points: number): number {
    return (points / 100) * 10;
  },

  async getExpiringPoints(userId: string) {
    const { data, error } = await supabase
      .rpc('get_expiring_points', { p_user_id: userId });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async expirePoints() {
    const { data, error } = await supabase
      .rpc('expire_loyalty_points');

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export const notificationsApi = {
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string
  ) {
    const { data, error } = await supabase
      .rpc('create_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_message: message,
        p_link: link
      });

    if (error) throw error;
    return data;
  },

  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_unread_notification_count', { p_user_id: userId });

    if (error) throw error;
    return Number(data) || 0;
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .rpc('mark_all_notifications_read', { p_user_id: userId });

    if (error) throw error;
    return data;
  },

  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  async broadcastNotification(
    type: string,
    title: string,
    message: string,
    link?: string
  ) {
    const { data, error } = await supabase
      .rpc('broadcast_notification', {
        p_type: type,
        p_title: title,
        p_message: message,
        p_link: link
      });

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// CHAT API
// ============================================================================

export const chatApi = {
  async getOrCreateConversation(userId: string) {
    const { data, error } = await supabase
      .rpc('get_or_create_conversation', { p_user_id: userId });

    if (error) throw error;
    return data;
  },

  async getConversation(conversationId: string) {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        user:profiles(id, full_name, nickname, email)
      `)
      .eq('id', conversationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllConversations() {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        user:profiles(id, full_name, nickname, email)
      `)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async sendMessage(conversationId: string, senderId: string, message: string) {
    const { data, error } = await supabase
      .rpc('send_chat_message', {
        p_conversation_id: conversationId,
        p_sender_id: senderId,
        p_message: message
      });

    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles(id, full_name, nickname, role)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_unread_message_count', {
        p_conversation_id: conversationId,
        p_user_id: userId
      });

    if (error) throw error;
    return Number(data) || 0;
  },

  async markAsRead(conversationId: string, userId: string) {
    const { data, error } = await supabase
      .rpc('mark_conversation_read', {
        p_conversation_id: conversationId,
        p_user_id: userId
      });

    if (error) throw error;
    return data;
  },

  async closeConversation(conversationId: string) {
    const { data, error } = await supabase
      .rpc('close_conversation', { p_conversation_id: conversationId });

    if (error) throw error;
    return data;
  },

  async reopenConversation(conversationId: string) {
    const { data, error } = await supabase
      .rpc('reopen_conversation', { p_conversation_id: conversationId });

    if (error) throw error;
    return data;
  },

  async getOpenConversationsCount(): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_open_conversations_count');

    if (error) throw error;
    return Number(data) || 0;
  },

  async getConversationsWithUnread() {
    const { data, error } = await supabase
      .rpc('get_conversations_with_unread');

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};


