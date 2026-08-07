import { StoreConfig } from '@/lib/mock/products';

export interface InvoiceItem {
  name: string;
  price: number;
  quantity: number;
}

export interface InvoiceAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface InvoiceOrder {
  orderNumber: string;
  placedAt: string;
  status: 'CONFIRMED' | 'PENDING';
  paymentMethod: string;
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  lowOrderCharge: number;
  discount: number;
  total: number;
  address: InvoiceAddress;
}

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function chargeRows(order: InvoiceOrder): { label: string; amount: number }[] {
  const rows = [{ label: 'Subtotal', amount: order.subtotal }];
  rows.push({ label: 'Shipping', amount: order.shipping });
  if (order.lowOrderCharge > 0) rows.push({ label: 'Low order charge', amount: order.lowOrderCharge });
  if (order.discount > 0) rows.push({ label: 'Discount', amount: -order.discount });
  return rows;
}

export function buildInvoiceEmail(
  order: InvoiceOrder,
  store: StoreConfig
): { subject: string; html: string; text: string } {
  const subject = `Your A.K.R Electronics bill — Order #${order.orderNumber}`;

  const itemRowsHtml = order.items
    .map(
      item => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatINR(item.price)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatINR(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('');

  const chargeRowsHtml = chargeRows(order)
    .map(
      row => `
      <tr>
        <td colspan="3" style="padding:4px 0;text-align:right;color:#555;">${row.label}</td>
        <td style="padding:4px 0;text-align:right;color:#555;">${row.amount < 0 ? '-' : ''}${formatINR(Math.abs(row.amount))}</td>
      </tr>`
    )
    .join('');

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#111;">
    <h1 style="font-size:20px;margin-bottom:4px;">${store.storeName}</h1>
    <p style="color:#555;font-size:13px;margin-top:0;">Order confirmation & bill</p>

    <table style="width:100%;margin:20px 0;font-size:14px;">
      <tr>
        <td><strong>Order #</strong><br/>${order.orderNumber}</td>
        <td><strong>Date</strong><br/>${formatDate(order.placedAt)}</td>
        <td><strong>Payment</strong><br/>${order.paymentMethod}${order.status === 'PENDING' ? ' (verifying)' : ''}</td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="text-align:left;border-bottom:2px solid #111;">
          <th style="padding-bottom:8px;">Item</th>
          <th style="padding-bottom:8px;text-align:center;">Qty</th>
          <th style="padding-bottom:8px;text-align:right;">Price</th>
          <th style="padding-bottom:8px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHtml}
      </tbody>
      <tfoot>
        ${chargeRowsHtml}
        <tr>
          <td colspan="3" style="padding-top:8px;text-align:right;font-size:16px;"><strong>Grand Total</strong></td>
          <td style="padding-top:8px;text-align:right;font-size:16px;"><strong>${formatINR(order.total)}</strong></td>
        </tr>
      </tfoot>
    </table>

    <h3 style="font-size:14px;margin-top:28px;margin-bottom:6px;">Shipping to</h3>
    <p style="font-size:13px;color:#333;line-height:1.5;margin:0;">
      ${order.address.name}<br/>
      ${order.address.address}, ${order.address.city}, ${order.address.state} ${order.address.pincode}<br/>
      ${order.address.phone}
    </p>

    <p style="font-size:12px;color:#888;margin-top:32px;border-top:1px solid #eee;padding-top:12px;">
      Questions about this order? Reply to this email or call ${store.supportPhone} (${store.supportEmail}).<br/>
      ${store.storeName}
    </p>
  </div>`;

  const text = [
    `${store.storeName} — Order confirmation`,
    `Order #${order.orderNumber} — ${formatDate(order.placedAt)}`,
    `Payment: ${order.paymentMethod}${order.status === 'PENDING' ? ' (verifying)' : ''}`,
    '',
    'Items:',
    ...order.items.map(item => `  ${item.name} x${item.quantity} — ${formatINR(item.price * item.quantity)}`),
    '',
    ...chargeRows(order).map(row => `${row.label}: ${row.amount < 0 ? '-' : ''}${formatINR(Math.abs(row.amount))}`),
    `Grand Total: ${formatINR(order.total)}`,
    '',
    'Shipping to:',
    `  ${order.address.name}`,
    `  ${order.address.address}, ${order.address.city}, ${order.address.state} ${order.address.pincode}`,
    `  ${order.address.phone}`,
    '',
    `Questions? ${store.supportEmail} / ${store.supportPhone}`,
  ].join('\n');

  return { subject, html, text };
}
