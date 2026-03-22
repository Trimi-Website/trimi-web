import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiArchive, FiPlus, FiTrash2, FiCornerUpLeft, FiUsers,
  FiSearch, FiMessageCircle, FiUser, FiTruck, FiX, FiCheck,
  FiBarChart2, FiTrendingUp, FiShoppingBag,
} from 'react-icons/fi';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

// ── Hardcoded shipper roster ──────────────────────────────────────────────────
// email field enables the Shipper Dashboard to filter orders by login email
const SHIPPERS = [
  { name: 'Phạm Vũ Hoàng',    phone: '0865481225', image: '/shipper.jpg',  email: 'phanbasongtoan112@gmail.com' },
  { name: 'Phan Bá Song Toàn', phone: '0914320196', image: '/shipper2.jpg', email: '690demonking069@gmail.com'   },
  { name: 'Hồ Thành Tài',      phone: '0345543606', image: '/shipper3.jpg', email: ''                           },
  { name: 'Lê Trần Bình An',   phone: '0342585006', image: '/shipper4.jpg', email: ''                           },
];

// ── Notification helper ───────────────────────────────────────────────────────
const notifyOrderStatus = async (db, order, newStatus) => {
  if (!order?.uid) return;
  const notifId = `status_${order.id}_${Date.now()}`;
  const statusEmoji = {
    'Đang chuẩn bị hàng':    '📦',
    'Đang giao hàng':         '🚚',
    'Hoàn thành':             '✅',
    'Đơn không đạt yêu cầu': '❌',
    'Khách hàng tự hủy đơn': '🚫',
    'Chờ xác nhận thanh toán':'⏳',
  };
  await setDoc(
    doc(db, 'notifications', order.uid, 'items', notifId),
    {
      type: 'order_status',
      title: `${statusEmoji[newStatus] || '📋'} Cập nhật đơn hàng`,
      body: `Đơn ${order.orderId}: ${newStatus}`,
      isRead: false, createdAt: Date.now(),
      orderId: order.id, orderStatus: newStatus,
    }
  ).catch(() => {});
};

