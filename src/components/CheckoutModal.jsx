import { FiX, FiTrash2, FiUpload, FiCheckCircle, FiLoader } from 'react-icons/fi';

export default function CheckoutModal({
  isDarkMode, t, t_prod,
  showCheckoutModal, setShowCheckoutModal,
  cart, cartProductsTotal, shippingFee, cartFinalTotal,
  paymentMode, depositAmount, currentOrderId,
  receiptImg, isCheckingPayment,
  handleReceiptUpload, handleConfirmPayment,
  removeFromCart,
}) {
  if (!showCheckoutModal) return null;

  const finalPayAmount = paymentMode === 'deposit' ? depositAmount : cartFinalTotal;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={() => !isCheckingPayment && setShowCheckoutModal(false)}
      ></div>

      <div className="bg-white rounded-[32px] w-full max-w-4xl relative z-10 shadow-2xl flex flex-col md:flex-row overflow-hidden">

        {/* ── LEFT: ORDER SUMMARY ── */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 md:p-8 border-r border-slate-100 flex flex-col">
          <h3 className="text-2xl font-black mb-6">{t('order_summary')}</h3>

          {/* Cart items */}
          <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2 max-h-[150px] md:max-h-[300px]">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm font-medium group">
                <span className="text-slate-600 line-clamp-1 pr-2 flex-1">
                  {t_prod(item.id, 'name', item.name)}
                  <span className="text-sky-600 font-bold ml-1">x{item.quantity}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-900 font-bold whitespace-nowrap">
                    {((Number(item.price) || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Xóa khỏi đơn"
                  >
                    <FiTrash2 className="text-base" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal + shipping */}
          <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
            <div className="flex justify-between items-center text-sm font-medium text-slate-500">
              <span>{t('order_price')}</span>
              <span>{cartProductsTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium text-slate-500">
              <span>{t('shipping_fee')}</span>
              <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}</span>
            </div>
          </div>

          {/* Total + deposit */}
          <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
            <div className={`flex justify-between items-end ${paymentMode === 'full' ? 'bg-sky-100 p-3 rounded-xl' : 'mb-2'}`}>
              <span className={`${paymentMode === 'full' ? 'text-sky-700' : 'text-slate-500'} font-bold uppercase tracking-widest text-xs`}>
                {t('total')}
              </span>
              <span className={`text-2xl font-black ${paymentMode === 'full' ? 'text-sky-600' : 'text-slate-900'}`}>
                {cartFinalTotal.toLocaleString('vi-VN')}đ
              </span>
            </div>
            {paymentMode === 'deposit' && (
              <div className="flex justify-between items-end bg-sky-100 p-3 rounded-xl">
                <span className="text-sky-700 font-black uppercase tracking-widest text-sm">{t('deposit')}</span>
                <span className="text-2xl font-black text-sky-600">{depositAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: QR PAYMENT ── */}
        <div className="w-full md:w-1/2 p-6 md:p-8 text-center flex flex-col items-center justify-center relative bg-white">
          {!isCheckingPayment && (
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"
            >
              <FiX className="text-xl"/>
            </button>
          )}

          <h3 className="text-2xl font-black mb-2 text-slate-900">{t('qr_pay')}</h3>
          <p className="text-sm text-slate-500 mb-4 font-medium px-4">{t('qr_scan_desc')}</p>

          {/* QR Code */}
          <div className="bg-white p-2 rounded-3xl shadow-lg border border-slate-100 mb-4 inline-block transform hover:scale-105 transition-transform relative">
            <img src="/qr.png" alt="QR Code" className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-xl"/>
          </div>

          {/* Transfer content label */}
          <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-xs font-bold mb-4 border border-amber-200">
            Nội dung CK: <span style={{ color: '#000' }} className="font-black text-sm">{currentOrderId}</span>
          </div>

          {/* Receipt upload */}
          <div className="w-full mb-4">
            <label className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed ${
              receiptImg
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-300 bg-slate-50 text-slate-500 hover:border-sky-500 hover:text-sky-600'
            }`}>
              {receiptImg
                ? <><FiCheckCircle className="text-lg"/> Đã tải lên Bill</>
                : <><FiUpload className="text-lg"/> 1. Tải lên ảnh Bill chuyển khoản</>
              }
              <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
            </label>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirmPayment}
            disabled={isCheckingPayment || !receiptImg}
            className={`w-full py-4 rounded-full font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              isCheckingPayment || !receiptImg
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-sky-500 text-white hover:bg-sky-600 shadow-xl cursor-pointer'
            }`}
          >
            {isCheckingPayment
              ? <><FiLoader className="text-xl animate-spin text-sky-500"/> {t('waiting_payment')}</>
              : <><FiCheckCircle className="text-xl"/> 2. {t('confirm_paid')}</>
            }
          </button>

          <p className="text-[10px] text-slate-400 mt-4 px-4 leading-relaxed">
            Quét mã QR. Bạn bắt buộc phải tải lên ảnh chụp màn hình chuyển khoản để có thể bấm Xác nhận.
          </p>
        </div>

      </div>
    </div>
  );
}
