import { FiUsers, FiUserPlus, FiUserCheck, FiSearch } from 'react-icons/fi';

export default function FriendsView({
  isDarkMode, user, usersList, friendsList, pendingRequests,
  onAcceptFriend, onDeclineFriend, onAddFriend
}) {
  const pending = pendingRequests || [];
  const safeUsersList = usersList || [];
  const safeFriendsList = friendsList || [];
  
  const myFriends = safeUsersList.filter(u => safeFriendsList.includes(u.uid));

  // Thuật toán Gợi ý kết bạn
  const suggestions = safeUsersList
    .filter(u => u.uid !== user?.uid && !safeFriendsList.includes(u.uid) && !pending.some(r => r.fromUid === u.uid))
    .slice(0, 10);

  return (
    <div className={`max-w-5xl mx-auto w-full px-4 pt-0 pb-[100px] md:pb-8 animate-fade-in ${isDarkMode ? 'dark text-white' : 'text-slate-800'}`}>
      
      {/* ── 1. PHẦN ĐẦU TRANG ─── */}
      {/* Đã xóa border-b, pb-5 và giảm mb-8 thành mb-4 để kéo ô tìm kiếm lên gần hơn */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <FiUsers className="text-sky-500"/> Bạn bè
          </h1>
          <p className="text-sm text-slate-500 mt-1 line-clamp-1">Kết nối và khám phá Trimi!</p>
        </div>
      </div>

      {/* ── 2. THANH TÌM KIẾM ─── */}
      <div className="relative mb-8">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input type="text" placeholder="Tìm kiếm bạn bè theo tên..." className={`w-full p-4 pl-12 rounded-2xl border text-sm shadow-sm outline-none focus:border-sky-500 transition-colors ${isDarkMode ? 'bg-[#111111] border-white/10' : 'bg-white border-slate-100'}`} />
      </div>

      {/* ── LỜI MỜI KẾT BẠN ── */}
      {pending.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest mb-4 text-amber-500">Lời mời kết bạn ({pending.length})</p>
          <div className="flex flex-col gap-3">
            {pending.map(req => {
              const sender = safeUsersList.find(u => u.uid === req.fromUid);
              return (
                <div key={req.fromUid} className={`flex items-center justify-between p-3 rounded-2xl border ${isDarkMode ? 'bg-amber-500/10 border-amber-700/50' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-3">
                    <div onClick={() => document.dispatchEvent(new CustomEvent('trimi:open-profile', { detail: sender }))} className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border-2 cursor-pointer border-amber-400">
                      {sender?.avatar ? <img src={sender.avatar} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center text-sm font-black bg-slate-200 text-slate-600">{(sender?.nickname || '?').charAt(0).toUpperCase()}</div>}
                    </div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{sender?.nickname || 'Người dùng'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onAcceptFriend(req.fromUid)} className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm hover:bg-emerald-600"><FiUserCheck/></button>
                    <button onClick={() => onDeclineFriend(req.fromUid)} className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. DANH SÁCH GỢI Ý ─── */}
      {suggestions.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest mb-4 text-sky-500">Gợi ý làm quen</p>
          <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
            {suggestions.map(s => (
              <div key={s.uid} className={`flex flex-col items-center min-w-[100px] p-3 rounded-3xl border flex-shrink-0 ${isDarkMode ? 'bg-[#181512] border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div onClick={() => document.dispatchEvent(new CustomEvent('trimi:open-profile', { detail: s }))} className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden mb-3 cursor-pointer border border-slate-300 hover:scale-105 transition-transform">
                  {s.avatar ? <img src={s.avatar} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center font-black text-slate-500 text-lg">{(s.nickname || 'U').charAt(0).toUpperCase()}</div>}
                </div>
                <p className={`text-xs font-bold truncate w-full text-center mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{s.nickname}</p>
                <button onClick={(e) => onAddFriend && onAddFriend(e, s.uid)} className="w-full py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-black flex items-center justify-center gap-1">
                  <FiUserPlus/> Thêm
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. DANH SÁCH BẠN BÈ ─── */}
      <div>
         <p className="text-xs font-black uppercase tracking-widest mb-4 text-slate-500">Danh sách bạn bè</p>
         {myFriends.length === 0 ? (
            <div className={`text-center py-10 rounded-3xl border border-dashed ${isDarkMode ? 'border-white/20' : 'border-slate-300'}`}>
              <p className="text-sm font-bold text-slate-400">Chưa có bạn bè nào</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myFriends.map(f => (
                <div key={f.uid} onClick={() => document.dispatchEvent(new CustomEvent('trimi:open-profile', { detail: f }))} className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer border ${isDarkMode ? 'bg-[#181512] border-white/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                      {f.avatar ? <img src={f.avatar} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center text-sm font-black text-slate-600">{(f.nickname || '?').charAt(0).toUpperCase()}</div>}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${isDarkMode ? 'border-[#181512]' : 'border-white'} ${f.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold truncate block">{f.nickname}</span>
                    <span className={`text-[10px] font-medium mt-0.5 block ${f.isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {f.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
         )}
      </div>
    </div>
  );
}