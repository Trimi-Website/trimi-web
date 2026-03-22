import { FiX, FiSettings, FiUser, FiSave } from 'react-icons/fi';
import { doc, setDoc } from 'firebase/firestore';

export default function SettingsDrawer({
  isSettingsDrawerOpen, setIsSettingsDrawerOpen,
  isDarkMode, isAuthenticated, user, t,
  tempSettings, setTempSettings,
  setNickname, setPhone, setAddress, setDistrict,
  handleThemeToggle, setLang, showToast,
  daNangDistricts, db,
}) {
  if (!isSettingsDrawerOpen || !isAuthenticated || !user) return null;

  const handleSave = async () => {
    if (!tempSettings.nickname?.trim()) return alert("Biệt danh không được để trống!");
    if (tempSettings.address) {
      const hasLetters = /[a-zA-ZÀ-ỹ]/.test(tempSettings.address);
      if (!hasLetters) return alert("Địa chỉ không hợp lệ! Vui lòng nhập rõ Tên Đường/Phường/Xã.");
    }

    // 1. Update local state
    setNickname(tempSettings.nickname);
    setPhone(tempSettings.phone);
    setAddress(tempSettings.address);
    setDistrict(tempSettings.district);
    handleThemeToggle(null, tempSettings.theme === 'dark');
    setLang(tempSettings.lang);

    // 2. Persist to Firestore
    try { await setDoc(doc(db, "users", user.uid), tempSettings, { merge: true }); } catch { }

    showToast('Đã lưu tất cả cài đặt!');
    setIsSettingsDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => setIsSettingsDrawerOpen(false)}
      ></div>

      {/* Drawer panel */}
      <div className={`relative w-full max-w-[400px] h-full flex flex-col shadow-2xl animate-fade-in-right backdrop-blur-xl border-l overflow-y-auto custom-scrollbar ${
        isDarkMode
          ? 'bg-[#181512]/90 border-white/10 text-white'
          : 'bg-[#f7f3ed]/95 border-black/10 text-slate-900'
      }`}>

        {/* ── HEADER ── */}
        <div className={`flex justify-between items-center p-5 border-b ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white'}`}>
          <h2 className="text-xl font-black flex items-center gap-2">
            <FiSettings className="text-sky-500"/> Cài đặt hợp nhất
          </h2>
          <button
            onClick={() => setIsSettingsDrawerOpen(false)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-black/5 hover:bg-black/10 text-slate-500'}`}
          >
            <FiX className="text-xl"/>
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex-grow p-6 flex flex-col gap-8">

          {/* BLOCK 1: Personal info */}
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FiUser/> {t('account')}
            </p>
            <div className="space-y-4">

              {/* Display name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Biệt danh hiển thị
                </label>
                <input
                  type="text"
                  value={tempSettings.nickname || ''}
                  onChange={e => setTempSettings({ ...tempSettings, nickname: e.target.value })}
                  className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 text-sm font-bold ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-black/10 shadow-inner'}`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  {t('f_contact')}
                </label>
                <input
                  type="tel"
                  value={tempSettings.phone || ''}
                  onChange={e => setTempSettings({ ...tempSettings, phone: e.target.value })}
                  placeholder="09xxxx..."
                  className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 text-sm font-medium ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-black/10 shadow-inner'}`}
                />
              </div>

              {/* Address + district side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Số nhà, Tên đường
                  </label>
                  <input
                    type="text"
                    value={tempSettings.address || ''}
                    onChange={e => setTempSettings({ ...tempSettings, address: e.target.value })}
                    placeholder="123 ABC..."
                    className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 text-sm font-medium ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-black/10 shadow-inner'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Khu vực (Đà Nẵng)
                  </label>
                  <select
                    value={tempSettings.district || 'Hải Châu'}
                    onChange={e => setTempSettings({ ...tempSettings, district: e.target.value })}
                    className={`w-full border rounded-full px-4 py-3 outline-none focus:border-sky-500 text-sm font-medium cursor-pointer ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-black/10 shadow-inner'}`}
                  >
                    {daNangDistricts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── FOOTER: SAVE BUTTON ── */}
        <div className={`p-5 border-t mt-auto sticky bottom-0 ${isDarkMode ? 'border-white/10 bg-[#181512]/90' : 'border-black/10 bg-[#f7f3ed]/95'}`}>
          <button
            onClick={handleSave}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white py-4 rounded-full font-black text-sm tracking-widest uppercase shadow-xl shadow-sky-500/30 transition-all flex justify-center items-center gap-2 cursor-pointer"
          >
            <FiSave className="text-xl"/> Lưu Thay Đổi
          </button>
        </div>

      </div>
    </div>
  );
}
