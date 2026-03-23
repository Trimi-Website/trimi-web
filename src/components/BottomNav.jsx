import { useState, useRef, useEffect } from 'react';
import { FiHome, FiUser, FiMessageCircle, FiShoppingCart, FiBell, FiUsers } from 'react-icons/fi';

export default function BottomNav({
  isDarkMode, currentView, navigateTo, requireLogin,
  cartItemCount, hasUnreadUser, totalAdminUnread, isAdmin, unreadBellCount,
  pendingRequestsCount,
  setIsHelpOpen, setIsCartOpen, setShowFriendsModal, onNotificationClick,
  littleTrimiConfig
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const barRef = useRef(null);

  // Danh sách các tab và hành động tương ứng
  const tabs = [
    { id: 'home', icon: FiHome, label: 'Cửa hàng', badge: 0, 
      action: () => navigateTo('shop', 'all') },
    { id: 'chat', icon: FiMessageCircle, label: 'Chat', 
      badge: isAdmin ? totalAdminUnread : (hasUnreadUser ? 1 : 0), 
      action: () => setIsHelpOpen(true) },
    { id: 'cart', icon: FiShoppingCart, label: 'Giỏ hàng', badge: cartItemCount, 
      action: () => setIsCartOpen(true) },
    { id: 'bell', icon: FiBell, label: 'Thông báo', badge: unreadBellCount, 
      action: () => onNotificationClick?.() },
    { id: 'friends', icon: FiUsers, label: 'Bạn bè', badge: pendingRequestsCount, 
      action: () => setShowFriendsModal?.(true) },
    { id: 'profile', icon: FiUser, label: 'Tài khoản', badge: 0, 
      action: () => requireLogin(() => navigateTo('profile')) }
  ];

  // Bắt đầu chạm vào quả cầu
  const handleTouchStart = (e) => {
    setIsDragging(true);
    // Rung nhẹ điện thoại (nếu thiết bị hỗ trợ) để tạo cảm giác sci-fi
    if (navigator.vibrate) navigator.vibrate(50); 
  };

  // Vuốt ngón tay để chọn tab
  const handleTouchMove = (e) => {
    if (!isDragging || !barRef.current) return;
    const touch = e.touches[0];
    const rect = barRef.current.getBoundingClientRect();
    
    // Kiểm tra xem ngón tay có đang nằm trong khu vực thanh Nav kéo dài không
    if (touch.clientY >= rect.top - 50 && touch.clientY <= rect.bottom + 50) {
      const relativeX = touch.clientX - rect.left;
      const tabWidth = rect.width / tabs.length;
      let idx = Math.floor(relativeX / tabWidth);
      
      // Giới hạn index để không bị lỗi
      if (idx < 0) idx = 0;
      if (idx >= tabs.length) idx = tabs.length - 1;
      
      setHoveredIdx(idx);
    } else {
      setHoveredIdx(-1); // Vuốt ra ngoài thì hủy chọn
    }
  };

  // Thả ngón tay ra để kích hoạt
  const handleTouchEnd = () => {
    if (isDragging && hoveredIdx !== -1) {
      tabs[hoveredIdx].action(); // Gọi lệnh của tab đó
      if (navigator.vibrate) navigator.vibrate(30);
    }
    setIsDragging(false);
    setHoveredIdx(-1);
  };

  return (
    <div 
      className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] flex justify-center items-end"
      // touch-none cấm trình duyệt cuộn màn hình khi đang vuốt thanh Nav
      style={{ touchAction: 'none' }} 
    >
      {/* Container chính: Quả cầu hoặc Thanh Nav */}
      <div
        ref={barRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        // Khi không kéo: Là quả cầu 60x60. Khi kéo: Dãn ra 95vw và biến thành hình chữ nhật bo góc tròn
        className={`transition-all duration-300 ease-out flex items-center justify-between px-2 overflow-hidden ${
          isDragging 
            ? `w-[95vw] h-[70px] rounded-[35px] ${isDarkMode ? 'bg-[#1e293b]/90 backdrop-blur-md border border-slate-700' : 'bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl'}` 
            : `w-[60px] h-[60px] rounded-full magic-sphere cursor-pointer effect-${littleTrimiConfig?.effect || 'spin'}`
        }`}
      >
        {/* Hiển thị các icon bên trong khi dãn ra */}
        <div className={`w-full h-full flex items-center justify-around transition-opacity duration-200 ${isDragging ? 'opacity-100' : 'opacity-0 hidden'}`}>
          {tabs.map((tab, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div 
                key={tab.id} 
                className={`flex flex-col items-center justify-center w-full h-full relative transition-all duration-200 ${isHovered ? '-translate-y-2' : ''}`}
              >
                <div className={`relative p-2 rounded-full transition-colors ${isHovered ? 'bg-sky-500 text-white shadow-[0_10px_20px_rgba(56,189,248,0.5)]' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                  <tab.icon className={`text-[24px] ${isHovered ? 'scale-110' : ''} transition-transform`} />
                  
                  {/* Badge số lượng thông báo */}
                  {tab.badge > 0 && (
                    <span className="absolute 0 top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1e293b]">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>
                
                {/* Chữ hiển thị khi tay đang lướt qua */}
                {isHovered && (
                  <span className="absolute -bottom-1 text-[10px] font-bold text-sky-500 whitespace-nowrap animate-fade-in-up">
                    {tab.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}