// ── Shipper Picker Modal ──────────────────────────────────────────────────────
function ShipperPickerModal({ order, isDarkMode, onConfirm, onCancel }) {
  const [selected, setSelected] = useState(
    // Pre-select the currently assigned shipper if any
    order.shipper
      ? SHIPPERS.findIndex(s => s.phone === order.shipper.phone)
      : null
  );

  // createPortal renders the modal directly on document.body.
  // This bypasses any CSS stacking context created by ancestor elements
  // (e.g. main's overflow-x:hidden + position:relative), so the modal
  // sits above the header, bottom nav, and every other element.
  return createPortal(
    <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative z-10 bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 animate-fade-in-up overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <FiTruck className="text-sky-500 text-2xl"/> Chọn Shipper
          </h3>
          <button onClick={onCancel} className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer">
            <FiX className="text-xl"/>
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-7 leading-relaxed">
          Đơn <span className="font-black text-slate-800">{order.orderId}</span> — Chọn shipper để giao hàng:
        </p>

        {/* Shipper list — generous spacing */}
        <div className="flex flex-col gap-4 mb-10">
          {SHIPPERS.map((shipper, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className={`flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                selected === idx
                  ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-100'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={shipper.image}
                  alt={shipper.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-16 h-16 rounded-full bg-sky-500 text-white hidden items-center justify-center text-2xl font-black border-2 border-white shadow-md">
                  {shipper.name.charAt(0)}
                </div>
                {selected === idx && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <FiCheck className="text-white text-xs"/>
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-black text-slate-900 text-base">{shipper.name}</p>
                <p className="text-sky-500 font-bold text-sm mt-1">{shipper.phone}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 rounded-full font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-sm">
            Hủy
          </button>
          <button
            onClick={() => selected !== null && onConfirm(SHIPPERS[selected])}
            disabled={selected === null}
            className={`flex-grow py-4 rounded-full font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm ${
              selected !== null
                ? 'bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <FiTruck/> Xác nhận giao hàng
          </button>
        </div>
      </div>
    </div>,
    document.body   // ← renders outside all stacking contexts
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
// Extracted as its own component so useState (chartPeriod) follows Rules of Hooks
function AnalyticsTab({ adminOrders, setPreviewImg }) {
  const [chartPeriod, setChartPeriod] = useState('day');

  const completedOrders = adminOrders.filter(o => o.status === 'Hoàn thành' && o.createdAt);

  const fmt = {
    day:   (ts) => new Date(ts).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    month: (ts) => new Date(ts).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }),
    year:  (ts) => new Date(ts).getFullYear().toString(),
  };

  const buckets = {};
  completedOrders.forEach(o => {
    const key = fmt[chartPeriod](o.createdAt);
    if (!buckets[key]) buckets[key] = { revenue: 0, items: 0, orders: 0 };
    buckets[key].revenue += Number(o.paidAmount) || 0;
    buckets[key].items   += (o.items || []).reduce((s, i) => s + (Number(i.quantity) || 1), 0);
    buckets[key].orders  += 1;
  });

  const MAX_BARS = chartPeriod === 'year' ? 5 : chartPeriod === 'month' ? 6 : 14;
  const sortedKeys = Object.keys(buckets).sort((a, b) => {
    const parse = s => {
      const p = s.split('/');
      if (p.length === 2 && p[0].length === 2) return new Date(`20${p[1].slice(-2)}-${p[0]}-01`).getTime();
      if (p.length === 3) return new Date(`${p[2]}-${p[1]}-${p[0]}`).getTime();
      return parseInt(s);
    };
    return parse(a) - parse(b);
  }).slice(-MAX_BARS);

  const data = sortedKeys.map(k => ({ label: k, ...buckets[k] }));
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const totalRevenue = completedOrders.reduce((s, o) => s + (Number(o.paidAmount) || 0), 0);
  const totalItems   = completedOrders.reduce((s, o) => s + (o.items || []).reduce((x, i) => x + (Number(i.quantity) || 1), 0), 0);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 text-slate-800">

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Tổng doanh thu',  value: totalRevenue.toLocaleString('vi-VN') + 'đ', icon: <FiTrendingUp className="text-xl"/>, color: 'bg-sky-500' },
          { label: 'Đơn hoàn thành', value: completedOrders.length,                      icon: <FiBarChart2 className="text-xl"/>,  color: 'bg-emerald-500' },
          { label: 'Sản phẩm đã bán', value: totalItems,                                 icon: <FiShoppingBag className="text-xl"/>,color: 'bg-violet-500' },
        ].map(s => (
          <div key={s.label} className={`${s.color} text-white rounded-2xl p-5 flex items-center gap-4 shadow-md`}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">{s.icon}</div>
            <div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-sm font-bold opacity-80 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Period toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-xl font-black flex items-center gap-2">
          <FiBarChart2 className="text-sky-500"/> Biểu đồ doanh thu
        </h3>
        <div className="bg-slate-100 p-1 rounded-full flex gap-1">
          {[{ key: 'day', label: 'Ngày' }, { key: 'month', label: 'Tháng' }, { key: 'year', label: 'Năm' }].map(p => (
            <button
              key={p.key}
              onClick={() => setChartPeriod(p.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                chartPeriod === p.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <FiBarChart2 className="text-5xl mb-3 opacity-40"/>
          <p className="font-bold text-sm">Chưa có dữ liệu doanh thu</p>
          <p className="text-xs mt-1 opacity-60">Dữ liệu sẽ hiện khi có đơn hoàn thành</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[460px]">
            <div className="flex gap-2 items-end h-52">
              {/* Y-axis */}
              <div className="flex flex-col justify-between h-full text-right pr-2 flex-shrink-0 w-20">
                {[1, 0.75, 0.5, 0.25, 0].map(frac => (
                  <span key={frac} className="text-[10px] text-slate-400 font-medium leading-none">
                    {Math.round(maxRevenue * frac / 1000)}k
                  </span>
                ))}
              </div>
              {/* Bars area */}
              <div className="flex-1 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 0.25, 0.5, 0.75, 1].map(f => (
                    <div key={f} className="border-t border-slate-100 w-full"/>
                  ))}
                </div>
                <div className="flex items-end gap-1.5 h-full relative z-10 px-1">
                  {data.map((d, idx) => {
                    const pct = (d.revenue / maxRevenue) * 100;
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg px-2 py-1 whitespace-nowrap pointer-events-none z-20 shadow-lg">
                          {d.revenue.toLocaleString('vi-VN')}đ<br/>
                          {d.orders} đơn · {d.items} sp
                        </div>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-sky-600 to-sky-400 hover:from-sky-500 hover:to-sky-300 transition-all shadow-sm cursor-default"
                          style={{ height: `${Math.max(pct, 2)}%`, minHeight: '4px' }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex gap-1.5 mt-2 pl-[88px] pr-1">
              {data.map((d, idx) => (
                <div key={idx} className="flex-1 text-center">
                  <span className="text-[9px] text-slate-400 font-medium">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data table */}
      {data.length > 0 && (
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-black border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Kỳ</th>
                <th className="px-5 py-3 text-right">Doanh thu</th>
                <th className="px-5 py-3 text-right">Đơn hàng</th>
                <th className="px-5 py-3 text-right">Sản phẩm bán</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d, idx) => (
                <tr key={idx} className="border-b last:border-0 border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-800">{d.label}</td>
                  <td className="px-5 py-3 text-right font-black text-sky-500">{d.revenue.toLocaleString('vi-VN')}đ</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-600">{d.orders}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-600">{d.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminView({
  isDarkMode, t, t_prod,
  localProducts, setLocalProducts,
  adminOrders, usersList,
  handleDeleteProduct,
  setShowAddModal, setEditFormData, setShowEditModal,
  openAdminChatWithUser,
  setPreviewImg, showToast, navigateTo,
  db,
}) {
  const [adminTab, setAdminTab] = useState('products');
  const [shipperPickerCtx, setShipperPickerCtx] = useState(null);
  const [grantUid, setGrantUid] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);

  // ── Grant shipper role by UID ─────────────────────────────────────────────
  const handleGrantShipper = async () => {
    const uid = grantUid.trim();
    if (!uid) return alert('Vui lòng nhập UID người dùng!');
    setGrantLoading(true);
    try {
      await setDoc(doc(db, 'users', uid), { role: 'shipper' }, { merge: true });
      showToast(`✅ Đã cấp quyền Shipper cho UID: ${uid}`);
      setGrantUid('');
    } catch (e) {
      alert('UID không tồn tại hoặc có lỗi: ' + e.message);
    } finally { setGrantLoading(false); }
  };

  const handleRevokeShipper = async (uid) => {
    if (!window.confirm('Thu hồi quyền Shipper của người này?')) return;
    await setDoc(doc(db, 'users', uid), { role: 'Khách hàng' }, { merge: true });
    showToast('Đã thu hồi quyền Shipper!');
  };

  // ── Status change handler — intercepts "Đang giao hàng" ──────────────────
  const handleStatusChange = async (order, newStatus) => {
    if (newStatus === 'Đang giao hàng') {
      // Show the shipper picker before committing
      setShipperPickerCtx({ order, pendingStatus: newStatus });
      return;
    }
    // All other statuses update immediately
    await setDoc(doc(db, 'orders', order.id), { status: newStatus }, { merge: true });
    await notifyOrderStatus(db, order, newStatus);
    showToast('Đã cập nhật trạng thái đơn!');
  };

  // ── Called when admin picks a shipper ─────────────────────────────────────
  const handleShipperConfirm = async (shipper) => {
    const { order, pendingStatus } = shipperPickerCtx;
    // Find the matching user in usersList to get their Firebase UID
    await setDoc(doc(db, 'orders', order.id), {
      status: pendingStatus,
      shipper: {
        name:  shipper.name,
        phone: shipper.phone,
        image: shipper.image,
        email: shipper.email || '',
        uid:   shipper.uid   || '',   // ← primary filter key for ShipperView
      },
    }, { merge: true });
    await notifyOrderStatus(db, order, pendingStatus);
    showToast(`✅ Đã giao cho ${shipper.name}!`);
    setShipperPickerCtx(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 py-8 md:py-12 animate-fade-in flex flex-col gap-8">

      {/* ── SHIPPER PICKER MODAL ── */}
      {shipperPickerCtx && (
        <ShipperPickerModal
          order={shipperPickerCtx.order}
          isDarkMode={isDarkMode}
          onConfirm={handleShipperConfirm}
          onCancel={() => setShipperPickerCtx(null)}
        />
      )}

      {/* ── PAGE HEADER ── */}
      <div>
        <div className="text-xs font-bold text-slate-400 mb-6 tracking-wider uppercase flex items-center gap-2">
          <button onClick={() => navigateTo('profile')} className="hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer">
            <FiCornerUpLeft/> {t('account')}
          </button>
          <span>/</span>
          <span className="text-slate-800 truncate">{t('adminDashboard')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3 justify-start">
            <FiArchive className="text-sky-500"/> {t('adminDashboard')}
          </h2>
          <div className="flex justify-center">
            <div className="bg-slate-100 p-1.5 rounded-full flex gap-1 w-fit">
              <button onClick={() => setAdminTab('products')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${adminTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Kho Hàng</button>
              <button onClick={() => setAdminTab('orders')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${adminTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                Đơn Đặt Hàng
                {adminOrders.length > 0 && <span className="bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{adminOrders.length}</span>}
              </button>
              <button onClick={() => setAdminTab('roles')} className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${adminTab === 'roles' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                <FiTruck className="text-sm"/> Phân quyền
              </button>
              <button onClick={() => setAdminTab('analytics')} className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${adminTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                <FiBarChart2 className="text-sm"/> Doanh thu
              </button>
              <button onClick={() => setAdminTab('feedback')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${adminTab === 'feedback' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Phản Hồi & Hủy</button>
            </div>
          </div>
          <div className="flex justify-end">
            {adminTab === 'products' && (
              <button onClick={() => setShowAddModal(true)} className="bg-sky-500 text-white px-6 py-3.5 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-sky-600 transition-colors">
                <FiPlus className="text-xl"/> Thêm Sản Phẩm
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT PANEL ── */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">

          {/* ── PRODUCTS TAB ── */}
          {adminTab === 'products' && (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-black border-b border-slate-200">
                  <th className="p-5 pl-8">{t('adminImg')}</th>
                  <th className="p-5">{t('adminName')}</th>
                  <th className="p-5">{t('adminPrice')}</th>
                  <th className="p-5 text-right pr-8">{t('adminAction')}</th>
                </tr>
              </thead>
              <tbody>
                {localProducts.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-5 pl-8">
                      <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
                        <img src={item.imageUrl} className="w-full h-full object-cover rounded-xl" alt=""/>
                      </div>
                    </td>
                    <td className="p-5 font-bold text-base text-slate-800 max-w-[250px] truncate">{item.name}</td>
                    <td className="p-5 font-black text-slate-900 text-lg">{(Number(item.price) || 0).toLocaleString('vi-VN')}đ</td>
                    <td className="p-5 text-right pr-8">
                      <button
                        onClick={() => handleDeleteProduct(item.id)}
                        className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-full transition-colors font-bold text-xs flex items-center justify-center gap-2 ml-auto cursor-pointer"
                      >
                        <FiTrash2 className="text-sm"/> {t('adminDel')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── ORDERS TAB ── */}
          {adminTab === 'orders' && (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-black border-b border-slate-200">
                  <th className="p-5 pl-8">Mã Đơn / Thời gian</th>
                  <th className="p-5">Khách hàng</th>
                  <th className="p-5">Sản phẩm</th>
                  <th className="p-5">Thanh toán</th>
                  <th className="p-5 text-center">Ảnh Bill</th>
                  <th className="p-5 text-right pr-8">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.length === 0 ? (
                  <tr><td colSpan="6" className="p-10 text-center text-slate-400 font-medium">Chưa có đơn hàng nào.</td></tr>
                ) : (
                  adminOrders.map((order) => {
                    const customerUser = usersList.find(u => u.uid === order.uid);
                    return (
                      <tr key={order.id} className={`border-b transition-colors ${isDarkMode ? 'border-slate-700/50 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>

                        {/* Order ID */}
                        <td className="p-5 pl-8">
                          <span className={`font-black block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.orderId}</span>
                          <span className={`text-xs font-medium mt-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                        </td>

                        {/* Customer */}
                        <td className="p-5 text-sm">
                          <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.customerName}</span>
                          <span className={`block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{order.customerPhone}</span>
                          <span className={`text-xs mt-1 block max-w-[200px] line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{order.customerAddress}</span>
                          {customerUser && (
                            <button onClick={() => openAdminChatWithUser(customerUser)} className="mt-3 text-xs font-bold bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 w-fit cursor-pointer border border-sky-500/20">
                              <FiMessageCircle/> Nhắn tin
                            </button>
                          )}
                        </td>

                        {/* Items */}
                        <td className="p-5 text-sm">
                          <div className="space-y-1 max-w-[250px]">
                            {order.items.map((it, idx) => (
                              <div key={idx} className={`font-medium truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                - {it.name} <b className="text-sky-500">x{it.quantity}</b>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Payment */}
                        <td className="p-5">
                          <span className="font-black text-sky-500 block text-base">{order.paidAmount.toLocaleString('vi-VN')}đ</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-1 ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                            {order.paymentMode === 'full' ? 'Đã CK 100%' : 'Đã Cọc 30%'}
                          </span>
                        </td>

                        {/* Receipt */}
                        <td className="p-5 text-center">
                          {order.receiptImage ? (
                            <div onClick={() => setPreviewImg(order.receiptImage)} className="inline-block relative group">
                              <img src={order.receiptImage} className={`w-16 h-16 object-cover rounded-xl border shadow-sm transition-transform cursor-pointer group-hover:scale-105 ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`} alt="Bill"/>
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <FiSearch className="text-white text-xl"/>
                              </div>
                            </div>
                          ) : (
                            <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Không có</span>
                          )}
                        </td>

                        {/* ── STATUS CONTROLS ── */}
                        <td className="p-5 text-right pr-8">

                          {/* Currently assigned shipper mini-card (if delivering) */}
                          {order.status === 'Đang giao hàng' && order.shipper && (
                            <div className="flex items-center gap-2 mb-3 p-2 bg-sky-50 border border-sky-200 rounded-xl">
                              <img
                                src={order.shipper.image}
                                alt={order.shipper.name}
                                className="w-8 h-8 rounded-full object-cover border border-sky-200 flex-shrink-0"
                                onError={(e) => { e.target.style.display='none'; }}
                              />
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-xs font-black text-slate-800 truncate">{order.shipper.name}</p>
                                <p className="text-[10px] text-sky-600 font-bold">{order.shipper.phone}</p>
                              </div>
                              {/* Re-assign button */}
                              <button
                                onClick={() => setShipperPickerCtx({ order, pendingStatus: 'Đang giao hàng' })}
                                className="text-[10px] font-bold text-sky-500 hover:text-sky-700 underline cursor-pointer flex-shrink-0"
                              >
                                Đổi
                              </button>
                            </div>
                          )}

                          {/* Status dropdown */}
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            className={`border text-sm font-bold rounded-xl px-4 py-2 outline-none cursor-pointer transition-colors focus:border-sky-500 mb-2 w-full ${isDarkMode ? 'bg-[#111111] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                          >
                            <option value="Chờ xác nhận thanh toán">Chờ duyệt Bill</option>
                            <option value="Đang chuẩn bị hàng">Đang chuẩn bị hàng</option>
                            <option value="Đang giao hàng">Đang giao hàng</option>
                            <option value="Đã giao - chờ khách xác nhận">Đã giao (chờ KH xác nhận)</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                            <option value="Khách hàng tự hủy đơn">Khách tự hủy</option>
                            <option value="Đơn không đạt yêu cầu">Không đạt (Bill lỗi)</option>
                          </select>

                          {/* Quick-action buttons */}
                          <div className="flex flex-wrap justify-end gap-1.5 mt-2">
                            <button
                              onClick={() => handleStatusChange(order, 'Hoàn thành')}
                              className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                            >Thành công</button>
                            <button
                              onClick={() => handleStatusChange(order, 'Đơn không đạt yêu cầu')}
                              className="bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-500 hover:text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                            >Từ chối</button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Xóa vĩnh viễn đơn hàng này khỏi hệ thống?')) {
                                  await deleteDoc(doc(db, 'orders', order.id));
                                  showToast('Đã xóa đơn hàng!');
                                }
                              }}
                              className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer w-full mt-1 flex justify-center items-center gap-1"
                            >
                              <FiTrash2/> Xóa Đơn
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* ── FEEDBACK TAB ── */}
          {adminTab === 'feedback' && (
            <div className="p-6 md:p-8 flex flex-col gap-10 text-slate-800">

              {/* ── USER RATINGS ── */}
              <div>
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">⭐ Đánh giá từ khách hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminOrders.filter(o => o.rating).length === 0 ? (
                    <p className="text-slate-500 text-sm">Chưa có đánh giá nào.</p>
                  ) : (
                    adminOrders.filter(o => o.rating).map(o => (
                      <div key={o.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-black text-slate-900">{o.orderId}</span>
                            <span className="text-xs text-slate-500 ml-2">{o.customerName}</span>
                          </div>
                          <span className="text-xs text-slate-400">{o.rating.ratedAt ? new Date(o.rating.ratedAt).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                        {/* Products in this order */}
                        {o.items?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {o.items.map((it, idx) => (
                              <span key={idx} className="text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-full">
                                {it.name} ×{it.quantity}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          {[
                            ['Sản phẩm', o.rating.productQuality],
                            ['Dịch vụ',  o.rating.service],
                            ['Đóng gói', o.rating.packaging],
                            ['Shipper',  o.rating.shipping],
                          ].map(([label, val]) => (
                            <div key={label} className="flex items-center gap-1">
                              <span className="text-slate-500 w-16">{label}:</span>
                              <span className="text-amber-500 font-black">{'★'.repeat(val)}{'☆'.repeat(5-val)}</span>
                            </div>
                          ))}
                        </div>
                        {o.rating.comment && (
                          <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 italic">"{o.rating.comment}"</p>
                        )}
                        {/* Delivery proof photo */}
                        {o.deliveryProof?.image && (
                          <div className="mt-3 flex items-center gap-2">
                            <img src={o.deliveryProof.image} className="w-12 h-12 rounded-lg object-cover border border-slate-200 cursor-pointer" alt="Proof" onClick={() => setPreviewImg(o.deliveryProof.image)}/>
                            <span className="text-xs text-slate-400">Ảnh xác nhận giao</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <hr className="border-slate-200"/>

              {/* ── ISSUE REPORTS ── */}
              <div>
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">🚨 Báo lỗi từ khách hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminOrders.filter(o => o.issueReport).length === 0 ? (
                    <p className="text-slate-500 text-sm">Không có báo lỗi nào.</p>
                  ) : (
                    adminOrders.filter(o => o.issueReport).map(o => (
                      <div key={o.id} className="bg-red-50 p-4 rounded-2xl border border-red-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-black text-slate-900">{o.orderId}</span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold">Báo lỗi</span>
                        </div>
                        <p className="text-sm font-medium text-slate-700">Khách: {o.customerName} — {o.customerPhone}</p>
                        <p className="text-sm mt-2 text-red-700 font-bold">{o.issueReport.reason}</p>
                        <p className="text-xs text-slate-400 mt-1">{o.issueReport.reportedAt ? new Date(o.issueReport.reportedAt).toLocaleString('vi-VN') : ''}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <hr className="border-slate-200"/>

              {/* ── CANCELLED ORDERS ── */}
              <div>
                <h3 className="text-xl font-black mb-4 flex items-center gap-2"><FiArchive className="text-red-500"/> Các đơn bị khách hủy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminOrders.filter(o => o.cancelReason).length === 0 ? (
                    <p className="text-slate-500 text-sm">Chưa có đơn hàng nào bị hủy.</p>
                  ) : (
                    adminOrders.filter(o => o.cancelReason).map(o => (
                      <div key={o.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-900">{o.orderId}</span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold">{o.cancelReason}</span>
                        </div>
                        <p className="text-sm font-medium">Khách: {o.customerName} - {o.customerPhone}</p>
                        <div className="mt-3 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 italic">"{o.cancelComment || 'Không để lại lời nhắn.'}"</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <hr className="border-slate-200"/>

              {/* ── SURVEY DATA ── */}
              <div>
                <h3 className="text-xl font-black mb-4 flex items-center gap-2"><FiUsers className="text-sky-500"/> Dữ liệu Khảo sát Khách hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {usersList.filter(u => u.isSurveyCompleted).length === 0 ? (
                    <p className="text-slate-500 text-sm">Chưa có ai làm khảo sát.</p>
                  ) : (
                    usersList.filter(u => u.isSurveyCompleted).map(u => (
                      <div key={u.uid} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                        <p className="font-bold text-base flex items-center gap-2">
                          {u.avatar ? <img src={u.avatar} className="w-6 h-6 rounded-full" alt=""/> : <FiUser/>}
                          {u.nickname || u.email?.split('@')[0]}
                        </p>
                        <p className="text-sm"><span className="text-slate-500 text-xs uppercase block">Nghề nghiệp</span><span className="font-medium">{u.role}</span></p>
                        <p className="text-sm"><span className="text-slate-500 text-xs uppercase block">Nguồn biết đến</span><span className="font-medium bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-xs">{u.discoverySource}</span></p>
                        <p className="text-sm"><span className="text-slate-500 text-xs uppercase block">Sở thích Mua sắm</span><span className="font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">{u.interests}</span></p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ROLES TAB ── */}
          {adminTab === 'roles' && (
            <div className="p-6 md:p-8 flex flex-col gap-8">

              {/* Grant by UID */}
              <div>
                <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                  <FiTruck className="text-emerald-500"/> Cấp quyền Shipper theo UID
                </h3>
                <p className="text-sm text-slate-500 mb-5">
                  Nhập Firebase UID (không phải email) của người dùng. UID có thể tìm trong Authentication console hoặc yêu cầu người dùng sao chép từ trang Profile.
                </p>
                <div className="flex gap-3 max-w-xl">
                  <input
                    type="text"
                    value={grantUid}
                    onChange={e => setGrantUid(e.target.value)}
                    placeholder="Nhập UID Firebase người dùng..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-400 font-mono"
                  />
                  <button
                    onClick={handleGrantShipper}
                    disabled={grantLoading || !grantUid.trim()}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors ${
                      !grantLoading && grantUid.trim()
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {grantLoading ? '...' : '🚚 Cấp quyền'}
                  </button>
                </div>
              </div>

              <hr className="border-slate-200"/>

              {/* Current shippers list */}
              <div>
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <FiUsers className="text-sky-500"/> Danh sách Shipper hiện tại
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usersList.filter(u => u.role === 'shipper').length === 0 ? (
                    <p className="text-slate-500 text-sm">Chưa có Shipper nào được cấp quyền.</p>
                  ) : (
                    usersList.filter(u => u.role === 'shipper').map(u => (
                      <div key={u.uid} className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt=""/> : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 font-black text-lg">
                                {(u.nickname || u.email || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 text-sm">🚚</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-900 text-sm truncate">{u.nickname || u.email?.split('@')[0]}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                          <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{u.uid}</p>
                        </div>
                        <button
                          onClick={() => handleRevokeShipper(u.uid)}
                          className="text-xs text-red-500 hover:text-red-700 font-bold flex-shrink-0 cursor-pointer"
                          title="Thu hồi quyền"
                        >
                          Thu hồi
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {adminTab === 'analytics' && (
            <AnalyticsTab adminOrders={adminOrders} setPreviewImg={setPreviewImg}/>
          )}

        </div>
      </div>
    </div>
  );
}
