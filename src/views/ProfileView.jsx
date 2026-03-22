import { useState } from 'react';
import {
  FiCamera, FiLogOut, FiMonitor, FiSettings, FiEdit3, FiCheckCircle,
  FiX, FiArchive, FiImage,
} from 'react-icons/fi';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function ProfileView({
  isDarkMode, t, isAdmin, user,
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
  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8 animate-fade-in-up relative z-30">

      {/* ── PROFILE CARD ── */}
      <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-200 mb-6 relative">

        {/* COVER PHOTO */}
        <div className="h-48 md:h-72 w-full bg-gradient-to-r from-sky-400 to-indigo-500 relative flex items-center justify-center overflow-hidden">
          {coverUrl
            ? <img src={coverUrl} className="w-full h-full object-cover" alt="Cover"/>
            : <FiImage className="text-6xl text-white opacity-20"/>
          }
          <div className="absolute bottom-4 right-4">
            <label htmlFor="coverUpload" className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white hover:text-slate-900 transition-all cursor-pointer shadow-md">
              <FiCamera className="text-lg"/> {t('changeCover')}
            </label>
            <input type="file" id="coverUpload" accept="image/*" onClick={(e) => e.target.value = null} onChange={(e) => handleProfileUpload(e, 'cover')} className="hidden" />
          </div>
        </div>

        {/* AVATAR + ACTIONS ROW */}
        <div className="px-6 md:px-12 pb-8 relative">
          {/* Avatar */}
          <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-full p-1.5 absolute -top-16 md:-top-24 border border-slate-100 shadow-xl z-10">
            <div className="w-full h-full bg-slate-900 text-white rounded-full flex items-center justify-center text-5xl font-black relative overflow-hidden group">
              {avatarUrl
                ? <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar"/>
                : nickname.charAt(0).toUpperCase() || 'U'
              }
              <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <FiCamera className="text-white text-3xl"/>
              </label>
              <input type="file" id="avatarUpload" accept="image/*" onClick={(e) => e.target.value = null} onChange={(e) => handleProfileUpload(e, 'avatar')} className="hidden" />
            </div>
          </div>

          {/* Action buttons */}
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
          </div>

          {/* NAME + BADGES */}
          <div className="mt-4 md:mt-0 relative z-20">
            {/* Editable name */}
            {!isEditingName ? (
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                {nickname}
                <button
                  onClick={() => { setTempName(nickname); setIsEditingName(true); }}
                  className="text-sm text-slate-400 hover:text-sky-500 transition-colors p-1.5 bg-slate-50 rounded-full border border-slate-100"
                  title="Đổi biệt danh"
                >
                  <FiEdit3/>
                </button>
                <button
                  onClick={() => {
                    setTempSettings({ nickname, phone, address, district, theme: isDarkMode ? 'dark' : 'light', lang });
                    setIsSettingsDrawerOpen(true);
                  }}
                  className="text-sm text-slate-400 hover:text-sky-500 transition-colors p-1.5 bg-slate-50 rounded-full border border-slate-100 ml-1"
                  title="Cài đặt Profile, Giao diện & Ngôn ngữ"
                >
                  <FiSettings/>
                </button>
              </h2>
            ) : (
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="text" value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  className="border-b-2 border-sky-500 text-3xl md:text-4xl font-black text-slate-900 outline-none bg-transparent w-64 md:w-80"
                  autoFocus placeholder="Nhập biệt danh..."
                />
                <button onClick={handleSaveName} className="bg-slate-900 text-white p-2 rounded-full hover:bg-sky-500 shadow-md transition-colors">
                  <FiCheckCircle className="text-lg"/>
                </button>
                <button onClick={() => setIsEditingName(false)} className="bg-slate-100 text-slate-500 p-2 rounded-full hover:bg-red-500 hover:text-white shadow-md transition-colors">
                  <FiX className="text-lg"/>
                </button>
              </div>
            )}

            <p className="text-slate-500 font-medium mb-4 mt-2">{user?.email || 'Đăng nhập bằng Số điện thoại'}</p>

            {/* Role badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">{t('roleCustomer')}</span>
              <span className="bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"><FiCheckCircle/> {t('roleVerified')}</span>
              {isAdmin && <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold">Admin</span>}
            </div>
          </div>

          {/* TAB BAR */}
          <div className={`flex gap-8 border-b pt-6 overflow-x-auto custom-scrollbar relative z-20 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {['Đơn hàng của tôi'].map((tab, idx) => (
              <button key={idx} className={`pb-3 whitespace-nowrap font-bold text-sm tracking-wide transition-colors ${isDarkMode ? 'text-white border-b-2 border-white' : 'text-slate-900 border-b-2 border-slate-900'}`}>
                {tab}
              </button>
            ))}
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
            <div
              key={order.id}
              className={`p-6 rounded-[32px] border shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}
            >
              {/* Order info */}
              <div>
                <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mã đơn: {order.orderId}</h4>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                </p>
                <div className="space-y-1">
                  {order.items.map((it, idx) => (
                    <p key={idx} className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      - {it.name} <span className="text-sky-500 font-bold ml-1">x{it.quantity}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Order status + amount */}
              <div className="flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0">
                <span className="text-xl font-black text-sky-500">
                  {order.paidAmount.toLocaleString('vi-VN')}đ{' '}
                  <span className="text-xs text-slate-500 font-medium">
                    ({order.paymentMode === 'full' ? '100%' : 'Cọc 30%'})
                  </span>
                </span>
                <span className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm ${
                  order.status.includes('Hoàn thành') ? 'bg-emerald-500 text-white'
                  : order.status.includes('hủy') || order.status.includes('từ chối') ? 'bg-red-500 text-white'
                  : 'bg-amber-400 text-amber-950'
                }`}>
                  {order.status}
                </span>

                {/* Cancel order button */}
                {order.status === 'Chờ xác nhận thanh toán' && (
                  <button
                    onClick={async () => {
                      if (window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) {
                        await setDoc(doc(db, 'orders', order.id), { status: 'Khách hàng tự hủy đơn' }, { merge: true });
                        showToast('Đã hủy đơn thành công! Đơn sẽ bị xóa sau 5 giây.');
                        setTimeout(() => { deleteDoc(doc(db, 'orders', order.id)); }, 5000);
                      }
                    }}
                    className="text-xs font-bold text-red-500 hover:underline cursor-pointer mt-1"
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
