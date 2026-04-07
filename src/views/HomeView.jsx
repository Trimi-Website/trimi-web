export default function HomeView({ isDarkMode, navigateTo, localProducts }) {
  // Lấy đúng 8 sản phẩm mới nhất từ Database thật
  const newArrivals = localProducts ? localProducts.slice(0, 8) : [];

  return (
    <div className={`w-full animate-fade-in ${isDarkMode ? 'bg-[#111111] text-white' : 'bg-white text-[#1a1a1a]'}`}>
      
      {/* ── HERO BANNER ── */}
      <div className="w-full h-[85vh] relative flex items-center bg-[#3c78a9]">
        {/* 👉 TÊN ẢNH BÌA: mixtas_hero_models.png */}
        <img
          src="/mixtas_hero_models.png" 
          className="absolute right-0 bottom-0 h-[90%] md:h-[100%] object-contain"
          alt="Models"
          onError={(e) => e.target.style.display = 'none'} // Ẩn nếu cậu chưa bỏ ảnh vào
        />
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 text-white">
          <p className="text-sm font-medium tracking-widest uppercase mb-4">URBAN EDGE</p>
          <h1 className="text-5xl md:text-[80px] font-bold mb-10 leading-[1.1] tracking-tight drop-shadow-lg">
            Jackets for the <br/> Modern Man
          </h1>
          <button onClick={() => navigateTo('shop', 'all')} className="bg-white text-black px-8 py-4 text-sm font-bold uppercase transition-transform hover:scale-105 shadow-xl">
            Discovery Now
          </button>
        </div>
      </div>

      {/* ── NEW ARRIVALS (DATA THẬT, CLICK ĐƯỢC) ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-normal mb-8">New Arrivals</h2>
        
        <div className="flex justify-center gap-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-12">
          <span className="text-black border-b border-black pb-1 cursor-pointer">All</span>
          <span className="cursor-pointer hover:text-black transition-colors" onClick={() => navigateTo('shop', 'shirt_all')}>Shirts</span>
          <span className="cursor-pointer hover:text-black transition-colors" onClick={() => navigateTo('shop', 'pants_all')}>Pants</span>
          <span className="cursor-pointer hover:text-black transition-colors" onClick={() => navigateTo('shop', 'acc_all')}>Accessories</span>
        </div>
        
        {/* LƯỚI SẢN PHẨM THẬT */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-left">
          {newArrivals.map((p) => (
            <div key={p.id} className="group cursor-pointer flex flex-col mb-4" onClick={() => navigateTo('productDetail', p.category, p)}>
              <div className="w-full aspect-[4/5] bg-slate-100 mb-3 flex items-center justify-center p-0 rounded-xl overflow-hidden relative">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">TRIMI</p>
              <h3 className="text-xs md:text-sm font-bold text-gray-800 mb-1 leading-relaxed line-clamp-2">{p.name}</h3>
              <div className="flex justify-between items-center mt-auto pt-1">
                <span className="text-sm font-black text-sky-600">{(Number(p.price) || 0).toLocaleString('vi-VN')}đ</span>
                {p.rating && <span className="text-black tracking-widest text-[10px]">★★★★★</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MASONRY PROMO ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-20">
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[500px]">

          {/* CỘT TRÁI */}
          <div className="w-full lg:w-1/2 bg-[#f2f4f5] flex flex-col justify-center items-start p-10 relative overflow-hidden group cursor-pointer" onClick={() => navigateTo('shop', 'shirt_all')}>
            {/* 👉 TÊN ẢNH: promo_left.jpg */}
            <img src="/promo_left.jpg" className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-multiply group-hover:scale-105 transition-transform duration-700" alt="" onError={(e) => e.target.style.display = 'none'} />
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">ETHEREAL ELEGANCE</p>
              <h3 className="text-4xl md:text-5xl font-medium mb-8 text-black leading-tight">Where Dreams <br/>Meet Couture</h3>
              <button className="bg-white text-black px-6 py-3 text-xs font-bold shadow-sm">Shop Now</button>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            {/* Nửa trên */}
            <div className="flex-1 bg-[#f3f4f6] flex flex-col justify-center items-start p-8 relative overflow-hidden group cursor-pointer" onClick={() => navigateTo('shop', 'pants_all')}>
               {/* 👉 TÊN ẢNH: promo_right_top.jpg */}
               <img src="/promo_right_top.jpg" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-multiply group-hover:scale-105 transition-transform duration-700" alt="" onError={(e) => e.target.style.display = 'none'} />
               <div className="relative z-10">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">RADIANT REVERIE</p>
                 <h3 className="text-[26px] font-medium mb-4 text-black leading-tight">Enchanting Styles <br/>for Every Woman</h3>
                 <button className="bg-white text-black px-6 py-2 text-xs font-bold shadow-sm">Shop Now</button>
               </div>
            </div>

            {/* Nửa dưới chia 2 */}
            <div className="flex-1 flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-white border border-gray-200 flex flex-col justify-center items-center p-6 text-center cursor-pointer" onClick={() => navigateTo('shop', 'all')}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">URBAN STRIDES</p>
                <h3 className="text-lg font-medium text-black mb-3">Chic Footwear <br/>for City Living</h3>
                <button className="border border-black text-black px-6 py-2 text-[10px] font-bold uppercase mt-auto">Shop Now</button>
              </div>

              <div className="flex-1 bg-[#4a6b82] text-white flex flex-col justify-center items-center text-center p-6 cursor-pointer" onClick={() => navigateTo('shop', 'acc_all')}>
                <h3 className="text-[16px] font-medium mb-1 leading-snug">Trendsetting Bags <br/> For Her</h3>
                <p className="text-[55px] font-brush mb-3">50%</p>
                <button className="bg-white text-black px-6 py-2 text-[10px] font-bold uppercase">Shop Now</button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}