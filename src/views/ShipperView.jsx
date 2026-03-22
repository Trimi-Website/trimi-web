import { useState } from 'react';
import { FiTruck, FiUploadCloud, FiCheckCircle, FiPackage, FiPhone, FiCamera, FiX } from 'react-icons/fi';
import { doc, setDoc } from 'firebase/firestore';
import { compressImage } from '../utils/imageUtils';

// ── Proof-of-delivery upload modal ───────────────────────────────────────────
function DeliveryProofModal({ order, isDarkMode, user, db, onSuccess, onCancel }) {
  const [proofImage, setProofImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) compressImage(file, (base64) => setProofImage(base64));
  };

  const handleConfirm = async () => {
    if (!proofImage) return alert('Vui lòng chụp hoặc tải ảnh xác nhận giao hàng!');
    setUploading(true);
    try {
      const now = Date.now();
      await setDoc(doc(db, 'orders', order.id), {
        status:        'Đã giao - chờ khách xác nhận',
        deliveryProof: { image: proofImage, deliveredAt: now },
      }, { merge: true });

      // Notify the customer
      await setDoc(
        doc(db, 'notifications', order.uid, 'items', `delivered_${order.id}`),
        {
          type:      'order_status',
          title:     '🚚 Đơn hàng đã được giao!',
          body:      `Đơn ${order.orderId} đã được giao. Vui lòng xác nhận đã nhận hàng.`,
          isRead:    false,
          createdAt: now,
          orderId:   order.id,
        }
      ).catch(() => {});

      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className={`relative w-full max-w-md rounded-[32px] shadow-2xl p-8 animate-fade-in-up ${isDarkMode ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-900'}`}>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <FiCamera className="text-sky-500"/> Ảnh xác nhận giao hàng
          </h3>
          <button onClick={onCancel} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer">
            <FiX/>
          </button>
        </div>

        <p className={`text-sm mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Đơn <span className="font-black">{order.orderId}</span> — Tải ảnh chụp tại điểm giao để xác nhận:
        </p>

        {/* Upload zone */}
        <label className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors mb-6 ${
          proofImage
            ? 'border-emerald-400 bg-emerald-50'
            : isDarkMode ? 'border-slate-600 hover:border-sky-500' : 'border-slate-300 hover:border-sky-400 hover:bg-sky-50'
        }`}>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange}/>
          {proofImage ? (
            <img src={proofImage} className="w-full max-h-48 object-cover rounded-xl mx-auto" alt="Proof"/>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <FiUploadCloud className="text-4xl text-slate-400"/>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Nhấn để chụp ảnh hoặc chọn từ thư viện
              </p>
            </div>
          )}
        </label>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-full font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-sm">
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!proofImage || uploading}
            className={`flex-grow py-3 rounded-full font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm ${
              proofImage && !uploading
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg'
                : 'bg-slate-300 text-slate-400 cursor-not-allowed'
            }`}
          >
            {uploading ? <><span className="animate-spin">⏳</span> Đang lưu...</> : <><FiCheckCircle/> Xác nhận đã giao</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ShipperView({ isDarkMode, user, adminOrders, db, showToast }) {
  const [proofCtx, setProofCtx] = useState(null); // order waiting for proof upload

  // ── BUG FIX 4: Filter orders assigned to this shipper.
  //    Primary: shipper.uid === user.uid (new UID-based system)
  //    Fallback: shipper.email === user.email (legacy email system)
  //    adminOrders was previously only populated for isAdmin — fixed in App.jsx
  //    to also populate for isShipper users.
  const myOrders = adminOrders.filter(o =>
    (o.shipper?.uid && o.shipper.uid === user?.uid) ||
    (o.shipper?.email && o.shipper.email === user?.email)
  );

  const pending   = myOrders.filter(o => o.status === 'Đang giao hàng');
  const delivered = myOrders.filter(o => o.status !== 'Đang giao hàng');

  const statusColor = (status) => {
    if (status === 'Hoàn thành')                    return 'bg-emerald-500 text-white';
    if (status === 'Đã giao - chờ khách xác nhận')  return 'bg-violet-500 text-white';
    if (status === 'Đang giao hàng')                return 'bg-sky-500 text-white';
    return 'bg-amber-400 text-amber-950';
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 md:py-12 animate-fade-in flex flex-col gap-8">

      {/* Proof upload modal */}
      {proofCtx && (
        <DeliveryProofModal
          order={proofCtx}
          isDarkMode={isDarkMode}
          user={user}
          db={db}
          onSuccess={() => { setProofCtx(null); showToast('✅ Đã xác nhận giao hàng thành công!'); }}
          onCancel={() => setProofCtx(null)}
        />
      )}

      {/* Header */}
      <div>
        <h2 className={`text-3xl md:text-4xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <FiTruck className="text-sky-500"/> Trang Shipper
        </h2>
        <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Chỉ hiển thị đơn hàng được giao cho <span className="font-bold text-sky-500">{user?.email}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Cần giao',    value: pending.length,   color: 'bg-sky-500' },
          { label: 'Đã giao',     value: delivered.filter(o => o.status === 'Đã giao - chờ khách xác nhận').length, color: 'bg-violet-500' },
          { label: 'Hoàn thành', value: delivered.filter(o => o.status === 'Hoàn thành').length, color: 'bg-emerald-500' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 text-white shadow-md ${s.color}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-sm font-bold opacity-80 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending deliveries */}
      <div>
        <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <FiPackage className="text-sky-500"/> Đơn cần giao ({pending.length})
        </h3>

        {pending.length === 0 ? (
          <div className={`rounded-2xl p-8 text-center border ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
            <FiTruck className={`text-5xl mx-auto mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-200'}`}/>
            <p className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Không có đơn nào cần giao.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map(order => (
              <div key={order.id} className={`p-6 rounded-[28px] border shadow-sm flex flex-col gap-4 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>

                {/* Order info row */}
                <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                  <div className="flex-1">
                    <h4 className={`font-black text-base mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {order.orderId}
                    </h4>
                    <p className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {order.customerName}
                    </p>
                    <a href={`tel:${order.customerPhone}`} className="text-sky-500 font-bold text-sm flex items-center gap-1 mb-2 hover:underline w-fit">
                      <FiPhone className="text-xs"/> {order.customerPhone}
                    </a>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      📍 {order.customerAddress}
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-full ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-sky-500 font-black text-sm">
                      {order.paidAmount?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className={`text-sm rounded-xl p-3 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  {order.items?.map((it, idx) => (
                    <p key={idx} className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                      • {it.name} <span className="text-sky-500 font-bold">×{it.quantity}</span>
                    </p>
                  ))}
                </div>

                {/* Mark as Delivered — requires photo upload */}
                <button
                  onClick={() => setProofCtx(order)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
                >
                  <FiCamera className="text-base"/> Đánh dấu đã giao (cần ảnh xác nhận)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivered orders history */}
      {delivered.length > 0 && (
        <div>
          <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <FiCheckCircle className="text-emerald-500"/> Lịch sử đã giao ({delivered.length})
          </h3>
          <div className="flex flex-col gap-3">
            {delivered.map(order => (
              <div key={order.id} className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
                <div>
                  <p className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.orderId}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{order.customerName} · {order.customerAddress}</p>
                  {order.deliveryProof?.deliveredAt && (
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Giao lúc: {new Date(order.deliveryProof.deliveredAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {order.deliveryProof?.image && (
                    <img src={order.deliveryProof.image} className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-200" alt="Proof"/>
                  )}
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
