import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiHeart, FiEdit3 } from 'react-icons/fi';

export default function ProductDetailView({
  isDarkMode, t, t_prod, isAdmin,
  selectedProduct, setSelectedProduct,
  handleAddToCart, setIsCartOpen,
  setEditFormData, setShowEditModal,
}) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isDescOpen, setIsDescOpen] = useState(false); // Đóng sẵn cho gọn
  const [isShipOpen, setIsShipOpen] = useState(false);

  if (!selectedProduct) return null;

  const mainImageSrc =
    selectedProduct.images && selectedProduct.images.length > 0
      ? selectedProduct.images[activeImgIdx]
      : selectedProduct.imageUrl;

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className={`max-w-[1100px] mx-auto w-full px-4 md:px-8 py-4 animate-fade-in ${isDarkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
      
      {/* Breadcrumb - Nhỏ gọn hơn */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-medium">
        <span className="cursor-pointer hover:text-black transition-colors" onClick={() => window.history.back()}>← Home</span>
        <span>·</span>
        <span>Product details</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        
        {/* ── LEFT: IMAGE GALLERY (Thu nhỏ lại) ── */}
        <div className="w-full md:w-[45%] flex flex-col gap-3">
          <div className={`w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden relative border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
            <img
              id="detail-main-image"
              src={mainImageSrc}
              className="w-full h-full object-contain object-center"
              alt={selectedProduct.name}
            />
          </div>
          {/* Thumbnails */}
          {selectedProduct.images && selectedProduct.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto custom-scrollbar">
              {selectedProduct.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                    activeImgIdx === idx ? 'border-black' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: PRODUCT INFO (Ép lề, giảm margin) ── */}
        <div className="w-full md:w-[55%] flex flex-col relative">
          
          {isAdmin && (
            <button onClick={() => { setEditFormData({ ...selectedProduct, images: selectedProduct.images || [selectedProduct.imageUrl] }); setShowEditModal(true); }} className="absolute -top-2 right-0 text-gray-400 hover:text-black p-2">
              <FiEdit3 className="text-xl" />
            </button>
          )}

          <p className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">
            {(selectedProduct.category || '').includes('shirt') ? 'Trimi Fashion' : 'Trimi Collection'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight pr-8">
            {t_prod(selectedProduct.id, 'name', selectedProduct.name)}
          </h1>
          
          <div className="text-xl font-black mb-4 text-sky-600">
            {(Number(selectedProduct.price) || 0).toLocaleString('vi-VN')}đ
          </div>

          <div className={`w-full border text-[11px] p-2.5 rounded-lg mb-5 flex items-center gap-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
            <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold ${isDarkMode ? 'border-slate-500' : 'border-gray-400'}`}>i</span>
            Order in 02:30:25 to get next day delivery
          </div>

          {/* Size Selector */}
          <div className="mb-6">
            <p className="text-xs font-bold mb-2">Select Size</p>
            <div className="flex gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    selectedSize === size ? 'bg-[#1a1a1a] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={(e) => { handleAddToCart(selectedProduct, e); setIsCartOpen(true); }}
              className={`flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider trimi-btn-lift ${
                isDarkMode
                  ? 'bg-white text-slate-900 hover:bg-slate-100'
                  : 'bg-[#1a1a1a] text-white hover:bg-black'
              }`}
            >
              Add to Cart
            </button>
            <button
              className={`w-12 h-12 flex-shrink-0 border rounded-full flex items-center justify-center trimi-btn-lift ${
                isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiHeart className="text-lg" />
            </button>
          </div>

          {/* Accordions (Thu gọn) */}
          <div className="border-t border-gray-200">
            <div className="border-b border-gray-200 py-3">
              <button className="w-full flex justify-between items-center text-left font-bold text-xs uppercase" onClick={() => setIsDescOpen(!isDescOpen)}>
                Description & Fit {isDescOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {isDescOpen && <p className="mt-2 text-xs text-gray-500 leading-relaxed whitespace-pre-line">{t_prod(selectedProduct.id, 'desc', selectedProduct.description)}</p>}
            </div>
            <div className="border-b border-gray-200 py-3">
              <button className="w-full flex justify-between items-center text-left font-bold text-xs uppercase" onClick={() => setIsShipOpen(!isShipOpen)}>
                Shipping {isShipOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {isShipOpen && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                   <div><p className="font-bold text-gray-800">Discount</p><p>Freeship Đà Nẵng</p></div>
                   <div><p className="font-bold text-gray-800">Package</p><p>Hộp tiêu chuẩn</p></div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}