export default function HomeView({ isDarkMode, navigateTo, localProducts }) {
  const products = Array.isArray(localProducts) ? localProducts : [];
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(0, 8);

  const serviceItems = [
    {
      icon: '🛍️',
      title: 'Easy Shopping',
      desc: 'Mua sắm nhanh gọn',
    },
    {
      icon: '🚚',
      title: 'Fast Delivery',
      desc: 'Giao hàng nhanh',
    },
    {
      icon: '💬',
      title: '24/7 Support',
      desc: 'Hỗ trợ mọi lúc',
    },
    {
      icon: '💳',
      title: 'Secure Payment',
      desc: 'Thanh toán an toàn',
    },
  ];

  const floatBadges = [
    { text: 'LOCAL BRAND', cls: 'left-[-8px] top-[180px] rotate-[-16deg]' },
    { text: 'UI/UX', cls: 'left-[18px] top-[560px] rotate-[18deg]' },
    { text: 'FASHION', cls: 'right-[-14px] top-[220px] rotate-[14deg]' },
    { text: 'ECOMMERCE', cls: 'right-[-8px] bottom-[180px] rotate-[-12deg]' },
  ];

  const formatPrice = (price) =>
    `${(Number(price) || 0).toLocaleString('vi-VN')} đ`;

  const heroImage =
    featuredProducts[0]?.imageUrl || '/mixtas_hero_models.png';

  const sectionImage1 = featuredProducts[1]?.imageUrl || '/promo_left.jpg';
  const sectionImage2 = featuredProducts[2]?.imageUrl || '/promo_right_top.jpg';
  const sectionImage3 = featuredProducts[3]?.imageUrl || '/mixtas_hero_models.png';

  return (
    <div
      className={`w-full overflow-x-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0b1220] text-white' : 'bg-[#dbe6f0] text-[#111111]'
      }`}
    >
      <section className="relative overflow-hidden pt-[96px] pb-16 md:pb-24">
        {/* BACKGROUND */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_rgba(219,230,240,0.95)_45%,_rgba(205,220,233,1)_100%)]" />
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
          <div className="absolute left-1/2 top-5 -translate-x-1/2 select-none text-center text-[70px] font-black uppercase leading-none tracking-[0.08em] text-white/55 sm:text-[120px] md:text-[180px] lg:text-[220px]">
            TRIMI
          </div>
        </div>

        <div className="relative mx-auto max-w-[1220px] px-4 sm:px-6">
          {/* FLOAT LABELS */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            {floatBadges.map((item) => (
              <div
                key={item.text}
                className={`floating-badge absolute ${item.cls}`}
              >
                {item.text}
              </div>
            ))}
          </div>

          {/* MAIN PANEL */}
          <div className="panel-shell overflow-hidden rounded-[34px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(33,65,107,0.14)]">
            {/* INTERNAL NAV LOOK */}
            <div className="flex items-center justify-between border-b border-[#e8eef4] px-5 py-4 sm:px-7">
              <div className="text-[28px] font-black italic leading-none text-[#4b98e6] sm:text-[36px]">
                trimi
              </div>

              <div className="hidden items-center gap-7 text-[13px] text-[#58606d] md:flex">
                <button className="font-semibold text-[#111111]">Home</button>
                <button>Shop</button>
                <button>Product</button>
                <button>About Us</button>
                <button>Contact</button>
                <button>Blog</button>
              </div>

              <div className="flex items-center gap-2 text-[#243243] sm:gap-3">
                <button className="grid h-9 w-9 place-items-center rounded-full bg-[#f3f7fb] text-sm">
                  🔍
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-[#f3f7fb] text-sm">
                  ♡
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-[#0f2340] text-sm text-white">
                  👜
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-full bg-[#4b98e6] text-sm text-white">
                  👤
                </button>
              </div>
            </div>

            {/* HERO */}
            <div className="px-4 pt-4 sm:px-6 sm:pt-6">
              <div className="relative overflow-hidden rounded-[28px] bg-[#082b4e]">
                <img
                  src={heroImage}
                  alt="TRIMI hero"
                  className="h-[430px] w-full object-cover object-center sm:h-[520px] lg:h-[600px]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/mixtas_hero_models.png';
                  }}
                />

                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,20,45,0.72),rgba(2,28,58,0.38),rgba(7,13,24,0.22))]" />

                {/* animation moved to background behind title */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="title-glow title-glow-1" />
                  <div className="title-glow title-glow-2" />
                  <div className="title-ring title-ring-1" />
                  <div className="title-ring title-ring-2" />
                  <div className="title-particles title-particles-1" />
                  <div className="title-particles title-particles-2" />
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.34em] text-white/78 sm:text-xs">
                    Autumn Winter 2025
                  </p>

                  <h1 className="text-[42px] font-black leading-[0.9] tracking-[-0.06em] text-[#4b98e6] sm:text-[62px] md:text-[86px] lg:text-[104px]">
                    TRIMI
                  </h1>

                  <p className="mt-4 max-w-2xl text-base font-medium text-white/92 sm:text-xl">
                    Dám khác biệt - Dám Trimi
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigateTo('shop', 'all')}
                      className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0f2340] transition hover:-translate-y-0.5 hover:bg-[#edf4fb]"
                    >
                      Khám phá thêm
                    </button>

                    <button
                      onClick={() => navigateTo('shop', 'shirt_all')}
                      className="rounded-full border border-white/70 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#0f2340]"
                    >
                      Xem bộ sưu tập
                    </button>
                  </div>
                </div>

                {/* floating bubble */}
                <div className="absolute right-4 top-8 hidden rounded-[999px] bg-white/92 px-4 py-3 shadow-[0_15px_30px_rgba(0,0,0,0.14)] backdrop-blur-sm sm:right-7 sm:flex sm:items-center sm:gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-[#4b98e6] text-white">
                    ✦
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-black leading-none text-[#12314d]">
                      @trimi_style
                    </div>
                    <div className="mt-1 text-sm text-[#687485]">
                      Local Brand Landing Page
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SERVICES ROW */}
            <div className="grid grid-cols-2 gap-y-6 px-6 py-8 sm:grid-cols-4 sm:px-8 md:py-10">
              {serviceItems.map((item) => (
                <div key={item.title} className="text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#eef5fb] text-xl">
                    {item.icon}
                  </div>
                  <div className="mt-3 text-sm font-semibold text-[#203041]">
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs text-[#7b8794]">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* SPLIT CONTENT */}
            <div className="grid gap-8 px-6 pb-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="relative overflow-hidden rounded-[26px] bg-[#edf4fb]">
                <img
                  src={sectionImage1}
                  alt="TRIMI feature"
                  className="h-[260px] w-full object-cover object-center sm:h-[320px]"
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0';
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,31,60,0.12),rgba(8,31,60,0.02))]" />

                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4b98e6]">
                  New concept
                </div>

                <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#213446] shadow-sm">
                  Premium Look
                </div>
              </div>

              <div className="relative">
                <div className="mb-3 inline-flex rounded-full bg-[#edf4fb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5e94c7]">
                  TRIMI DESIGN IDEA
                </div>

                <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#16304b] sm:text-4xl md:text-5xl">
                  Làm giao diện hiện đại, sạch và nổi bật hơn
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-[#6a7585] sm:text-base">
                  Bố cục được làm theo tinh thần hình mẫu bạn gửi: nền xanh nhạt,
                  panel trắng lớn ở giữa, hero bo góc sang hơn, badge nổi xung quanh
                  và khối nội dung gọn mắt hơn.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigateTo('shop', 'all')}
                    className="rounded-full bg-[#12314d] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2740]"
                  >
                    Shop Now →
                  </button>

                  <button
                    onClick={() => navigateTo('shop', 'acc_all')}
                    className="rounded-full border border-[#d4e1ee] px-7 py-3 text-sm font-semibold text-[#12314d] transition hover:bg-[#f5f9fd]"
                  >
                    Xem phụ kiện
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-[20px] bg-[#f7fbff] p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#80a1c3]">
                      Style
                    </div>
                    <div className="mt-2 text-lg font-bold text-[#18324d]">
                      Soft Blue UI
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-[#f7fbff] p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#80a1c3]">
                      Direction
                    </div>
                    <div className="mt-2 text-lg font-bold text-[#18324d]">
                      Premium Landing
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="grid gap-6 px-6 pb-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] bg-[#f5f9fe] p-5 sm:p-6">
                <div className="grid gap-5 sm:grid-cols-[1fr_1fr] sm:items-center">
                  <div className="overflow-hidden rounded-[24px] bg-white">
                    <img
                      src={sectionImage2}
                      alt="TRIMI mood"
                      className="h-[240px] w-full object-cover object-center sm:h-[280px]"
                      onError={(e) => {
                        e.currentTarget.style.opacity = '0';
                      }}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85a6c7]">
                      Fashion direction
                    </div>
                    <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#17324c] sm:text-3xl">
                      Giao diện trẻ, sang và có điểm nhấn
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[#6a7585]">
                      Phần này giúp trang đỡ trống hơn, nhìn giống một landing page
                      thiết kế chỉn chu thay vì chỉ là danh sách sản phẩm đơn thuần.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#eff6fd] p-5 sm:p-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#85a6c7]">
                  200+ item
                </div>
                <h3 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#17324c]">
                  New Arrivals
                </h3>

                <div className="mt-5 space-y-3 text-sm text-[#6a7585]">
                  <div>streetwear jacket</div>
                  <div>oversize tee</div>
                  <div>daily bag</div>
                  <div>essential outfit</div>
                </div>

                <button
                  onClick={() => navigateTo('shop', 'all')}
                  className="mt-6 rounded-full border border-[#cfe0ef] bg-white px-5 py-2.5 text-sm font-semibold text-[#12314d] transition hover:bg-[#f8fbfe]"
                >
                  View All →
                </button>

                <div className="mt-6 overflow-hidden rounded-[24px] bg-white">
                  <img
                    src={sectionImage3}
                    alt="TRIMI item"
                    className="h-[220px] w-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ARRIVALS BELOW */}
          <div className="mt-10">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6c89a8]">
                  Latest Pieces
                </div>
                <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#17324c] sm:text-4xl">
                  Sản phẩm nổi bật
                </h3>
              </div>

              <button
                onClick={() => navigateTo('shop', 'all')}
                className="rounded-full border border-white/70 bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#17324c] backdrop-blur-sm transition hover:bg-white"
              >
                Xem tất cả
              </button>
            </div>

            {newArrivals.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {newArrivals.map((product, index) => (
                  <div
                    key={product.id || index}
                    onClick={() =>
                      navigateTo('productDetail', product.category || 'all', product)
                    }
                    className="group cursor-pointer overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_14px_36px_rgba(28,54,84,0.07)]"
                  >
                    <div className="overflow-hidden bg-[#f5f9fe]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="aspect-[4/5] h-auto w-full object-cover object-center transition duration-700 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="p-4">
                      <h4 className="line-clamp-2 text-sm font-semibold leading-6 text-[#1b3148] sm:text-base">
                        {product.name}
                      </h4>
                      <p className="mt-2 text-sm text-[#6a7585]">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-white/70 bg-white px-6 py-14 text-center shadow-[0_14px_36px_rgba(28,54,84,0.07)]">
                <h3 className="text-xl font-bold text-[#17324c]">
                  Chưa có sản phẩm để hiển thị
                </h3>
                <p className="mt-3 text-sm text-[#6a7585]">
                  Hãy kiểm tra lại dữ liệu localProducts.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes bgFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(0, -18px, 0) scale(1.04);
          }
        }

        @keyframes badgeFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.94);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.08);
          }
        }

        @keyframes ringSpin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes particleMove {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-12px) translateX(6px);
            opacity: 0.9;
          }
        }

        .panel-shell {
          backdrop-filter: blur(8px);
        }

        .bg-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(80px);
          animation: bgFloat 7s ease-in-out infinite;
        }

        .bg-orb-1 {
          width: 260px;
          height: 260px;
          left: -60px;
          top: 180px;
          background: rgba(75, 152, 230, 0.16);
        }

        .bg-orb-2 {
          width: 320px;
          height: 320px;
          right: -40px;
          top: 120px;
          background: rgba(120, 183, 240, 0.18);
          animation-delay: 1.3s;
        }

        .bg-orb-3 {
          width: 280px;
          height: 280px;
          left: 26%;
          bottom: 40px;
          background: rgba(255, 255, 255, 0.4);
          animation-delay: 2.2s;
        }

        .floating-badge {
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.82);
          padding: 14px 22px;
          font-size: 14px;
          font-weight: 800;
          color: #17324c;
          box-shadow: 0 12px 30px rgba(34, 64, 98, 0.12);
          backdrop-filter: blur(10px);
          animation: badgeFloat 4s ease-in-out infinite;
        }

        .title-glow,
        .title-ring,
        .title-particles {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .title-glow {
          border-radius: 9999px;
          filter: blur(50px);
          animation: glowPulse 3.4s ease-in-out infinite;
        }

        .title-glow-1 {
          width: 320px;
          height: 160px;
          background: rgba(75, 152, 230, 0.22);
        }

        .title-glow-2 {
          width: 220px;
          height: 220px;
          background: rgba(255, 255, 255, 0.12);
          animation-delay: 0.8s;
        }

        .title-ring {
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          animation: ringSpin 18s linear infinite;
        }

        .title-ring-1 {
          width: 230px;
          height: 230px;
        }

        .title-ring-2 {
          width: 300px;
          height: 300px;
          border-style: dashed;
          animation-duration: 26s;
          opacity: 0.45;
        }

        .title-particles {
          width: 260px;
          height: 140px;
          animation: particleMove 4.4s ease-in-out infinite;
        }

        .title-particles::before,
        .title-particles::after {
          content: "✦";
          position: absolute;
          color: rgba(255, 255, 255, 0.85);
          font-size: 16px;
          text-shadow: 0 0 10px rgba(75, 152, 230, 0.65);
        }

        .title-particles-1::before {
          left: 20px;
          top: 10px;
        }

        .title-particles-1::after {
          right: 14px;
          bottom: 4px;
        }

        .title-particles-2 {
          animation-delay: 1.2s;
        }

        .title-particles-2::before {
          left: 46%;
          top: -16px;
        }

        .title-particles-2::after {
          right: 28%;
          top: 18px;
        }
      `}</style>
    </div>
  );
}