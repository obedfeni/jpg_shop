import { NextRequest, NextResponse } from 'next/server';
import { getSpreadsheet } from '@/lib/sheets';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: rawId } = await params;
  if (!rawId || rawId === 'null' || rawId === 'undefined') {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
  }

  const id = Number(rawId);
  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
  }

  const { status } = await req.json();
  const validStatuses = ['Pending', 'Approved', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['orders'];
    const rows = await sheet.getRows();
    const row = rows.find((r) => Number(r.get('id')) === id);
    if (!row) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    row.set('status', status);
    await row.save();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /orders/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
