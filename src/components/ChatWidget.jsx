import { useState } from 'react';
import { FiX, FiMessageCircle, FiShield, FiSearch, FiUsers, FiUserPlus, FiSend, FiCornerUpLeft, FiTruck, FiUserCheck } from 'react-icons/fi';

// ── Public Profile Modal ──────────────────────────────────────────────────────
function PublicProfileModal({ targetUser, isDarkMode, friendsList, onAddFriend, onChat, onClose }) {
  if (!targetUser) return null;
  const isFriend = friendsList.includes(targetUser.uid);

  return (
    <div className="fixed inset-0 z-[200000] flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      <div
        className={`relative w-full md:max-w-sm rounded-t-[32px] md:rounded-[32px] shadow-2xl p-7 animate-fade-in-up z-10 ${
          isDarkMode ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer">
          <FiX/>
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-xl">
              {targetUser.avatar
                ? <img src={targetUser.avatar} className="w-full h-full object-cover" alt=""/>
                : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-500">
                    {(targetUser.nickname || targetUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
              }
            </div>
            {/* Online dot */}
            <span className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-white ${targetUser.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
          </div>

          {/* Name + badges */}
          <div className="text-center">
            <h3 className="text-xl font-black flex items-center gap-2 justify-center">
              {targetUser.nickname || targetUser.email?.split('@')[0]}
              {/* Shipper badge */}
              {targetUser.role === 'shipper' && (
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
                  <FiTruck className="text-xs"/> Shipper
                </span>
              )}
            </h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {targetUser.isOnline ? '🟢 Đang trực tuyến' : '⚫ Ngoại tuyến'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!isFriend ? (
            <button
              onClick={() => { onAddFriend(targetUser.uid); onClose(); }}
              className="flex-1 py-3 rounded-full font-bold text-sm bg-sky-500 hover:bg-sky-600 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <FiUserPlus/> Kết bạn
            </button>
          ) : (
            <div className="flex-1 py-3 rounded-full font-bold text-sm bg-slate-100 text-slate-500 flex items-center justify-center gap-2">
              <FiUserCheck className="text-emerald-500"/> Bạn bè
            </div>
          )}
          <button
            onClick={() => { onChat(targetUser); onClose(); }}
            className="flex-1 py-3 rounded-full font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <FiMessageCircle/> Nhắn tin
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ChatWidget({
  isAdmin, isHelpOpen, setIsHelpOpen,
  isChatBoxOpen, setIsChatBoxOpen,
  activeChatTarget, setActiveChatTarget,
  adminChatUser, setAdminChatUser,
  chatInput, setChatInput,
  chatMessages, p2pMessages,
  hasUnreadUser, totalAdminUnread,
  usersList, friendsList,
  chatContainerRef, adminChatContainerRef,
  handleUserSendMessage,
  openAdminChat, openP2PChat, openAdminChatWithUser, handleAddFriend,
  requireLogin, t, isDarkMode, user, avatarUrl, nickname,
}) {
  const [profileTarget, setProfileTarget] = useState(null);
  const anyPanelOpen = isHelpOpen || isChatBoxOpen;

  // Open public profile instead of directly starting P2P chat
  const handleUserClick = (u) => {
    requireLogin(() => setProfileTarget(u));
  };

  // Show ALL users in community list — everyone can be discovered and added.
  // Friend-only restriction was too restrictive: new users saw nobody and
  // could not initiate any friend requests. Privacy is still maintained by the
  // fact that chat is only opened after the PublicProfileModal interaction.
  const visibleCommunity = usersList;

  return (
    <div className={`fixed z-[9000] flex flex-col ${
      anyPanelOpen
        ? 'inset-0 md:inset-auto md:bottom-8 md:right-8 md:items-end'
        : 'bottom-[85px] right-4 md:bottom-8 md:right-8 items-end'
    }`}>

      {/* Public profile modal */}
      {profileTarget && (
        <PublicProfileModal
          targetUser={profileTarget}
          isDarkMode={isDarkMode}
          friendsList={friendsList}
          onAddFriend={(uid) => {
            const fakeEvent = { stopPropagation: () => {} };
            handleAddFriend(fakeEvent, uid);
          }}
          onChat={(u) => openP2PChat(u)}
          onClose={() => setProfileTarget(null)}
        />
      )}

      {/* Mobile backdrop */}
      {anyPanelOpen && (
        <div
          className="absolute inset-0 bg-black/50 md:hidden"
          onClick={() => { setIsHelpOpen(false); setIsChatBoxOpen(false); setActiveChatTarget(null); setAdminChatUser(null); }}
        ></div>
      )}

      {/* ── USER: HELP HUB ── */}
      {!isAdmin && isHelpOpen && !isChatBoxOpen && (
        <div className={`relative bg-white flex flex-col overflow-hidden border border-slate-200 animate-fade-in-up ${'w-full h-full md:w-[340px] md:h-auto md:max-h-[70vh] md:rounded-2xl md:shadow-[0_10px_40px_rgba(0,0,0,0.15)] md:mb-4 md:origin-bottom-right'}`}>
          <div className="bg-slate-900 text-white p-5 pr-4 flex justify-between items-start flex-shrink-0">
            <div>
              <h2 className="font-bold text-[17px] mb-1">{t('chatHelp')}</h2>
              <p className="text-sm text-slate-300">{t('chatHow')}</p>
            </div>
            <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1"><FiX className="text-xl"/></button>
          </div>

          <div className="p-4 border-b border-slate-100 flex-shrink-0">
            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-3">HỖ TRỢ TRỰC TUYẾN</p>
            <div onClick={() => requireLogin(openAdminChat)} className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm group relative">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <FiShield className="text-xl"/>
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">{t('chatWithUs')}</span>
                <span className="text-xs text-slate-500">{t('replyFast')}</span>
              </div>
              {hasUnreadUser && <div className="absolute top-1/2 -translate-y-1/2 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
            </div>
          </div>

          {/* Community list — non-admin users only see their accepted friends */}
          <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FiUsers/> {t('community')}
              </p>
              <FiSearch className="text-slate-400"/>
            </div>
            <div className="space-y-2">
              {visibleCommunity.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  {isAdmin ? 'Chưa có ai tham gia.' : 'Chưa có bạn bè nào. Hãy kết bạn trước!'}
                </p>
              ) : visibleCommunity.map(u => (
                <div
                  key={u.uid}
                  onClick={() => handleUserClick(u)}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 font-bold text-xs text-slate-600 overflow-hidden">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt=""/> : (u.nickname?.charAt(0).toUpperCase() || 'U')}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block leading-none mb-1 max-w-[100px] truncate">
                        {u.nickname || u.email?.split('@')[0]}
                      </span>
                      {u.role === 'shipper' ? (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 w-fit">
                          <FiTruck className="text-[8px]"/> Shipper
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 leading-none">{u.isOnline ? t('online') : t('offline')}</span>
                      )}
                    </div>
                  </div>
                  {!friendsList.includes(u.uid) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddFriend(e, u.uid); }}
                      className="text-sky-500 bg-sky-50 hover:bg-sky-500 hover:text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title={t('add_friend')}
                    >
                      <FiUserPlus className="text-sm"/>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN: INBOX ── */}
      {isAdmin && isHelpOpen && !activeChatTarget && (
        <div className={`relative bg-white overflow-hidden border border-slate-200 animate-fade-in-up flex flex-col ${'w-full h-full md:w-[340px] md:h-[480px] md:rounded-2xl md:shadow-[0_10px_40px_rgba(0,0,0,0.15)] md:mb-4 md:origin-bottom-right'}`}>
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center flex-shrink-0 md:rounded-t-2xl shadow-md z-10">
            <h2 className="font-bold">{t('adminInbox')}</h2>
            <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-white p-1"><FiX className="text-xl"/></button>
          </div>
          <div className="flex-grow p-2 overflow-y-auto custom-scrollbar">
            {usersList.length === 0 ? (
              <p className="text-center text-slate-400 text-sm mt-4">{t('adminWait')}</p>
            ) : (
              usersList.map(u => (
                <div key={u.uid} onClick={() => openAdminChatWithUser(u)} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer rounded-xl border-b border-slate-100 last:border-0 relative">
                  <div className="relative">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-slate-600 overflow-hidden">
                      {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt=""/> : (u.nickname?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  </div>
                  <div className="flex-col flex flex-grow min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-800 truncate">{u.nickname || (u.email ? u.email.split('@')[0] : 'Khách')}</span>
                      {u.role === 'shipper' && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-0.5"><FiTruck className="text-[8px]"/>Shipper</span>}
                    </div>
                    <span className="text-xs text-slate-500">{u.isOnline ? t('online') : t('offline')}</span>
                  </div>
                  {u.hasUnreadAdmin && <div className="w-3 h-3 bg-red-500 rounded-full mr-2 shadow-sm animate-pulse flex-shrink-0"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── CHAT BOX ── */}
      {isChatBoxOpen && activeChatTarget && (
        <div className={`relative bg-white overflow-hidden border border-slate-200 animate-fade-in-up flex flex-col ${'w-full h-full md:w-[340px] md:h-[480px] md:rounded-2xl md:shadow-[0_10px_40px_rgba(0,0,0,0.15)] md:mb-4 md:origin-bottom-right'}`}>
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center flex-shrink-0 md:rounded-t-2xl shadow-md z-10">
            <button onClick={() => { setIsChatBoxOpen(false); setIsHelpOpen(true); setActiveChatTarget(null); setAdminChatUser(null); }} className="text-slate-300 hover:text-white flex items-center gap-2 font-bold text-sm">
              <FiCornerUpLeft/> Quay lại
            </button>
            <div className="flex items-center gap-2">
              {activeChatTarget !== 'admin' && <div className={`w-2 h-2 rounded-full ${activeChatTarget.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>}
              <span className="text-sm font-bold truncate max-w-[120px]">
                {activeChatTarget === 'admin' ? t('chatWithUs') : activeChatTarget.nickname}
              </span>
              {activeChatTarget !== 'admin' && activeChatTarget.role === 'shipper' && (
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <FiTruck className="text-[8px]"/>Shipper
                </span>
              )}
            </div>
          </div>
          <div ref={chatContainerRef} className="flex-grow bg-slate-50 p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
            <div className="flex justify-center mb-2">
              <span className="text-xs text-slate-400 font-medium bg-white px-3 py-1 rounded-full border border-slate-100">Hôm nay</span>
            </div>
            {(isAdmin && activeChatTarget
              ? (adminChatUser?.messages || [])
              : activeChatTarget === 'admin' ? chatMessages : p2pMessages
            ).map((msg, idx) => {
              const isMe = msg.sender === user?.uid || (isAdmin && msg.sender === 'bot');
              return (
                <div key={idx} className={`flex gap-2 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-auto overflow-hidden shadow-sm">
                      {activeChatTarget === 'admin' || isAdmin
                        ? <FiShield className="text-sky-500"/>
                        : activeChatTarget.avatar ? <img src={activeChatTarget.avatar} className="w-full h-full object-cover" alt=""/> : activeChatTarget.nickname?.charAt(0).toUpperCase()
                      }
                    </div>
                  )}
                  <div className={`p-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100'}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 flex-shrink-0">
            <input
              type="text" value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleUserSendMessage()}
              placeholder={t('chatInput')}
              className="flex-grow bg-slate-100 text-slate-800 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-300"
            />
            <button onClick={handleUserSendMessage} className={`p-2.5 rounded-full flex items-center justify-center transition-colors ${chatInput.trim() ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
              <FiSend/>
            </button>
          </div>
        </div>
      )}

      {/* ── FLOATING BUBBLE — desktop only ── */}
      {!isChatBoxOpen && !isHelpOpen && (
        <button
          aria-label="Mở khung chat"
          onClick={() => setIsHelpOpen(true)}
          className="hidden md:flex relative w-14 h-14 bg-slate-900/50 backdrop-blur-md border border-white/10 text-white rounded-full items-center justify-center shadow-lg hover:bg-sky-500 hover:scale-105 transition-all"
        >
          <FiMessageCircle className="text-2xl"/>
          {!isAdmin && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white/50 rounded-full shadow-sm"></span>}
          {!isAdmin && hasUnreadUser && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white/50 animate-bounce">1</span>}
          {isAdmin && totalAdminUnread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white/50 animate-bounce">{totalAdminUnread}</span>}
        </button>
      )}
    </div>
  );
}
