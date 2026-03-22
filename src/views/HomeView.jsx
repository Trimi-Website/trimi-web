import { FiShoppingCart } from 'react-icons/fi';

export default function HomeView({ isDarkMode, t, navigateTo, lookbook }) {
  return (
    <div className="w-full animate-fade-in relative">

      {/* ── ZONE 1: FIXED HERO BANNER ── */}
      <div className="fixed top-0 left-0 right-0 h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 overflow-hidden z-0 pt-[50px] md:pt-[60px]">

        {/* Full-bleed background images (light / dark swap) */}
        <div className="absolute inset-0 w-full h-full bg-[#0f172a]">
          <img
            src="/banner_model_light.webp"
            className={`absolute inset-0 w-full h-full object-cover object-right-top md:object-right transition-opacity duration-1000 ease-in-out ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
            alt="Trimi Light"
          />
          <img
            src="/banner_model_dark.webp"
            className={`absolute inset-0 w-full h-full object-cover object-right-top md:object-right transition-opacity duration-1000 ease-in-out ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
            alt="Trimi Dark"
          />
        </div>

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-black/50 md:bg-gradient-to-r md:from-black/90 md:to-transparent"></div>

        {/* Hero text */}
        <div className="relative z-10 w-full max-w-2xl mt-10 md:mt-0">
          <h1 className="text-[40px] md:text-7xl lg:text-8xl font-brush mb-6 leading-[1.1] text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
            <span className="whitespace-nowrap">Dám Khác Biệt.</span><br/>
            <span className="whitespace-nowrap">Dám Là Trimi.</span>
          </h1>
          <p className="mb-10 font-medium text-sm md:text-base leading-relaxed text-slate-200 drop-shadow-md max-w-lg">
            Chúng tôi tin rằng thời trang là ngôn ngữ không lời để thể hiện cá tính thực sự của bạn. Trải nghiệm sự khác biệt ngay hôm nay.
          </p>
          <button
            onClick={() => navigateTo('shop', 'all')}
            className="hero-buy-button flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            MUA NGAY <FiShoppingCart />
          </button>
        </div>
      </div>

      {/* ── ZONE 2: INVISIBLE SPACER (creates scroll room for the fixed banner) ── */}
      <div className="w-full h-screen bg-transparent pointer-events-none relative z-0"></div>

      {/* ── ZONE 3: SCROLLABLE CONTENT (slides up over the fixed banner) ── */}
      <div
        className={`relative z-10 w-full flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.8)] ${isDarkMode ? 'bg-[#111111]' : 'bg-[#f8fafc]'}`}
        style={{ marginTop: '100vh' }}
      >
        {/* LOOKBOOK GRID */}
        <div className="w-full flex md:grid md:grid-cols-5 overflow-x-auto snap-x snap-mandatory custom-scrollbar relative transition-all duration-300 bg-black h-[45vh] md:h-[70vh]">
          {lookbook.map((block) => (
            <div
              key={block.id}
              className="w-[80vw] md:w-full flex-shrink-0 h-full relative group cursor-pointer overflow-hidden border-r border-white/10 snap-center"
              onClick={() => navigateTo('shop', block.targetCategory || 'all')}
            >
              <img
                src={block.img}
                className="w-full h-full object-cover object-[center_top] transition-transform duration-[1.5s] ease-out opacity-80 group-hover:opacity-100 group-hover:scale-110"
                alt={block.title}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center md:items-end md:justify-start md:bottom-10 md:left-6 lg:left-8 z-10 pointer-events-none p-4">
                <h3 className="text-white text-center md:text-left text-2xl lg:text-3xl font-black uppercase tracking-widest transform md:translate-y-6 opacity-100 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 drop-shadow-md">
                  {block.title.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* SLOGAN */}
        <div className={`w-full py-16 md:py-24 px-6 text-center border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} transition-colors duration-300`}>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-brush mb-4 md:mb-6 text-sky-500 normal-case tracking-normal drop-shadow-sm px-2 break-words">
            {t('sloganTitle')}
          </h2>
          <p className={`max-w-xl mx-auto mb-10 font-medium text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('sloganDesc')}
          </p>
        </div>

      </div>
    </div>
  );
}
