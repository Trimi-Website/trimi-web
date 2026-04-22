import React from "react";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 21L16.65 16.65M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 18.5H7C5.34315 18.5 4 17.1569 4 15.5V8.5C4 6.84315 5.34315 5.5 7 5.5H17C18.6569 5.5 20 6.84315 20 8.5V15.5C20 17.1569 18.6569 18.5 17 18.5H12.5L8.5 21V18.5H8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 4H5.2L7 14H18.3L20.2 7H8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7H20M4 12H20M4 17H20"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header() {
  const categories = ["TẤT CẢ", "ÁO", "QUẦN", "LINH KIỆN"];

  return (
    <>
      <header className="trimi-header">
        <div className="trimi-header__inner">
          <div className="trimi-header__top">
            <a href="/" className="trimi-header__logo" aria-label="TRIMI">
              <img src="/apple-touch-icon.png" alt="TRIMI" />
            </a>

            <div className="trimi-header__search">
              <input type="text" placeholder="Tìm kiếm..." />
              <button type="button" aria-label="Tìm kiếm">
                <SearchIcon />
              </button>
            </div>

            <div className="trimi-header__actions">
              <button type="button" className="trimi-icon-btn" aria-label="Tin nhắn">
                <MessageIcon />
              </button>

              <button type="button" className="trimi-icon-btn trimi-cart-btn" aria-label="Giỏ hàng">
                <CartIcon />
                <span className="trimi-cart-badge">1</span>
              </button>

              <button type="button" className="trimi-icon-btn" aria-label="Menu">
                <MenuIcon />
              </button>
            </div>
          </div>

          <nav className="trimi-header__nav">
            {categories.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`trimi-nav-btn ${index === 0 ? "active" : ""}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <style>{`
        .trimi-header {
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #eceff3;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .trimi-header__inner {
          max-width: 1680px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .trimi-header__top {
          min-height: 128px;
          display: grid;
          grid-template-columns: 180px minmax(360px, 520px) 180px;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border-bottom: 1px solid #eef1f5;
        }

        .trimi-header__logo {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          text-decoration: none;
        }

        .trimi-header__logo img {
          width: 112px;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .trimi-header__search {
          width: 100%;
          max-width: 520px;
          justify-self: center;
          position: relative;
        }

        .trimi-header__search input {
          width: 100%;
          height: 52px;
          border: 1px solid #e8edf4;
          outline: none;
          border-radius: 999px;
          background: #f3f6fa;
          padding: 0 58px 0 22px;
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
          transition: all 0.2s ease;
        }

        .trimi-header__search input::placeholder {
          color: #9aa4b2;
        }

        .trimi-header__search input:focus {
          background: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
        }

        .trimi-header__search button {
          position: absolute;
          top: 50%;
          right: 16px;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border: 0;
          background: transparent;
          color: #9aa4b2;
          padding: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .trimi-header__search button svg {
          width: 22px;
          height: 22px;
        }

        .trimi-header__actions {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .trimi-icon-btn {
          position: relative;
          width: 34px;
          height: 34px;
          border: 0;
          background: transparent;
          color: #111827;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .trimi-icon-btn:hover {
          transform: translateY(-1px);
          opacity: 0.9;
        }

        .trimi-icon-btn svg {
          width: 27px;
          height: 27px;
        }

        .trimi-cart-btn svg {
          width: 29px;
          height: 29px;
        }

        .trimi-cart-badge {
          position: absolute;
          top: 1px;
          right: -1px;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #2f80ed;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          line-height: 18px;
          text-align: center;
          padding: 0 4px;
          box-shadow: 0 0 0 2px #ffffff;
        }

        .trimi-header__nav {
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 56px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .trimi-header__nav::-webkit-scrollbar {
          display: none;
        }

        .trimi-nav-btn {
          border: 0;
          background: transparent;
          padding: 0;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.16em;
          color: #7d8795;
          cursor: pointer;
          transition: color 0.2s ease, transform 0.2s ease;
          white-space: nowrap;
        }

        .trimi-nav-btn:hover {
          color: #1f2937;
          transform: translateY(-1px);
        }

        .trimi-nav-btn.active {
          color: #111827;
        }

        @media (max-width: 1024px) {
          .trimi-header__top {
            grid-template-columns: 1fr;
            min-height: auto;
            gap: 18px;
            padding: 20px 0;
          }

          .trimi-header__logo {
            justify-content: center;
          }

          .trimi-header__search {
            max-width: 100%;
          }

          .trimi-header__actions {
            justify-self: center;
          }

          .trimi-header__nav {
            justify-content: flex-start;
            gap: 32px;
            min-height: 54px;
          }
        }

        @media (max-width: 640px) {
          .trimi-header__inner {
            padding: 0 16px;
          }

          .trimi-header__logo img {
            width: 96px;
          }

          .trimi-header__search input {
            height: 48px;
            font-size: 15px;
          }

          .trimi-header__actions {
            gap: 14px;
          }

          .trimi-icon-btn svg {
            width: 24px;
            height: 24px;
          }

          .trimi-header__nav {
            gap: 24px;
          }

          .trimi-nav-btn {
            font-size: 13px;
            letter-spacing: 0.12em;
          }
        }
      `}</style>
    </>
  );
}