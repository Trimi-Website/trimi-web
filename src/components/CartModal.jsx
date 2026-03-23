import { FiShoppingCart, FiX, FiTrash2, FiCheckCircle } from 'react-icons/fi';

// CHANGE 5: On mobile the cart takes full screen (w-full, no max-w, no border-l).
//           On desktop it remains the right-side drawer (max-w-[360px], border-l).
export default function CartModal({
  isDarkMode, t, t_prod, isCartOpen, setIsCartOpen,
  cart, cartItemCount, paymentMode, setPaymentMode,
  cartFinalTotal, depositAmount,
  updateCartQuantity, removeFromCart,
  handleProceedCheckout, navigateTo,
}) {
  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[80000] flex md:justify-end pointer-events-none">
      {/* Mobile: full-screen backdrop to close on tap outside */}
      <div
        className="absolute inset-0 bg-black/30 md:hidden pointer-events-auto"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Cart panel
          Mobile:  w-full, no max-w, no border-l  → full screen
          Desktop: max-w-[360px], border-l         → right drawer  */}
      <div
        className={`relative w-full md:max-w-[360px] h-full flex flex-col shadow-2xl animate-fade-in-right backdrop-blur-xl md:border-l pointer-events-auto ${
          isDarkMode
            ? 'bg-[#181512]/95 md:bg-[#181512]/60 border-white/10 text-white'
            : 'bg-[#f7f3ed] md:bg-[#f7f3ed]/70 border-black/10 text-slate-900'
        }`}
      >
        {/* ── HEADER ── */}
        <div className={`flex justify-between items-center p-4 md:p-5 border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <h2 className="text-xl font-black flex items-center gap-2">
            <FiShoppingCart className="text-sky-500"/> Giỏ hàng ({cartItemCount})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-black/5 hover:bg-black/10 text-slate-500'}`}
          >
            <FiX className="text-xl"/>
          </button>
        </div>

        {/* ── ITEM LIST ── */}
        <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center mt-20 flex flex-col items-center">
              <div className={`w-20 h-20 shadow-sm rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-white/50'}`}>
                <FiShoppingCart className={`text-4xl ${isDarkMode ? 'text-slate-500' : 'text-slate-300'}`}/>
              </div>
              <p className={`font-medium mb-6 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('emptyCart')}
              </p>
              <button
                onClick={() => { setIsCartOpen(false); navigateTo('shop', 'all'); }}
                className="px-6 py-3 bg-sky-500 text-white text-xs font-bold tracking-widest uppercase rounded-full shadow-lg hover:bg-sky-600 transition-all cursor-pointer"
              >
                {t('startShop')}
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={`flex gap-3 p-3 rounded-2xl border relative pr-10 group transition-colors ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-white/40 border-black/5 hover:border-black/10 shadow-sm'
                }`}
              >
                <div className={`w-16 h-16 rounded-xl p-1 flex-shrink-0 border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white/50 border-black/5'}`}>
                  <img src={item.imageUrl} className="w-full h-full object-cover rounded-lg" alt=""/>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-xs font-bold line-clamp-2 leading-snug">{t_prod(item.id, 'name', item.name)}</h3>
                  <p className="font-black text-sm mt-0.5 text-sky-500">{(Number(item.price) || 0).toLocaleString('vi-VN')}đ</p>
                  <div className={`flex items-center border rounded-lg w-fit mt-2 overflow-hidden ${isDarkMode ? 'border-white/20 bg-black/20' : 'border-black/10 bg-white/50'}`}>
                    <button onClick={() => updateCartQuantity(item.id, -1)} className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>-</button>
                    <span className={`px-3 text-xs font-black py-1 border-x ${isDarkMode ? 'border-white/20 bg-white/5' : 'border-black/10 bg-white'}`}>{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.id, 1)} className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>+</button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className={`absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-colors cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                  title="Xóa"
                >
                  <FiTrash2 className="text-base"/>
                </button>
              </div>
            ))
          )}
        </div>

        {/* ── FOOTER: PAYMENT MODE + CHECKOUT ── */}
        {cart.length > 0 && (
          <div className={`pb-[85px] md:pb-5 border-t ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-black/10 bg-white/30'}`}>
            <div className={`flex gap-2 mb-4 p-1.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white/50 border-black/5'}`}>
              <button
                onClick={() => setPaymentMode('deposit')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${paymentMode === 'deposit' ? (isDarkMode ? 'bg-white/20 text-white shadow-sm' : 'bg-white shadow-sm text-slate-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}
              >
                {t('deposit_30')}
              </button>
              <button
                onClick={() => setPaymentMode('full')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${paymentMode === 'full' ? (isDarkMode ? 'bg-white/20 text-white shadow-sm' : 'bg-white shadow-sm text-slate-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}
              >
                {t('pay_full')}
              </button>
            </div>
            <div className="flex justify-between items-end mb-4">
              <span className={`font-bold uppercase tracking-widest text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {paymentMode === 'deposit' ? t('deposit') : t('total')}
              </span>
              <span className="text-2xl font-black text-sky-500">
                {paymentMode === 'deposit' ? depositAmount.toLocaleString('vi-VN') : cartFinalTotal.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <button
              onClick={handleProceedCheckout}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase shadow-xl transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              <FiCheckCircle className="text-base"/> {t('checkout')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
