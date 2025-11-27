import { supabase } from './supabase';
import type { Product, ProductVariant, ProductWithVariants, Order, Profile, ProductCategory, ShippingRate, OrderStatus } from '@/types/types';

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
