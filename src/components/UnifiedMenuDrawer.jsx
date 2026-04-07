import { useState } from 'react';
import { FiX, FiMoon, FiSun, FiGlobe, FiLogOut, FiUser, FiInstagram, FiLinkedin, FiYoutube, FiShoppingBag, FiHeadphones, FiInfo, FiUsers, FiUserCheck, FiUserPlus, FiTruck, FiMessageCircle, FiSettings } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';

// ── Friends section — extracted as real component so hooks work correctly ───
// ── Friends section — extracted as real component so hooks work correctly ───
function FriendsSection({ isDarkMode, usersList, friendsList, pendingRequests, onAcceptFriend, onDeclineFriend, onAddFriend, user }) {
  const myFriends = usersList.filter(u => friendsList.includes(u.uid));
  const pending   = pendingRequests || [];
  
  // Thuật toán Gợi ý: Lọc bỏ bản thân, lọc bỏ người đã kết bạn, lọc bỏ người đang chờ xác nhận
  const suggestions = (usersList || [])
    .filter(u => u.uid !== user?.uid && !friendsList.includes(u.uid) && !pending.some(r => r.fromUid === u.uid))
    .slice(0, 5); // Lấy 5 người lạ

  // 1. CHUYỂN STATE VÀO ĐÂY
  const [sentRequests, setSentRequests] = useState([]); 
  const [viewingProfile, setViewingProfile] = useState(null);

  const handleSendFriendRequest = (e, targetUid) => {
    e.stopPropagation();
    onAddFriend(e, targetUid); 
    setSentRequests(prev => [...prev, targetUid]); 
  };

  return (
    <div className="mt-5 relative">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1.5">
        <FiUsers className="text-xs"/> Bạn bè
        {pending.length > 0 && (
          <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
            {pending.length}
          </span>
        )}
      </p>

      {/* ── Incoming friend requests ── */}
      {pending.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          <p className={`text-[10px] font-black uppercase tracking-widest px-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
            Lời mời kết bạn ({pending.length})
          </p>
          {pending.map(req => {
            const sender = usersList.find(u => u.uid === req.fromUid);
            return (
              <div
                key={req.fromUid}
                className={`flex items-center gap-2 p-2.5 rounded-2xl border ${isDarkMode ? 'bg-amber-500/10 border-amber-700/50' : 'bg-amber-50 border-amber-200'}`}
              >
                <div onClick={() => setViewingProfile(sender)} className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border-2 border-amber-300 cursor-pointer hover:opacity-80">
                  {sender?.avatar ? <img src={sender.avatar} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-600">{(sender?.nickname || req.fromName || '?').charAt(0).toUpperCase()}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {sender?.nickname || req.fromName || sender?.email?.split('@')[0] || 'Người dùng'}
                  </p>
                  {sender?.role === 'shipper' && <span className="text-[9px] font-black text-emerald-600 flex items-center gap-0.5"><FiTruck className="text-[8px]"/> Shipper</span>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => onAcceptFriend(req.fromUid)} className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"><FiUserCheck className="text-xs"/></button>
                  <button onClick={() => onDeclineFriend(req.fromUid)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer text-xs font-black ${isDarkMode ? 'bg-slate-700 hover:bg-red-700 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-500'}`}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── GỢI Ý BẠN BÈ ── */}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <p className={`text-[10px] font-black uppercase tracking-widest px-1 mb-2 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
            Gợi ý bạn bè
          </p>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 px-1">
            {suggestions.map(s => {
              const isSent = sentRequests.includes(s.uid);
              return (
                <div key={s.uid} className={`flex flex-col items-center w-[85px] p-2.5 rounded-2xl border flex-shrink-0 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div 
                    onClick={() => setViewingProfile(s)}
                    className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden mb-2 cursor-pointer border border-slate-300 hover:scale-105 transition-transform"
                  >
                    {s.avatar ? <img src={s.avatar} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center font-black text-slate-500">{(s.nickname || s.email || 'U').charAt(0).toUpperCase()}</div>}
                  </div>
                  <p className={`text-[10px] font-bold truncate w-full text-center mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {s.nickname || s.email?.split('@')[0]}
                  </p>
                  <button 
                    disabled={isSent}
                    onClick={(e) => handleSendFriendRequest(e, s.uid)}
                    className={`w-full py-1.5 rounded-full text-[10px] font-black flex items-center justify-center gap-1 transition-colors shadow-sm ${
                      isSent 
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400' 
                        : 'bg-sky-500 hover:bg-sky-600 text-white cursor-pointer'
                    }`}
                  >
                    {isSent ? 'Đã gửi' : <><FiUserPlus className="text-[10px]"/> Thêm</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── DANH SÁCH BẠN BÈ ── */}
      {myFriends.length === 0 && pending.length === 0 ? (
        <div className={`text-center py-4 rounded-2xl border border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <FiUserPlus className="mx-auto text-xl mb-1 opacity-50"/>
          <p className="text-xs font-medium">Chưa có bạn bè</p>
          <p className="text-[10px] opacity-60 mt-0.5">Thêm bạn ở mục gợi ý bên trên nhé!</p>
        </div>
      ) : myFriends.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {myFriends.map(f => (
            <div key={f.uid} onClick={() => setViewingProfile(f)} className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} transition-colors`}>
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                  {f.avatar ? <img src={f.avatar} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-600">{(f.nickname || '?').charAt(0).toUpperCase()}</div>}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${isDarkMode ? 'border-[#111111]' : 'border-white'} ${f.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-bold truncate block ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{f.nickname || f.email?.split('@')[0]}</span>
                {f.role === 'shipper' && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-full inline-flex items-center gap-0.5"><FiTruck className="text-[8px]"/> Shipper</span>}
              </div>
              <span className={`text-[9px] font-medium flex-shrink-0 ${f.isOnline ? 'text-emerald-500' : isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                {f.isOnline ? '● Online' : 'Offline'}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {/* ── POPUP XEM HỒ SƠ CHUYÊN NGHIỆP ── */}
      {viewingProfile && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setViewingProfile(null)}>
          <div className={`rounded-2xl p-6 w-full max-w-xs shadow-2xl relative ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingProfile(null)} className={`absolute top-4 right-4 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
              <FiX className="text-xl" />
            </button>
            <div className="flex flex-col items-center mt-2">
              <img src={viewingProfile.avatar || 'https://via.placeholder.com/150'} className={`w-20 h-20 rounded-full object-cover border-4 mb-3 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`} alt="Profile" />
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{viewingProfile.nickname || viewingProfile.email?.split('@')[0]}</h3>
              <p className={`text-[11px] font-medium mb-5 px-3 py-1 rounded-full mt-2 ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                {viewingProfile.role || 'Thành viên Trimi'}
              </p>
              
              <div className="flex w-full gap-2">
                {friendsList.includes(viewingProfile.uid) ? (
                  <button 
                    onClick={() => { setViewingProfile(null); document.dispatchEvent(new CustomEvent('trimi:open-chat', { detail: viewingProfile })); }}
                    className="flex-1 bg-sky-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-sky-600 flex items-center justify-center gap-2"
                  >
                    <FiMessageCircle /> Nhắn tin
                  </button>
                ) : (
                  <button 
                    disabled={sentRequests.includes(viewingProfile.uid)}
                    onClick={(e) => handleSendFriendRequest(e, viewingProfile.uid)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                      sentRequests.includes(viewingProfile.uid)
                        ? (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500')
                        : 'bg-sky-500 text-white hover:bg-sky-600'
                    }`}
                  >
                    {sentRequests.includes(viewingProfile.uid) ? 'Đã gửi yêu cầu' : <><FiUserPlus /> Kết bạn</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnifiedMenuDrawer({
  isUnifiedMenuOpen, setIsUnifiedMenuOpen,
  isDarkMode, handleThemeToggle,
  lang, setLang,
  currentView, isAuthenticated, handleLogout,
  navigateTo, requireLogin, t,
  showToast,
  setShowPrivacyModal, setShowTermsModal,
  setShowStoryModal, setShowCareerModal, setShowContactModal,
  setShowSizeGuideModal,
  // ── NEW: friend system ──
  user, usersList, friendsList, pendingRequests,
  onAcceptFriend, onDeclineFriend, onAddFriend,
  // ── NEW: guest login ──
  setShowLoginModal,setIsSettingsDrawerOpen,
  littleTrimiConfig, updateLittleTrimiConfig
}) {
  if (!isUnifiedMenuOpen) return null;
  const [sentRequests, setSentRequests] = useState([]); 
  const [viewingProfile, setViewingProfile] = useState(null);
  const handleSendFriendRequest = (e, targetUid) => {
    e.stopPropagation();
    onAddFriend(e, targetUid); // Gọi hàm add friend gốc từ App.jsx
    setSentRequests(prev => [...prev, targetUid]); // Đánh dấu là đã gửi
  };
  const close = () => setIsUnifiedMenuOpen(false);
  const go    = (view, cat) => { close(); navigateTo(view, cat); };

  return (
    <div className="fixed inset-0 z-[100000] flex justify-end">

      {/* Backdrop — on mobile the drawer IS full-screen so no backdrop needed */}
      <div className="absolute inset-0 bg-slate-900/70 hidden md:block" onClick={close}></div>

      {/* Drawer panel:
          Mobile: full-screen (w-full h-full), no border-l
          Desktop: side drawer 320px wide */}
      <div className={`relative w-full md:w-[320px] h-full flex flex-col shadow-2xl md:border-l overflow-y-auto transform transition-transform duration-300 ${isDarkMode ? 'bg-[#111111] md:border-slate-800 text-white' : 'bg-white md:border-slate-200 text-slate-900'}`}>

        {/* ── HEADER ── */}
        <div className={`flex justify-between items-center px-5 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <button onClick={close} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
            <FiX className="text-xl"/>
          </button>
          <h2 className="text-4xl font-brush font-black tracking-wide">Trimi</h2>
        </div>

        {/* ── MOBILE ONLY: Category Nav at the very top of menu ── */}
        <div className="md:hidden px-5 pt-5 pb-3 border-b border-slate-100/50">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <FiShoppingBag className="text-xs"/> Danh mục
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Tất cả',           action: () => go('shop', 'all'),       match: 'all' },
              { label: t('nav_shirt'),      action: () => go('shop', 'shirt_all'), match: 'shirt' },
              { label: t('nav_pants'),      action: () => go('shop', 'pants_all'), match: 'pants' },
              { label: t('nav_acc'),        action: () => go('shop', 'acc_all'),   match: 'acc' },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className={`py-3 px-4 rounded-2xl text-sm font-black text-center transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 border border-slate-700 text-white hover:bg-sky-500/20 hover:border-sky-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MENU BODY ── */}
        <div className="flex-grow flex flex-col px-5 py-4 gap-1.5">
          {/* ── LITTLE TRIMI CUSTOMIZATION Ở TRONG MENU ─── */}
          {littleTrimiConfig && updateLittleTrimiConfig && (
            // Thêm md:hidden để ẩn khối này từ màn hình PC trở lên
            <div className={`md:hidden mt-4 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}> 
              <p className="text-[11px] font-black text-sky-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Màu sắc</label>
                  <div className={`flex items-center gap-2 rounded-xl p-1 border ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-black/10'}`}>
                    <input 
                      type="color" 
                      value={littleTrimiConfig.color}
                      onChange={(e) => updateLittleTrimiConfig({ color: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Hiệu ứng</label>
                  <select 
                    value={littleTrimiConfig.effect}
                    onChange={(e) => updateLittleTrimiConfig({ effect: e.target.value })}
                    className={`w-full border rounded-xl px-2 py-2 outline-none focus:border-sky-500 text-xs font-bold ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-black/10'}`}
                  >
                    <option value="spin">Xoay tròn</option>
                    <option value="wave">Sóng dâng</option>
                    <option value="relax">Lướt nhẹ</option>
                    <option value="heartbeat">Nhịp đập</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {/* SECTION: Display & Settings */}
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2 ml-1">Giao diện & Cài đặt</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={(e) => handleThemeToggle(e)} className={`flex flex-col items-center justify-center p-3 rounded-2xl font-bold transition-colors border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-sky-400' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              {isDarkMode ? <FiSun className="text-xl mb-2"/> : <FiMoon className="text-xl mb-2"/>}
              <span className="text-[10px]">Giao diện</span>
            </button>
            <button onClick={() => setLang(lang === 'VI' ? 'EN' : 'VI')} className={`flex flex-col items-center justify-center p-3 rounded-2xl font-bold transition-colors border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <FiGlobe className="text-xl mb-2"/>
              <span className="text-[10px]">{lang === 'VI' ? 'EN' : 'VI'}</span>
            </button>
            <button onClick={() => { close(); setIsSettingsDrawerOpen?.(true); }} className={`flex flex-col items-center justify-center p-3 rounded-2xl font-bold transition-colors border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
              <FiSettings className="text-xl mb-2"/>
              <span className="text-[10px]">Cài đặt</span>
            </button>
          </div>

          {/* ── FRIENDS SECTION — (Chỉ PC mới thấy) ────────────────── */}
          {isAuthenticated && user && (
            <div className="hidden md:block">
              <FriendsSection
                isDarkMode={isDarkMode}
                usersList={usersList}
                friendsList={friendsList || []}
                pendingRequests={pendingRequests || []}
                onAcceptFriend={onAcceptFriend}
                onDeclineFriend={onDeclineFriend}
                onAddFriend={onAddFriend}
                user={user}
              />
            </div>
          )}

          {/* SECTION: Footer links — mobile only (md:hidden)
              On desktop the footer is visible at the bottom of the page. */}
          <div className="md:hidden mt-6 flex flex-col gap-5">

            {/* Products */}
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1.5">
                <FiShoppingBag className="text-xs"/> {t('f_prod')}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: t('f_all'),   action: () => go('shop', 'all') },
                  { label: t('f_men'),   action: () => go('shop', 'shirt_all') },
                  { label: t('f_women'), action: () => go('shop', 'pants_all') },
                  { label: t('f_acc'),   action: () => go('shop', 'acc_all') },
                ].map(item => (
                  <button key={item.label} onClick={item.action} className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1.5">
                <FiHeadphones className="text-xs"/> {t('f_sup')}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: t('f_track'), action: () => { close(); requireLogin(() => navigateTo('profile')); } },
                  { label: t('f_ret'),   action: () => { close(); setShowTermsModal(true); } },
                  { label: t('f_ship'),  action: () => { close(); setShowTermsModal(true); } },
                  { label: t('f_size'),  action: () => { close(); setShowSizeGuideModal(true); } },
                ].map(item => (
                  <button key={item.label} onClick={item.action} className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* About */}
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1.5">
                <FiInfo className="text-xs"/> {t('f_about')}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: t('f_story'),   action: () => { close(); setShowStoryModal(true); } },
                  { label: t('f_career'),  action: () => { close(); setShowCareerModal(true); } },
                  { label: t('f_contact'), action: () => { close(); setShowContactModal(true); } },
                  { label: t('f_priv'),    action: () => { close(); setShowPrivacyModal(true); } },
                ].map(item => (
                  <button key={item.label} onClick={item.action} className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Social icons */}
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Mạng xã hội</p>
              <div className="flex gap-2">
                {[
                  { Icon: FiInstagram, action: () => showToast('Đang chuyển đến Instagram!'), label: 'Instagram' },
                  { Icon: FaFacebook,  href: 'https://www.facebook.com/profile.php?id=61578555688928', label: 'Facebook' },
                  { Icon: FiLinkedin,  action: () => showToast('Đang chuyển đến LinkedIn!'), label: 'LinkedIn' },
                  { Icon: FiYoutube,   action: () => showToast('Đang chuyển đến YouTube!'), label: 'YouTube' },
                ].map(item => (
                  item.href
                    ? <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-sky-500 hover:border-sky-500 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-sky-500 hover:border-sky-500 hover:text-white'}`}>
                        <item.Icon className="text-base"/>
                      </a>
                    : <button key={item.label} onClick={item.action} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-sky-500 hover:border-sky-500 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-sky-500 hover:border-sky-500 hover:text-white'}`}>
                        <item.Icon className="text-base"/>
                      </button>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <p className={`text-[10px] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'} mt-1`}>
              © Copyright Trimi 2026. All rights reserved.
            </p>
          </div>

        </div>

        {/* ── FOOTER: LOGIN (guest) / LOGOUT (authenticated) ── */}
        <div className={`p-4 mt-auto border-t ${isDarkMode ? 'border-slate-800 bg-[#111111]' : 'border-slate-100 bg-white'}`}>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200"
            >
              <FiLogOut/> {t('logout')}
            </button>
          ) : (
            <button
              onClick={() => { close(); setShowLoginModal?.(true); }}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white p-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <FiUser className="text-base"/> Đăng nhập / Đăng ký
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
