import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@19.1.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

async function updateOrderStatus(
  sessionId: string,
  session: Stripe.Checkout.Session
): Promise<boolean> {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, order_type, user_id, total_amount, points_used")
    .eq("stripe_session_id", sessionId)
    .single();

  if (fetchError || !order) {
    console.error("Failed to query order:", fetchError);
    return false;
  }

  if (order.status === "completed") {
    return true;
  }

  if (order.status !== "pending") {
    console.error(`Order status is ${order.status}, cannot complete payment`);
    return false;
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name,
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq("id", order.id)
    .eq("status", "pending");

  if (error) {
    console.error("Failed to update order:", error);
    return false;
  }

  // Redeem loyalty points if used
  if (order.user_id && order.points_used && order.points_used > 0) {
    try {
      const { error: redeemError } = await supabase
        .rpc('redeem_loyalty_points', {
          p_user_id: order.user_id,
          p_order_id: order.id,
          p_points: order.points_used
        });
      
      if (redeemError) {
        console.error("Failed to redeem points:", redeemError);
      } else {
        console.log(`Redeemed ${order.points_used} points for order ${order.id}`);
      }
    } catch (err) {
      console.error("Error redeeming points:", err);
    }
  }

  // Award loyalty points for the purchase
  if (order.user_id && order.total_amount) {
    try {
      const { data: pointsAwarded, error: awardError } = await supabase
        .rpc('award_loyalty_points', {
          p_user_id: order.user_id,
          p_order_id: order.id,
          p_order_amount: order.total_amount
        });
      
      if (awardError) {
        console.error("Failed to award points:", awardError);
      } else {
        console.log(`Awarded ${pointsAwarded} points for order ${order.id}`);
        
        // Create notification for points earned
        await supabase
          .from('notifications')
          .insert({
            user_id: order.user_id,
            type: 'points',
            title: 'Points Earned!',
            message: `You earned ${pointsAwarded} loyalty points from your recent purchase.`,
            link: '/loyalty-points'
          });
      }
    } catch (err) {
      console.error("Error awarding points:", err);
    }
  }

  // Automatically create shipment entry for online orders
  if (order.order_type === "online") {
    const { error: shipmentError } = await supabase
      .from("shipments")
      .insert({
        order_id: order.id,
        status: "pending",
        tracking_number: `SHIP-${order.id.substring(0, 8).toUpperCase()}`,
      });

    if (shipmentError) {
      console.error("Failed to create shipment:", shipmentError);
      // Don't fail the entire operation if shipment creation fails
    } else {
      console.log(`Shipment created for order ${order.id}`);
    }
  }

  return true;
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing session_id parameter");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return ok({
        verified: false,
        status: session.payment_status,
        sessionId: session.id,
      });
    }

    const orderUpdated = await updateOrderStatus(sessionId, session);

    // Fetch the complete order data to return
    // First get the order ID
    const { data: orderIdData, error: orderIdError } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .single();

    if (orderIdError || !orderIdData) {
      console.error("Failed to fetch order ID:", orderIdError);
      return ok({
        verified: true,
        status: "paid",
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
        amount: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        orderUpdated,
        order: null,
      });
    }

    // Then fetch the complete order details
    const { data: orderData, error: orderError } = await supabase
      .rpc('get_order_by_id', {
        p_order_id: orderIdData.id
      });

    if (orderError) {
      console.error("Failed to fetch order details:", orderError);
    }

    const order = Array.isArray(orderData) ? orderData[0] : orderData;
    console.log("Order data fetched:", order ? "success" : "null");

    return ok({
      verified: true,
      status: "paid",
      sessionId: session.id,
      paymentIntentId: session.payment_intent,
      amount: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      orderUpdated,
      order: order || null,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return fail(error instanceof Error ? error.message : "Payment verification failed", 500);
  }
});
