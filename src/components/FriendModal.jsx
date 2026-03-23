import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX, FiUserPlus, FiUserCheck, FiMessageCircle,
  FiUsers, FiSearch, FiUser,
} from 'react-icons/fi';

// ── Public profile mini-card (opens when clicking avatar/name) ───────────────
function PublicProfileCard({ target, isDarkMode, friendsList, onAddFriend, onChat, onClose }) {
  if (!target) return null;
  const isFriend = friendsList.includes(target.uid);
  return (
    <div
      className="fixed inset-0 z-[300000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xs rounded-[28px] shadow-2xl p-7 animate-fade-in-up text-center ${
          isDarkMode ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer">
          <FiX className="text-sm"/>
        </button>

        {/* Cover strip */}
        {target.cover ? (
          <div className="w-full h-16 rounded-2xl overflow-hidden mb-0 -mx-0 relative -mt-7 mb-3">
            <img src={target.cover} className="w-full h-full object-cover" alt=""/>
          </div>
        ) : (
          <div className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 mb-3"></div>
        )}

        {/* Avatar */}
        <div className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-white shadow-lg overflow-hidden bg-slate-200">
          {target.avatar
            ? <img src={target.avatar} className="w-full h-full object-cover" alt=""/>
            : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-500">
                {(target.nickname || target.email || 'U').charAt(0).toUpperCase()}
              </div>
          }
        </div>

        <h3 className="font-black text-lg">{target.nickname || target.email?.split('@')[0]}</h3>
        <p className={`text-xs mt-0.5 flex items-center justify-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <span className={`w-2 h-2 rounded-full ${target.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          {target.isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
        </p>

        {/* UID chip */}
        <p className={`text-[10px] font-mono mt-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          UID: {target.uid?.slice(0,12)}…
        </p>

        {/* Role badges */}
        <div className="flex flex-wrap gap-1.5 justify-center mt-2 mb-4">
          {target.role === 'shipper' && (
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">🚚 Shipper</span>
          )}
        </div>

        <div className="flex gap-2">
          {!isFriend ? (
            <button
              onClick={() => { onAddFriend(null, target.uid); onClose(); }}
              className="flex-1 py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FiUserPlus className="text-sm"/> Kết bạn
            </button>
          ) : (
            <div className="flex-1 py-2.5 rounded-full bg-slate-100 text-slate-500 text-sm font-bold flex items-center justify-center gap-1.5">
              <FiUserCheck className="text-sm text-emerald-500"/> Bạn bè
            </div>
          )}
          <button
            onClick={() => { onChat(target); onClose(); }}
            className="flex-1 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <FiMessageCircle className="text-sm"/> Nhắn tin
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function FriendsModal({
  isDarkMode, user, usersList, friendsList, pendingRequests,
  onAcceptFriend, onDeclineFriend, onAddFriend, onChat, onClose,
}) {
  const [tab, setTab] = useState('requests'); // 'requests' | 'friends' | 'suggest'
  const [search, setSearch] = useState('');
  const [profileTarget, setProfileTarget] = useState(null);

  const myFriends  = usersList.filter(u => friendsList.includes(u.uid));
  const suggestions = usersList.filter(
    u => !friendsList.includes(u.uid) &&
         !pendingRequests.some(r => r.fromUid === u.uid) &&
         u.uid !== user?.uid
  );

  const filtered = (list) => !search.trim()
    ? list
    : list.filter(u =>
        (u.nickname || u.email || '').toLowerCase().includes(search.toLowerCase())
      );

  const AvatarBubble = ({ u, size = 'md' }) => {
    const s = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';
    return (
      <button
        onClick={() => setProfileTarget(u)}
        className={`${s} rounded-full bg-slate-200 overflow-hidden flex-shrink-0 cursor-pointer border-2 border-white shadow-sm`}
      >
        {u.avatar
          ? <img src={u.avatar} className="w-full h-full object-cover" alt=""/>
          : <div className="w-full h-full flex items-center justify-center font-black text-slate-500">
              {(u.nickname || u.email || 'U').charAt(0).toUpperCase()}
            </div>
        }
      </button>
    );
  };

  const tabBtn = (key, label, count) => (
    <button
      onClick={() => setTab(key)}
      className={`flex-1 py-2.5 text-xs font-black rounded-full transition-colors cursor-pointer relative ${
        tab === key
          ? isDarkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
          : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {label}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[200000] flex flex-col justify-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}/>

      <div
        className={`relative w-full md:max-w-sm rounded-t-[32px] md:rounded-[32px] shadow-2xl flex flex-col animate-fade-in-up max-h-[85vh] ${
          isDarkMode ? 'bg-[#111111] text-white' : 'bg-white text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-xl font-black flex items-center gap-2">
            <FiUsers className="text-sky-500"/> Bạn bè
          </h2>
          <button onClick={onClose} className={`p-2 rounded-full cursor-pointer ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
            <FiX/>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 flex-shrink-0">
          <div className={`flex items-center gap-2 rounded-full px-4 py-2.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <FiSearch className={`text-sm flex-shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}/>
            <input
              type="text"
              placeholder="Tìm kiếm bạn bè..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 mx-5 mb-4 p-1 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {tabBtn('requests', 'Lời mời', pendingRequests.length)}
          {tabBtn('friends',  'Bạn bè',  0)}
          {tabBtn('suggest',  'Gợi ý',   0)}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 custom-scrollbar min-h-0">

          {/* ── PENDING REQUESTS ── */}
          {tab === 'requests' && (
            pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <FiUserPlus className={`text-5xl mx-auto mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}/>
                <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Không có lời mời nào</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingRequests.map(req => {
                  const sender = usersList.find(u => u.uid === req.fromUid);
                  return (
                    <div
                      key={req.fromUid}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border ${isDarkMode ? 'bg-amber-500/10 border-amber-700/40' : 'bg-amber-50 border-amber-200'}`}
                    >
                      <AvatarBubble u={sender || { uid: req.fromUid, nickname: req.fromName, avatar: req.fromAvatar }}/>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {sender?.nickname || req.fromName || 'Người dùng'}
                        </p>
                        <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Muốn kết bạn với bạn
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => onAcceptFriend(req.fromUid)}
                          className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                        >
                          <FiUserCheck className="text-sm"/>
                        </button>
                        <button
                          onClick={() => onDeclineFriend(req.fromUid)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}
                        >
                          <FiX className="text-sm"/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── FRIENDS LIST ── */}
          {tab === 'friends' && (
            filtered(myFriends).length === 0 ? (
              <div className="text-center py-12">
                <FiUsers className={`text-5xl mx-auto mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}/>
                <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {search ? 'Không tìm thấy bạn bè' : 'Chưa có bạn bè nào'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered(myFriends).map(f => (
                  <div
                    key={f.uid}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                  >
                    <AvatarBubble u={f}/>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => setProfileTarget(f)}
                        className="font-black text-sm truncate block text-left hover:text-sky-500 transition-colors cursor-pointer"
                      >
                        {f.nickname || f.email?.split('@')[0]}
                      </button>
                      <p className={`text-[10px] flex items-center gap-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${f.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {f.isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                      </p>
                    </div>
                    <button
                      onClick={() => { onChat(f); onClose(); }}
                      className={`p-2 rounded-full transition-colors cursor-pointer flex-shrink-0 ${isDarkMode ? 'bg-slate-700 hover:bg-sky-500 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-sky-500 text-slate-600 hover:text-white'}`}
                    >
                      <FiMessageCircle className="text-base"/>
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── SUGGESTIONS ── */}
          {tab === 'suggest' && (
            filtered(suggestions).length === 0 ? (
              <div className="text-center py-12">
                <FiUser className={`text-5xl mx-auto mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}/>
                <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {search ? 'Không tìm thấy người dùng' : 'Không có gợi ý nào'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered(suggestions).map(u => (
                  <div
                    key={u.uid}
                    className={`rounded-2xl border p-4 flex flex-col items-center gap-2 text-center ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <AvatarBubble u={u} size="lg"/>
                    <button
                      onClick={() => setProfileTarget(u)}
                      className={`text-xs font-black line-clamp-1 hover:text-sky-500 transition-colors cursor-pointer ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                    >
                      {u.nickname || u.email?.split('@')[0]}
                    </button>
                    <p className={`text-[10px] flex items-center gap-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {u.isOnline ? 'Online' : 'Offline'}
                    </p>
                    <button
                      onClick={() => onAddFriend(null, u.uid)}
                      className="w-full py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <FiUserPlus className="text-xs"/> Kết bạn
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Public profile card */}
      {profileTarget && (
        <PublicProfileCard
          target={profileTarget}
          isDarkMode={isDarkMode}
          friendsList={friendsList}
          onAddFriend={onAddFriend}
          onChat={onChat}
          onClose={() => setProfileTarget(null)}
        />
      )}
    </div>,
    document.body
  );
}
