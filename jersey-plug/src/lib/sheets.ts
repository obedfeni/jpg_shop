import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

export async function getSpreadsheet(): Promise<GoogleSpreadsheet> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const sheetId = process.env.GOOGLE_SHEET_ID!;
  let key = process.env.GOOGLE_PRIVATE_KEY!;

  if (!email || !key || !sheetId) {
    throw new Error(`Missing env vars. email=${!!email} key=${!!key} sheetId=${!!sheetId}`);
  }

  key = key.replace(/^["']|["']$/g, '');
  key = key.replace(/\\n/g, '\n');

  if (!key.includes('-----BEGIN')) {
    throw new Error('GOOGLE_PRIVATE_KEY is malformed');
  }

  const auth = new JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(sheetId, auth);
  await doc.loadInfo();
  return doc;
}

export function parseVariants(raw: string) {
  if (!raw) return [];
  return raw.split(',').map((p) => {
    const [name, price] = p.split(':');
    return { name: name?.trim(), price: Number(price) };
  }).filter((v) => v.name && !isNaN(v.price));
}

export function serializeVariants(variants: Array<{ name: string; price: number }>) {
  return variants.map((v) => `${v.name}:${v.price}`).join(', ');
}

export async function ensureSheets(doc: GoogleSpreadsheet) {
  const productHeaders = ['id', 'name', 'price', 'stock', 'image1', 'image2', 'image3', 'description', 'category', 'status', 'variants'];
  const orderHeaders = ['id', 'reference', 'name', 'phone', 'location', 'product_name', 'product_id', 'variant', 'quantity', 'amount', 'status', 'timestamp'];

  if (!doc.sheetsByTitle['products']) {
    await doc.addSheet({ title: 'products', headerValues: productHeaders });
  }
  if (!doc.sheetsByTitle['orders']) {
    await doc.addSheet({ title: 'orders', headerValues: orderHeaders });
  }
}
