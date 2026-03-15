'use client';
import { useState, useRef } from 'react';
import { Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { Button, Input, Card, Badge } from '@/components/ui/index';
import { COLORS, BUSINESS, CATEGORIES, SIZES } from '@/lib/constants';
import { useProducts, useCreateProduct, useDeleteProduct, useUpload } from '@/hooks/index';
import toast from 'react-hot-toast';

export function ProductManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', category: 'Club Jerseys', variants: '' });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [useSizes, setUseSizes] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, refetch } = useProducts();
  const products = data?.data ?? [];
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const upload = useUpload();

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, BUSINESS.maxImages);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const resetForm = () => {
    setForm({ name: '', price: '', stock: '', description: '', category: 'Club Jerseys', variants: '' });
    setImages([]); setPreviews([]); setIsAdding(false);
  };

  const submit = async () => {
    if (!form.name || !form.price || !form.stock) { toast.error('Name, price, and stock are required'); return; }
    const toastId = toast.loading('Uploading images...');
    try {
      const urls: string[] = [];
      for (const img of images) {
        const url = await upload.upload(img, `${form.name}_${Date.now()}`);
        if (url) urls.push(url);
      }
      toast.loading('Saving jersey...', { id: toastId });

      let variants: Array<{ name: string; price: number }> = [];
      if (useSizes) {
        variants = SIZES.map((s) => ({ name: s, price: Number(form.price) }));
      } else if (form.variants.trim()) {
        variants = form.variants.split(',').map((v) => {
          const [n, p] = v.split(':');
          return { name: n?.trim(), price: Number(p) || Number(form.price) };
        }).filter((v) => v.name);
      }

      await createProduct.mutateAsync({
        name: form.name, price: Number(form.price), stock: Number(form.stock),
        description: form.description, category: form.category,
        images: urls, variants,
      });
      toast.success('Jersey added!', { id: toastId });
      resetForm();
    } catch { toast.error('Failed to save jersey', { id: toastId }); }
  };

  const del = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await toast.promise(deleteProduct.mutateAsync(id), { loading: 'Deleting...', success: 'Deleted!', error: 'Failed' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>
          Jerseys <span className="text-base font-normal text-jp-text-muted ml-2">({products.length})</span>
        </h2>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}><Plus className="w-4 h-4 mr-2" />Add Jersey</Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>New Jersey</h3>
            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Input label="Jersey Name *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Barcelona Home 2024/25" />
            <Input label="Price (GHS) *" type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="350" />
            <Input label="Stock Quantity *" type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} placeholder="20" />
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.text }}>Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jp-primary/30"
                style={{ borderColor: COLORS.border }}>
                {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <Input label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Official replica jersey..." />
            </div>
          </div>

          {/* Size options */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" style={{ color: COLORS.text }}>Size Options</label>
            <div className="flex gap-3 mb-3">
              <button onClick={() => setUseSizes(true)}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${useSizes ? 'border-jp-primary text-white' : 'border-jp-border'}`}
                style={useSizes ? { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` } : { color: COLORS.textSoft }}>
                Standard Sizes (S/M/L/XL/XXL)
              </button>
              <button onClick={() => setUseSizes(false)}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${!useSizes ? 'border-jp-primary text-white' : 'border-jp-border'}`}
                style={!useSizes ? { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` } : { color: COLORS.textSoft }}>
                Custom Variants
              </button>
            </div>
            {!useSizes && (
              <Input label="Custom Variants (name:price)" value={form.variants}
                onChange={(e) => setForm((p) => ({ ...p, variants: e.target.value }))}
                placeholder="Small:300, Medium:350, Large:400" />
            )}
            {useSizes && (
              <div className="flex gap-2">
                {SIZES.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: COLORS.primary }}>{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="mb-5">
            <label className="block text-sm font-bold mb-2" style={{ color: COLORS.text }}>
              Jersey Photos (max {BUSINESS.maxImages})
            </label>
            <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleFiles} className="hidden" />
            <div className="flex gap-3 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border" style={{ borderColor: COLORS.border }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => { const nf = images.filter((_, j) => j !== i); setImages(nf); setPreviews(nf.map((f) => URL.createObjectURL(f))); }}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {previews.length < BUSINESS.maxImages && (
                <button onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 hover:bg-jp-primary-light transition-all"
                  style={{ borderColor: COLORS.border }}>
                  <ImageIcon className="w-5 h-5" style={{ color: COLORS.textMuted }} />
                  <span className="text-xs" style={{ color: COLORS.textMuted }}>Add Photo</span>
                </button>
              )}
            </div>
            {upload.isUploading && (
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full transition-all" style={{ width: `${upload.progress}%`, backgroundColor: COLORS.primary }} />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button onClick={submit} isLoading={createProduct.isPending || upload.isUploading}>Save Jersey</Button>
          </div>
        </Card>
      )}

      {/* Products grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <Card key={p.id} className="p-4 flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
              style={{ backgroundColor: COLORS.bg }}>
              {p.image1 ? <img src={p.image1} alt={p.name} className="w-full h-full object-cover" />
                : <ImageIcon className="w-8 h-8" style={{ color: COLORS.textMuted }} />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm truncate" style={{ color: COLORS.text }}>{p.name}</h4>
              <p className="text-xs" style={{ color: COLORS.textSoft }}>{p.category}</p>
              <p className="text-base font-bold" style={{ color: COLORS.primary }}>{BUSINESS.currency} {p.price}</p>
              <div className="flex items-center justify-between mt-1">
                <Badge variant={p.stock > 0 ? 'success' : 'error'}>
                  {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                </Badge>
                <Button variant="danger" size="sm" onClick={() => del(p.id, p.name)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {!products.length && !isAdding && (
        <div className="text-center py-16" style={{ color: COLORS.textMuted }}>
          <div className="text-5xl mb-3">👕</div><p>No jerseys yet. Add your first one!</p>
        </div>
      )}
    </div>
  );
}
