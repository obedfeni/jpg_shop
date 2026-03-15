import { NextRequest, NextResponse } from 'next/server';
import { getSpreadsheet } from '@/lib/sheets';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['products'];
    const rows = await sheet.getRows();
    const row = rows.find((r) => Number(r.get('id')) === id);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await row.delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /products/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = Number(rawId);
  const body = await req.json();

  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['products'];
    const rows = await sheet.getRows();
    const row = rows.find((r) => Number(r.get('id')) === id);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (body.stock !== undefined) { row.set('stock', body.stock); row.set('status', body.stock > 0 ? 'In Stock' : 'Out of Stock'); }
    if (body.name !== undefined) row.set('name', body.name);
    if (body.price !== undefined) row.set('price', body.price);
    await row.save();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /products/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
