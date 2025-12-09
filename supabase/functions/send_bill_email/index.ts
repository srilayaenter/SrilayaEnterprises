import { createClient } from "jsr:@supabase/supabase-js@2";

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

function generateBillHTML(order: any): string {
  const items = order.items || [];
  const itemsHTML = items.map((item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} ${item.packaging_size ? `(${item.packaging_size})` : ''}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const subtotal = order.total_amount;
  const gst = order.gst_amount;
  const shipping = order.shipping_cost || 0;
  const total = subtotal + gst + shipping;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Bill - ${order.id.slice(0, 8).toUpperCase()}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Order Confirmation</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your order!</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Order ID</p>
            <p style="margin: 5px 0; font-weight: bold;">${order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Order Date</p>
            <p style="margin: 5px 0; font-weight: bold;">${new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Order Type</p>
            <p style="margin: 5px 0; font-weight: bold; text-transform: capitalize;">${order.order_type}</p>
          </div>
          <div>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Status</p>
            <p style="margin: 5px 0; font-weight: bold; text-transform: capitalize; color: #10b981;">${order.status}</p>
          </div>
        </div>

        ${order.customer_name ? `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
            <h3 style="margin: 0 0 10px 0;">Customer Information</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${order.customer_name}</p>
            ${order.customer_email ? `<p style="margin: 5px 0;"><strong>Email:</strong> ${order.customer_email}</p>` : ''}
            ${order.customer_phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${order.customer_phone}</p>` : ''}
            ${order.shipping_address ? `<p style="margin: 5px 0;"><strong>Address:</strong> ${order.shipping_address}</p>` : ''}
          </div>
        ` : ''}
      </div>

      <div style="margin-top: 30px;">
        <h2 style="margin: 0 0 15px 0;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
              <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 30px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Subtotal:</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>GST (${order.gst_rate}%):</span>
          <span>₹${gst.toFixed(2)}</span>
        </div>
        ${shipping > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Shipping:</span>
            <span>₹${shipping.toFixed(2)}</span>
          </div>
        ` : ''}
        ${order.points_used > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #10b981;">
            <span>Points Discount (${order.points_used} points):</span>
            <span>-₹${((order.points_used * 0.1) || 0).toFixed(2)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 2px solid #ddd; font-size: 20px; font-weight: bold; color: #667eea;">
          <span>Total:</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
      </div>

      <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-left: 4px solid #667eea; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          If you have any questions about your order, please contact our support team.
        </p>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
        <p>Thank you for shopping with us!</p>
      </div>
    </body>
    </html>
  `;
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const { orderId } = await req.json();

    if (!orderId) {
      return fail("Order ID is required");
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return fail("Order not found");
    }

    if (!order.customer_email) {
      return fail("No email address found for this order");
    }

    const billHTML = generateBillHTML(order);

    // Note: In a production environment, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Postmark
    // For now, we'll return success with the HTML content
    
    // Example with Resend (commented out):
    // const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    // const response = await fetch("https://api.resend.com/emails", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${RESEND_API_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     from: "orders@yourdomain.com",
    //     to: order.customer_email,
    //     subject: `Order Confirmation - ${order.id.slice(0, 8).toUpperCase()}`,
    //     html: billHTML,
    //   }),
    // });

    return ok({
      message: "Email functionality ready. Please configure email service provider.",
      orderId: order.id,
      email: order.customer_email,
      // In production, you would return the email service response
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to send email", 500);
  }
});
