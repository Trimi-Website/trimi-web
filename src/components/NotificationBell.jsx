import { useState, useEffect, useRef } from 'react';
import { FiBell, FiX, FiShoppingBag, FiMessageCircle, FiPackage, FiCheck, FiTrash2 } from 'react-icons/fi';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_META = {
  new_order:    { icon: FiShoppingBag, color: 'text-sky-500',     bg: 'bg-sky-50',     border: 'border-sky-100' },
  new_message:  { icon: FiMessageCircle, color: 'text-violet-500', bg: 'bg-violet-50',  border: 'border-violet-100' },
  order_status: { icon: FiPackage,      color: 'text-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-100' },
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NotificationBell({ user, isAdmin, isDarkMode }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen]               = useState(false);
  const dropdownRef                        = useRef(null);

  // The Firestore path — admin gets a fixed bucket; users get their own
  const bucketId = isAdmin ? 'admin' : user?.uid;

  // ── Subscribe ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!bucketId) return;
    const colRef = collection(db, 'notifications', bucketId, 'items');
    const unsub  = onSnapshot(colRef, (snap) => {
      const items = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setNotifications(items.sort((a, b) => b.createdAt - a.createdAt));
    }, () => {});
    return () => unsub();
  }, [bucketId]);

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const markRead = async (notifId) => {
    if (!bucketId) return;
    await setDoc(
      doc(db, 'notifications', bucketId, 'items', notifId),
      { isRead: true },
      { merge: true }
    ).catch(() => {});
  };

  const markAllRead = async () => {
    if (!bucketId) return;
    const batch = writeBatch(db);
    notifications
      .filter(n => !n.isRead)
      .forEach(n => batch.set(
        doc(db, 'notifications', bucketId, 'items', n.id),
        { isRead: true },
        { merge: true }
      ));
    await batch.commit().catch(() => {});
  };

  const clearAll = async () => {
    if (!bucketId) return;
    const batch = writeBatch(db);
    notifications.forEach(n =>
      batch.delete(doc(db, 'notifications', bucketId, 'items', n.id))
    );
    await batch.commit().catch(() => {});
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(prev => !prev);
  };

  const handleNotifClick = (n) => {
    if (!n.isRead) markRead(n.id);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Don't render at all if there's no user
  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>

      {/* ── BELL BUTTON ─────────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        aria-label="Thông báo"
        className={`relative p-1 md:p-2 transition-colors cursor-pointer ${
          isDarkMode ? 'text-white hover:text-sky-400' : 'text-slate-900 hover:text-sky-600'
        }`}
      >
        <FiBell className={`text-xl md:text-2xl transition-transform duration-200 ${isOpen ? 'scale-110' : ''}`} />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── DROPDOWN ────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className={`absolute right-0 top-full mt-3 w-[340px] md:w-[380px] rounded-2xl shadow-2xl border z-[50000] overflow-hidden animate-fade-in-up origin-top-right ${
          isDarkMode
            ? 'bg-[#1e293b] border-slate-700 text-white'
            : 'bg-white border-slate-100 text-slate-900'
        }`}>

          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <FiBell className="text-sky-500 text-lg"/>
              <h3 className="font-black text-base">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Đánh dấu tất cả đã đọc"
                  className={`p-1.5 rounded-full transition-colors text-xs font-bold flex items-center gap-1 ${
                    isDarkMode ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <FiCheck className="text-base"/> Đọc hết
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Xóa tất cả"
                  className={`p-1.5 rounded-full transition-colors ${
                    isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
                  }`}
                >
                  <FiTrash2 className="text-sm"/>
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <FiBell className={`text-3xl ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}/>
                </div>
                <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Không có thông báo nào
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Các hoạt động mới sẽ hiện tại đây
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.order_status;
                const IconComp = meta.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className={`flex gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b last:border-0 ${
                      isDarkMode ? 'border-slate-700/50' : 'border-slate-50'
                    } ${
                      !n.isRead
                        ? isDarkMode ? 'bg-sky-500/5 hover:bg-sky-500/10' : 'bg-sky-50/60 hover:bg-sky-50'
                        : isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${meta.bg} ${meta.border}`}>
                      <IconComp className={`text-lg ${meta.color}`}/>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-bold leading-snug line-clamp-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {n.body}
                      </p>
                      <p className={`text-[10px] mt-1.5 font-medium ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
