'use client';
import { useState } from 'react';
import { Search, Phone, Check, X, Package, RefreshCw, MessageCircle } from 'lucide-react';
import { Input, Button, Card, Badge } from '@/components/ui/index';
import { COLORS, BUSINESS } from '@/lib/constants';
import { useOrders, useUpdateOrderStatus } from '@/hooks/index';
import toast from 'react-hot-toast';
import type { Order } from '@/types';

const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
  Pending: 'warning', Approved: 'info', Completed: 'success', Cancelled: 'error',
};

export function OrderManager() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { data, refetch, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const orders: Order[] = data?.data ?? [];

  const filtered = orders.filter((o) => {
    if (!o.id) return false;
    if (filter !== 'all' && o.status?.toLowerCase() !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.customerName?.toLowerCase().includes(q) || o.phone?.includes(q) ||
        o.reference?.toLowerCase().includes(q) || o.location?.toLowerCase().includes(q) ||
        o.items?.[0]?.productName?.toLowerCase().includes(q);
    }
    return true;
  });

  const update = async (id: number, status: string) => {
    if (!id || isNaN(id)) { toast.error('Cannot update — invalid order ID'); return; }
    await toast.promise(updateStatus.mutateAsync({ id, status }), {
      loading: 'Updating...', success: `Marked as ${status}`, error: 'Failed to update',
    });
  };

  const whatsappMsg = (o: Order) => {
    const product = o.items?.[0]?.productName || 'your jersey';
    const size = o.items?.[0]?.variant || 'Standard';
    const msg = encodeURIComponent(
      `Hello ${o.customerName}! 👋\n\nThank you for your order at *${BUSINESS.name}*.\n\n` +
      `📦 *${product}* (Size: ${size})\n🔖 Ref: *${o.reference}*\n💰 Amount: *GHS ${o.amount}*\n\n` +
      `Please make payment via Mobile Money:\n📱 *${BUSINESS.momo}* (${BUSINESS.momoName})\n\n` +
      `Use your reference number *${o.reference}* as the payment note.\n\n` +
      `Once payment is confirmed, we will process your delivery to *${o.location}*. 🚚\n\nThank you! ⚽`
    );
    const phone = o.phone.replace(/^0/, '233');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const smsMsg = (o: Order) => {
    const product = o.items?.[0]?.productName || 'your jersey';
    const msg = encodeURIComponent(
      `Hi ${o.customerName}, your order for ${product} (Ref: ${o.reference}) is confirmed. ` +
      `Pay GHS ${o.amount} to MoMo ${BUSINESS.momo}. Use ref as payment note. - ${BUSINESS.shortName}`
    );
    window.open(`sms:${o.phone}?body=${msg}`, '_blank');
  };

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    approved: orders.filter((o) => o.status === 'Approved').length,
    completed: orders.filter((o) => o.status === 'Completed').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>
          Orders <span className="text-base font-normal ml-2" style={{ color: COLORS.textMuted }}>({orders.length})</span>
        </h2>
        <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm">
          <Input placeholder="Search orders..." value={search}
            onChange={(e) => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'completed', 'cancelled'] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all border ${
                filter === s ? 'text-white' : 'hover:bg-jp-primary-light'
              }`}
              style={filter === s
                ? { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, borderColor: COLORS.primary }
                : { borderColor: COLORS.border, color: COLORS.textSoft }}>
              {s}{counts[s as keyof typeof counts] !== undefined && (
                <span className="ml-1 text-xs opacity-70">({counts[s as keyof typeof counts]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: COLORS.textMuted }}>
            <div className="text-5xl mb-3">📋</div><p>No orders found</p>
          </div>
        ) : filtered.map((o) => (
          <Card key={o.id} className="p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold" style={{ color: COLORS.text }}>
                    {o.items?.[0]?.productName || '—'}
                  </h4>
                  <Badge variant={STATUS_VARIANT[o.status] ?? 'primary'}>{o.status}</Badge>
                </div>
                <p className="text-xs" style={{ color: COLORS.textSoft }}>
                  Size: {o.items?.[0]?.variant || 'Standard'} × {o.items?.[0]?.quantity || 1}
                </p>
                <p className="text-sm" style={{ color: COLORS.textSoft }}>
                  <span className="font-medium">{o.customerName}</span> · {o.phone} · {o.location}
                </p>
                <p className="text-xs font-mono" style={{ color: COLORS.textMuted }}>
                  {new Date(o.timestamp).toLocaleString('en-GH')} · {o.reference}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <p className="text-xl font-bold" style={{ color: COLORS.primary }}>
                  {BUSINESS.currency} {Number(o.amount).toLocaleString()}
                </p>
                <div className="flex gap-2 flex-wrap justify-end">
                  {o.status === 'Pending' && (
                    <>
                      <Button size="sm" onClick={() => update(o.id, 'Approved')}>
                        <Check className="w-3 h-3 mr-1" />Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => update(o.id, 'Cancelled')}>
                        <X className="w-3 h-3 mr-1" />Cancel
                      </Button>
                    </>
                  )}
                  {o.status === 'Approved' && (
                    <Button size="sm" onClick={() => update(o.id, 'Completed')}>
                      <Package className="w-3 h-3 mr-1" />Complete
                    </Button>
                  )}
                  <button onClick={() => whatsappMsg(o)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#25D366' }}>
                    <MessageCircle className="w-3 h-3" />WhatsApp
                  </button>
                  <button onClick={() => smsMsg(o)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all hover:bg-jp-primary-light"
                    style={{ color: COLORS.text, borderColor: COLORS.border }}>
                    <Phone className="w-3 h-3" />SMS
                  </button>
                  <a href={`tel:${o.phone}`}>
                    <Button size="sm" variant="secondary"><Phone className="w-3 h-3" /></Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
