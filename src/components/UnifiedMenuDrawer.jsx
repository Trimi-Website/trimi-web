import { FiX, FiMoon, FiSun, FiGlobe, FiUser, FiLogOut } from 'react-icons/fi';

export default function UnifiedMenuDrawer({
  isUnifiedMenuOpen, setIsUnifiedMenuOpen,
  isDarkMode, handleThemeToggle,
  lang, setLang,
  currentView, isAuthenticated, handleLogout,
  navigateTo, requireLogin, t,
}) {
  if (!isUnifiedMenuOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100000] flex justify-end transition-opacity duration-400 ${isUnifiedMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70"
        onClick={() => setIsUnifiedMenuOpen(false)}
      ></div>

      {/* Drawer panel — slides in from the RIGHT */}
      <div
        className={`relative w-[280px] md:w-[320px] h-full flex flex-col shadow-2xl border-l overflow-y-auto transform transition-transform duration-400 cartoon-ease ${
          isUnifiedMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDarkMode
            ? 'bg-[#111111] border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >

        {/* ── HEADER ── */}
        <div className={`flex justify-between items-center p-5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <button
            onClick={() => setIsUnifiedMenuOpen(false)}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}
          >
            <FiX className="text-xl"/>
          </button>
          <h2 className="text-4xl font-brush font-black tracking-wide">Trimi</h2>
        </div>

        {/* ── MENU BODY ── */}
        <div className="flex-grow flex flex-col p-4 gap-1.5">

          {/* SECTION: Display */}
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2 ml-2">
            Giao diện
          </p>
          <div className="grid grid-cols-2 gap-3">

            {/* Theme toggle */}
            <button
              onClick={(e) => handleThemeToggle(e)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl font-bold transition-colors border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-sky-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {isDarkMode
                ? <FiSun className="text-2xl mb-2"/>
                : <FiMoon className="text-2xl mb-2"/>
              }
              <span className="text-xs">Giao diện</span>
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'VI' ? 'EN' : 'VI')}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl font-bold transition-colors border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <FiGlobe className="text-2xl mb-2"/>
              <span className="text-xs">{lang === 'VI' ? 'Tiếng Việt' : 'English'}</span>
            </button>
          </div>

          {/* SECTION: Personal */}
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-6 ml-2">
            Cá nhân
          </p>

          {/* Profile link — prompts login if not authenticated */}
          <button
            onClick={() => requireLogin(() => { setIsUnifiedMenuOpen(false); navigateTo('profile'); })}
            className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all text-left group border ${
              currentView === 'profile'
                ? isDarkMode
                  ? 'bg-white text-black border-white'
                  : 'bg-slate-900 text-white border-slate-900'
                : isDarkMode
                  ? 'bg-black/20 border-white/5 hover:border-sky-500 hover:text-sky-400'
                  : 'bg-slate-50 border-slate-100 text-slate-900 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600'
            }`}
          >
            <FiUser className="text-xl"/> Tài khoản của tôi
          </button>

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
