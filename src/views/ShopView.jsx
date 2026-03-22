import { FiRefreshCcw, FiArchive, FiPlus, FiX } from 'react-icons/fi';

export default function ShopView({
  isDarkMode, t, t_prod, currentCategory, selectedTag, setSelectedTag,
  sortOrder, setSortOrder, isLoadingShop, displayedProducts,
  navigateTo, handleAddToCart, translateTag, fakeColorSpheres,
}) {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-8 md:py-10 animate-fade-in">

      {/* SHOP BANNER */}
      {currentCategory === 'all' && (
        <div
          className="w-full h-[180px] md:h-[250px] rounded-[32px] overflow-hidden mb-8 shadow-sm border border-slate-100 relative group cursor-pointer"
          onClick={() => navigateTo('shop', 'all')}
        >
          <img
            src="/shop_banner.webp"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Shop Banner"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
        </div>
      )}

      {/* HEADER ROW: TITLE + SORT */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-sky-500 rounded-full"></div>
          <h2 className={`text-2xl font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {currentCategory.includes('_all')
              ? t(currentCategory)
              : currentCategory === 'all'
              ? t('all_products')
              : t(currentCategory)}
          </h2>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="ml-4 bg-sky-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-red-500 transition-colors"
            >
              #{translateTag(selectedTag)} <FiX />
            </button>
          )}
        </div>

        {/* SORT DROPDOWN */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-500">{t('sort_label')}</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={`border rounded-full px-5 py-2.5 outline-none focus:border-sky-500 text-sm font-bold cursor-pointer transition-colors appearance-none pr-10 relative ${isDarkMode ? 'bg-[#111111] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundPosition: 'right 12px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px',
            }}
          >
            <option value="default">{t('sort_default')}</option>
            <option value="asc">{t('sort_low_high')}</option>
            <option value="desc">{t('sort_high_low')}</option>
          </select>
        </div>
      </div>

      {/* PRODUCT GRID */}
      {isLoadingShop ? (
        <div className="flex justify-center py-32">
          <FiRefreshCcw className="text-4xl text-sky-500 animate-spin" />
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <FiArchive className="text-6xl text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">{t('no_products')}</h3>
          <p className="text-slate-500 mt-2">{t('no_products_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 px-1 md:px-0">
          {displayedProducts.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 group">

              {/* PRODUCT IMAGE CARD */}
              <div
                className="bg-slate-100 rounded-[32px] border border-slate-200 relative aspect-[4/5] flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-sky-400 hover:-translate-y-2 hover:scale-[1.02] hover:rotate-1 overflow-hidden"
                onClick={() => navigateTo('productDetail', item.category, item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <button
                  onClick={(e) => handleAddToCart(item, e)}
                  className="absolute bottom-3 right-3 md:bottom-5 md:right-5 w-9 h-9 md:w-12 md:h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-110 hover:bg-sky-500 transition-all shadow-lg shadow-slate-900/30"
                >
                  <FiPlus className="text-lg md:text-2xl"/>
                </button>
              </div>

              {/* PRODUCT INFO */}
              <div className="px-2">
                {/* TAGS */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1 mb-1 mt-2 flex-wrap">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}
                        className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md hover:bg-sky-100 hover:text-sky-600 transition-colors cursor-pointer border border-slate-300 shadow-sm font-bold"
                      >
                        #{translateTag(tag)}
                      </span>
                    ))}
                  </div>
                )}

                <h3
                  className={`font-bold text-xs md:text-sm line-clamp-1 mb-1 cursor-pointer transition-colors hover:text-sky-500 mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
                  onClick={() => navigateTo('productDetail', item.category, item)}
                >
                  {t_prod(item.id, 'name', item.name)}
                </h3>

                <div className="flex items-center justify-between mt-1">
                  {/* COLOR SPHERES */}
                  <div className="flex items-center gap-1 md:gap-1.5">
                    {fakeColorSpheres.map((gradient, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-full shadow-inner border border-slate-200/50 bg-gradient-to-br ${gradient}`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-sm md:text-base font-black text-slate-900">
                    {(Number(item.price) || 0).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
