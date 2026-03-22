import { FiX, FiPlus, FiUploadCloud, FiCheckCircle, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminProductModals({
  isAdmin, isDarkMode, t,
  showAddModal, setShowAddModal,
  newProd, setNewProd, handleSubmitNewProduct,
  showEditModal, setShowEditModal,
  editFormData, setEditFormData,
  localProducts, setLocalProducts,
  setSelectedProduct, showToast,
  db, compressImage,
}) {
  if (!isAdmin) return null;

  return (
    <>
      {/* ══════════════════════════════════════════
          ADD PRODUCT MODAL
      ══════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white rounded-[40px] p-8 md:p-10 w-full max-w-2xl relative z-10 shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">

            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <FiPlus className="text-sky-500 bg-sky-50 p-2 rounded-full"/> {t('adminAdd')}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-3 rounded-full transition-colors">
                <FiX className="text-xl"/>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-6">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">{t('adminImg')} (PNG/JPG)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-[24px] p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer group">
                  <input
                    type="file" accept="image/*"
                    onClick={(e) => e.target.value = null}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) compressImage(file, (base64) => setNewProd({ ...newProd, imagePreview: base64 }));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {newProd.imagePreview
                    ? <img src={newProd.imagePreview} className="h-40 object-cover rounded-xl drop-shadow-md" alt="Preview"/>
                    : <><FiUploadCloud className="text-5xl text-slate-300 mb-3 group-hover:text-sky-500 transition-colors"/><p className="text-sm font-medium text-slate-500">Bấm hoặc kéo thả ảnh vào đây</p></>
                  }
                </div>
              </div>

              {/* Name + Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">{t('adminName')}</label>
                  <input type="text" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">{t('adminPrice')} (VNĐ)</label>
                  <input type="number" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"/>
                </div>
              </div>

              {/* Category + Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Danh mục</label>
                  <select value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium">
                    <option value="shirt_1">{t('shirt_1')}</option>
                    <option value="shirt_2">{t('shirt_2')}</option>
                    <option value="shirt_3">{t('shirt_3')}</option>
                    <option value="pants_1">{t('pants_1')}</option>
                    <option value="pants_2">{t('pants_2')}</option>
                    <option value="pants_3">{t('pants_3')}</option>
                    <option value="acc_1">{t('acc_1')}</option>
                    <option value="acc_2">{t('acc_2')}</option>
                    <option value="acc_3">{t('acc_3')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Tags (Cách nhau dấu phẩy)</label>
                  <input type="text" placeholder="nam, áo, streetwear" value={newProd.tags || ''} onChange={(e) => setNewProd({ ...newProd, tags: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"/>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">{t('desc')}</label>
                <textarea value={newProd.desc} onChange={(e) => setNewProd({ ...newProd, desc: e.target.value })} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium resize-none"></textarea>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 mt-4 flex justify-end gap-4">
              <button onClick={() => setShowAddModal(false)} className="px-8 py-4 rounded-full font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">Hủy Bỏ</button>
              <button onClick={handleSubmitNewProduct} className="px-8 py-4 rounded-full font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/30 cursor-pointer">
                <FiCheckCircle className="text-lg"/> Đăng Lên Cửa Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          EDIT PRODUCT MODAL
      ══════════════════════════════════════════ */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="bg-white rounded-[40px] p-8 md:p-10 w-full max-w-2xl relative z-10 shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">

            <div className="flex justify-between items-center mb-6 text-slate-900">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <FiEdit3 className="text-sky-500"/> Sửa Sản Phẩm
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-2.5 rounded-full cursor-pointer">
                <FiX className="text-xl"/>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-5 text-slate-800">

              {/* Image gallery manager */}
              <div>
                <label className="block text-sm font-bold mb-2">Thư viện ảnh (Tối đa 10 ảnh)</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {editFormData.images && editFormData.images.map((img, idx) => (
                    <div key={idx} className="w-20 h-20 relative group rounded-xl overflow-hidden border border-slate-200">
                      <img src={img} className="w-full h-full object-cover" alt=""/>
                      <button
                        onClick={() => setEditFormData({ ...editFormData, images: editFormData.images.filter((_, i) => i !== idx) })}
                        className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <FiTrash2/>
                      </button>
                    </div>
                  ))}
                  {(!editFormData.images || editFormData.images.length < 10) && (
                    <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-colors relative">
                      <FiPlus className="text-slate-400 text-2xl"/>
                      <input
                        type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) compressImage(file, (base64) => {
                            const newImages = [...(editFormData.images || []), base64];
                            setEditFormData({ ...editFormData, images: newImages });
                          });
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Name + Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500"
                  placeholder="Tên sản phẩm"
                />
                <input
                  type="number"
                  value={editFormData.price || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500"
                  placeholder="Giá tiền"
                />
              </div>

              {/* Description */}
              <textarea
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows="4"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500 resize-none"
                placeholder="Mô tả sản phẩm"
              ></textarea>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-4 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-6 py-3 rounded-full font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 cursor-pointer">
                Hủy
              </button>
              <button
                onClick={async () => {
                  // ── BUG FIX: explicitly list every field instead of using
                  //    spread alone, guaranteeing name + description always persist
                  const finalData = {
                    id:          editFormData.id,
                    name:        (editFormData.name || '').trim(),
                    description: (editFormData.description || '').trim(),
                    price:       parseFloat(editFormData.price) || 0,
                    category:    editFormData.category || '',
                    imageUrl:    editFormData.images?.[0] || editFormData.imageUrl || '',
                    images:      editFormData.images || [],
                    rating:      editFormData.rating ?? 5,
                    reviews:     editFormData.reviews ?? 0,
                    tags:        editFormData.tags || [],
                    stock:       editFormData.stock ?? 50,
                  };
                  await setDoc(doc(db, 'products', finalData.id), finalData, { merge: true });
                  setLocalProducts(localProducts.map(p => p.id === finalData.id ? finalData : p));
                  setSelectedProduct(finalData);
                  setShowEditModal(false);
                  showToast('Cập nhật thành công!');
                }}
                className="px-8 py-3 rounded-full font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-lg cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
