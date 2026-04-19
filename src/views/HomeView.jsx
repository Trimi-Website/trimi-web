import {
  FiShoppingBag,
  FiTruck,
  FiMessageCircle,
  FiShield,
  FiArrowRight,
  FiInstagram,
  FiStar,
} from 'react-icons/fi';

/* ─── CSS injected once ─────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.trimi-hero-img { transition: transform 0.7s ease; }
.trimi-hero-wrap:hover .trimi-hero-img { transform: scale(1.03); }

/* buttons */
.trimi-btn-primary {
  display:inline-flex;align-items:center;gap:8px;
  background:#fff;color:#1a4fa0;
  border:none;border-radius:999px;
  padding:14px 28px;font-size:14px;font-weight:800;
  cursor:pointer;
  transition:transform .25s ease,box-shadow .25s ease,background .25s ease;
  will-change:transform;
}
.trimi-btn-primary:hover {
  transform:translateY(-3px);
  box-shadow:0 16px 36px rgba(0,0,0,0.28);
  background:#f0f7ff;
}
.trimi-btn-ghost {
  display:inline-flex;align-items:center;gap:8px;
  background:transparent;color:#fff;
  border:1.5px solid rgba(255,255,255,0.38);border-radius:999px;
  padding:14px 26px;font-size:14px;font-weight:700;
  cursor:pointer;
  transition:background .25s ease,border-color .25s ease,transform .25s ease;
  will-change:transform;
}
.trimi-btn-ghost:hover {
  background:rgba(255,255,255,0.14);
  border-color:#fff;
  transform:translateY(-2px);
}
.trimi-btn-accent {
  display:inline-flex;align-items:center;gap:8px;
  background:#2f80ed;color:#fff;
  border:none;border-radius:999px;
  padding:13px 26px;font-size:14px;font-weight:800;
  cursor:pointer;
  transition:transform .25s ease,box-shadow .25s ease,background .2s ease;
  will-change:transform;
}
.trimi-btn-accent:hover {
  transform:translateY(-3px);
  background:#1a66cc;
  box-shadow:0 12px 28px rgba(47,128,237,0.35);
}
.trimi-btn-outline {
  display:inline-flex;align-items:center;gap:8px;
  background:transparent;
  border-radius:999px;
  padding:13px 22px;font-size:14px;font-weight:700;
  cursor:pointer;
  transition:background .2s ease,border-color .2s ease,transform .2s ease;
  will-change:transform;
}
.trimi-btn-outline:hover {
  transform:translateY(-2px);
}

/* service cards */
.trimi-service-card {
  border-radius:22px;padding:20px 18px;
  display:flex;align-items:center;gap:14px;
  transition:transform .25s ease,box-shadow .25s ease;
  will-change:transform;
}
.trimi-service-card:hover {
  transform:translateY(-5px);
}

/* product cards */
.trimi-product-card {
  border-radius:22px;overflow:hidden;cursor:pointer;
  transition:transform .28s ease,box-shadow .28s ease;
  will-change:transform;
}
.trimi-product-card:hover {
  transform:translateY(-9px);
}
.trimi-product-img {
  width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .45s ease;
  will-change:transform;
}
.trimi-product-card:hover .trimi-product-img {
  transform:scale(1.07);
}

/* category buttons */
.trimi-cat-btn {
  border-radius:18px;padding:15px 16px;text-align:left;
  font-size:14px;font-weight:700;cursor:pointer;
  display:flex;align-items:center;justify-content:space-between;
  transition:border-color .22s ease,transform .22s ease,background .22s ease;
  will-change:transform;
}
.trimi-cat-btn:hover {
  transform:translateX(5px);
}

