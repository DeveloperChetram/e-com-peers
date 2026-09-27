export interface EmailItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}


const DASHBOARD_URL = 'http://localhost:3000/dashboard/user'

export function formatAddress(addressDetail?: string | null, addressObj?: any): string {
  if (addressDetail) {
    try {
      const parsed = JSON.parse(addressDetail);
      if (parsed && typeof parsed === 'object') {
        if (parsed.formatted) return parsed.formatted;
        const parts = [
          parsed.street,
          parsed.city,
          parsed.state ? `${parsed.state} ${parsed.zip || ''}`.trim() : parsed.zip,
          parsed.country,
        ].filter(Boolean);
        if (parts.length > 0) return parts.join(', ');
      }
    } catch {}
    if (typeof addressDetail === 'string' && addressDetail.trim() && !addressDetail.startsWith('{')) {
      return addressDetail;
    }
  }

  if (addressObj) {
    const parts = [
      addressObj.street,
      addressObj.city,
      addressObj.state ? `${addressObj.state} ${addressObj.zip || ''}`.trim() : addressObj.zip,
      addressObj.country,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }

  return 'Standard Shipping Address';
}

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SHOP.CO Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e4e4e7;">
          <!-- Header -->
          <tr>
            <td style="background-color: #09090b; padding: 24px 32px; text-align: left;">
              <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-transform: uppercase;">
                SHOP.CO
              </span>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 32px; border-top: 1px solid #f4f4f5; text-align: center; font-size: 12px; color: #71717a;">
              <p style="margin: 0 0 6px 0;">Need assistance? Visit your <a href=${DASHBOARD_URL} style="color: #18181b; font-weight: 600; text-decoration: underline;">Customer Portal</a>.</p>
              <p style="margin: 0;">© 2026 SHOP.CO Marketplace. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// 1. ORDER PLACED EMAIL
export function orderPlacedTemplate(params: {
  customerName: string;
  orderId: string;
  items: EmailItem[];
  totalAmount: number;
  formattedAddress: string;
  merchantName?: string;
}): string {
  const shortId = params.orderId.slice(-6).toUpperCase();

  const itemsRows = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f4f4f5; font-size: 13px; color: #18181b; font-weight: 600;">
          ${item.name}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f4f4f5; font-size: 13px; color: #71717a; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f4f4f5; font-size: 13px; color: #18181b; text-align: right; font-weight: 600;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  const body = `
    <div style="margin-bottom: 20px;">
      <span style="background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
        Order Confirmed
      </span>
      <h1 style="font-size: 22px; font-weight: 800; color: #09090b; margin: 12px 0 6px 0;">
        Thank you for your order, ${params.customerName}!
      </h1>
      <p style="font-size: 14px; color: #52525b; line-height: 1.5; margin: 0;">
        We've received your order <strong>#${shortId}</strong> (${params.orderId}) and notified the merchant for rapid preparation.
      </p>
    </div>

    <!-- Items Section -->
    <div style="margin: 24px 0;">
      <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; margin: 0 0 12px 0;">
        Order Summary
      </h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #e4e4e7;">
            <th align="left" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #a1a1aa;">Item</th>
            <th align="center" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #a1a1aa;">Qty</th>
            <th align="right" style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #a1a1aa;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding-top: 14px; font-size: 14px; font-weight: 700; color: #09090b;">
              Total Amount:
            </td>
            <td align="right" style="padding-top: 14px; font-size: 16px; font-weight: 900; color: #09090b;">
              $${params.totalAmount.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Shipping Address & Merchant Box -->
    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin: 24px 0;">
      <div style="margin-bottom: 12px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #71717a; display: block; margin-bottom: 4px;">
          Delivery Address
        </span>
        <span style="font-size: 13px; color: #18181b; font-weight: 500; line-height: 1.4;">
          ${params.formattedAddress}
        </span>
      </div>
      ${
        params.merchantName
          ? `
        <div style="border-top: 1px solid #e4e4e7; padding-top: 10px; margin-top: 10px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #71717a; display: block; margin-bottom: 4px;">
            Fulfilled By
          </span>
          <span style="font-size: 13px; color: #18181b; font-weight: 600;">
            ${params.merchantName}
          </span>
        </div>
      `
          : ''
      }
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href=${DASHBOARD_URL}/orders style="display: inline-block; background-color: #09090b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 13px; font-weight: 700;">
        View Order in Dashboard
      </a>
    </div>
  `;

  return baseTemplate(body);
}

// 2. ORDER CANCELLED EMAIL
export function orderCancelledTemplate(params: {
  customerName: string;
  orderId: string;
  reason?: string;
}): string {
  const shortId = params.orderId.slice(-6).toUpperCase();

  const body = `
    <div style="margin-bottom: 20px;">
      <span style="background-color: #ffe4e6; color: #e11d48; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
        Order Cancelled
      </span>
      <h1 style="font-size: 22px; font-weight: 800; color: #09090b; margin: 12px 0 6px 0;">
        Order #${shortId} Has Been Cancelled
      </h1>
      <p style="font-size: 14px; color: #52525b; line-height: 1.5; margin: 0;">
        Hi ${params.customerName}, your order <strong>#${params.orderId}</strong> has been cancelled.
      </p>
    </div>

    <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #9f1239;">
      <strong>Status:</strong> Cancelled<br/>
      ${params.reason ? `<strong>Reason:</strong> ${params.reason}` : 'Cancelled as requested.'}
    </div>

    <p style="font-size: 13px; color: #71717a; line-height: 1.5;">
      Any pending holds or pre-authorizations on your payment method will be released shortly. If you did not request this cancellation, please contact our support team.
    </p>

    <div style="text-align: center; margin-top: 24px;">
      <a href=${DASHBOARD_URL}/products style="display: inline-block; background-color: #09090b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 13px; font-weight: 700;">
        Explore Marketplace Catalog
      </a>
    </div>
  `;

  return baseTemplate(body);
}

// 3. RETURN / CANCELLATION REQUESTED BY CUSTOMER
export function returnOrCancelRequestedTemplate(params: {
  customerName: string;
  orderId: string;
  type: 'CANCEL' | 'RETURN';
  reason?: string;
}): string {
  const shortId = params.orderId.slice(-6).toUpperCase();
  const title = params.type === 'CANCEL' ? 'Cancellation Request Received' : 'Return Request Received';

  const body = `
    <div style="margin-bottom: 20px;">
      <span style="background-color: #fef3c7; color: #d97706; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
        Request Pending Store Review
      </span>
      <h1 style="font-size: 22px; font-weight: 800; color: #09090b; margin: 12px 0 6px 0;">
        ${title}
      </h1>
      <p style="font-size: 14px; color: #52525b; line-height: 1.5; margin: 0;">
        Hi ${params.customerName}, we have received your request for order <strong>#${shortId}</strong>. The merchant has been notified and will review your request.
      </p>
    </div>

    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px;">
      <p style="margin: 0 0 6px 0;"><strong>Order ID:</strong> ${params.orderId}</p>
      <p style="margin: 0 0 6px 0;"><strong>Request Type:</strong> ${params.type === 'CANCEL' ? 'Cancellation' : 'Item Return'}</p>
      ${params.reason ? `<p style="margin: 0;"><strong>Reason Provided:</strong> ${params.reason}</p>` : ''}
    </div>

    <p style="font-size: 13px; color: #71717a;">
      You will receive an automated email notification once the store accepts or responds to your request.
    </p>
  `;

  return baseTemplate(body);
}

// 4. ORDER STATUS UPDATED (SHIPPED / DELIVERED / CONFIRMED)
export function orderStatusUpdatedTemplate(params: {
  customerName: string;
  orderId: string;
  newStatus: string;
  trackingNumber?: string;
  carrier?: string;
  note?: string;
}): string {
  const shortId = params.orderId.slice(-6).toUpperCase();

  let badgeColor = '#dbeafe';
  let badgeTextColor = '#1d4ed8';
  let headline = `Order #${shortId} Status Update`;
  let message = `Your order status has been updated to ${params.newStatus}.`;

  if (params.newStatus === 'CONFIRMED') {
    badgeColor = '#e0e7ff';
    badgeTextColor = '#4338ca';
    headline = 'Your Order Has Been Confirmed!';
    message = 'The merchant has confirmed your order and is currently preparing your package for dispatch.';
  } else if (params.newStatus === 'SHIPPED') {
    badgeColor = '#ede9fe';
    badgeTextColor = '#6d28d9';
    headline = 'Your Order Is On The Way!';
    message = 'Your package has been dispatched and handed over to the courier.';
  } else if (params.newStatus === 'DELIVERED') {
    badgeColor = '#ecfdf5';
    badgeTextColor = '#047857';
    headline = 'Package Delivered!';
    message = 'Your order has been marked as delivered. We hope you enjoy your purchase!';
  } else if (params.newStatus === 'CANCELLED') {
    badgeColor = '#ffe4e6';
    badgeTextColor = '#e11d48';
    headline = 'Order Cancelled';
    message = 'Your order has been cancelled.';
  }

  const body = `
    <div style="margin-bottom: 20px;">
      <span style="background-color: ${badgeColor}; color: ${badgeTextColor}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
        ${params.newStatus}
      </span>
      <h1 style="font-size: 22px; font-weight: 800; color: #09090b; margin: 12px 0 6px 0;">
        ${headline}
      </h1>
      <p style="font-size: 14px; color: #52525b; line-height: 1.5; margin: 0;">
        Hi ${params.customerName}, ${message}
      </p>
    </div>

    ${
      params.trackingNumber
        ? `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">
          Shipment Tracking
        </span>
        <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
          Tracking #: <span style="font-family: monospace; font-size: 15px; color: #2563eb;">${params.trackingNumber}</span>
        </div>
        ${params.carrier ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">Carrier: ${params.carrier}</div>` : ''}
      </div>
    `
        : ''
    }

    ${
      params.note
        ? `
      <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #52525b;">
        <strong>Merchant Note:</strong> ${params.note}
      </div>
    `
        : ''
    }

    <div style="text-align: center; margin-top: 24px;">
      <a href=${DASHBOARD_URL}/orders style="display: inline-block; background-color: #09090b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 13px; font-weight: 700;">
        Track Order Status
      </a>
    </div>
  `;

  return baseTemplate(body);
}

// 5. RETURN / CANCELLATION DECISION (APPROVED / REJECTED)
export function returnDecisionTemplate(params: {
  customerName: string;
  orderId: string;
  approved: boolean;
  decisionNote?: string;
}): string {
  const shortId = params.orderId.slice(-6).toUpperCase();
  const headline = params.approved ? 'Your Request Has Been Approved' : 'Your Request Has Been Declined';
  const badgeColor = params.approved ? '#ecfdf5' : '#fff1f2';
  const badgeText = params.approved ? '#047857' : '#e11d48';

  const body = `
    <div style="margin-bottom: 20px;">
      <span style="background-color: ${badgeColor}; color: ${badgeText}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
        ${params.approved ? 'Approved' : 'Declined'}
      </span>
      <h1 style="font-size: 22px; font-weight: 800; color: #09090b; margin: 12px 0 6px 0;">
        ${headline}
      </h1>
      <p style="font-size: 14px; color: #52525b; line-height: 1.5; margin: 0;">
        Hi ${params.customerName}, the store provider has reviewed your request for order <strong>#${shortId}</strong>.
      </p>
    </div>

    ${
      params.decisionNote
        ? `
      <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px;">
        <strong>Store Note:</strong> ${params.decisionNote}
      </div>
    `
        : ''
    }

    <div style="text-align: center; margin-top: 24px;">
      <a href=${DASHBOARD_URL}/orders style="display: inline-block; background-color: #09090b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 13px; font-weight: 700;">
        View Order in Dashboard
      </a>
    </div>
  `;

  return baseTemplate(body);
}
