import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiCamera, FiLogOut, FiMonitor, FiSettings, FiEdit3, FiCheckCircle,
  FiX, FiArchive, FiImage, FiTruck, FiPhone, FiAlertCircle, FiStar,
} from 'react-icons/fi';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { compressImage } from '../utils/imageUtils';

// ── Star rating input ────────────────────────────────────────────────────────
function StarRating({ value, onChange, label }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-bold text-slate-700">{label}</p>
      <div className="flex gap-1.5">
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 cursor-pointer"
          >
            <FiStar
              className={`text-2xl transition-colors ${
                star <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
              }`}
              style={{ fill: star <= (hovered || value) ? '#fbbf24' : 'none' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Rating Modal ─────────────────────────────────────────────────────────────
function RatingModal({ order, isDarkMode, db, onClose }) {
  const [ratings, setRatings] = useState({ productQuality: 0, service: 0, packaging: 0, shipping: 0 });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const allRated = Object.values(ratings).every(v => v > 0);

  const handleSubmit = async () => {
    if (!allRated) return alert('Vui lòng đánh giá đủ tất cả 4 tiêu chí!');
    setSubmitting(true);
    try {
      const now = Date.now();
      await setDoc(doc(db, 'orders', order.id), {
        status:       'Hoàn thành',
        userConfirmed: true,
        userConfirmedAt: now,
        rating: { ...ratings, comment: comment.trim(), ratedAt: now },
      }, { merge: true });

      // Notify admin about completed order + rating
      await setDoc(
        doc(db, 'notifications', 'admin', 'items', `rated_${order.id}`),
        {
          type:      'order_status',
          title:     '⭐ Khách đã đánh giá đơn hàng',
          body:      `Đơn ${order.orderId} - ${order.customerName}: ${comment.trim() || 'Không có bình luận'}`,
          isRead:    false,
          createdAt: now,
          orderId:   order.id,
        }
      ).catch(() => {});

      onClose(true);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // createPortal renders directly on document.body, escaping ProfileView's
  // `relative z-30` stacking context that would otherwise trap fixed modals.
  return createPortal(
    <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className={`relative w-full max-w-lg rounded-[32px] shadow-2xl p-8 animate-fade-in-up flex flex-col max-h-[92vh] ${isDarkMode ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-900'}`}>

        {/* Scrollable inner content */}
        <div className="overflow-y-auto flex-grow custom-scrollbar">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-2xl font-black mb-2">Cảm ơn bạn!</h3>
            <p className="text-sky-500 font-bold text-sm italic">
              Trimi rất cảm ơn sự chào đón của bạn! hiihi
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Đơn {order.orderId} — Hãy dành 1 phút đánh giá trải nghiệm nhé 😊
            </p>

            {/* Products being reviewed */}
            {order.items?.length > 0 && (
              <div className={`mt-3 p-3 rounded-2xl text-left text-xs ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className={`font-black uppercase tracking-widest mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Sản phẩm trong đơn:</p>
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2 py-0.5">
                    {it.imageUrl && <img src={it.imageUrl} className="w-6 h-6 rounded object-cover flex-shrink-0" alt=""/>}
                    <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{it.name}</span>
                    <span className="text-sky-500 font-bold ml-auto">×{it.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Star ratings */}
          <div className="flex flex-col gap-5 mb-6">
            <StarRating
              label="⭐ Chất lượng sản phẩm"
              value={ratings.productQuality}
              onChange={v => setRatings(r => ({ ...r, productQuality: v }))}
            />
            <StarRating
              label="🛎 Chất lượng dịch vụ"
              value={ratings.service}
              onChange={v => setRatings(r => ({ ...r, service: v }))}
            />
            <StarRating
              label="📦 Đóng gói"
              value={ratings.packaging}
              onChange={v => setRatings(r => ({ ...r, packaging: v }))}
            />
            <StarRating
              label="🚚 Vận chuyển / Shipper"
              value={ratings.shipping}
              onChange={v => setRatings(r => ({ ...r, shipping: v }))}
            />
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn... (không bắt buộc)"
            rows={3}
            className={`w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none mb-4 border transition-colors focus:border-sky-400 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Actions — always visible at bottom */}
        <div className="flex gap-3 pt-4 flex-shrink-0">
          <button
            onClick={() => onClose(false)}
            className={`flex-1 py-3 rounded-full font-bold text-sm transition-colors cursor-pointer ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Để sau
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allRated || submitting}
            className={`flex-grow py-3 rounded-full font-bold text-white text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              allRated && !submitting ? 'bg-sky-500 hover:bg-sky-600 shadow-lg' : 'bg-slate-300 text-slate-400 cursor-not-allowed'
            }`}
          >
            {submitting ? '⏳ Đang gửi...' : <><FiCheckCircle/> Gửi đánh giá</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Report Issue Modal ────────────────────────────────────────────────────────
function ReportIssueModal({ order, isDarkMode, db, user, onClose }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const QUICK_REASONS = [
    'Sản phẩm bị lỗi / hỏng',
    'Thiếu hàng so với đơn',
    'Sai sản phẩm',
    'Đóng gói kém',
    'Khác',
  ];

  const handleSubmit = async () => {
    if (!reason.trim()) return alert('Vui lòng nhập lý do báo lỗi!');
    setSubmitting(true);
    try {
      const now = Date.now();
      await setDoc(doc(db, 'orders', order.id), {
        issueReport: { reason: reason.trim(), reportedAt: now },
      }, { merge: true });

      // Critical notification to admin
      await setDoc(
        doc(db, 'notifications', 'admin', 'items', `issue_${order.id}_${now}`),
        {
          type:      'order_status',
          title:     '🚨 Báo lỗi đơn hàng!',
          body:      `${order.customerName} báo lỗi đơn ${order.orderId}: ${reason.trim()}`,
          isRead:    false,
          createdAt: now,
          orderId:   order.id,
        }
      ).catch(() => {});

      onClose();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra!');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className={`relative w-full max-w-md rounded-[32px] shadow-2xl p-8 animate-fade-in-up ${isDarkMode ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-900'}`}>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <FiAlertCircle className="text-red-500"/> Báo lỗi đơn hàng
          </h3>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer">
            <FiX/>
          </button>
        </div>

        <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Đơn <span className="font-black">{order.orderId}</span> — Chọn lý do:
        </p>

        {/* Quick pick */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                reason === r
                  ? 'bg-red-500 text-white border-red-500'
                  : isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-red-400' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-red-400 hover:text-red-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Mô tả chi tiết vấn đề..."
          rows={3}
          className={`w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none mb-6 border transition-colors focus:border-red-400 ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        />

        <div className="flex gap-3">
          <button onClick={onClose} className={`flex-1 py-3 rounded-full font-bold text-sm cursor-pointer ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            className={`flex-grow py-3 rounded-full font-bold text-white text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              reason.trim() && !submitting ? 'bg-red-500 hover:bg-red-600 shadow-lg' : 'bg-slate-300 text-slate-400 cursor-not-allowed'
            }`}
          >
            {submitting ? '⏳...' : <><FiAlertCircle/> Gửi báo lỗi</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProfileView({
  isDarkMode, t, isAdmin, isShipper, user,
  nickname, setNickname,
  avatarUrl, coverUrl,
  isEditingName, setIsEditingName,
  tempName, setTempName,
  handleSaveName, handleProfileUpload, handleLogout,
  myOrders, showToast, navigateTo,
  setSurveyStep, setShowSurveyModal,
  setTempSettings, setIsSettingsDrawerOpen,
  phone, address, district, lang,
  db,
}) {
  const [ratingOrder, setRatingOrder]       = useState(null); // order to rate
  const [reportOrder, setReportOrder]       = useState(null); // order to report

  const statusColor = (status) => {
    if (status === 'Hoàn thành')                   return 'bg-emerald-500 text-white';
    if (status === 'Đã giao - chờ khách xác nhận') return 'bg-violet-500 text-white';
    if (status.includes('hủy') || status.includes('từ chối') || status.includes('không đạt')) return 'bg-red-500 text-white';
    if (status === 'Đang giao hàng')               return 'bg-sky-500 text-white';
    return 'bg-amber-400 text-amber-950';
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8 animate-fade-in-up relative z-30">

      {/* Rating modal */}
      {ratingOrder && (
        <RatingModal
          order={ratingOrder}
          isDarkMode={isDarkMode}
          db={db}
          onClose={(submitted) => {
            setRatingOrder(null);
            if (submitted) showToast('⭐ Cảm ơn bạn đã đánh giá!');
          }}
        />
      )}

      {/* Report issue modal */}
      {reportOrder && (
        <ReportIssueModal
          order={reportOrder}
          isDarkMode={isDarkMode}
          db={db}
          user={user}
          onClose={() => { setReportOrder(null); showToast('🚨 Đã gửi báo lỗi đến Trimi!'); }}
        />
      )}

      {/* ── PROFILE CARD ── */}
      <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-200 mb-6 relative">

        {/* Cover */}
        <div className="h-48 md:h-72 w-full bg-gradient-to-r from-sky-400 to-indigo-500 relative flex items-center justify-center overflow-hidden">
          {coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" alt="Cover"/> : <FiImage className="text-6xl text-white opacity-20"/>}
          <div className="absolute bottom-4 right-4">
            <label htmlFor="coverUpload" className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white hover:text-slate-900 transition-all cursor-pointer shadow-md">
              <FiCamera className="text-lg"/> {t('changeCover')}
            </label>
            <input type="file" id="coverUpload" accept="image/*" onClick={(e) => e.target.value = null} onChange={(e) => handleProfileUpload(e, 'cover')} className="hidden"/>
          </div>
        </div>

        {/* Avatar + Actions */}
        <div className="px-6 md:px-12 pb-8 relative">
          <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-full p-1.5 absolute -top-16 md:-top-24 border border-slate-100 shadow-xl z-10">
            <div className="w-full h-full bg-slate-900 text-white rounded-full flex items-center justify-center text-5xl font-black relative overflow-hidden group">
              {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar"/> : nickname.charAt(0).toUpperCase() || 'U'}
              <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <FiCamera className="text-white text-3xl"/>
              </label>
              <input type="file" id="avatarUpload" accept="image/*" onClick={(e) => e.target.value = null} onChange={(e) => handleProfileUpload(e, 'avatar')} className="hidden"/>
            </div>
          </div>

          <div className="flex justify-end pt-6 pb-2 gap-3 relative z-20 flex-wrap">
            <button onClick={handleLogout} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2 border border-slate-200">
              <FiLogOut/> {t('logout')}
            </button>
            {isAdmin && (
              <>
                <button onClick={() => { setSurveyStep(1); setShowSurveyModal(true); }} className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-md">
                  <FiMonitor/> Test Khảo sát
                </button>
                <button onClick={() => navigateTo('admin')} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-md">
                  <FiSettings/> {t('adminMenu')}
                </button>
              </>
            )}
            {/* Shipper Dashboard button — only shown to authorized shipper emails */}
            {isShipper && (
              <button
                onClick={() => navigateTo('shipper')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-md"
              >
                <FiTruck/> Trang Shipper
              </button>
            )}
          </div>

          {/* Name + Badges */}
          <div className="mt-4 md:mt-0 relative z-20">
            {!isEditingName ? (
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                {nickname}
                <button onClick={() => { setTempName(nickname); setIsEditingName(true); }} className="text-sm text-slate-400 hover:text-sky-500 transition-colors p-1.5 bg-slate-50 rounded-full border border-slate-100"><FiEdit3/></button>
                <button onClick={() => { setTempSettings({ nickname, phone, address, district, theme: isDarkMode ? 'dark' : 'light', lang }); setIsSettingsDrawerOpen(true); }} className="text-sm text-slate-400 hover:text-sky-500 transition-colors p-1.5 bg-slate-50 rounded-full border border-slate-100 ml-1"><FiSettings/></button>
              </h2>
            ) : (
              <div className="flex items-center gap-3 mb-2">
                <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="border-b-2 border-sky-500 text-3xl md:text-4xl font-black text-slate-900 outline-none bg-transparent w-64 md:w-80" autoFocus placeholder="Nhập biệt danh..."/>
                <button onClick={handleSaveName} className="bg-slate-900 text-white p-2 rounded-full hover:bg-sky-500 shadow-md transition-colors"><FiCheckCircle className="text-lg"/></button>
                <button onClick={() => setIsEditingName(false)} className="bg-slate-100 text-slate-500 p-2 rounded-full hover:bg-red-500 hover:text-white shadow-md transition-colors"><FiX className="text-lg"/></button>
              </div>
            )}
            <p className="text-slate-500 font-medium mb-2 mt-2">{user?.email}</p>
            {/* UID display for sharing — needed for Shipper role assignment */}
            <div className={`flex items-center gap-2 mb-4 px-3 py-1.5 rounded-xl w-fit text-xs ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>UID:</span>
              <span className={`font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{user?.uid?.slice(0, 16)}…</span>
              <button
                onClick={() => { navigator.clipboard?.writeText(user?.uid || ''); showToast('Đã sao chép UID!'); }}
                className="text-sky-500 hover:text-sky-600 font-bold cursor-pointer"
                title="Sao chép UID"
              >
                📋
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">{t('roleCustomer')}</span>
              <span className="bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"><FiCheckCircle/> {t('roleVerified')}</span>
              {isAdmin && <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold">Admin</span>}
              {isShipper && !isAdmin && (
                <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <FiTruck className="text-xs"/> Shipper
                </span>
              )}
            </div>
          </div>

          {/* Tab bar */}
          <div className={`flex gap-8 border-b pt-6 overflow-x-auto custom-scrollbar relative z-20 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <button className={`pb-3 whitespace-nowrap font-bold text-sm tracking-wide transition-colors ${isDarkMode ? 'text-white border-b-2 border-white' : 'text-slate-900 border-b-2 border-slate-900'}`}>
              Đơn hàng của tôi
            </button>
          </div>
        </div>
      </div>

      {/* ── ORDERS LIST ── */}
      {myOrders.length === 0 ? (
        <div className={`rounded-[40px] p-8 border shadow-sm text-center py-24 ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200'}`}>
          <FiArchive className={`text-6xl mx-auto mb-6 ${isDarkMode ? 'text-slate-600' : 'text-slate-200'}`}/>
          <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{t('noOrders')}</h3>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{t('noOrdersDesc')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {myOrders.map(order => (
            <div key={order.id} className={`p-6 rounded-[32px] border shadow-sm flex flex-col gap-5 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>

              {/* Top row */}
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                  <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mã đơn: {order.orderId}</h4>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                  <div className="space-y-1">
                    {order.items.map((it, idx) => (
                      <p key={idx} className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        - {it.name} <span className="text-sky-500 font-bold ml-1">x{it.quantity}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0">
                  <span className="text-xl font-black text-sky-500">
                    {order.paidAmount.toLocaleString('vi-VN')}đ{' '}
                    <span className="text-xs text-slate-500 font-medium">({order.paymentMode === 'full' ? '100%' : 'Cọc 30%'})</span>
                  </span>
                  <span className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm ${statusColor(order.status)}`}>
                    {order.status}
                  </span>

                  {/* ── ACTION BUTTONS ── */}
                  <div className="flex flex-wrap gap-2 mt-1">

                    {/* Cancel — only when waiting for bill review */}
                    {order.status === 'Chờ xác nhận thanh toán' && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) {
                            await setDoc(doc(db, 'orders', order.id), { status: 'Khách hàng tự hủy đơn' }, { merge: true });
                            showToast('Đã hủy đơn!');
                            setTimeout(() => { deleteDoc(doc(db, 'orders', order.id)); }, 5000);
                          }
                        }}
                        className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                      >
                        Hủy đơn hàng
                      </button>
                    )}

                    {/* Report Issue — available on active orders (not completed/cancelled) */}
                    {!['Hoàn thành','Khách hàng tự hủy đơn','Đơn không đạt yêu cầu'].includes(order.status) && !order.issueReport && (
                      <button
                        onClick={() => setReportOrder(order)}
                        className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                          isDarkMode ? 'border-red-800 text-red-400 hover:bg-red-500/20' : 'border-red-200 text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <FiAlertCircle className="text-xs"/> Báo lỗi
                      </button>
                    )}

                    {/* Show "issue reported" badge */}
                    {order.issueReport && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                        🚨 Đã báo lỗi
                      </span>
                    )}

                    {/* ── CONFIRM RECEIVED ──
                        Shows when status is "Đã giao - chờ khách xác nhận".
                        Does NOT require deliveryProof.image — admin may have set
                        the status manually via the dropdown without going through
                        ShipperView, so we don't gate on proof existence. */}
                    {order.status === 'Đã giao - chờ khách xác nhận' && !order.userConfirmed && (
                      <button
                        onClick={() => setRatingOrder(order)}
                        className="text-xs font-black px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FiCheckCircle/> Đã nhận hàng & Đánh giá
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SHIPPER CARD ── */}
              {(order.status === 'Đang giao hàng' || order.status === 'Đã giao - chờ khách xác nhận') && order.shipper && (
                <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${
                  order.status === 'Đã giao - chờ khách xác nhận'
                    ? 'border-violet-200 ' + (isDarkMode ? 'bg-violet-500/10' : 'bg-violet-50')
                    : 'border-sky-200 '   + (isDarkMode ? 'bg-sky-500/10' : 'bg-sky-50')
                }`}>
                  <div className="relative flex-shrink-0">
                    <img src={order.shipper.image} alt={order.shipper.name} className="w-16 h-16 rounded-full object-cover border-2 border-sky-300 shadow-md" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
                    <div className="w-16 h-16 rounded-full bg-sky-500 text-white hidden items-center justify-center text-2xl font-black border-2 border-sky-300 shadow-md">{order.shipper.name.charAt(0)}</div>
                    <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>

                  <div className="flex-1">
                    <p className={`text-[11px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5 ${
                      order.status === 'Đã giao - chờ khách xác nhận'
                        ? isDarkMode ? 'text-violet-400' : 'text-violet-600'
                        : isDarkMode ? 'text-sky-400' : 'text-sky-600'
                    }`}>
                      <FiTruck className="text-sm"/>
                      {order.status === 'Đã giao - chờ khách xác nhận' ? 'Shipper đã giao đến nơi' : 'Shipper đang trên đường giao'}
                    </p>
                    <p className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.shipper.name}</p>
                    <a href={`tel:${order.shipper.phone}`} className="text-sky-500 font-bold text-sm hover:text-sky-600 hover:underline flex items-center gap-1.5 mt-0.5 w-fit">
                      <FiPhone className="text-xs"/> {order.shipper.phone}
                    </a>
                  </div>

                  {/* Delivery proof thumbnail (if available) */}
                  {order.deliveryProof?.image && (
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <img src={order.deliveryProof.image} className="w-14 h-14 rounded-xl object-cover border-2 border-violet-300 shadow-sm" alt="Proof"/>
                      <p className="text-[9px] font-bold text-violet-500 text-center">Ảnh xác nhận</p>
                    </div>
                  )}

                  <a href={`tel:${order.shipper.phone}`} className="hidden md:flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-colors shadow-md flex-shrink-0">
                    <FiPhone/> Gọi ngay
                  </a>
                </div>
              )}

              {/* Fallback shipper card */}
              {order.status === 'Đang giao hàng' && !order.shipper && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl border border-dashed border-sky-300 ${isDarkMode ? 'bg-sky-500/5' : 'bg-sky-50/50'}`}>
                  <FiTruck className={`text-2xl flex-shrink-0 ${isDarkMode ? 'text-sky-400' : 'text-sky-500'}`}/>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>Đơn hàng đang được giao — thông tin shipper sẽ hiển thị sớm.</p>
                </div>
              )}

              {/* Show existing rating */}
              {order.rating && (
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-amber-500/10 border-amber-700' : 'bg-amber-50 border-amber-200'}`}>
                  <p className={`text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>⭐ Đánh giá của bạn</p>
                  <div className="flex gap-4 flex-wrap text-xs">
                    {[
                      ['Sản phẩm', order.rating.productQuality],
                      ['Dịch vụ',  order.rating.service],
                      ['Đóng gói', order.rating.packaging],
                      ['Shipper',  order.rating.shipping],
                    ].map(([label, val]) => (
                      <span key={label} className={`font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                        {label}: {'⭐'.repeat(val)}
                      </span>
                    ))}
                  </div>
                  {order.rating.comment && (
                    <p className={`text-sm mt-2 italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>"{order.rating.comment}"</p>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
