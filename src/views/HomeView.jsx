import { useState } from 'react';
import { FiShoppingBag, FiTruck, FiMessageCircle, FiShield, FiArrowRight, FiInstagram, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function HomeView({ isDarkMode, navigateTo, localProducts }) {
  const products = Array.isArray(localProducts) ? localProducts : [];
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(0, 8);
  const [heroSlide, setHeroSlide] = useState(0);

  const heroSlides = [
    {
      image: '/cover-trimi.jpg',
      badge: 'NEW COLLECTION 2026',
      title: 'Dám Khác Biệt',
      subtitle: 'Dám TRIMI',
      desc: 'Phong cách riêng — không cần theo ai',
    },
    {
      image: featuredProducts[0]?.imageUrl || '/1.jpg',
      badge: 'FASHION DROP',
      title: 'Style Của Bạn',
      subtitle: 'Là Câu Chuyện',
      desc: 'Mỗi bộ outfit là một ngôn ngữ không lời',
    },
  ];

  const currentSlide = heroSlides[heroSlide];

  const services = [
    { icon: <FiShoppingBag />, title: 'Dễ Mua Sắm', desc: 'Chọn đồ theo gu' },
    { icon: <FiTruck />, title: 'Giao Hàng Nhanh', desc: 'Nội thành Đà Nẵng' },
    { icon: <FiMessageCircle />, title: 'Hỗ Trợ 24/7', desc: 'Gợi ý mix đồ' },
    { icon: <FiShield />, title: 'An Toàn', desc: 'Thanh toán bảo mật' },
  ];

  const categories = [
    { label: 'Áo Thun', key: 'shirt_1' },
    { label: 'Áo Sơ Mi', key: 'shirt_2' },
    { label: 'Áo Khoác', key: 'shirt_3' },
    { label: 'Quần Jeans', key: 'pants_1' },
  ];

  const formatPrice = (price) => `${(Number(price) || 0).toLocaleString('vi-VN')} đ`;

  const bg = isDarkMode ? '#0d1117' : '#ffffff';
  const surface = isDarkMode ? '#161b22' : '#f8f9fa';
  const border = isDarkMode ? '#30363d' : '#e9ecef';
  const textPrimary = isDarkMode ? '#f0f6fc' : '#0d1b2a';
  const textMuted = isDarkMode ? '#8b949e' : '#6c757d';
  const accent = '#1a5c8f';
  const accentLight = isDarkMode ? '#1f3f5e' : '#e8f1f8';

  return (
    <div style={{ background: bg, color: textPrimary, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', width: '100%', height: '92vh', minHeight: 500, overflow: 'hidden' }}>
        <img
          src={currentSlide.image}
          alt="TRIMI hero"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', transition: 'opacity 0.6s ease' }}
          onError={(e) => { e.currentTarget.src = '/1.jpg'; }}
        />
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,30,50,0.78) 0%, rgba(10,30,50,0.45) 60%, transparent 100%)' }} />

        {/* Floating brand badge - top right */}
        <div style={{
          position: 'absolute', top: 32, right: 32,
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 50, padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
        }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>T</div>
          TRIMI BRAND
        </div>

        {/* Floating label - bottom right */}
        <div style={{
          position: 'absolute', bottom: 40, right: 32,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 8, padding: '8px 18px',
          color: accent, fontSize: 12, fontWeight: 800, letterSpacing: '0.18em',
        }}>
          TRIMI
        </div>

        {/* Hero text */}
        <div style={{ position: 'absolute', bottom: 100, left: '6%', maxWidth: 560, color: '#fff' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 50,
            padding: '5px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', marginBottom: 20,
          }}>
            {currentSlide.badge}
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.08, margin: 0, letterSpacing: '-0.03em' }}>
            {currentSlide.title}<br />
            <span style={{ color: '#60a5fa' }}>{currentSlide.subtitle}</span>
          </h1>
          <p style={{ marginTop: 16, fontSize: 16, opacity: 0.8, fontWeight: 400, lineHeight: 1.6 }}>
            {currentSlide.desc}
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigateTo('shop', 'all')}
              style={{
                background: '#fff', color: accent,
                border: 'none', borderRadius: 50, padding: '13px 28px',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              Khám Phá Ngay <FiArrowRight />
            </button>
            <button
              onClick={() => navigateTo('shop', 'shirt_all')}
              style={{
                background: 'transparent', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 50, padding: '13px 28px',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
            >
              Sưu Tập
            </button>
          </div>
        </div>

        {/* Slide controls */}
        <div style={{ position: 'absolute', bottom: 40, left: '6%', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setHeroSlide((heroSlide - 1 + heroSlides.length) % heroSlides.length)}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
            <FiChevronLeft />
          </button>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>
            {String(heroSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
          </span>
          <button onClick={() => setHeroSlide((heroSlide + 1) % heroSlides.length)}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
            <FiChevronRight />
          </button>
        </div>
      </section>

      {/* ── SERVICES STRIP ── */}
      <section style={{ background: surface, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          {services.map((s) => (
            <div key={s.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px', borderRadius: 12, transition: 'background 0.2s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? '#1f2937' : '#edf4fb'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ fontSize: 22, color: accent }}>{s.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: textPrimary, textAlign: 'center' }}>{s.title}</div>
              <div style={{ fontSize: 12, color: textMuted, textAlign: 'center' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE SECTION ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>

          {/* Left: image with slide counter */}
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: surface, aspectRatio: '4/3' }}>
            <img
              src={featuredProducts[0]?.imageUrl || '/1.jpg'}
              alt="TRIMI feature"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
              onError={e => { e.currentTarget.src = '/1.jpg'; }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            <div style={{
              position: 'absolute', bottom: 16, right: 16,
              background: 'rgba(255,255,255,0.95)', borderRadius: 50,
              padding: '6px 14px', fontSize: 12, fontWeight: 700, color: accent,
            }}>
              208 +
            </div>
            {/* Nav dots */}
            <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: i === 0 ? 20 : 6, height: 6, borderRadius: 3, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'width 0.3s' }} />
              ))}
            </div>
          </div>

          {/* Right: text */}
          <div>
            <div style={{
              display: 'inline-block', background: accentLight, color: accent,
              borderRadius: 50, padding: '5px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 20,
            }}>
              TRIMI STYLE CONCEPT
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-0.03em', color: textPrimary }}>
              Phụ kiện tinh tế<br />giúp outfit nổi bật hơn
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: textMuted, maxWidth: 420 }}>
              Khám phá bộ sưu tập phụ kiện & thời trang được chọn lọc kỹ càng — kết hợp hiện đại và cá tính, dễ phối mọi outfit.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigateTo('shop', 'all')}
                style={{
                  background: accent, color: '#fff', border: 'none', borderRadius: 50,
                  padding: '12px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(26,92,143,0.3)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                Shop Now <FiArrowRight />
              </button>
              <button
                onClick={() => navigateTo('shop', 'acc_all')}
                style={{
                  background: 'transparent', color: textPrimary,
                  border: `1.5px solid ${border}`, borderRadius: 50,
                  padding: '12px 26px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textPrimary; }}
              >
                <FiInstagram /> Follow Instagram
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES + PRODUCTS ── */}
      <section style={{ background: surface, borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

            {/* Left: big product image */}
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '3/4', background: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
              <img
                src={featuredProducts[1]?.imageUrl || '/2.jpg'}
                alt="TRIMI product"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s' }}
                onError={e => { e.currentTarget.src = '/2.jpg'; }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <button
                onClick={() => navigateTo('shop', 'all')}
                style={{
                  position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(255,255,255,0.95)', color: accent,
                  border: 'none', borderRadius: 50, padding: '10px 22px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  whiteSpace: 'nowrap',
                }}>
                View All <FiArrowRight />
              </button>
            </div>

            {/* Right: category list + product grid */}
            <div>
              <div style={{
                background: isDarkMode ? '#1e293b' : '#fff',
                border: `1px solid ${border}`, borderRadius: 20, padding: 28, marginBottom: 24,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.18em', marginBottom: 8 }}>200+ items</div>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 20px', letterSpacing: '-0.04em', color: textPrimary }}>Bộ Sưu Tập</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {categories.map((c) => (
                    <button key={c.key} onClick={() => navigateTo('shop', c.key)}
                      style={{
                        background: 'none', border: 'none', padding: '8px 0',
                        borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', cursor: 'pointer', color: textMuted,
                        fontSize: 14, fontWeight: 500, textAlign: 'left', transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = accent; }}
                      onMouseLeave={e => { e.currentTarget.style.color = textMuted; }}>
                      {c.label}
                      <FiArrowRight style={{ opacity: 0.5 }} />
                    </button>
                  ))}
                </div>
                <button onClick={() => navigateTo('shop', 'all')}
                  style={{
                    marginTop: 20, background: 'none', border: 'none', color: accent,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0,
                  }}>
                  View All <FiArrowRight />
                </button>
              </div>

              {/* Mini product grid */}
              {featuredProducts[2] && (
                <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3', background: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                  <img
                    src={featuredProducts[2]?.imageUrl || '/3.jpg'}
                    alt="TRIMI item"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s' }}
                    onError={e => { e.currentTarget.src = '/3.jpg'; }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS GRID ── */}
      {newArrivals.length > 0 && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: textMuted, letterSpacing: '0.2em', marginBottom: 6 }}>LATEST PIECES</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.04em', color: textPrimary }}>Sản Phẩm Nổi Bật</h2>
            </div>
            <button onClick={() => navigateTo('shop', 'all')}
              style={{
                background: 'none', border: `1.5px solid ${border}`, borderRadius: 50,
                padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                color: textPrimary, display: 'flex', alignItems: 'center', gap: 6, transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textPrimary; }}>
              Xem tất cả <FiArrowRight />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {newArrivals.map((product, index) => (
              <div key={product.id || index}
                onClick={() => navigateTo('productDetail', product.category || 'all', product)}
                style={{
                  background: isDarkMode ? '#161b22' : '#fff',
                  border: `1px solid ${border}`,
                  borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,${isDarkMode ? 0.3 : 0.1})`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ background: isDarkMode ? '#1e293b' : '#f8f9fa', aspectRatio: '4/5', overflow: 'hidden' }}>
                  <img src={product.imageUrl} alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: textPrimary, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: accent }}>{formatPrice(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}