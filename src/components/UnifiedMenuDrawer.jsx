import { FiX, FiMoon, FiSun, FiGlobe, FiUser, FiLogOut, FiInstagram, FiLinkedin, FiYoutube, FiShoppingBag, FiHeadphones, FiInfo } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';

export default function UnifiedMenuDrawer({
  isUnifiedMenuOpen, setIsUnifiedMenuOpen,
  isDarkMode, handleThemeToggle,
  lang, setLang,
  currentView, isAuthenticated, handleLogout,
  navigateTo, requireLogin, t,
  // ── CHANGE 3: footer props for mobile links ──
  showToast,
  setShowPrivacyModal, setShowTermsModal,
  setShowStoryModal, setShowCareerModal, setShowContactModal,
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

          {/* ── CHANGE 4: Account section — hidden on mobile (md:block), visible on desktop ──
               Rationale: bottom nav already has the Account tab on mobile */}
          <div className="hidden md:block">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-6 ml-2">Cá nhân</p>
            <button
              onClick={() => requireLogin(() => { close(); navigateTo('profile'); })}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all text-left group border ${
                currentView === 'profile'
                  ? isDarkMode ? 'bg-white text-black border-white' : 'bg-slate-900 text-white border-slate-900'
                  : isDarkMode ? 'bg-black/20 border-white/5 hover:border-sky-500 hover:text-sky-400' : 'bg-slate-50 border-slate-100 text-slate-900 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600'
              }`}
            >
              <FiUser className="text-xl"/> Tài khoản của tôi
            </button>
          </div>

          {/* ── CHANGE 3: Footer content — mobile only (md:hidden) ──
               Compact pill-button style, easy to tap */}
          <div className="md:hidden mt-6 flex flex-col gap-5">

            {/* Products */}
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1.5">
                <FiShoppingBag className="text-xs"/> {t('f_prod')}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: t('f_all'),    action: () => go('shop', 'all') },
                  { label: t('f_men'),    action: () => go('shop', 'shirt_all') },
                  { label: t('f_women'),  action: () => go('shop', 'pants_all') },
                  { label: t('f_acc'),    action: () => go('shop', 'acc_all') },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600'}`}
                  >
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
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600'}`}
                  >
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
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600'}`}
                  >
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
                  { Icon: FaFacebook,  action: null, href: 'https://www.facebook.com/profile.php?id=61578555688928', label: 'Facebook' },
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
