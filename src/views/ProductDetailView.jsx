import { useState } from 'react';
import { FiStar, FiTruck, FiShield, FiShoppingCart, FiCheckCircle, FiEdit3 } from 'react-icons/fi';

export default function ProductDetailView({
  isDarkMode, t, t_prod, isAdmin,
  selectedProduct, setSelectedProduct,
  handleAddToCart, setIsCartOpen,
  setEditFormData, setShowEditModal,
}) {
  // Internal state — only needed inside this view
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  if (!selectedProduct) return null;

  const mainImageSrc =
    selectedProduct.images && selectedProduct.images.length > 0
      ? selectedProduct.images[activeImgIdx]
      : selectedProduct.imageUrl;

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-2 md:py-4 animate-fade-in flex items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="bg-white rounded-3xl md:rounded-[40px] border border-slate-100 p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6 lg:gap-10 shadow-sm w-full">

        {/* ── IMAGE COLUMN ── */}
        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col gap-3 flex-shrink-0">

          {/* Main image with zoom-on-hover */}
          <div
            className="w-full h-[300px] md:h-[350px] lg:h-[450px] bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[32px] flex items-center justify-center relative overflow-hidden cursor-crosshair group shadow-inner"
            onMouseMove={(e) => {
              const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - left) / width) * 100;
              const y = ((e.clientY - top) / height) * 100;
              e.currentTarget.querySelector('img').style.transformOrigin = `${x}% ${y}%`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.querySelector('img').style.transformOrigin = 'center center';
            }}
          >
            <img
              id="detail-main-image"
              src={mainImageSrc}
              className="w-full h-full object-cover transition-transform duration-[0.4s] ease-out group-hover:scale-[2.5]"
              alt={selectedProduct.name}
            />
          </div>

          {/* Thumbnail strip */}
          {selectedProduct.images && selectedProduct.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto custom-scrollbar py-1">
              {selectedProduct.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${
                    activeImgIdx === idx
                      ? 'border-sky-500 shadow-md'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── INFO COLUMN ── */}
        <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col justify-center relative">

          {/* Admin edit button */}
          {isAdmin && (
            <button
              onClick={() => {
                setEditFormData({
                  ...selectedProduct,
                  images: selectedProduct.images || [selectedProduct.imageUrl],
                });
                setShowEditModal(true);
              }}
              className="absolute top-0 right-0 bg-white border border-slate-200 text-slate-800 p-2.5 rounded-full hover:text-sky-600 hover:border-sky-300 shadow-sm transition-all cursor-pointer z-10"
              title="Chỉnh sửa sản phẩm"
            >
              <FiEdit3 className="text-lg" />
            </button>
          )}

          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-tight pr-10">
            {t_prod(selectedProduct.id, 'name', selectedProduct.name)}
          </h1>

          {/* Rating */}
          <div className="flex items-center text-xs gap-3 mb-4">
            <span className="text-amber-400 font-bold flex items-center gap-1 text-sm">
              <FiStar className="fill-current"/> {selectedProduct.rating}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium underline underline-offset-4">
              {selectedProduct.reviews} Đánh giá
            </span>
          </div>

          {/* Price */}
          <div className="text-3xl font-black text-sky-600 mb-6">
            {(Number(selectedProduct.price) || 0).toLocaleString('vi-VN')}đ
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 mb-6 w-full">
            <button
              onClick={(e) => handleAddToCart(selectedProduct, e)}
              className="flex-1 md:flex-none md:px-6 bg-sky-50 text-sky-600 border border-sky-200 py-3 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-sky-100 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <FiShoppingCart className="text-lg"/> Thêm
            </button>
            <button
              onClick={(e) => { handleAddToCart(selectedProduct, e); setIsCartOpen(true); }}
              className="flex-[2] bg-slate-900 text-white py-3 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-black transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 cursor-pointer"
            >
              <FiCheckCircle className="text-lg"/> Mua Ngay
            </button>
          </div>

          {/* Shipping / Returns */}
          <div className="space-y-2 text-xs font-medium text-slate-700 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2"><FiTruck className="text-lg text-sky-500"/> {t('ship')}</div>
            <div className="flex items-center gap-2"><FiShield className="text-lg text-emerald-500"/> {t('return')}</div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">{t('desc')}</p>
            <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line line-clamp-3 hover:line-clamp-none transition-all">
              {t_prod(selectedProduct.id, 'desc', selectedProduct.description)}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
