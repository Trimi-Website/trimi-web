import { FiMoon, FiSun, FiCheckCircle } from 'react-icons/fi';
import { doc, setDoc } from 'firebase/firestore';

export default function SurveyModal({
  showSurveyModal, isAuthenticated,
  isDarkMode, surveyStep, setSurveyStep,
  surveyData, setSurveyData,
  handleThemeToggle, setNickname, setUserRole,
  setShowSurveyModal, showToast,
  user, db,
}) {
  if (!showSurveyModal || !isAuthenticated) return null;

  // Called on the last step — saves everything to Firestore then closes
  const handleFinish = (interests) => {
    setSurveyStep(5);
    setTimeout(async () => {
      setUserRole(surveyData.occupation || 'Khách hàng');
      setNickname(surveyData.name);
      localStorage.setItem(`trimi_name_${user?.uid}`, surveyData.name);
      localStorage.setItem(`trimi_survey_done_${user?.uid}`, 'true');
      setShowSurveyModal(false);
      if (user) {
        try {
          await setDoc(doc(db, "users", user.uid), {
            nickname: surveyData.name,
            role: surveyData.occupation || 'Khách hàng',
            discoverySource: surveyData.source,
            interests,
            isSurveyCompleted: true,
          }, { merge: true });
        } catch { }
      }
      showToast('Hoàn tất thiết lập!');
    }, 2500);
  };

  return (
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-50'} animate-fade-in`}>
      <div className="w-full max-w-3xl relative z-10 flex flex-col text-left">

        {/* Progress bar (steps 1-4) */}
        {surveyStep < 5 && (
          <div className={`w-64 h-1 rounded-full mx-auto mb-16 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div
              className="h-full bg-sky-500 transition-all duration-500"
              style={{ width: `${(surveyStep / 4) * 100}%` }}
            ></div>
          </div>
        )}

        {/* ── STEP 1: Name + Theme ── */}
        {surveyStep === 1 && (
          <div className="mx-auto w-full max-w-md animate-fade-in-up">
            <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Chào mừng đến với Trimi!
            </h2>
            <p className={`mb-8 text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Hãy cá nhân hóa trải nghiệm của bạn
            </p>

            <input
              type="text"
              value={surveyData.name}
              onChange={e => setSurveyData({ ...surveyData, name: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter' && surveyData.name.trim()) setSurveyStep(2); }}
              placeholder="Nhập tên và nhấn Enter..."
              className={`w-full border rounded-full px-5 py-3.5 outline-none focus:border-sky-500 transition-colors mb-8 ${isDarkMode ? 'bg-transparent border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}
            />

            <p className={`text-sm mb-3 font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Chọn giao diện yêu thích
            </p>
            <div className="flex gap-3 mb-10">
              {['Dark', 'Light'].map(mode => (
                <button
                  key={mode}
                  onClick={(e) => {
                    setSurveyData({ ...surveyData, theme: mode });
                    handleThemeToggle(e, mode === 'Dark');
                  }}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    surveyData.theme === mode
                      ? isDarkMode ? 'bg-white text-black border-white font-bold shadow-lg' : 'bg-slate-900 text-white border-slate-900 font-bold shadow-lg'
                      : isDarkMode ? 'border-slate-700 text-slate-400 hover:border-sky-500 hover:text-sky-400' : 'border-slate-200 text-slate-500 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50'
                  }`}
                >
                  {mode === 'Dark' ? <FiMoon/> : <FiSun/>} {mode}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSurveyStep(2)}
              className={`font-bold px-8 py-3 rounded-full transition-all cursor-pointer transform hover:scale-105 ${isDarkMode ? 'bg-sky-500 text-white hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.4)]' : 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg'}`}
            >
              Tiếp tục
            </button>
          </div>
        )}

        {/* ── STEP 2: Discovery source ── */}
        {surveyStep === 2 && (
          <div className="mx-auto w-full text-center animate-fade-in-up">
            <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Bạn biết đến chúng tôi qua đâu?
            </h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto mb-16">
              {['Facebook', 'Instagram', 'TikTok', 'Google', 'Bạn bè giới thiệu', 'YouTube', 'Khác'].map(src => (
                <button
                  key={src}
                  onClick={() => { setSurveyData({ ...surveyData, source: src }); setSurveyStep(3); }}
                  className={`px-6 py-3 rounded-full border transition-all cursor-pointer flex items-center gap-2 transform hover:-translate-y-1 hover:shadow-lg ${isDarkMode ? 'border-slate-700 text-slate-300 hover:border-sky-500 hover:bg-sky-500/10 hover:text-sky-400' : 'border-slate-200 text-slate-600 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 font-medium'}`}
                >
                  {src}
                </button>
              ))}
            </div>
            <div className="flex justify-between w-full max-w-xl mx-auto px-4">
              <button onClick={() => setSurveyStep(1)} className={`cursor-pointer font-bold transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Quay lại</button>
              <button onClick={() => setSurveyStep(3)} className={`cursor-pointer font-bold transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Bỏ qua</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Occupation ── */}
        {surveyStep === 3 && (
          <div className="mx-auto w-full text-center animate-fade-in-up">
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Nghề nghiệp của bạn là gì?
            </h2>
            <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Chọn công việc mô tả đúng nhất về bạn.
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto mb-16">
              {['Sinh viên', 'Nhân viên văn phòng', 'Designer', 'Lập trình viên / IT', 'Kinh doanh tự do', 'Khác'].map(occ => (
                <button
                  key={occ}
                  onClick={() => { setSurveyData({ ...surveyData, occupation: occ }); setSurveyStep(4); }}
                  className={`px-6 py-3 rounded-full border transition-all cursor-pointer flex items-center gap-2 transform hover:-translate-y-1 hover:shadow-lg ${isDarkMode ? 'border-slate-700 text-slate-300 hover:border-sky-500 hover:bg-sky-500/10 hover:text-sky-400' : 'border-slate-200 text-slate-600 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 font-medium'}`}
                >
                  {occ}
                </button>
              ))}
            </div>
            <div className="flex justify-between w-full max-w-2xl mx-auto px-4">
              <button onClick={() => setSurveyStep(2)} className={`cursor-pointer font-bold transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Quay lại</button>
              <button onClick={() => setSurveyStep(4)} className={`cursor-pointer font-bold transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Bỏ qua</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Shopping interests ── */}
        {surveyStep === 4 && (
          <div className="mx-auto w-full text-center animate-fade-in-up">
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Sở thích mua sắm của bạn?
            </h2>
            <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Chọn phong cách bạn thường hay mua nhất.
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto mb-16">
              {['Áo thun Basic', 'Streetwear', 'Sơ mi công sở', 'Quần Jeans / Kaki', 'Phụ kiện (Nón, Balo)', 'Tất cả'].map(int => (
                <button
                  key={int}
                  onClick={() => handleFinish(int)}
                  className={`px-6 py-3 rounded-full border transition-all cursor-pointer flex items-center gap-2 transform hover:-translate-y-1 hover:shadow-lg ${isDarkMode ? 'border-slate-700 text-slate-300 hover:border-sky-500 hover:bg-sky-500/10 hover:text-sky-400' : 'border-slate-200 text-slate-600 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 font-medium'}`}
                >
                  {int}
                </button>
              ))}
            </div>
            <div className="flex justify-between w-full max-w-2xl mx-auto px-4">
              <button onClick={() => setSurveyStep(3)} className={`cursor-pointer font-bold transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Quay lại</button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Loading / personalising ── */}
        {surveyStep === 5 && (
          <div className="mx-auto w-full text-center flex flex-col items-center justify-center animate-fade-in py-10">
            <div className="relative w-24 h-24 mb-8">
              <div className={`absolute inset-0 border-4 rounded-full ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}></div>
              <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiCheckCircle className="text-sky-500 text-3xl animate-pulse"/>
              </div>
            </div>
            <h2 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Đang cá nhân hóa...
            </h2>
            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
              Phân tích sở thích và chuẩn bị không gian của bạn
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
