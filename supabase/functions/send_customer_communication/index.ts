import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email templates
function getOrderConfirmationTemplate(data: any): EmailTemplate {
  const itemsList = data.items
    .map(
      (item: any) =>
        `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.quantity * item.price).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #8D6E63 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Srilaya Enterprises</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Organic Store</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #4CAF50; margin-top: 0;">Order Confirmed! 🎉</h2>
        
        <p>Dear ${data.customer_name},</p>
        
        <p>Thank you for your order! We're excited to prepare your organic products for delivery.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <h3 style="margin-top: 0; color: #4CAF50;">Order Details</h3>
          <p><strong>Order ID:</strong> ${data.order_number}</p>
          <p><strong>Order Date:</strong> ${new Date(data.created_at).toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #4CAF50; color: white;">
              <th style="padding: 12px; text-align: left;">Product</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #4CAF50; font-size: 18px;">₹${data.total_amount}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0;"><strong>📦 What's Next?</strong></p>
          <p style="margin: 10px 0 0 0;">We'll send you another email with tracking information once your order ships. Expected delivery: 3-5 business days.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${SUPABASE_URL}/orders/${data.order_id}" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Track Your Order</a>
        </div>
        
        <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>Need help? Contact us at <a href="mailto:support@srilayaenterprises.com" style="color: #4CAF50;">support@srilayaenterprises.com</a></p>
          <p style="margin: 10px 0;">Thank you for choosing organic! 🌱</p>
          <p style="margin: 10px 0;">&copy; 2025 Srilaya Enterprises. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Order Confirmation - Srilaya Enterprises

Dear ${data.customer_name},

Thank you for your order! We're excited to prepare your organic products for delivery.

Order Details:
Order ID: ${data.order_number}
Order Date: ${new Date(data.created_at).toLocaleDateString('en-IN')}

Items:
${data.items.map((item: any) => `- ${item.name} x ${item.quantity} = ₹${(item.quantity * item.price).toFixed(2)}`).join('\n')}

Total Amount: ₹${data.total_amount}

What's Next?
We'll send you another email with tracking information once your order ships. Expected delivery: 3-5 business days.

Need help? Contact us at support@srilayaenterprises.com

Thank you for choosing organic! 🌱

© 2025 Srilaya Enterprises. All rights reserved.
  `;

  return {
    subject: `Order Confirmation #${data.order_number} - Srilaya Enterprises`,
    html,
    text,
  };
}

function getShippingNotificationTemplate(data: any): EmailTemplate {
  const trackingInfo = data.tracking_number
    ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #4CAF50;">Tracking Information</h3>
      <p><strong>Tracking Number:</strong> <span style="font-size: 18px; color: #4CAF50; font-family: monospace;">${data.tracking_number}</span></p>
      ${data.carrier ? `<p><strong>Carrier:</strong> ${data.carrier}</p>` : ''}
      <a href="#" style="background: #4CAF50; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Track Package</a>
    </div>
  `
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Shipped</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #8D6E63 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Srilaya Enterprises</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Organic Store</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #4CAF50; margin-top: 0;">Your Order is On Its Way! 📦</h2>
        
        <p>Dear ${data.customer_name},</p>
        
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <h3 style="margin-top: 0; color: #4CAF50;">Order Details</h3>
          <p><strong>Order ID:</strong> ${data.order_id}</p>
          <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">${data.status === 'shipped' ? 'Shipped' : 'Out for Delivery'}</span></p>
        </div>
        
        ${trackingInfo}
        
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <p style="margin: 0;"><strong>🚚 Estimated Delivery</strong></p>
          <p style="margin: 10px 0 0 0;">Your package should arrive within 2-3 business days.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${SUPABASE_URL}/orders/${data.order_id}" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Order Details</a>
        </div>
        
        <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>Questions about your delivery? Contact us at <a href="mailto:support@srilayaenterprises.com" style="color: #4CAF50;">support@srilayaenterprises.com</a></p>
          <p style="margin: 10px 0;">&copy; 2025 Srilaya Enterprises. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Your Order is On Its Way! - Srilaya Enterprises

Dear ${data.customer_name},

Great news! Your order has been shipped and is on its way to you.

Order ID: ${data.order_id}
Status: ${data.status === 'shipped' ? 'Shipped' : 'Out for Delivery'}

${data.tracking_number ? `Tracking Number: ${data.tracking_number}` : ''}
${data.carrier ? `Carrier: ${data.carrier}` : ''}

Estimated Delivery: 2-3 business days

Questions about your delivery? Contact us at support@srilayaenterprises.com

© 2025 Srilaya Enterprises. All rights reserved.
  `;

  return {
    subject: `Your Order is On Its Way! - Srilaya Enterprises`,
    html,
    text,
  };
}

function getDeliveryConfirmationTemplate(data: any): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #8D6E63 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Srilaya Enterprises</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Organic Store</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #4CAF50; margin-top: 0;">Order Delivered Successfully! ✅</h2>
        
        <p>Dear ${data.customer_name},</p>
        
        <p>Your order has been delivered! We hope you enjoy your organic products.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <h3 style="margin-top: 0; color: #4CAF50;">Delivery Details</h3>
          <p><strong>Order ID:</strong> ${data.order_id}</p>
          <p><strong>Delivered On:</strong> ${new Date(data.delivered_at).toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #8D6E63;">How Was Your Experience? ⭐</h3>
          <p>We'd love to hear your feedback about your purchase!</p>
          <a href="${SUPABASE_URL}/orders/${data.order_id}/review" style="background: #FF9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-top: 10px;">Write a Review</a>
        </div>
        
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💚 Thank You for Choosing Organic!</strong></p>
          <p style="margin: 10px 0 0 0;">Your support helps us promote sustainable and healthy living.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${SUPABASE_URL}/products" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Shop Again</a>
        </div>
        
        <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>Any issues with your order? Contact us at <a href="mailto:support@srilayaenterprises.com" style="color: #4CAF50;">support@srilayaenterprises.com</a></p>
          <p style="margin: 10px 0;">We're here to help! 🌱</p>
          <p style="margin: 10px 0;">&copy; 2025 Srilaya Enterprises. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Order Delivered Successfully! - Srilaya Enterprises

Dear ${data.customer_name},

Your order has been delivered! We hope you enjoy your organic products.

Order ID: ${data.order_id}
Delivered On: ${new Date(data.delivered_at).toLocaleDateString('en-IN')}

How Was Your Experience?
We'd love to hear your feedback about your purchase!

Thank You for Choosing Organic!
Your support helps us promote sustainable and healthy living.

Any issues with your order? Contact us at support@srilayaenterprises.com

We're here to help! 🌱

© 2025 Srilaya Enterprises. All rights reserved.
  `;

  return {
    subject: `Order Delivered - Thank You! - Srilaya Enterprises`,
    html,
    text,
  };
}

async function sendEmail(to: string, template: EmailTemplate) {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email send");
    return { success: true, message: "Email service not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Srilaya Enterprises <orders@srilayaenterprises.com>",
      to: [to],
      subject: template.subject,
      html: template.html,
      text: template.text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get pending communications
    const { data: pendingLogs, error: fetchError } = await supabase
      .from("communication_logs")
      .select("*")
      .eq("status", "pending")
      .eq("channel", "email")
      .order("created_at", { ascending: true })
      .limit(10);

    if (fetchError) {
      throw fetchError;
    }

    if (!pendingLogs || pendingLogs.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending communications" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const results = [];

    for (const log of pendingLogs) {
      try {
        let template: EmailTemplate;

        // Get template based on type
        switch (log.type) {
          case "order_confirmation":
            template = getOrderConfirmationTemplate(log.template_data);
            break;
          case "shipping_notification":
            template = getShippingNotificationTemplate(log.template_data);
            break;
          case "delivery_confirmation":
            template = getDeliveryConfirmationTemplate(log.template_data);
            break;
          default:
            throw new Error(`Unknown communication type: ${log.type}`);
        }

        // Send email
        await sendEmail(log.recipient_email, template);

        // Update status to sent
        await supabase
          .from("communication_logs")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", log.id);

        results.push({
          id: log.id,
          status: "sent",
          type: log.type,
          recipient: log.recipient_email,
        });
      } catch (error) {
        // Update status to failed
        await supabase
          .from("communication_logs")
          .update({
            status: "failed",
            error_message: error.message,
            retry_count: log.retry_count + 1,
          })
          .eq("id", log.id);

        results.push({
          id: log.id,
          status: "failed",
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send_customer_communication:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
