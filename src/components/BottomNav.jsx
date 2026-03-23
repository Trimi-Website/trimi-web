import { FiHome, FiUser, FiMessageCircle, FiShoppingCart, FiBell, FiUsers } from 'react-icons/fi';

export default function BottomNav({
  isDarkMode, currentView, navigateTo, requireLogin,
  cartItemCount, hasUnreadUser, totalAdminUnread, isAdmin, unreadBellCount,
  pendingRequestsCount,
  setIsHelpOpen, setIsCartOpen, setShowFriendsModal,
}) {
  const base = 'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors cursor-pointer relative';
  const active = 'text-sky-500';
  const inactive = isDarkMode ? 'text-slate-400 active:text-sky-400' : 'text-slate-500 active:text-sky-500';

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 w-full z-[9999] border-t flex justify-around items-center h-[60px] transition-colors duration-300 ${
        isDarkMode ? 'bg-[#111111] border-slate-800' : 'bg-white border-slate-200'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* ① Home / Shop */}
      <button
        aria-label="Cửa hàng"
        onClick={() => navigateTo('shop', 'all')}
        className={`${base} ${currentView === 'shop' || currentView === 'home' || currentView === 'productDetail' ? active : inactive}`}
      >
        <FiHome
          className="text-[22px]"
          style={{ fill: (currentView === 'shop' || currentView === 'home') ? 'currentColor' : 'none' }}
        />
        <span className="text-[9px] font-bold">Cửa hàng</span>
      </button>

      {/* ② Chat */}
      <button
        aria-label="Chat"
        onClick={() => setIsHelpOpen(true)}
        className={`${base} ${inactive}`}
      >
        <div className="relative">
          <FiMessageCircle className="text-[22px]"/>
          {!isAdmin && hasUnreadUser && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#111111] rounded-full"></span>
          )}
          {isAdmin && totalAdminUnread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {totalAdminUnread > 9 ? '9+' : totalAdminUnread}
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold">Chat</span>
      </button>

      {/* ③ Cart */}
      <button
        aria-label="Giỏ hàng"
        onClick={() => setIsCartOpen(true)}
        className={`${base} ${inactive}`}
      >
        <div className="relative">
          <FiShoppingCart className="text-[22px]"/>
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-sky-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold">Giỏ hàng</span>
      </button>

      {/* ④ Notification Bell */}
      <button
        aria-label="Thông báo"
        onClick={() => document.dispatchEvent(new CustomEvent('trimi:open-bell'))}
        className={`${base} ${inactive}`}
      >
        <div className="relative">
          <FiBell className="text-[22px]"/>
          {unreadBellCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white animate-pulse">
              {unreadBellCount > 9 ? '9+' : unreadBellCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold">Thông báo</span>
      </button>

      {/* ⑤ Friends */}
      <button
        aria-label="Bạn bè"
        onClick={() => setShowFriendsModal?.(true)}
        className={`${base} ${inactive}`}
      >
        <div className="relative">
          <FiUsers className="text-[22px]"/>
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white animate-pulse">
              {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold">Bạn bè</span>
      </button>

      {/* ⑥ Account */}
      <button
        aria-label="Tài khoản"
        onClick={() => requireLogin(() => navigateTo('profile'))}
        className={`${base} ${['profile','admin','shipper'].includes(currentView) ? active : inactive}`}
      >
        <FiUser
          className="text-[22px]"
          style={{ fill: ['profile','admin','shipper'].includes(currentView) ? 'currentColor' : 'none' }}
        />
        <span className="text-[9px] font-bold">Tài khoản</span>
      </button>
    </nav>
  );
}