/* promo cards */
.trimi-promo-card {
  border-radius:28px;overflow:hidden;
  transition:transform .3s ease,box-shadow .3s ease;
  will-change:transform;
}
.trimi-promo-card:hover {
  transform:translateY(-6px);
}
`;

function injectCSS(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}

export default function HomeView({ isDarkMode, navigateTo, localProducts }) {
  injectCSS('trimi-home-css', CSS);

  const products = Array.isArray(localProducts) ? localProducts : [];
  const newArrivals = products.slice(0, 8);

  const categories = [
    { label: 'Áo Thun — Form chuẩn, vải cotton mềm', key: 'shirt_1' },
    { label: 'Áo Sơ Mi — Nhẹ, thoáng, dễ phối', key: 'shirt_2' },
    { label: 'Áo Khoác — Ấm nhẹ, phong cách thu đông', key: 'shirt_3' },
    { label: 'Quần Jeans — Co giãn 4 chiều, bền màu', key: 'pants_1' },
  ];

  const services = [
    { icon: <FiShoppingBag />, title: 'Dễ mua sắm', desc: 'Giao diện gọn, chọn đồ nhanh' },
    { icon: <FiTruck />, title: 'Giao hàng nhanh', desc: 'Nội thành Đà Nẵng linh hoạt' },
    { icon: <FiMessageCircle />, title: 'Tư vấn mix đồ', desc: 'Theo phong cách và vóc dáng bạn' },
    { icon: <FiShield />, title: 'Thanh toán an toàn', desc: 'Bảo mật, nhiều hình thức' },
  ];

  const stats = [
    { label: 'Chất liệu', value: 'Premium' },
    { label: 'Phong cách', value: 'Minimalist' },
    { label: 'Form dáng', value: 'Chuẩn Âu' },
    { label: 'Màu sắc', value: 'Trung tính' },
  ];

  const formatPrice = (price) => `${(Number(price) || 0).toLocaleString('vi-VN')} đ`;

  const bg = isDarkMode ? '#080e1a' : '#f4f7fc';
  const surface = isDarkMode ? '#0f1824' : '#ffffff';
  const surfaceSoft = isDarkMode ? '#16202e' : '#edf2fb';
  const border = isDarkMode ? 'rgba(255,255,255,0.07)' : '#e2e9f5';
  const borderHover = '#2f80ed';
  const textPrimary = isDarkMode ? '#f1f5fc' : '#0c1525';
  const textMuted = isDarkMode ? '#8aa0be' : '#5a7090';
  const accent = '#2f80ed';
  const accentDeep = '#1a4fa0';

  return (
    <div style={{ background: bg, color: textPrimary, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ── HERO ───────────────────────────────────────── */}
      <section style={{ padding: '24px 20px 0' }}>
        <div
          className="trimi-hero-wrap"
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            position: 'relative',
            borderRadius: 32,
            overflow: 'hidden',
            border: `1px solid ${border}`,
            boxShadow: isDarkMode
              ? '0 28px 80px rgba(0,0,0,0.45)'
              : '0 28px 80px rgba(12,21,37,0.13)',
            /* Fixed frame — 16:9 aspect ratio, no overflow */
            aspectRatio: '16 / 7',
            maxHeight: '88vh',
            background: '#0a1220',
          }}
        >
          <img
            className="trimi-hero-img"
            src="/cover-trimi.jpg"
            alt="TRIMI cover"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
            onError={(e) => { e.currentTarget.src = '/1.jpg'; }}
          />

          {/* gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(100deg, rgba(6,12,26,0.88) 0%, rgba(6,12,26,0.55) 45%, rgba(6,12,26,0.10) 100%)',
          }} />

          {/* ── TRIMI badge — RIGHT SIDE ── */}
          <div style={{
            position: 'absolute',
            top: 24,
            right: 24,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px 10px 10px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.20)',
            backdropFilter: 'blur(16px)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.09em',
            zIndex: 3,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 15,
            }}>T</div>
            TRIMI
          </div>

          {/* ── NEW COLLECTION chip — bottom right ── */}
          <div style={{
            position: 'absolute',
            right: 24,
            bottom: 24,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.20)',
            backdropFilter: 'blur(16px)',
            borderRadius: 20,
            padding: '14px 20px',
            color: '#fff',
            minWidth: 210,
            zIndex: 3,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', opacity: 0.8, marginBottom: 6 }}>
              BST MỚI — XUÂN HÈ 2026
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.25 }}>Dám Khác Biệt</div>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>Bộ sưu tập giới hạn từ TRIMI</div>
          </div>

          {/* ── Hero text — LEFT ── */}
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
          }}>
            <div style={{
              maxWidth: 600,
              padding: '0 28px 0 36px',
              color: '#fff',
            }}>
              {/* eyebrow */}
              <div style={{
                display: 'inline-block',
                padding: '7px 16px',
                borderRadius: 999,
                background: 'rgba(47,128,237,0.22)',
                border: '1px solid rgba(47,128,237,0.45)',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.18em',
                marginBottom: 20,
                color: '#7cc4ff',
              }}>
                TRIMI FASHION 2026
              </div>

              <h1 style={{
                margin: 0,
                fontSize: 'clamp(2rem, 4.5vw, 4.2rem)',
                lineHeight: 1.05,
                fontWeight: 900,
                letterSpacing: '-0.04em',
              }}>
                Chất liệu cao cấp.
                <br />
                <span style={{ color: '#7cc4ff' }}>Thiết kế tối giản.</span>
              </h1>

              <p style={{
                marginTop: 8,
                marginBottom: 0,
                fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.75)',
                letterSpacing: '-0.01em',
              }}>
                Thời trang hàng ngày — nhẹ, thoáng, dễ phối đồ.
              </p>

              <p style={{
                marginTop: 14,
                marginBottom: 0,
                fontSize: 14,
                lineHeight: 1.85,
                color: 'rgba(255,255,255,0.72)',
                maxWidth: 480,
              }}>
                Vải premium co giãn 4 chiều, form chuẩn Âu, màu sắc trung tính —&nbsp;
                TRIMI tạo ra những bộ đồ bạn muốn mặc mỗi ngày.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
                <button className="trimi-btn-primary" onClick={() => navigateTo('shop', 'all')}>
                  Khám phá ngay <FiArrowRight />
                </button>
                <button className="trimi-btn-ghost" onClick={() => navigateTo('shop', 'shirt_all')}>
                  Xem bộ sưu tập
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
                {['Vải Premium', 'Co giãn 4 chiều', 'Form chuẩn Âu', 'Dễ phối đồ'].map((tag) => (
                  <span key={tag} style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.09)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────── */}
      <section style={{ padding: '28px 20px 0' }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}>
          {services.map((item) => (
            <div
              key={item.title}
              className="trimi-service-card"
              style={{
                background: surface,
                border: `1px solid ${border}`,
                boxShadow: isDarkMode ? 'none' : '0 2px 12px rgba(12,21,37,0.05)',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                background: isDarkMode ? 'rgba(47,128,237,0.14)' : '#e8f1ff',
                color: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: textPrimary }}>{item.title}</div>
                <div style={{ fontSize: 13, color: textMuted, marginTop: 3 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STYLE / COLLECTION SPLIT ─────────────────── */}
      <section style={{ padding: '36px 20px 0' }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 22,
        }}>
          {/* Left — editorial image card */}
          <div
            className="trimi-promo-card"
            style={{
              position: 'relative',
              minHeight: 520,
              border: `1px solid ${border}`,
              background: surface,
            }}
          >
            <img
              src={products[1]?.imageUrl || '/2.jpg'}
              alt="TRIMI lookbook"
              style={{
                width: '100%', height: '100%',
                position: 'absolute', inset: 0,
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
              }}
              onError={(e) => { e.currentTarget.src = '/2.jpg'; }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.65) 100%)',
            }} />
            <div style={{ position: 'absolute', left: 28, right: 28, bottom: 28, color: '#fff' }}>
              <div style={{
                display: 'inline-block', padding: '6px 14px', borderRadius: 999,
                background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 14,
              }}>
                TRIMI LOOKBOOK
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.15 }}>
                Tối giản,<br />vẫn có điểm nhấn.
              </div>
              <p style={{
                margin: '12px 0 0', fontSize: 14, lineHeight: 1.75,
                color: 'rgba(255,255,255,0.82)', maxWidth: 420,
              }}>
                Mỗi sản phẩm TRIMI được chọn lọc kỹ — từ chất vải mềm mịn, đường may chuẩn
                đến bảng màu trung tính dễ phối với bất kỳ trang phục nào.
              </p>
            </div>
          </div>

          {/* Right — collection info + stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Collection card */}
            <div style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 28, padding: 30,
              boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(12,21,37,0.06)',
            }}>
              <div style={{
                display: 'inline-block', padding: '7px 14px', borderRadius: 999,
                background: isDarkMode ? 'rgba(47,128,237,0.16)' : '#e8f1ff',
                color: accent, fontSize: 11, fontWeight: 800, letterSpacing: '0.16em',
                marginBottom: 16,
              }}>
                BỘ SƯU TẬP
              </div>

              <h2 style={{
                margin: 0,
                fontSize: 'clamp(1.8rem, 2.8vw, 2.5rem)',
                fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em',
              }}>
                Mặc đẹp mỗi ngày,<br />
                <span style={{ color: accent }}>không cần cố gắng.</span>
              </h2>

              <p style={{
                marginTop: 14, marginBottom: 24,
                color: textMuted, fontSize: 14.5, lineHeight: 1.85,
              }}>
                Bộ sưu tập TRIMI 2026 lấy cảm hứng từ phong cách Âu châu hiện đại — thiết kế
                tinh gọn, chất liệu thở được, và form dáng tôn vóc dáng mọi người mặc.
              </p>

              <div style={{ display: 'grid', gap: 10 }}>
                {categories.map((item) => (
                  <button
                    key={item.key}
                    className="trimi-cat-btn"
                    onClick={() => navigateTo('shop', item.key)}
                    style={{
                      background: surfaceSoft,
                      color: textPrimary,
                      border: `1.5px solid ${border}`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = borderHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = border; }}
                  >
                    {item.label}
                    <FiArrowRight style={{ flexShrink: 0, opacity: 0.6 }} />
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
                <button className="trimi-btn-accent" onClick={() => navigateTo('shop', 'all')}>
                  Xem tất cả <FiArrowRight />
                </button>
                <button
                  className="trimi-btn-outline"
                  onClick={() => navigateTo('shop', 'acc_all')}
                  style={{ color: textPrimary, border: `1.5px solid ${border}` }}
                >
                  <FiInstagram /> Theo dõi TRIMI
                </button>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 28, padding: 24,
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14,
              boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(12,21,37,0.06)',
            }}>
              {stats.map((s) => (
                <div key={s.label} style={{
                  background: surfaceSoft, borderRadius: 18, padding: '18px 20px',
                  border: `1px solid ${border}`,
                }}>
                  <div style={{ fontSize: 11, color: textMuted, fontWeight: 700, letterSpacing: '0.1em' }}>
                    {s.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, marginTop: 8, color: textPrimary }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section style={{ padding: '40px 20px 60px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            {/* section header */}
            <div style={{
              display: 'flex', alignItems: 'flex-end',
              justifyContent: 'space-between', gap: 16,
              flexWrap: 'wrap', marginBottom: 24,
            }}>
              <div>
                <div style={{
                  fontSize: 11, color: textMuted, fontWeight: 800,
                  letterSpacing: '0.2em', marginBottom: 8,
                }}>
                  SẢN PHẨM NỔI BẬT
                </div>
                <h2 style={{
                  margin: 0,
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  fontWeight: 900, letterSpacing: '-0.03em',
                }}>
                  Được yêu thích nhất
                </h2>
              </div>
              <button
                className="trimi-btn-outline"
                onClick={() => navigateTo('shop', 'all')}
                style={{
                  color: textPrimary,
                  border: `1.5px solid ${border}`,
                  background: surface,
                  padding: '12px 22px',
                }}
              >
                Xem tất cả <FiArrowRight />
              </button>
            </div>

            {/* product grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: 18,
            }}>
              {newArrivals.map((product, index) => (
                <div
                  key={product.id || index}
                  className="trimi-product-card"
                  onClick={() => navigateTo('productDetail', product.category || 'all', product)}
                  style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    boxShadow: isDarkMode ? 'none' : '0 2px 14px rgba(12,21,37,0.06)',
                  }}
                >
                  {/* image */}
                  <div style={{
                    position: 'relative',
                    background: surfaceSoft,
                    aspectRatio: '4 / 5',
                    overflow: 'hidden',
                  }}>
                    <img
                      className="trimi-product-img"
                      src={product.imageUrl}
                      alt={product.name}
                    />
                    {/* badge */}
                    <div style={{
                      position: 'absolute', top: 12, left: 12,
                      background: 'rgba(255,255,255,0.93)',
                      color: accentDeep,
                      padding: '5px 10px', borderRadius: 999,
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    }}>
                      TRIMI
                    </div>
                    {/* rating */}
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'rgba(255,255,255,0.93)',
                      color: '#f59e0b',
                      padding: '5px 9px', borderRadius: 999,
                      fontSize: 11, fontWeight: 800,
                      display: 'flex', alignItems: 'center', gap: 4,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    }}>
                      <FiStar /> 4.9
                    </div>
                  </div>

                  {/* info */}
                  <div style={{ padding: '14px 16px 18px' }}>
                    <h3 style={{
                      margin: 0, fontSize: 14, fontWeight: 700,
                      lineHeight: 1.5, color: textPrimary,
                      display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', minHeight: 42,
                    }}>
                      {product.name}
                    </h3>
                    <div style={{
                      marginTop: 10, fontSize: 16,
                      fontWeight: 900, color: accent,
                    }}>
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}