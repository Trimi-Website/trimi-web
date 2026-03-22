import { FiX, FiCheckCircle, FiMail, FiTruck, FiMessageCircle } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';

export default function InfoModals({
  isDarkMode, t,
  showPrivacyModal, setShowPrivacyModal,
  showTermsModal, setShowTermsModal,
  showStoryModal, setShowStoryModal,
  showCareerModal, setShowCareerModal,
  showContactModal, setShowContactModal,
  showCookieConsent, setShowCookieConsent,
  previewImg, setPreviewImg,
  successOrderInfo, setSuccessOrderInfo,
  setIsHelpOpen,
}) {
  return (
    <>
      {/* ── PRIVACY POLICY ── */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowPrivacyModal(false)}></div>
          <div className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-3xl relative z-10 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar">
            <button onClick={() => setShowPrivacyModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>
            <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase">Chính sách bảo mật</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p><b>1. Thu thập thông tin:</b> Trimi thu thập thông tin cá nhân (Tên, SĐT, Địa chỉ) chỉ nhằm mục đích xử lý đơn hàng và giao nhận tại Đà Nẵng.</p>
              <p><b>2. Sử dụng Cookie:</b> Chúng tôi sử dụng Cookie và lịch sử xem hàng để AI gợi ý sản phẩm phù hợp với phong cách của bạn.</p>
              <p><b>3. Bảo mật thanh toán:</b> Hình ảnh biên lai chuyển khoản được lưu trữ an toàn để đối soát và sẽ không chia sẻ cho bên thứ ba.</p>
              <p><b>4. Quyền của người dùng:</b> Bạn có quyền yêu cầu xóa lịch sử mua hàng hoặc tài khoản bất cứ lúc nào thông qua trạm hỗ trợ.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TERMS OF SERVICE ── */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowTermsModal(false)}></div>
          <div className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-3xl relative z-10 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar">
            <button onClick={() => setShowTermsModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>
            <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase">Điều khoản dịch vụ</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p><b>1. Phạm vi giao hàng:</b> Hiện tại Trimi chỉ hỗ trợ giao hàng trong địa phận Đà Nẵng. Các đơn hàng ngoại tỉnh vui lòng liên hệ Admin.</p>
              <p><b>2. Quy định thanh toán:</b> Quý khách cần thanh toán cọc 30% hoặc 100% giá trị đơn hàng thông qua mã QR và tải ảnh bill để xác nhận đơn.</p>
              <p><b>3. Chính sách đổi trả:</b> Hỗ trợ đổi trả miễn phí trong vòng 5 ngày nếu sản phẩm có lỗi từ nhà sản xuất hoặc không đúng size.</p>
              <p><b>4. Trách nhiệm:</b> Người dùng cam kết cung cấp đúng thông tin liên lạc. Mọi hành vi spam bill giả sẽ bị khóa tài khoản vĩnh viễn.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── BRAND STORY ── */}
      {showStoryModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowStoryModal(false)}></div>
          <div className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-2xl relative z-10 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar animate-fade-in-up">
            <button onClick={() => setShowStoryModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>
            <h2 className="text-4xl font-brush text-slate-900 mb-6">Trimi Studio</h2>
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-wider">Dám Khác Biệt. Dám Là Trimi.</h3>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm font-medium">
              <p>Được thành lập vào năm 2026 tại thành phố Đà Nẵng năng động, <b>Trimi</b> ra đời từ niềm đam mê thời trang streetwear mãnh liệt.</p>
              <p>Chúng tôi không chỉ bán quần áo. Chúng tôi tin rằng thời trang là ngôn ngữ không lời mạnh mẽ nhất để thể hiện cá tính thực sự, cái tôi độc bản của mỗi người.</p>
              <p>Từng đường kim, mũi chỉ, từng bản in trên các bộ sưu tập của Trimi đều mang theo thông điệp: <i>"Hãy tự tin mặc những gì bạn yêu thích, đừng để ai định nghĩa phong cách của bạn."</i></p>
              <p className="pt-4 text-sky-600 font-bold italic">Hãy đồng hành cùng Trimi trên hành trình định hình phong cách cá nhân nhé!</p>
            </div>
          </div>
        </div>
      )}

      {/* ── CAREERS ── */}
      {showCareerModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowCareerModal(false)}></div>
          <div className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-2xl relative z-10 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar animate-fade-in-up">
            <button onClick={() => setShowCareerModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>
            <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase">Cơ Hội Nghề Nghiệp</h2>
            <p className="text-slate-500 mb-8 text-sm">Gia nhập đội ngũ năng động tại Trimi Studio Đà Nẵng.</p>
            <div className="space-y-4">
              <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 hover:border-sky-500 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-900">1. Nhân viên Sáng tạo Nội dung (Content Creator)</h4>
                  <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Đang mở</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">Yêu cầu: Có gu thẩm mỹ tốt, biết quay dựng video TikTok/Reels cơ bản. Yêu thích thời trang Streetwear.</p>
              </div>
              <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 hover:border-sky-500 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-900">2. Chuyên viên Tư vấn Khách hàng</h4>
                  <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Đang mở</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">Yêu cầu: Giao tiếp tốt, kiên nhẫn, có kinh nghiệm trực page và chốt đơn là một lợi thế.</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600 font-medium mb-3">Gửi CV và Portfolio (nếu có) của bạn về Email:</p>
              <a href="mailto:phanbasongtoan112@gmail.com" className="text-lg font-black text-sky-500 hover:underline">phanbasongtoan112@gmail.com</a>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTACT ── */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowContactModal(false)}></div>
          <div className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-md relative z-10 shadow-2xl animate-fade-in-up text-center">
            <button onClick={() => setShowContactModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>
            <div className="w-20 h-20 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMail className="text-4xl"/>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase">Liên Hệ Trimi</h2>
            <div className="space-y-4 text-slate-600 font-medium text-sm mb-8 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="flex items-center gap-3"><FiTruck className="text-sky-500 text-lg"/> Đà Nẵng, Việt Nam</p>
              <p className="flex items-center gap-3"><FiMail className="text-sky-500 text-lg"/> phanbasongtoan112@gmail.com</p>
              <p className="flex items-center gap-3"><FaFacebook className="text-sky-500 text-lg"/> fb.com/trimi.studio</p>
            </div>
            <button
              onClick={() => { setShowContactModal(false); setIsHelpOpen(true); }}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-full hover:bg-sky-500 transition-colors shadow-lg flex justify-center items-center gap-2"
            >
              <FiMessageCircle className="text-lg"/> Chat Trực Tiếp Với Admin
            </button>
          </div>
        </div>
      )}

      {/* ── BILL PREVIEW (admin full-screen image zoom) ── */}
      {previewImg && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewImg(null)}
        >
          <button className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors cursor-pointer">
            <FiX className="text-2xl"/>
          </button>
          <img
            src={previewImg}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            alt="Bill Preview"
          />
        </div>
      )}

      {/* ── ORDER SUCCESS POPUP ── */}
      {successOrderInfo && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] p-8 text-center max-w-sm w-full shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FiCheckCircle className="text-5xl" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Tuyệt vời!</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Đơn hàng <strong className="text-sky-600 font-bold">{successOrderInfo}</strong> của bạn đã được ghi nhận.<br/>
              Chúng tôi sẽ duyệt bill và chuẩn bị hàng ngay!
            </p>
            <button
              onClick={() => setSuccessOrderInfo(null)}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-full hover:bg-sky-500 transition-colors shadow-lg cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

      {/* ── COOKIE CONSENT BANNER ── */}
      {showCookieConsent && (
        <div className="fixed bottom-0 left-0 w-full bg-slate-900 text-white p-4 md:px-8 z-[99999] flex flex-col md:flex-row justify-between items-center text-sm shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-fade-in-up">
          <p className="mb-4 md:mb-0 font-medium text-slate-300 text-center md:text-left">
            Trimi sử dụng cookie để theo dõi trải nghiệm nhằm cung cấp các đề xuất AI chính xác nhất. Khi tiếp tục, bạn đồng ý với{' '}
            <span onClick={() => {}} className="text-sky-400 cursor-pointer font-bold hover:underline">Chính sách bảo mật</span> của chúng tôi.
          </p>
          <button
            onClick={() => { localStorage.setItem('trimi_cookies', 'true'); setShowCookieConsent(false); }}
            className="bg-sky-500 hover:bg-sky-600 px-8 py-2.5 rounded-full font-bold text-white shadow-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Tôi đồng ý
          </button>
        </div>
      )}
    </>
  );
}
