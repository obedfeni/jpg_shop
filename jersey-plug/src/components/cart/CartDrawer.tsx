'use client';
import { useState } from 'react';
import { X, Phone, User, MapPin, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input } from '@/components/ui/index';
import { COLORS, BUSINESS, SIZES } from '@/lib/constants';
import { validateGhanaPhone, sanitizeInput } from '@/lib/utils';
import { useCreateOrder } from '@/hooks/index';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

interface CartDrawerProps {
  isOpen: boolean; onClose: () => void;
  selectedProduct: Product | null; onClearSelection: () => void;
}

export function CartDrawer({ isOpen, onClose, selectedProduct, onClearSelection }: CartDrawerProps) {
  const [step, setStep] = useState<'product' | 'form' | 'success'>('product');
  const [form, setForm] = useState({ name: '', phone: '', location: '', quantity: 1, variant: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderRef, setOrderRef] = useState('');
  const createOrder = useCreateOrder();
  const product = selectedProduct;
  const selectedVariant = product?.variants?.find((v) => v.name === form.variant);
  const unitPrice = selectedVariant?.price ?? product?.price ?? 0;
  const total = unitPrice * form.quantity;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Full name required';
    if (!validateGhanaPhone(form.phone)) e.phone = 'Valid Ghana phone required (e.g. 0541234567)';
    if (!form.location.trim()) e.location = 'Location required';
    if ((product?.variants?.length || 0) > 0 && !form.variant) e.variant = 'Please select a size';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate() || !product) return;
    try {
      const result = await createOrder.mutateAsync({
        customerName: sanitizeInput(form.name),
        phone: form.phone.replace(/\s/g, ''),
        location: sanitizeInput(form.location),
        items: [{
          productId: product.id, productName: product.name,
          variant: form.variant || 'Standard',
          quantity: form.quantity, unitPrice,
          image: product.image1 || '',
        }],
      });
      setOrderRef(result.data?.reference ?? '');
      setStep('success');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Order failed. Please try again.');
    }
  };

  const close = () => {
    onClose();
    setTimeout(() => {
      setStep('product');
      setForm({ name: '', phone: '', location: '', quantity: 1, variant: '' });
      setErrors({});
      setOrderRef('');
      onClearSelection();
    }, 300);
  };

  // Size buttons — show variants if product has them, else show standard sizes
  const sizeOptions = product?.variants?.length
    ? product.variants
    : SIZES.map((s) => ({ name: s, price: product?.price || 0 }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6 min-h-full flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}>
                    ⚽
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: COLORS.text }}>
                    {step === 'success' ? '✅ Order Confirmed!' : 'Complete Order'}
                  </h2>
                </div>
                <button onClick={close} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Step 1: Product */}
              {step === 'product' && product && (
                <div className="space-y-5 flex-1">
                  <div className="bg-jp-bg rounded-2xl overflow-hidden aspect-video flex items-center justify-center border" style={{ borderColor: COLORS.border }}>
                    {product.image1
                      ? <img src={product.image1} alt={product.name} className="max-h-full max-w-full object-contain p-4" />
                      : <div className="text-5xl opacity-30">👕</div>}
                  </div>
                  <div>
                    {product.category && (
                      <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white mb-2"
                        style={{ backgroundColor: COLORS.primary }}>{product.category}</span>
                    )}
                    <h3 className="text-xl font-bold" style={{ color: COLORS.text }}>{product.name}</h3>
                    {product.description && <p className="text-sm mt-1" style={{ color: COLORS.textSoft }}>{product.description}</p>}
                    <p className="text-2xl font-bold mt-2" style={{ color: COLORS.primary }}>
                      {BUSINESS.currency} {product.price}
                    </p>
                  </div>

                  {/* Size selection */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: COLORS.text }}>
                      Select Size {errors.variant && <span className="text-red-500 ml-1 font-normal">{errors.variant}</span>}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((v) => (
                        <button key={v.name} onClick={() => setForm((p) => ({ ...p, variant: v.name }))}
                          className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                            form.variant === v.name
                              ? 'text-white border-jp-primary'
                              : 'border-jp-border hover:border-jp-primary text-jp-text'
                          }`}
                          style={form.variant === v.name ? { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, borderColor: COLORS.primary } : {}}>
                          {v.name}
                          {product.variants?.length > 0 && v.price !== product.price && (
                            <span className="ml-1 text-xs opacity-80"> +{v.price - product.price}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => setStep('form')} className="w-full" size="lg">Continue to Checkout →</Button>
                </div>
              )}

              {/* Step 2: Form */}
              {step === 'form' && product && (
                <div className="space-y-4 flex-1">
                  <div className="rounded-2xl p-4 border" style={{ backgroundColor: COLORS.primaryLight, borderColor: COLORS.border }}>
                    <p className="font-bold" style={{ color: COLORS.text }}>{product.name}</p>
                    <p className="text-sm" style={{ color: COLORS.textSoft }}>Size: {form.variant || 'Standard'} × {form.quantity}</p>
                    <p className="text-xl font-bold mt-1" style={{ color: COLORS.primary }}>
                      Total: {BUSINESS.currency} {total.toLocaleString()}
                    </p>
                  </div>
                  <Input label="Full Name" value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    error={errors.name} placeholder="Kwame Mensah" icon={<User className="w-4 h-4" />} />
                  <Input label="Phone Number" value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    error={errors.phone} placeholder="0541234567" icon={<Phone className="w-4 h-4" />} type="tel" />
                  <Input label="Delivery Location" value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    error={errors.location} placeholder="Accra, Kumasi, Takoradi..."
                    icon={<MapPin className="w-4 h-4" />} />
                  <div>
                    <label className="block text-sm font-bold mb-1.5" style={{ color: COLORS.text }}>Quantity</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setForm((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                        className="w-10 h-10 rounded-xl border font-bold text-xl transition-colors hover:bg-jp-primary-light"
                        style={{ borderColor: COLORS.border }}>−</button>
                      <span className="text-xl font-bold w-12 text-center">{form.quantity}</span>
                      <button onClick={() => setForm((p) => ({ ...p, quantity: Math.min(50, p.quantity + 1) }))}
                        className="w-10 h-10 rounded-xl border font-bold text-xl transition-colors hover:bg-jp-primary-light"
                        style={{ borderColor: COLORS.border }}>+</button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setStep('product')} className="flex-1">← Back</Button>
                    <Button onClick={submit} isLoading={createOrder.isPending} className="flex-1">Place Order ⚽</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Success */}
              {step === 'success' && (
                <div className="flex-1 flex flex-col items-center text-center py-6 space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-700">Order Placed!</h3>
                  <div className="bg-gray-50 rounded-2xl p-4 w-full border" style={{ borderColor: COLORS.border }}>
                    <p className="text-sm text-gray-500 mb-1">Your reference number</p>
                    <p className="text-lg font-mono font-bold" style={{ color: COLORS.text }}>{orderRef}</p>
                  </div>
                  <div className="rounded-2xl p-4 w-full text-left space-y-2 border"
                    style={{ backgroundColor: COLORS.primaryLight, borderColor: COLORS.border }}>
                    <p className="font-bold" style={{ color: COLORS.primaryDark }}>What happens next?</p>
                    <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>
                      ✅ We have received your order.<br /><br />
                      📞 We will contact you at <strong>{form.phone}</strong> shortly to confirm your order and send payment details.<br /><br />
                      📦 Delivery to <strong>{form.location}</strong> after payment is confirmed.
                    </p>
                  </div>
                  <Button onClick={close} size="lg" className="w-full mt-4">Continue Shopping</Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
