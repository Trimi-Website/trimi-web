import { FiMenu, FiSearch, FiShoppingCart, FiMessageCircle, FiX } from 'react-icons/fi';

export default function Header({
  currentView, isDarkMode, isHeaderVisible,
  searchQuery, setSearchQuery,
  isMobileSearchOpen, setIsMobileSearchOpen,
  cartItemCount, isAdmin, hasUnreadUser, totalAdminUnread,
  currentCategory, lang, t,
  navigateTo,
  setCurrentView,   // ← ADDED: needed for search so we don't call navigateTo
                    //   (navigateTo internally calls setSearchQuery('') which
                    //    would immediately erase what the user just typed)
  setIsCartOpen, setIsUnifiedMenuOpen, setIsHelpOpen,
  displayedProducts, t_prod,
}) {
  // ── Search handler ────────────────────────────────────────────────────────
  // Original monolithic code used setCurrentView('shop') here, NOT navigateTo.
  // navigateTo resets searchQuery to '' so the search would always self-clear.
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentView('shop');   // ← just switches the view; does NOT clear query
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] border-b flex-shrink-0 transition-all duration-500 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'} ${currentView === 'home' ? (isDarkMode ? 'bg-[#111111] border-slate-800' : 'bg-white border-slate-200') : (isDarkMode ? 'bg-[#111111] border-slate-800' : 'bg-white border-slate-200 shadow-sm')}`}>
      <div className={`max-w-[1400px] mx-auto px-4 md:px-8 transition-all duration-500 ${currentView === 'home' ? 'py-2' : 'pt-3 pb-0'}`}>

        {/* ── TOP BAR ── */}
        <div className={`flex items-center justify-between gap-3 md:gap-4 transition-all duration-500 ${currentView === 'home' ? 'pb-0' : 'pb-2 md:pb-3'}`}>

          {/* LEFT: Mobile menu button + Logo */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <button
              aria-label="Mở menu"
              onClick={() => setIsUnifiedMenuOpen(true)}
              className={`md:hidden p-1 transition-colors cursor-pointer ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            >
              <FiMenu className="text-[26px]" />
            </button>
            <h1
              className={`font-brush tracking-wide cursor-pointer transition-all duration-500 ${currentView === 'home' ? 'text-3xl md:text-4xl' : 'text-4xl md:text-[52px]'} ${isDarkMode ? 'text-white hover:text-sky-400' : 'text-slate-900 hover:text-sky-600'}`}
              onClick={() => navigateTo('home', 'all')}
              style={{ lineHeight: '1' }}
            >
              Trimi
            </h1>
          </div>

          {/* CENTER: Search bar (hidden on home) */}
          {currentView !== 'home' ? (
            <div className="flex relative flex-grow justify-end md:justify-center mx-2 md:mx-6 animate-fade-in">

              {/* PC search — always visible */}
              <div className="hidden md:flex relative w-full max-w-[400px]">
                <div className={`flex rounded-full w-full overflow-hidden border shadow-inner z-50 relative h-10 ${isDarkMode ? 'bg-white/10 border-slate-700 text-white focus-within:border-sky-500' : 'bg-slate-100 border-transparent focus-within:border-slate-300 focus-within:bg-white text-slate-800'}`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={t('search')}
                    className="w-full px-4 text-sm outline-none bg-transparent placeholder-slate-500 font-medium"
                  />
                  <button aria-label="Tìm kiếm" className="px-4 text-slate-400 hover:text-sky-500 transition-colors">
                    <FiSearch className="text-lg"/>
                  </button>
                </div>

                {/* Search suggestions dropdown */}
                {searchQuery && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 max-h-60 overflow-y-auto animate-fade-in-up">
                    {displayedProducts.length > 0 ? displayedProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => { setSearchQuery(''); navigateTo('productDetail', p.category, p); }}
                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <img src={p.imageUrl} className="w-10 h-10 object-cover rounded-md border border-slate-100" alt=""/>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800 line-clamp-1">{t_prod(p.id, 'name', p.name)}</p>
                          <p className="text-xs text-sky-600 font-black">{(Number(p.price) || 0).toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>
                    )) : (
                      <div className="px-4 py-3 text-sm text-slate-500 text-center font-medium">Không tìm thấy sản phẩm</div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile search — tap to expand */}
              <div className="md:hidden flex items-center justify-end w-full">
                {isMobileSearchOpen ? (
                  <div className={`flex rounded-full w-full overflow-hidden border shadow-inner z-50 relative h-9 ${isDarkMode ? 'bg-white/10 border-slate-700 text-white' : 'bg-slate-100 border-transparent text-slate-800'} animate-fade-in-right`}>
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onBlur={() => setTimeout(() => setIsMobileSearchOpen(false), 200)}
                      placeholder={t('search')}
                      className="w-full px-4 text-xs outline-none bg-transparent"
                    />
                    <button className="px-3 text-slate-400"><FiSearch/></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsMobileSearchOpen(true)}
                    className={`p-2 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-600'}`}
                  >
                    <FiSearch className="text-xl"/>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-grow"></div>
          )}

          {/* RIGHT: Chat (mobile) + Cart + Desktop menu */}
          <div className="flex items-center gap-2 md:gap-3 text-sm font-semibold text-slate-700 flex-shrink-0 relative z-[1001]">

            {/* Chat icon — mobile only, hidden when search is open */}
            {!isMobileSearchOpen && (
              <button
                aria-label="Mở hỗ trợ chat"
                onClick={() => setIsHelpOpen(true)}
                className={`md:hidden p-1 transition-colors relative cursor-pointer ${isDarkMode ? 'text-white hover:text-sky-400' : 'text-slate-900 hover:text-sky-600'}`}
              >
                <FiMessageCircle className="text-[22px]" />
                {(!isAdmin && hasUnreadUser) && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                )}
                {(isAdmin && totalAdminUnread > 0) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{totalAdminUnread}</span>
                )}
              </button>
            )}

            {/* Cart icon */}
            <div
              aria-label="Mở giỏ hàng"
              className={`flex items-center gap-2 cursor-pointer transition-colors relative group p-1 md:p-2 ${isDarkMode ? 'text-white hover:text-sky-400' : 'text-slate-900 hover:text-sky-600'}`}
              onClick={() => setIsCartOpen(true)}
            >
              <div id="header-cart-icon" className="relative transition-transform duration-300">
                <FiShoppingCart className={`${currentView === 'home' ? 'text-xl' : 'text-2xl'}`}/>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-sky-500 text-white w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full shadow-sm border border-white">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </div>

            {/* Desktop menu button */}
            <button
              aria-label="Mở menu"
              onClick={() => setIsUnifiedMenuOpen(true)}
              className={`hidden md:block p-1.5 md:p-2 transition-colors cursor-pointer relative z-[1100] ${isDarkMode ? 'text-white hover:text-sky-400' : 'text-slate-900 hover:text-sky-600'}`}
            >
              <FiMenu className={`${currentView === 'home' ? 'text-2xl' : 'text-3xl'}`} />
            </button>
          </div>
        </div>

        {/* ── CATEGORY SUB-NAV (hidden on home) ── */}
        <div className={`overflow-hidden transition-all duration-500 ${currentView === 'home' ? 'max-h-0 opacity-0' : 'max-h-[50px] opacity-100'}`}>
          <nav className="flex overflow-x-auto custom-scrollbar lg:justify-center gap-6 md:gap-2 text-[11px] md:text-[13px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-100 relative z-30 pb-2 md:pb-0 pt-2 md:pt-0 whitespace-nowrap">
            <div className="relative group cursor-pointer flex-shrink-0">
              <button
                onClick={() => navigateTo('shop', 'all')}
                className={`md:px-6 md:py-4 border-b-2 transition-colors ${currentView === 'shop' && currentCategory === 'all' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}
              >
                {t('shop')}
              </button>
            </div>
            <div className="relative group cursor-pointer flex-shrink-0">
              <button
                onClick={() => navigateTo('shop', 'shirt_all')}
                className={`md:px-6 md:py-4 border-b-2 transition-colors uppercase ${currentCategory.includes('shirt') ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}
              >
                {t('nav_shirt')}
              </button>
            </div>
            <div className="relative group cursor-pointer flex-shrink-0">
              <button
                onClick={() => navigateTo('shop', 'pants_all')}
                className={`md:px-6 md:py-4 border-b-2 transition-colors uppercase ${currentCategory.includes('pants') ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}
              >
                {t('nav_pants')}
              </button>
            </div>
            <div className="relative group cursor-pointer flex-shrink-0">
              <button
                onClick={() => navigateTo('shop', 'acc_all')}
                className={`md:px-6 md:py-4 border-b-2 transition-colors uppercase ${currentCategory.includes('acc') ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}
              >
                {t('nav_acc')}
              </button>
            </div>
          </nav>
        </div>

      </div>
    </header>
  );
}
