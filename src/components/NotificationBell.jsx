import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // THÊM LỆNH PORTAL Ở ĐÂY
import { FiBell, FiShoppingBag, FiMessageCircle, FiPackage, FiCheck, FiTrash2, FiUserPlus, FiUserCheck, FiX } from 'react-icons/fi';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const TYPE_META = {
  new_order:      { icon: FiShoppingBag,   color: 'text-sky-500',      bg: 'bg-sky-50',      border: 'border-sky-100'      },
  new_message:    { icon: FiMessageCircle, color: 'text-violet-500',   bg: 'bg-violet-50',   border: 'border-violet-100'   },
  order_status:   { icon: FiPackage,       color: 'text-amber-500',    bg: 'bg-amber-50',    border: 'border-amber-100'    },
  friend_request: { icon: FiUserPlus,      color: 'text-emerald-500',  bg: 'bg-emerald-50',  border: 'border-emerald-100'  },
};

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function NotificationBell({ user, isAdmin, isDarkMode, onAcceptFriend, onDeclineFriend }) {
  const [adminNotifs, setAdminNotifs] = useState([]);
  const [uidNotifs, setUidNotifs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userUid = user?.uid;

  useEffect(() => {
    if (!userUid) return;
    const ref = collection(db, 'notifications', userUid, 'items');
    const unsub = onSnapshot(ref, (snap) => {
      const items = [];
      snap.forEach(d => items.push({ id: d.id, _bucket: 'uid', ...d.data() }));
      setUidNotifs(items);
    }, (err) => console.error('[Bell] uid bucket error:', err));
    return () => unsub();
  }, [userUid]);

  useEffect(() => {
    if (!isAdmin) {
      setAdminNotifs([]);
      return;
    }
    const ref = collection(db, 'notifications', 'admin', 'items');
    const unsub = onSnapshot(ref, (snap) => {
      const items = [];
      snap.forEach(d => items.push({ id: d.id, _bucket: 'admin', ...d.data() }));
      setAdminNotifs(items);
    }, (err) => console.error('[Bell] admin bucket error:', err));
    return () => unsub();
  }, [isAdmin]);

  const notifications = [
    ...adminNotifs,
    ...uidNotifs,
  ]
    .filter((n, idx, arr) => arr.findIndex(x => x.id === n.id && x._bucket === n._bucket) === idx)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const bucketPath = (n) => n._bucket === 'admin' ? 'admin' : userUid;

  const markRead = async (n) => {
    if (!n || n.isRead) return;
    await setDoc(doc(db, 'notifications', bucketPath(n), 'items', n.id), { isRead: true }, { merge: true })
      .catch(err => console.error('[Bell] markRead error:', err));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (!unread.length) return;
    const batch = writeBatch(db);
    unread.forEach(n =>
      batch.set(doc(db, 'notifications', bucketPath(n), 'items', n.id), { isRead: true }, { merge: true })
    );
    await batch.commit().catch(err => console.error('[Bell] markAllRead error:', err));
  };

  const clearAll = async () => {
    if (!notifications.length) return;
    const batch = writeBatch(db);
    notifications.forEach(n =>
      batch.delete(doc(db, 'notifications', bucketPath(n), 'items', n.id))
    );
    await batch.commit().catch(err => console.error('[Bell] clearAll error:', err));
    setIsOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    document.dispatchEvent(new CustomEvent('trimi:bell-count', { detail: unreadCount }));
  }, [unreadCount]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    document.addEventListener('trimi:open-bell', handler);
    return () => document.removeEventListener('trimi:open-bell', handler);
  }, []);

  if (!user) return null;

  // ── ĐÓNG GÓI GIAO DIỆN THÔNG BÁO VÀO 1 BIẾN ĐỂ TÁI SỬ DỤNG ──
  const popupContent = (
    <>
      <div className="fixed inset-0 bg-black/60 z-[99990] md:hidden" onClick={() => setIsOpen(false)}></div>
      
      <div className={`absolute right-0 top-full mt-3 w-[340px] md:w-[380px] rounded-2xl shadow-2xl border z-[99999] overflow-hidden animate-fade-in-up origin-top-right
        ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'}
        max-md:fixed max-md:top-[10%] max-md:left-[5%] max-md:w-[90vw] max-md:max-h-[80vh] max-md:mt-0
      `}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <FiBell className="text-sky-500 text-lg"/>
            <h3 className="font-black text-base">Thông báo</h3>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className={`p-1.5 rounded-full transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer ${isDarkMode ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-500'}`}>
                <FiCheck className="text-base"/> Đọc hết
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} className={`p-1.5 rounded-full transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                <FiTrash2 className="text-sm"/>
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="md:hidden p-1.5 rounded-full hover:bg-slate-100 text-slate-500"><FiX className="text-lg"/></button>
          </div>
        </div>

        <div className="max-h-[60vh] md:max-h-[420px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                <FiBell className={`text-3xl ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}/>
              </div>
              <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Không có thông báo nào</p>
            </div>
          ) : (
            notifications.map(n => {
              const meta = TYPE_META[n.type] || TYPE_META.order_status;
              const Icon = meta.icon;
              const isFriendReq = n.type === 'friend_request' && n.fromUid;
              return (
                <div key={`${n._bucket}-${n.id}`} className={`flex gap-3 px-4 py-3.5 transition-colors border-b last:border-0 ${isDarkMode ? 'border-slate-700/50' : 'border-slate-50'} ${!n.isRead ? (isDarkMode ? 'bg-sky-500/5' : 'bg-sky-50/60') : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${meta.bg} ${meta.border}`}>
                    <Icon className={`text-lg ${meta.color}`}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{n.title}</p>
                      {!n.isRead && !isFriendReq && <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-1"></span>}
                    </div>
                    {n.body && <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{n.body}</p>}
                    <p className={`text-[10px] mt-1 font-medium ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(p => !p)}
        aria-label="Thông báo"
        className={`relative p-1 md:p-2 transition-colors cursor-pointer ${
          isDarkMode ? 'text-white hover:text-sky-400' : 'text-slate-900 hover:text-sky-600'
        }`}
      >
        <FiBell className={`text-xl md:text-2xl transition-transform duration-200 ${isOpen ? 'scale-110' : ''}`}/>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* DESKTOP: Hiển thị bình thường để dính vào icon chuông */}
          <div className="hidden md:block">
            {popupContent}
          </div>

          {/* MOBILE: Dùng Portal để bế Popup ra ngoài Body, không bị Header che mất */}
          {createPortal(
            <div className="md:hidden relative z-[100000]">
              {popupContent}
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}