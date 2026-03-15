import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSpreadsheet, parseVariants, serializeVariants, ensureSheets } from '@/lib/sheets';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

const ProductSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  description: z.string().max(500).optional().default(''),
  category: z.string().max(50).optional().default('Club Jerseys'),
  images: z.array(z.string()).max(3).default([]),
  variants: z.array(z.object({ name: z.string(), price: z.number() })).default([]),
});

export async function GET() {
  try {
    const doc = await getSpreadsheet();
    await ensureSheets(doc);
    const sheet = doc.sheetsByTitle['products'];
    const rows = await sheet.getRows();

    const products = rows.map((r) => ({
      id: Number(r.get('id')),
      name: r.get('name') || '',
      price: Number(r.get('price')) || 0,
      stock: Number(r.get('stock')) || 0,
      image1: r.get('image1') || '',
      image2: r.get('image2') || '',
      image3: r.get('image3') || '',
      description: r.get('description') || '',
      category: r.get('category') || 'Club Jerseys',
      status: r.get('status') || 'Out of Stock',
      variants: parseVariants(r.get('variants') || ''),
    })).filter((p) => p.name);

    return NextResponse.json({ success: true, data: products }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    });
  } catch (err) {
    console.error('GET /products error:', err);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get('authorization'));
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const result = ProductSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid data', details: result.error.flatten() }, { status: 400 });
  }

  try {
    const doc = await getSpreadsheet();
    await ensureSheets(doc);
    const sheet = doc.sheetsByTitle['products'];
    const rows = await sheet.getRows();
    const newId = rows.length ? Math.max(...rows.map((r) => Number(r.get('id')) || 0)) + 1 : 1;
    const { name, price, stock, description, category, images, variants } = result.data;

    await sheet.addRow({
      id: newId, name, price, stock,
      image1: images[0] || '', image2: images[1] || '', image3: images[2] || '',
      description, category,
      status: stock > 0 ? 'In Stock' : 'Out of Stock',
      variants: serializeVariants(variants),
    });

    return NextResponse.json({ success: true, data: { id: newId } }, { status: 201 });
  } catch (err) {
    console.error('POST /products error:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
