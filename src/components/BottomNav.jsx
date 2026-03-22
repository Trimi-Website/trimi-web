import { FiHome, FiUser } from 'react-icons/fi';

export default function BottomNav({ isDarkMode, currentView, navigateTo, requireLogin }) {
  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 w-full z-[9999] border-t px-2 pb-safe flex justify-around items-center h-[65px] transition-colors duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] ${
        isDarkMode
          ? 'bg-[#181512] border-slate-800'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Shop */}
      <button
        aria-label="Đi đến Cửa hàng"
        onClick={() => navigateTo('shop', 'all')}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
          currentView === 'shop'
            ? 'text-sky-500'
            : isDarkMode ? 'text-slate-300' : 'text-slate-500'
        }`}
      >
        <FiHome className="text-2xl" fill={currentView === 'shop' ? 'currentColor' : 'none'} />
        <span className="text-[10px] font-bold">Cửa hàng</span>
      </button>

      {/* Account */}
      <button
        aria-label="Mở trang Tài khoản"
        onClick={() => requireLogin(() => navigateTo('profile'))}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
          currentView === 'profile'
            ? 'text-sky-500'
            : isDarkMode ? 'text-slate-300' : 'text-slate-500'
        }`}
      >
        <FiUser className="text-2xl" fill={currentView === 'profile' ? 'currentColor' : 'none'} />
        <span className="text-[10px] font-bold">Tài khoản</span>
      </button>
    </nav>
  );
}
