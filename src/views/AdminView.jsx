import { useState } from 'react';
import {
  FiArchive, FiPlus, FiTrash2, FiCornerUpLeft, FiUsers,
  FiSearch, FiMessageCircle, FiUser,
} from 'react-icons/fi';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function AdminView({
  isDarkMode, t, t_prod,
  localProducts, setLocalProducts,
  adminOrders, usersList,
  handleDeleteProduct,
  setShowAddModal, setEditFormData, setShowEditModal,
  openAdminChatWithUser,
  setPreviewImg, showToast, navigateTo,
  db,
}) {
  // Internal state — only used inside this view
  const [adminTab, setAdminTab] = useState('products');

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 py-8 md:py-12 animate-fade-in flex flex-col gap-8">

      {/* ── PAGE HEADER ── */}
      <div>
        {/* Breadcrumb */}
        <div className="text-xs font-bold text-slate-400 mb-6 tracking-wider uppercase flex items-center gap-2">
          <button
            onClick={() => navigateTo('profile')}
            className="hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FiCornerUpLeft/> {t('account')}
          </button>
          <span>/</span>
          <span className="text-slate-800 truncate">{t('adminDashboard')}</span>
        </div>

        {/* Title + Tab Switcher + Action Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3 justify-start">
            <FiArchive className="text-sky-500"/> {t('adminDashboard')}
          </h2>

          <div className="flex justify-center">
            <div className="bg-slate-100 p-1.5 rounded-full flex gap-1 w-fit">
              <button
                onClick={() => setAdminTab('products')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${adminTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Kho Hàng
              </button>
              <button
                onClick={() => setAdminTab('orders')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${adminTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Đơn Đặt Hàng
                {adminOrders.length > 0 && (
                  <span className="bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">
                    {adminOrders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setAdminTab('feedback')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${adminTab === 'feedback' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Phản Hồi & Hủy
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            {adminTab === 'products' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-sky-500 text-white px-6 py-3.5 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-sky-600 transition-colors"
              >
                <FiPlus className="text-xl"/> Thêm Sản Phẩm
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT PANEL ── */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">

          {/* ── PRODUCTS TAB ── */}
          {adminTab === 'products' && (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-black border-b border-slate-200">
                  <th className="p-5 pl-8">{t('adminImg')}</th>
                  <th className="p-5">{t('adminName')}</th>
                  <th className="p-5">{t('adminPrice')}</th>
                  <th className="p-5 text-right pr-8">{t('adminAction')}</th>
                </tr>
              </thead>
              <tbody>
                {localProducts.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-5 pl-8">
                      <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
                        <img src={item.imageUrl} className="w-full h-full object-cover rounded-xl" alt=""/>
                      </div>
                    </td>
                    <td className="p-5 font-bold text-base text-slate-800 max-w-[250px] truncate">{item.name}</td>
                    <td className="p-5 font-black text-slate-900 text-lg">
                      {(Number(item.price) || 0).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="p-5 text-right pr-8">
                      <button
                        onClick={() => handleDeleteProduct(item.id)}
                        className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-full transition-colors font-bold text-xs flex items-center justify-center gap-2 ml-auto cursor-pointer"
                      >
                        <FiTrash2 className="text-sm"/> {t('adminDel')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── ORDERS TAB ── */}
          {adminTab === 'orders' && (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-black border-b border-slate-200">
                  <th className="p-5 pl-8">Mã Đơn / Thời gian</th>
                  <th className="p-5">Khách hàng</th>
                  <th className="p-5">Sản phẩm</th>
                  <th className="p-5">Thanh toán</th>
                  <th className="p-5 text-center">Ảnh Bill</th>
                  <th className="p-5 text-right pr-8">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400 font-medium">Chưa có đơn hàng nào.</td>
                  </tr>
                ) : (
                  adminOrders.map((order) => {
                    const customerUser = usersList.find(u => u.uid === order.uid);
                    return (
                      <tr
                        key={order.id}
                        className={`border-b transition-colors ${isDarkMode ? 'border-slate-700/50 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}
                      >
                        {/* Order ID */}
                        <td className="p-5 pl-8">
                          <span className={`font-black block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.orderId}</span>
                          <span className={`text-xs font-medium mt-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="p-5 text-sm">
                          <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.customerName}</span>
                          <span className={`block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{order.customerPhone}</span>
                          <span className={`text-xs mt-1 block max-w-[200px] line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{order.customerAddress}</span>
                          {customerUser && (
                            <button
                              onClick={() => openAdminChatWithUser(customerUser)}
                              className="mt-3 text-xs font-bold bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 w-fit cursor-pointer border border-sky-500/20"
                            >
                              <FiMessageCircle/> Nhắn tin
                            </button>
                          )}
                        </td>

                        {/* Items */}
                        <td className="p-5 text-sm">
                          <div className="space-y-1 max-w-[250px]">
                            {order.items.map((it, idx) => (
                              <div key={idx} className={`font-medium truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                - {it.name} <b className="text-sky-500">x{it.quantity}</b>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Payment */}
                        <td className="p-5">
                          <span className="font-black text-sky-500 block text-base">
                            {order.paidAmount.toLocaleString('vi-VN')}đ
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-1 ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                            {order.paymentMode === 'full' ? 'Đã CK 100%' : 'Đã Cọc 30%'}
                          </span>
                        </td>

                        {/* Receipt image */}
                        <td className="p-5 text-center">
                          {order.receiptImage ? (
                            <div onClick={() => setPreviewImg(order.receiptImage)} className="inline-block relative group">
                              <img
                                src={order.receiptImage}
                                className={`w-16 h-16 object-cover rounded-xl border shadow-sm transition-transform cursor-pointer group-hover:scale-105 ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}
                                alt="Bill"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <FiSearch className="text-white text-xl"/>
                              </div>
                            </div>
                          ) : (
                            <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Không có</span>
                          )}
                        </td>

                        {/* Status controls */}
                        <td className="p-5 text-right pr-8">
                          <select
                            value={order.status}
                            onChange={async (e) => {
                              await setDoc(doc(db, 'orders', order.id), { status: e.target.value }, { merge: true });
                              showToast('Đã cập nhật trạng thái đơn!');
                            }}
                            className={`border text-sm font-bold rounded-xl px-4 py-2 outline-none cursor-pointer transition-colors focus:border-sky-500 mb-2 w-full ${isDarkMode ? 'bg-[#111111] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                          >
                            <option value="Chờ xác nhận thanh toán">Chờ duyệt Bill</option>
                            <option value="Đang chuẩn bị hàng">Đang chuẩn bị hàng</option>
                            <option value="Đang giao hàng">Đang giao hàng</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                            <option value="Khách hàng tự hủy đơn">Khách tự hủy</option>
                            <option value="Đơn không đạt yêu cầu">Không đạt (Bill lỗi)</option>
                          </select>
                          <div className="flex flex-wrap justify-end gap-1.5 mt-2">
                            <button
                              onClick={async () => { await setDoc(doc(db, 'orders', order.id), { status: 'Hoàn thành' }, { merge: true }); showToast('Đã đánh dấu Hoàn Thành'); }}
                              className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Thành công
                            </button>
                            <button
                              onClick={async () => { await setDoc(doc(db, 'orders', order.id), { status: 'Đơn không đạt yêu cầu' }, { merge: true }); showToast('Đã Từ chối'); }}
                              className="bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-500 hover:text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Từ chối
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Xóa vĩnh viễn đơn hàng này khỏi hệ thống?')) {
                                  await deleteDoc(doc(db, 'orders', order.id));
                                  showToast('Đã xóa đơn hàng!');
                                }
                              }}
                              className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer w-full mt-1 flex justify-center items-center gap-1"
                            >
                              <FiTrash2/> Xóa Đơn
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* ── FEEDBACK TAB ── */}
          {adminTab === 'feedback' && (
            <div className="p-6 md:p-8 flex flex-col gap-8 text-slate-800">

              {/* Cancelled orders */}
              <div>
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <FiArchive className="text-red-500"/> Các đơn bị khách hủy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminOrders.filter(o => o.cancelReason).length === 0 ? (
                    <p className="text-slate-500 text-sm">Chưa có đơn hàng nào bị hủy.</p>
                  ) : (
                    adminOrders.filter(o => o.cancelReason).map(o => (
                      <div key={o.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-900">{o.orderId}</span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold">{o.cancelReason}</span>
                        </div>
                        <p className="text-sm font-medium">Khách: {o.customerName} - {o.customerPhone}</p>
                        <div className="mt-3 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 italic">
                          "{o.cancelComment || 'Không để lại lời nhắn.'}"
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <hr className="border-slate-200"/>

              {/* Survey data */}
              <div>
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <FiUsers className="text-sky-500"/> Dữ liệu Khảo sát Khách hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {usersList.filter(u => u.isSurveyCompleted).length === 0 ? (
                    <p className="text-slate-500 text-sm">Chưa có ai làm khảo sát.</p>
                  ) : (
                    usersList.filter(u => u.isSurveyCompleted).map(u => (
                      <div key={u.uid} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                        <p className="font-bold text-base flex items-center gap-2">
                          {u.avatar
                            ? <img src={u.avatar} className="w-6 h-6 rounded-full" alt=""/>
                            : <FiUser/>
                          }
                          {u.nickname || u.email?.split('@')[0]}
                        </p>
                        <p className="text-sm">
                          <span className="text-slate-500 text-xs uppercase block">Nghề nghiệp</span>
                          <span className="font-medium">{u.role}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-slate-500 text-xs uppercase block">Nguồn biết đến</span>
                          <span className="font-medium bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-xs">{u.discoverySource}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-slate-500 text-xs uppercase block">Sở thích Mua sắm</span>
                          <span className="font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">{u.interests}</span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
