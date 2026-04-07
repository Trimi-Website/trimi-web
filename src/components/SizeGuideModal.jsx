import { FiX, FiInfo, FiMaximize } from 'react-icons/fi';

export default function SizeGuideModal({ isOpen, onClose, isDarkMode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className={`relative w-full max-w-3xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-900'}`} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200/20">
          <h3 className="text-xl font-black flex items-center gap-2">
            <FiMaximize className="text-sky-500"/> Hướng Dẫn Chọn Size Chuẩn
          </h3>
          <button onClick={onClose} className={`p-2 rounded-full cursor-pointer transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
            <FiX className="text-xl"/>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
          <div className={`p-4 rounded-2xl text-sm leading-relaxed border font-medium ${isDarkMode ? 'bg-sky-500/10 border-sky-500/20 text-sky-100' : 'bg-sky-50 border-sky-200 text-sky-800'}`}>
            💡 Với số lượng nhập giới hạn "5 bộ/mẫu", việc chọn size là vô cùng quan trọng để tránh rủi ro tồn kho. Dưới đây là gợi ý chi tiết từ Trimi dựa trên dữ liệu vóc dáng thị trường Việt Nam.
          </div>

          {/* Áo thun & Sơ mi nam */}
          <div>
            <h4 className="font-black text-lg mb-2 flex items-center gap-2"><span className="text-sky-500">1.</span> Áo Thun (Nam & Nữ) & Sơ Mi Nam</h4>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Đây là những sản phẩm có form dáng cơ bản, dễ mặc. Dưới đây là đề xuất phân bổ cho <b>5 sản phẩm</b>:
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { s: 'Size M', q: '2 cái', desc: 'Nặng: 56-62kg', h: 'Cao: 1m66-1m70' },
                { s: 'Size L', q: '2 cái', desc: 'Nặng: 63-70kg', h: 'Cao: 1m71-1m75' },
                { s: 'Size XL', q: '1 cái', desc: 'Nặng: 71-78kg', h: 'Cao: 1m76-1m80' },
              ].map((item, i) => (
                <div key={i} className={`flex flex-col p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-sky-500 bg-sky-500/10 px-3 py-1 rounded-lg">{item.s}</span>
                    <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-1 rounded-md">{item.q}</span>
                  </div>
                  <span className="text-sm font-medium">{item.desc}</span>
                  <span className="text-sm font-medium">{item.h}</span>
                </div>
              ))}
            </div>
            <p className={`text-sm mt-3 p-3 rounded-xl ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              <b>Giải thích:</b> Nhóm size M và L là phổ biến nhất cho nam giới Việt Nam. Việc nhập 1 size XL giúp bạn cover những khách hàng có thân hình to hơn mà không lo tồn kho quá nhiều.
            </p>
          </div>

          {/* Sơ mi nữ */}
          <div>
            <h4 className="font-black text-lg mb-2 flex items-center gap-2"><span className="text-pink-500">2.</span> Áo Sơ Mi Nữ Chiết Eo</h4>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Form ôm sát cơ thể, cần chọn size chuẩn xác. Đề xuất phân bổ:
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { s: 'Size S', q: '1 cái', desc: 'Ngực: ~86-90cm', h: 'Eo: ~66-70cm (Mảnh)' },
                { s: 'Size M', q: '2 cái', desc: 'Ngực: ~90-94cm', h: 'Eo: ~70-74cm (Bán chạy)' },
                { s: 'Size L', q: '2 cái', desc: 'Ngực: ~94-100cm', h: 'Eo: ~74-80cm' },
              ].map((item, i) => (
                <div key={i} className={`flex flex-col p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-pink-500 bg-pink-500/10 px-3 py-1 rounded-lg">{item.s}</span>
                    <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-1 rounded-md">{item.q}</span>
                  </div>
                  <span className="text-sm font-medium">{item.desc}</span>
                  <span className="text-sm font-medium">{item.h}</span>
                </div>
              ))}
            </div>
            <p className={`text-sm mt-3 p-3 rounded-xl ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              <b>Giải thích:</b> Khách hàng sẽ chọn size chuẩn với cơ thể họ, ít khi chọn rộng. Tập trung vào M và L là tối ưu nhất.
            </p>
          </div>

          {/* Lưu ý */}
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <h4 className="font-black mb-3 flex items-center gap-2"><FiInfo className="text-sky-500"/> Mẹo giảm thiểu rủi ro</h4>
            <ul className="text-sm space-y-2 list-disc list-inside pl-2 marker:text-sky-500">
              <li><b>Xây dựng bảng size chi tiết:</b> Đừng chỉ ghi M, L. Hãy ghi chi tiết: "Size M: Dài áo 70cm - Ngực 102cm - Vai 44cm" để khách tự tin chọn.</li>
              <li><b>Form Oversize:</b> Nếu lo lắng, hãy ưu tiên form rộng. Người mặc size M vẫn có thể mặc size XL theo phong cách Hàn Quốc.</li>
              <li><b>Dùng ảnh mô tả:</b> Chụp ảnh người mẫu thật (ví dụ: cao 1m70, nặng 60kg mặc size M). Ghi chú: "Áo co giãn tốt, vừa cho người từ 55-70kg".</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}