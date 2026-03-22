import { FiX, FiMoon, FiSun, FiGlobe, FiLogOut, FiInstagram, FiLinkedin, FiYoutube, FiShoppingBag, FiHeadphones, FiInfo, FiUsers, FiUserCheck, FiUserPlus, FiTruck } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';

// ── Friends section — extracted as real component so hooks work correctly ───
function FriendsSection({ isDarkMode, usersList, friendsList, pendingRequests, onAcceptFriend, onDeclineFriend }) {
  const myFriends = usersList.filter(u => friendsList.includes(u.uid));
  const pending   = pendingRequests;

  return (
    <div className="mt-5">
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
                {/* Sender avatar */}
                <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border-2 border-amber-300">
                  {sender?.avatar
                    ? <img src={sender.avatar} className="w-full h-full object-cover" alt=""/>
                    : <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-600">
                        {(sender?.nickname || req.fromName || '?').charAt(0).toUpperCase()}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {sender?.nickname || req.fromName || sender?.email?.split('@')[0] || 'Người dùng'}
                  </p>
                  {sender?.role === 'shipper' && (
                    <span className="text-[9px] font-black text-emerald-600 flex items-center gap-0.5">
                      <FiTruck className="text-[8px]"/> Shipper
                    </span>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => onAcceptFriend(req.fromUid)}
                    className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                    title="Chấp nhận"
                  >
                    <FiUserCheck className="text-xs"/>
                  </button>
                  <button
                    onClick={() => onDeclineFriend(req.fromUid)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer text-xs font-black ${isDarkMode ? 'bg-slate-700 hover:bg-red-700 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-500'}`}
                    title="Từ chối"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Friends list ── */}
      {myFriends.length === 0 && pending.length === 0 ? (
        <div className={`text-center py-4 rounded-2xl border border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <FiUserPlus className="mx-auto text-xl mb-1 opacity-50"/>
          <p className="text-xs font-medium">Chưa có bạn bè</p>
          <p className="text-[10px] opacity-60 mt-0.5">Mở chat để kết bạn với người dùng khác</p>
        </div>
      ) : myFriends.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {myFriends.map(f => (
            <div key={f.uid} className={`flex items-center gap-2.5 p-2 rounded-xl ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} transition-colors`}>
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                  {f.avatar
                    ? <img src={f.avatar} className="w-full h-full object-cover" alt=""/>
                    : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-600">
                        {(f.nickname || '?').charAt(0).toUpperCase()}
                      </div>
                  }
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${isDarkMode ? 'border-[#111111]' : 'border-white'} ${f.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-bold truncate block ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  {f.nickname || f.email?.split('@')[0]}
                </span>
                {f.role === 'shipper' && (
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-full inline-flex items-center gap-0.5">
                    <FiTruck className="text-[8px]"/> Shipper
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-medium flex-shrink-0 ${f.isOnline ? 'text-emerald-500' : isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                {f.isOnline ? '● Online' : 'Offline'}
              </span>
            </div>
          ))}
        </div>
      ) : null}
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
  // ── NEW: friend system ──
  user, usersList, friendsList, pendingRequests,
  onAcceptFriend, onDeclineFriend,
}) {
  if (!isUnifiedMenuOpen) return null;

  const close = () => setIsUnifiedMenuOpen(false);
  const go    = (view, cat) => { close(); navigateTo(view, cat); };

  return (
    <div className="fixed inset-0 z-[100000] flex justify-end">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70" onClick={close}></div>

      {/* Drawer panel */}
      <div className={`relative w-[280px] md:w-[320px] h-full flex flex-col shadow-2xl border-l overflow-y-auto transform transition-transform duration-400 cartoon-ease translate-x-0 ${isDarkMode ? 'bg-[#111111] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>

        {/* ── HEADER ── */}
        <div className={`flex justify-between items-center p-5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <button onClick={close} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
            <FiX className="text-xl"/>
          </button>
          <h2 className="text-4xl font-brush font-black tracking-wide">Trimi</h2>
        </div>

        {/* ── MENU BODY ── */}
        <div className="flex-grow flex flex-col p-4 gap-1.5">

          {/* SECTION: Display */}
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2 ml-2">Giao diện</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={(e) => handleThemeToggle(e)} className={`flex flex-col items-center justify-center p-4 rounded-2xl font-bold transition-colors border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-sky-400' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              {isDarkMode ? <FiSun className="text-2xl mb-2"/> : <FiMoon className="text-2xl mb-2"/>}
              <span className="text-xs">Giao diện</span>
            </button>
            <button onClick={() => setLang(lang === 'VI' ? 'EN' : 'VI')} className={`flex flex-col items-center justify-center p-4 rounded-2xl font-bold transition-colors border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <FiGlobe className="text-2xl mb-2"/>
              <span className="text-xs">{lang === 'VI' ? 'Tiếng Việt' : 'English'}</span>
            </button>
          </div>

          {/* ── FRIENDS SECTION — visible on ALL screen sizes ──────────────────
               Previously was inside md:hidden which hid it on desktop. */}
          {isAuthenticated && user && (
            <FriendsSection
              isDarkMode={isDarkMode}
              usersList={usersList}
              friendsList={friendsList || []}
              pendingRequests={pendingRequests || []}
              onAcceptFriend={onAcceptFriend}
              onDeclineFriend={onDeclineFriend}
            />
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
                  { label: t('f_size'),  action: () => { close(); showToast('Tính năng Bảng Size đang được cập nhật!'); } },
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

        {/* ── FOOTER: LOGOUT ── */}
        <div className={`p-4 mt-auto border-t ${isDarkMode ? 'border-slate-800 bg-[#111111]' : 'border-slate-100 bg-white'}`}>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200"
            >
              <FiLogOut/> {t('logout')}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
