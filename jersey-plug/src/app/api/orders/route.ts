import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSpreadsheet, ensureSheets } from '@/lib/sheets';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { generateReference, sanitizeInput } from '@/lib/utils';

const OrderSchema = z.object({
  customerName: z.string().min(2).max(100),
  phone: z.string().regex(/^(0)(20|23|24|25|26|27|28|50|54|55|56|57|59)\d{7}$/, 'Invalid Ghana phone'),
  location: z.string().min(2).max(200),
  items: z.array(z.object({
    productId: z.number(),
    productName: z.string(),
    variant: z.string(),
    quantity: z.number().int().min(1).max(50),
    unitPrice: z.number().positive(),
    image: z.string(),
  })).min(1),
});

async function sendEmailNotification(order: {
  customerName: string; phone: string; location: string;
  productName: string; variant: string; quantity: number;
  amount: number; reference: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  if (!adminEmail || !resendKey) return;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'The Jersey Plug GH <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `🏆 New Order ${order.reference} — ${order.productName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <div style="background:#1D4ED8;padding:20px;border-radius:12px 12px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:22px">⚽ New Order Received!</h1>
              <p style="color:#BFDBFE;margin:6px 0 0">The Jersey Plug GH — retrogh.shop</p>
            </div>
            <div style="background:#F0F7FF;padding:24px;border:1px solid #BFDBFE;border-top:none">
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr style="background:#DBEAFE"><td style="padding:10px 8px;color:#1E3A8A;width:40%">Reference</td><td style="padding:10px 8px;font-weight:bold;color:#1D4ED8">${order.reference}</td></tr>
                <tr><td style="padding:10px 8px;color:#475569">Jersey</td><td style="padding:10px 8px">${order.productName} — Size: ${order.variant} ×${order.quantity}</td></tr>
                <tr style="background:#DBEAFE"><td style="padding:10px 8px;color:#1E3A8A">Customer</td><td style="padding:10px 8px">${order.customerName}</td></tr>
                <tr><td style="padding:10px 8px;color:#475569">Phone</td><td style="padding:10px 8px">${order.phone}</td></tr>
                <tr style="background:#DBEAFE"><td style="padding:10px 8px;color:#1E3A8A">Location</td><td style="padding:10px 8px">${order.location}</td></tr>
                <tr style="background:#FEF3C7"><td style="padding:10px 8px;color:#92400E;font-weight:bold;font-size:16px">Amount</td><td style="padding:10px 8px;color:#DC2626;font-weight:bold;font-size:20px">GHS ${order.amount}</td></tr>
              </table>
            </div>
            <div style="background:#fff;padding:16px;border:1px solid #BFDBFE;border-top:none;border-radius:0 0 12px 12px;text-align:center">
              <p style="color:#475569;font-size:13px;margin:0">Login to approve or cancel this order</p>
              <p style="color:#1D4ED8;font-size:13px;margin:6px 0 0;font-weight:bold">retrogh.shop/admin</p>
            </div>
          </div>`,
      }),
    });
    if (!res.ok) { const err = await res.json(); console.error('Resend error:', err); }
    else console.log('Order email sent to', adminEmail);
  } catch (err) {
    console.error('Email failed:', err);
  }
}

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const doc = await getSpreadsheet();
    await ensureSheets(doc);
    const sheet = doc.sheetsByTitle['orders'];
    const rows = await sheet.getRows();

    const orders = rows.map((r, index) => ({
      id: Number(r.get('id')) || index + 1,
      reference: r.get('reference') || '',
      customerName: r.get('name') || 'Unknown',
      phone: r.get('phone') || '',
      location: r.get('location') || '',
      amount: Number(r.get('amount')) || 0,
      status: r.get('status') || 'Pending',
      timestamp: r.get('timestamp') || new Date().toISOString(),
      items: [{
        productId: Number(r.get('product_id')) || 0,
        productName: r.get('product_name') || 'Unknown Product',
        variant: r.get('variant') || 'Standard',
        quantity: Number(r.get('quantity')) || 1,
        unitPrice: Number(r.get('amount')) || 0,
        image: '',
      }],
    })).filter((o) => o.reference).reverse();

    return NextResponse.json({ success: true, data: orders });
  } catch (err) {
    console.error('GET /orders error:', err);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(`order:${ip}`, 3, 900)) {
    return NextResponse.json({ error: 'Too many orders. Try again later.' }, { status: 429 });
  }

  const body = await req.json();
  const result = OrderSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data', details: result.error.flatten() }, { status: 400 });
  }

  const data = result.data;
  const item = data.items[0];
  const amount = data.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const reference = generateReference(item.productName, data.location);
  const timestamp = new Date().toISOString();

  try {
    const doc = await getSpreadsheet();
    await ensureSheets(doc);
    const sheet = doc.sheetsByTitle['orders'];
    const rows = await sheet.getRows();
    const newId = rows.length ? Math.max(...rows.map((r) => Number(r.get('id')) || 0)) + 1 : 1;

    await sheet.addRow({
      id: newId, reference,
      name: sanitizeInput(data.customerName),
      phone: data.phone.replace(/\s/g, ''),
      location: sanitizeInput(data.location),
      product_name: item.productName,
      product_id: item.productId,
      variant: item.variant || 'Standard',
      quantity: item.quantity,
      amount, status: 'Pending', timestamp,
    });

    // Update stock
    const pSheet = doc.sheetsByTitle['products'];
    const pRows = await pSheet.getRows();
    const productRow = pRows.find((r) => Number(r.get('id')) === item.productId);
    if (productRow) {
      const newStock = Math.max(0, Number(productRow.get('stock')) - item.quantity);
      productRow.set('stock', newStock);
      productRow.set('status', newStock > 0 ? 'In Stock' : 'Out of Stock');
      await productRow.save();
    }

    await sendEmailNotification({
      customerName: data.customerName, phone: data.phone,
      location: data.location, productName: item.productName,
      variant: item.variant || 'Standard', quantity: item.quantity,
      amount, reference,
    });

    // Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `⚽ NEW ORDER\n\n👕 ${item.productName} (${item.variant}) ×${item.quantity}\n👤 ${data.customerName}\n📱 ${data.phone}\n📍 ${data.location}\n💰 GHS ${amount}\n🔖 ${reference}`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: { reference, message: 'Order confirmed! We will contact you shortly.' } }, { status: 201 });
  } catch (err) {
    console.error('POST /orders error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
