import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@19.1.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

const successUrlPath = '/payment-success?session_id={CHECKOUT_SESSION_ID}';
const cancelUrlPath = '/cart';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  packaging_size?: string;
  product_id?: string;
  variant_id?: string;
}

interface CheckoutRequest {
  items: OrderItem[];
  currency?: string;
  payment_method_types?: string[];
  order_type?: 'online' | 'instore';
  shipping_address?: string;
  shipping_cost?: number;
  customer_info?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
  };
}

function ok(data: any): Response {
  return new Response(
    JSON.stringify({ code: "SUCCESS", message: "Success", data }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

function fail(msg: string, code = 400): Response {
  return new Response(
    JSON.stringify({ code: "FAIL", message: msg }),
    {
      status: code,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

function validateCheckoutRequest(request: CheckoutRequest): void {
  if (!request.items?.length) {
    throw new Error("Cart is empty");
  }
  for (const item of request.items) {
    if (!item.name || item.price <= 0 || item.quantity <= 0) {
      throw new Error("Invalid product information");
    }
  }
}

function processOrderItems(items: OrderItem[], shippingCost: number = 0) {
  const GST_RATE = 5; // 5% GST
  
  // Store items with prices in rupees (not paise)
  const formattedItems = items.map(item => ({
    name: item.name.trim(),
    price: item.price, // Keep in rupees for database storage
    quantity: item.quantity,
    image_url: item.image_url?.trim() || "",
    packaging_size: item.packaging_size || "",
    product_id: item.product_id || "",
    variant_id: item.variant_id || "",
  }));
  
  // Calculate subtotal in rupees
  const subtotal = formattedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  // Calculate GST in rupees
  const gstAmount = (subtotal * GST_RATE) / 100;
  
  // Total in rupees
  const totalAmount = subtotal + gstAmount + shippingCost;
  
  // For Stripe, convert to paise (smallest currency unit)
  const subtotalPaise = Math.round(subtotal * 100);
  const gstAmountPaise = Math.round(gstAmount * 100);
  const shippingAmountPaise = Math.round(shippingCost * 100);
  const totalAmountPaise = Math.round(totalAmount * 100);
  
  return { 
    formattedItems, 
    subtotal, 
    gstAmount, 
    shippingCost,
    totalAmount,
    subtotalPaise,
    gstAmountPaise,
    shippingAmountPaise,
    totalAmountPaise
  };
}

async function createCheckoutSession(
  stripe: Stripe,
  userId: string | null,
  items: OrderItem[],
  currency: string,
  paymentMethods: string[],
  origin: string,
  shippingCost: number = 0,
  customerInfo?: any,
  shippingAddress?: string,
  orderType: 'online' | 'instore' = 'online'
) {
  const { 
    formattedItems, 
    subtotal, 
    gstAmount, 
    totalAmount,
    gstAmountPaise,
    shippingAmountPaise
  } = processOrderItems(items, shippingCost);
  const GST_RATE = 5;

  // Store all amounts in rupees in the database
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      items: formattedItems,
      total_amount: subtotal, // Subtotal in rupees
      gst_rate: GST_RATE,
      gst_amount: gstAmount, // GST in rupees
      shipping_cost: shippingCost, // Shipping in rupees
      currency: currency.toLowerCase(),
      status: "pending",
      order_type: orderType || 'online',
      shipping_address: shippingAddress || customerInfo?.address || null,
      customer_name: customerInfo?.name || null,
      customer_email: customerInfo?.email || null,
      customer_phone: customerInfo?.phone || null,
      customer_city: customerInfo?.city || null,
      customer_state: customerInfo?.state || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create order: ${error.message}`);

  // Create Stripe line items with amounts in paise
  const lineItems = items.map(item => ({
    price_data: {
      currency: currency.toLowerCase(),
      product_data: {
        name: item.packaging_size ? `${item.name} (${item.packaging_size})` : item.name,
        images: item.image_url ? [item.image_url] : [],
      },
      unit_amount: Math.round(item.price * 100), // Convert to paise for Stripe
    },
    quantity: item.quantity,
  }));

  // Add GST as a line item (in paise)
  if (gstAmountPaise > 0) {
    lineItems.push({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: `GST (${GST_RATE}%)`,
        },
        unit_amount: gstAmountPaise, // Already in paise
      },
      quantity: 1,
    });
  }

  // Add shipping as a line item (in paise)
  if (shippingAmountPaise > 0) {
    lineItems.push({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: 'Shipping Cost',
        },
        unit_amount: shippingAmountPaise, // Already in paise
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    success_url: `${origin}${successUrlPath}`,
    cancel_url: `${origin}${cancelUrlPath}`,
    payment_method_types: paymentMethods,
    metadata: {
      order_id: order.id,
      user_id: userId || "",
    },
  });

  await supabase
    .from("orders")
    .update({
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq("id", order.id);

  return { order, session };
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const request = await req.json();
    validateCheckoutRequest(request);

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "";
    const { order, session } = await createCheckoutSession(
      stripe,
      user?.id || null,
      request.items,
      request.currency || 'usd',
      request.payment_method_types || ['card'],
      origin,
      request.shipping_cost || 0,
      request.customer_info,
      request.shipping_address,
      request.order_type || 'online'
    );

    return ok({
      url: session.url,
      sessionId: session.id,
      orderId: order.id,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Payment processing failed", 500);
  }
});
