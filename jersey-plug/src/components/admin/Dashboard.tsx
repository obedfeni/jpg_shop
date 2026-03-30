'use client';
import { useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, LogOut, TrendingUp, CheckCircle, Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card } from '@/components/ui/index';
import { COLORS, BUSINESS } from '@/lib/constants';
import { useAuth, useProducts, useOrders } from '@/hooks/index';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ProductManager } from './ProductManager';
import { OrderManager } from './OrderManager';

type Tab = 'dashboard' | 'products' | 'orders';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { logout } = useAuth();
  const { data: productsData } = useProducts();
  const { data: ordersData } = useOrders();
  const { data: analyticsData } = useAnalytics();

  const products = productsData?.data ?? [];
  const orders = ordersData?.data ?? [];
  const analytics = analyticsData?.data;

  const stats = {
    totalProducts: products.length,
    inStock: products.filter((p) => p.stock > 0).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'Pending').length,
    completedOrders: orders.filter((o) => o.status === 'Completed').length,
    // Revenue — only completed orders
    revenue: orders
      .filter((o) => o.status === 'Completed')
      .reduce((s, o) => s + (Number(o.amount) || 0), 0),
  };

  const tabs = [
    { id: 'dashboard' as Tab, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products' as Tab, icon: Package, label: 'Jerseys' },
    { id: 'orders' as Tab, icon: ShoppingBag, label: 'Orders' },
  ];

  const statCards = [
    { label: 'Total Jerseys', value: stats.totalProducts, sub: `${stats.inStock} in stock`, icon: Package, color: COLORS.primary },
    { label: 'Total Orders', value: stats.totalOrders, sub: `${stats.pendingOrders} pending`, icon: ShoppingBag, color: '#7C3AED' },
    { label: 'Completed', value: stats.completedOrders, sub: 'fulfilled orders', icon: CheckCircle, color: COLORS.success },
    {
      label: 'Revenue (GHS)',
      value: stats.revenue.toLocaleString(),
      sub: 'completed orders only',
      icon: TrendingUp,
      color: COLORS.danger,
    },
  ];

  const visitorCards = [
    { label: "Today's Visits", value: analytics?.todayVisits ?? '—', sub: 'total page views today', icon: Eye, color: COLORS.primary },
    { label: "Today's Visitors", value: analytics?.todayUnique ?? '—', sub: 'unique visitors today', icon: Users, color: '#7C3AED' },
    { label: 'Total Visits', value: analytics?.totalVisits ?? '—', sub: 'all time page views', icon: Eye, color: COLORS.success },
    { label: 'Total Visitors', value: analytics?.totalUnique ?? '—', sub: 'all time unique visitors', icon: Users, color: COLORS.accent },
  ];

  return (
    <div className="min-h-screen" style={{ background: COLORS.bg }}>
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-40 shadow-sm" style={{ borderColor: COLORS.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}>⚽</div>
                <span className="font-bold text-base" style={{ color: COLORS.text }}>{BUSINESS.shortName} Admin</span>
              </div>
              <div className="hidden md:flex gap-1">
                {tabs.map((t) => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'text-white' : 'hover:bg-jp-primary-light'}`}
                    style={activeTab === t.id
                      ? { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }
                      : { color: COLORS.textSoft }}>
                    <t.icon className="w-4 h-4" />{t.label}
                    {t.id === 'orders' && stats.pendingOrders > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {stats.pendingOrders}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />Logout
            </Button>
          </div>
          <div className="flex md:hidden gap-1 pb-2 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === t.id ? 'text-white' : 'hover:bg-jp-primary-light'}`}
                style={activeTab === t.id
                  ? { background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }
                  : { color: COLORS.textSoft }}>
                <t.icon className="w-3.5 h-3.5" />{t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

            {/* Store stats */}
            <div>
              <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.text }}>Store Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <Card className="p-5 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: s.color + '18' }}>
                        <s.icon className="w-5 h-5" style={{ color: s.color }} />
                      </div>
                      <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-sm font-semibold mt-1" style={{ color: COLORS.text }}>{s.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>{s.sub}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Visitor stats */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.text }}>
                <Eye className="w-5 h-5" style={{ color: COLORS.primary }} />
                Website Visitors
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {visitorCards.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }}>
                    <Card className="p-5 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: s.color + '18' }}>
                        <s.icon className="w-5 h-5" style={{ color: s.color }} />
                      </div>
                      <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-sm font-semibold mt-1" style={{ color: COLORS.text }}>{s.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: COLORS.textMuted }}>{s.sub}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Last 7 days table */}
            {analytics?.last7Days && analytics.last7Days.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.text }}>Last 7 Days</h2>
                <Card className="overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: COLORS.primaryLight }}>
                        <th className="text-left px-5 py-3 font-semibold" style={{ color: COLORS.primaryDark }}>Date</th>
                        <th className="text-right px-5 py-3 font-semibold" style={{ color: COLORS.primaryDark }}>Page Views</th>
                        <th className="text-right px-5 py-3 font-semibold" style={{ color: COLORS.primaryDark }}>Unique Visitors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.last7Days.map((d, i) => (
                        <tr key={d.date} style={{ backgroundColor: i % 2 === 0 ? 'white' : COLORS.bg }}>
                          <td className="px-5 py-3 font-medium" style={{ color: COLORS.text }}>
                            {new Date(d.date).toLocaleDateString('en-GH', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-5 py-3 text-right font-bold" style={{ color: COLORS.primary }}>{d.visits}</td>
                          <td className="px-5 py-3 text-right font-bold" style={{ color: '#7C3AED' }}>{d.uniqueVisitors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {/* Recent orders */}
            {orders.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ color: COLORS.text }}>Recent Orders</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-sm font-medium" style={{ color: COLORS.primary }}>View all →</button>
                </div>
                <Card className="p-5">
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: COLORS.border }}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: COLORS.text }}>{o.customerName}</p>
                          <p className="text-xs" style={{ color: COLORS.textMuted }}>{o.items?.[0]?.productName} · {o.reference}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: COLORS.primary }}>{BUSINESS.currency} {Number(o.amount).toLocaleString()}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            o.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                            o.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            o.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        )}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'orders' && <OrderManager />}
      </main>
    </div>
  );
}
