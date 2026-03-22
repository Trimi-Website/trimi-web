import { FiX } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

export default function LoginModal({
  showLoginModal,       // ← was MISSING — modal was always rendering
  isAuthenticated,      // ← was MISSING — modal was always rendering
  setShowLoginModal,
  authMode,
  setAuthMode,
  email,
  setEmail,
  password,
  setPassword,
  handleEmailAuth,
  handleGoogleLogin,
  handleFacebookLogin,
  t,
}) {
  // ← THIS GUARD WAS THE ROOT CAUSE. Without it the modal rendered
  //   unconditionally with fixed inset-0 z-[99999], covering Profile,
  //   ProductDetail, Shop — every single page behind it.
  if (!showLoginModal || isAuthenticated) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={() => setShowLoginModal(false)}
      ></div>
      <div className="bg-white rounded-[40px] w-full max-w-5xl relative z-10 shadow-2xl flex overflow-hidden min-h-[550px]">

        {/* ── LEFT: BRAND PANEL ── */}
        <div className="hidden md:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-6 leading-tight">
              Gia nhập thế giới<br/>Thời trang Trimi.
            </h2>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Đăng nhập để thêm sản phẩm vào giỏ hàng.
            </p>
          </div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
        </div>

        {/* ── RIGHT: FORM ── */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col relative bg-white">
          <button
            onClick={() => setShowLoginModal(false)}
            className="absolute top-6 right-6 p-2 rounded-full transition-colors text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          >
            <FiX className="text-2xl"/>
          </button>

          <h3 className="text-3xl font-black text-slate-900 mb-8">
            {authMode === 'login' ? t('login') : 'Tạo tài khoản'}
          </h3>

          {/* Social logins */}
          <div className="flex flex-col gap-4 mb-8">
            <button
              onClick={(e) => handleGoogleLogin(e)}
              type="button"
              className="w-full bg-[#101828] text-white py-4 font-bold rounded-full flex items-center justify-center gap-3 cursor-pointer hover:bg-black transition-colors"
            >
              <FcGoogle className="text-xl bg-white rounded-full p-0.5" /> Google
            </button>
            <button
              onClick={(e) => handleFacebookLogin(e)}
              type="button"
              className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white py-4 font-bold rounded-full flex items-center justify-center gap-3 cursor-pointer transition-colors shadow-md"
            >
              <FaFacebook className="text-xl"/> Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="mx-4 text-slate-400 text-xs font-bold uppercase">Hoặc</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Email + Password */}
          <div className="flex flex-col gap-4 mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth(e)}
              placeholder="Email"
              className="bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:border-sky-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth(e)}
              placeholder="Mật khẩu"
              className="bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:border-sky-500"
            />
            <button
              onClick={(e) => handleEmailAuth(e)}
              type="button"
              className="bg-sky-500 text-white py-4 font-black rounded-full uppercase shadow-lg cursor-pointer hover:bg-sky-600 transition-colors"
            >
              {authMode === 'login' ? t('login') : 'Đăng Ký'}
            </button>
          </div>

          {/* Toggle login / register */}
          <div className="text-center text-sm font-medium text-slate-600 mb-8">
            {authMode === 'login' ? (
              <>Chưa có tài khoản?{' '}
                <button onClick={() => setAuthMode('register')} className="text-sky-600 font-bold underline cursor-pointer">Tạo ngay</button>
              </>
            ) : (
              <>Đã có tài khoản?{' '}
                <button onClick={() => setAuthMode('login')} className="text-sky-600 font-bold underline cursor-pointer">Đăng nhập</button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
