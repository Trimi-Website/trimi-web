import {
  FiArchive,
  FiPlus,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiTruck,
} from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

/* ─── Skeleton loader ──────────────────────────────────────────────────────── */
const ProductSkeleton = ({ isDarkMode }) => (
  <div
    className={`p-4 rounded-[32px] border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-100'
      } animate-pulse`}
  >
    <div
      className={`w-full aspect-square rounded-[24px] mb-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
        }`}
    ></div>
    <div
      className={`h-4 w-3/4 rounded-full mb-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
        }`}
    ></div>
    <div className="flex justify-between items-end mt-4">
      <div
        className={`h-5 w-1/3 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
          }`}
      ></div>
      <div
        className={`h-10 w-10 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
          }`}
      ></div>
    </div>
  </div>
);

/* ─── Banner carousel ──────────────────────────────────────────────────────── */
const BANNERS = [
  '/shop_banner.webp',
  '/shop_banner2.webp',
  '/shop_banner3.webp',
  '/shop_banner4.webp',
  '/shop_banner5.webp',
];

function BannerCarousel() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);

  const handleScroll = () => {
    if (!ref.current) return;
    setActive(Math.round(ref.current.scrollLeft / ref.current.offsetWidth));
  };

  const scrollToIndex = (index) => {
    if (!ref.current) return;
    const target = (index + BANNERS.length) % BANNERS.length;
    ref.current.scrollTo({
      left: target * ref.current.offsetWidth,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const timer = setInterval(() => scrollToIndex(active + 1), 4000);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <div className="relative w-full mb-8 group">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="flex w-full overflow-x-auto snap-x snap-mandatory rounded-[28px] md:rounded-[32px]"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {BANNERS.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-full snap-center h-[170px] md:h-[250px] overflow-hidden relative"
          >
            <img
              src={src}
              alt={`Banner ${i + 1}`}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
              onError={(e) => {
                e.target.src = '/shop_banner.webp';
              }}
            />
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollToIndex(active - 1)}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 w-10 h-10 bg-white/70 hover:bg-white text-slate-800 rounded-full items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
      >
        <FiChevronLeft className="text-2xl" />
      </button>

      <button
        type="button"
        onClick={() => scrollToIndex(active + 1)}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-4 w-10 h-10 bg-white/70 hover:bg-white text-slate-800 rounded-full items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
      >
        <FiChevronRight className="text-2xl" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none z-10">
        {BANNERS.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${i === active ? 'w-5 h-2 bg-white shadow-md' : 'w-2 h-2 bg-white/60'
              }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main ShopView ────────────────────────────────────────────────────────── */
export default function ShopView({
  isDarkMode,
  t,
  t_prod,
  currentCategory,
  selectedTag,
  setSelectedTag,
  sortOrder,
  setSortOrder,
  isLoadingShop,
  displayedProducts,
  navigateTo,
  handleAddToCart,
  translateTag,
  fakeColorSpheres,
  isShipper,
}) {
  const dark = isDarkMode;
  const categoryKey = currentCategory || 'all';

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 pt-6 pb-8 md:pt-8 md:pb-10 animate-fade-in">
      {categoryKey === 'all' && <BannerCarousel />}

      {isShipper && (
        <div
          onClick={() => navigateTo('shipper')}
          className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-[28px] p-5 mb-8 cursor-pointer shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-between group border-2 border-emerald-300"
        >
          <div className="flex items-center gap-4 text-white">
            <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <FiTruck className="text-3xl" />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-wide">Khu Vực Shipper</h3>
              <p className="text-sm font-medium opacity-90 mt-0.5">
                Bấm vào đây để đi đến trang quản lý giao hàng
              </p>
            </div>
          </div>
          <FiChevronRight className="text-white text-3xl opacity-70 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-sky-500 rounded-full"></div>

          <h2
            className={`text-2xl font-black uppercase tracking-widest ${dark ? 'text-white' : 'text-slate-800'
              }`}
          >
            {categoryKey.includes('_all')
              ? t(categoryKey)
              : categoryKey === 'all'
                ? t('all_products')
                : t(categoryKey)}
          </h2>

          {selectedTag && (
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="ml-4 bg-sky-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-red-500 transition-colors"
            >
              #{translateTag(selectedTag)} <FiX />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-500">{t('sort_label')}</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={`border rounded-full px-5 py-2.5 outline-none focus:border-sky-500 text-sm font-bold cursor-pointer transition-colors appearance-none pr-10 ${dark
                ? 'bg-[#111111] border-slate-700 text-white'
                : 'bg-white border-slate-200 text-slate-800'
              }`}
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
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

      {isLoadingShop ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 px-1 md:px-0 w-full">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <ProductSkeleton key={i} isDarkMode={dark} />
            ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div
          className={`text-center py-20 rounded-3xl border shadow-sm ${dark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-100'
            }`}
        >
          <FiArchive className="text-6xl text-slate-300 mx-auto mb-4" />
          <h3 className={`${dark ? 'text-white' : 'text-slate-800'} text-xl font-bold`}>
            {t('no_products')}
          </h3>
          <p className={`${dark ? 'text-slate-400' : 'text-slate-500'} mt-2`}>
            {t('no_products_desc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 px-1 md:px-0">
          {displayedProducts.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 trimi-card-enter"
              style={{ animationDelay: `${Math.min(index * 45, 400)}ms` }}
            >
              <div
                className="bg-slate-100 rounded-[32px] border border-slate-200 relative aspect-[4/5] flex items-center justify-center cursor-pointer overflow-hidden trimi-product-hover"
                style={{ background: dark ? '#1e293b' : '#f1f5f9' }}
                onClick={() => navigateTo('productDetail', item.category, item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  id={`product-img-${item.id}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out"
                />

                <button
                  type="button"
                  onClick={(e) => handleAddToCart(item, e)}
                  className="absolute bottom-3 right-3 md:bottom-5 md:right-5 w-9 h-9 md:w-12 md:h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-900/30 trimi-btn-lift"
                  style={{
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease, background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#38bdf8';
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <FiPlus className="text-lg md:text-2xl" />
                </button>
              </div>

              <div className="px-2">
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1 mb-1 mt-2 flex-wrap">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(tag);
                        }}
                        className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md hover:bg-sky-100 hover:text-sky-600 transition-colors cursor-pointer border border-slate-300 shadow-sm font-bold"
                      >
                        #{translateTag(tag)}
                      </span>
                    ))}
                  </div>
                )}

                <h3
                  className={`font-bold text-xs md:text-sm line-clamp-1 mb-1 cursor-pointer transition-colors hover:text-sky-500 mt-1 ${dark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  onClick={() => navigateTo('productDetail', item.category, item)}
                >
                  {t_prod(item.id, 'name', item.name)}
                </h3>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 md:gap-1.5">
                    {fakeColorSpheres.map((gradient, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-full shadow-inner border border-slate-200/50 bg-gradient-to-br ${gradient}`}
                      />
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