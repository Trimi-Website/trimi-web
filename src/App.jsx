import { useState, useEffect } from 'react';

// Đã import thêm icon mạng xã hội cho Footer và ĐẢM BẢO ĐỦ TẤT CẢ ICON
import { 
  FiMenu, FiMail, FiLock, FiLogOut, FiShoppingCart, FiSearch, 
  FiUser, FiStar, FiTruck, FiShield, FiCornerUpLeft, FiX, 
  FiTrash2, FiCheckCircle, FiRefreshCcw, FiSettings, 
  FiPlus, FiUploadCloud, FiArchive, FiCamera, FiEdit3, FiSave, FiMove, FiImage,
  FiInstagram, FiYoutube, FiLinkedin, FiTwitter
} from 'react-icons/fi';
import { BiCloset } from 'react-icons/bi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

// Firebase
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [userRole, setUserRole] = useState(''); 
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  const [localProducts, setLocalProducts] = useState([]);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(''); 

  const isAdmin = user?.email === 'phanbasongtoan112@gmail.com';
  const [showAddModal, setShowAddModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [newProd, setNewProd] = useState({ name: '', price: '', desc: '', imagePreview: null });
  
  // === ĐÃ FIX LỖI TRẮNG TRANG: KHAI BÁO ĐẦY ĐỦ BANNER IMAGE ===
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [bannerConfig, setBannerConfig] = useState({ x: 0, y: 0, scale: 1 });
  const [bannerImage, setBannerImage] = useState(() => localStorage.getItem('trimi_banner_img') || '/banner.png');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const defaultLookbook = [
    { id: 1, title: 'Men Collection', img: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=800&auto=format&fit=crop' },
    { id: 2, title: 'Streetwear', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
    { id: 3, title: 'Accessories', img: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800&auto=format&fit=crop' },
    { id: 4, title: 'New Arrivals', img: 'https://images.unsplash.com/photo-1529139574466-a303027c028b?q=80&w=800&auto=format&fit=crop' },
  ];
  const [lookbook, setLookbook] = useState(defaultLookbook);

  // === TÍCH HỢP FACEBOOK MESSENGER ===
  useEffect(() => {
    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.appendChild(fbRoot);
    }
    window.fbAsyncInit = function() {
      window.FB.init({ xfbml: true, version: 'v18.0' });
    };
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = 'https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  // ÉP CUỘN TRANG
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://fakestoreapi.com/products/category/men's%20clothing");
        const data = await response.json();
        const formattedProducts = data.map((item) => ({
          id: item.id.toString(),
          name: item.title,
          price: item.price, 
          rating: item.rating.rate,
          reviews: item.rating.count,
          imageUrl: item.image,
          description: item.description
        }));
        setLocalProducts(formattedProducts);
        setIsLoadingShop(false);
      } catch (error) { console.error(error); setIsLoadingShop(false); }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const savedLookbook = localStorage.getItem('trimi_lookbook');
    if (savedLookbook) setLookbook(JSON.parse(savedLookbook));

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        
        const localBanner = localStorage.getItem('trimi_banner');
        if (localBanner) setBannerConfig(JSON.parse(localBanner));
        
        const localAvatar = localStorage.getItem(`trimi_avatar_${currentUser.uid}`);
        if (localAvatar) setAvatarUrl(localAvatar); else setAvatarUrl('');
        
        const localCover = localStorage.getItem(`trimi_cover_${currentUser.uid}`);
        if (localCover) setCoverUrl(localCover); else setCoverUrl('');

        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            if (docSnap.data().role) setUserRole(docSnap.data().role); else setShowSurveyModal(true);
          } else { setShowSurveyModal(true); }
        } catch (error) { console.warn(error); }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setAvatarUrl('');
        setCoverUrl('');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin && currentView === 'admin') {
      const fetchUsers = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "users"));
          const usersData = [];
          querySnapshot.forEach((doc) => { usersData.push({ uid: doc.id, ...doc.data() }); });
          setUsersList(usersData);
        } catch (err) { console.warn(err); }
      };
      fetchUsers();
    }
  }, [isAdmin, currentView]);

  const requireLogin = (action) => {
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    action();
  };

  const handleEmailAuth = async () => {
    if (!email || !email.includes('@')) return alert("Vui lòng nhập email hợp lệ.");
    if (password.length < 6) return alert("Mật khẩu ít nhất 6 ký tự!");
    try {
      if (authMode === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) { alert("Lỗi hệ thống: " + error.message); }
  };

  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (error) { console.error(error); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentView('home'); 
  };

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); };

  const handleProfileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if(type === 'avatar') { setAvatarUrl(base64String); localStorage.setItem(`trimi_avatar_${user.uid}`, base64String); }
      if(type === 'cover') { setCoverUrl(base64String); localStorage.setItem(`trimi_cover_${user.uid}`, base64String); }
      showToast('Đã lưu ảnh thành công!');
    };
    reader.readAsDataURL(file);
  };

  const handleLookbookUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const updatedLookbook = [...lookbook];
      updatedLookbook[index].img = base64String;
      setLookbook(updatedLookbook);
      localStorage.setItem('trimi_lookbook', JSON.stringify(updatedLookbook));
      showToast('Đã cập nhật ảnh trang chủ!');
    };
    reader.readAsDataURL(file);
  };

  // BANNER HÀM XỬ LÝ ẢNH MỚI
  const handleBannerImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setBannerImage(base64String);
      localStorage.setItem('trimi_banner_img', base64String);
      showToast('Đã tải ảnh lên thành công!');
    };
    reader.readAsDataURL(file);
  };

  const handleBannerMouseDown = (e) => {
    if (!isEditingBanner) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - bannerConfig.x, y: e.clientY - bannerConfig.y });
  };
  const handleBannerMouseMove = (e) => {
    if (!isDragging || !isEditingBanner) return;
    setBannerConfig({ ...bannerConfig, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleBannerMouseUp = () => { setIsDragging(false); };
  const handleBannerWheel = (e) => {
    if (!isEditingBanner) return;
    e.preventDefault(); 
    const scaleChange = e.deltaY > 0 ? -0.1 : 0.1;
    setBannerConfig(prev => ({ ...prev, scale: Math.max(0.3, prev.scale + scaleChange) }));
  };
  const handleSaveBanner = () => {
    setIsEditingBanner(false);
    localStorage.setItem('trimi_banner', JSON.stringify(bannerConfig));
    showToast('Đã lưu giao diện Banner!');
  };

  const handleAddToCart = (item, e) => {
    e.stopPropagation(); 
    requireLogin(() => {
      setCart((prevCart) => {
        const existingItem = prevCart.find(i => i.id === item.id);
        if (existingItem) return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...prevCart, { ...item, quantity: 1 }];
      });
      showToast('Đã thêm vào giỏ hàng');
    });
  };

  const updateCartQuantity = (id, delta) => setCart(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
  const cartItemCount = cart.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = cart.reduce((t, i) => t + (i.price * i.quantity), 0).toFixed(2);

  const handleDeleteProduct = (id) => {
    if(window.confirm("Xóa sản phẩm này khỏi hệ thống?")) {
      setLocalProducts(localProducts.filter(p => p.id !== id));
      showToast('Đã xóa sản phẩm!');
    }
  };

  const handleSubmitNewProduct = () => {
    if (!newProd.name || !newProd.price || !newProd.imagePreview) return alert("Điền đủ Tên, Giá và Ảnh!");
    const product = { id: Date.now().toString(), name: newProd.name, price: parseFloat(newProd.price), rating: 5.0, reviews: 0, imageUrl: newProd.imagePreview, description: newProd.desc || 'Sản phẩm chính hãng.' };
    setLocalProducts([product, ...localProducts]);
    setShowAddModal(false);
    setNewProd({ name: '', price: '', desc: '', imagePreview: null });
    showToast('Đã thêm sản phẩm lên cửa hàng!');
  };

  const fakeColorSpheres = ['from-white to-slate-300', 'from-zinc-700 to-black', 'from-amber-200 to-amber-600', 'from-sky-300 to-sky-600'];
  const surveyRoles = ["Tín đồ Thời trang", "Thiết kế viên", "Sinh viên", "Chủ doanh nghiệp", "Khác"];

  return (
    <>
      <style>{`
        html, body, #root {
          overflow: visible !important;
          overflow-y: auto !important;
          height: auto !important;
          min-height: 100vh !important;
        }
      `}</style>

      <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col relative">
        
        {/* COMPONENT CHAT CỦA FACEBOOK SẼ ĐƯỢC NHÚNG VÀO ĐÂY */}
        <div className="fb-customerchat" attribution="biz_inbox" page_id="61578555688928"></div>

        {toastMsg && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 flex items-center justify-center z-[5000] shadow-2xl animate-fade-in-up rounded-full pointer-events-none">
             <FiCheckCircle className="text-xl mr-2 text-emerald-400"/>
             <p className="font-semibold text-sm tracking-wide">{toastMsg}</p>
          </div>
        )}

        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
           <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
              <div className="flex items-center gap-8 w-full md:w-auto">
                 <h1 className="text-3xl font-black tracking-tighter cursor-pointer text-slate-900 flex items-center gap-1" onClick={() => setCurrentView('home')}>
                   Trimi.
                 </h1>
                 <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600 uppercase tracking-widest">
                   <button onClick={() => setCurrentView('home')} className={`pb-1 border-b-2 transition-colors ${currentView === 'home' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>Trang chủ</button>
                   <button onClick={() => setCurrentView('shop')} className={`pb-1 border-b-2 transition-colors ${currentView === 'shop' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>Cửa hàng</button>
                   <button className="pb-1 border-b-2 border-transparent hover:text-slate-900 transition-colors">Nam</button>
                   <button className="pb-1 border-b-2 border-transparent hover:text-slate-900 transition-colors">Nữ</button>
                   <button className="pb-1 border-b-2 border-transparent hover:text-slate-900 transition-colors">Bộ sưu tập</button>
                 </nav>
                 <div className="flex md:hidden items-center gap-4 text-slate-800 ml-auto">
                    {isAuthenticated ? (
                      <>
                        <button onClick={() => setCurrentView('profile')} className="text-slate-800"><FiUser className="text-2xl"/></button>
                        <div className="relative p-1 cursor-pointer" onClick={() => setIsCartOpen(true)}>
                          <FiShoppingCart className="text-2xl"/>
                          {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-sky-500 text-white w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full">{cartItemCount}</span>}
                        </div>
                      </>
                    ) : (
                      <button onClick={() => setShowLoginModal(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold">Đăng nhập</button>
                    )}
                 </div>
              </div>

              <div className="w-full md:w-auto md:max-w-[250px] flex-grow lg:mx-6 flex bg-slate-100 rounded-full h-10 overflow-hidden border border-transparent focus-within:border-slate-300 focus-within:bg-white transition-all shadow-inner">
                 <input type="text" placeholder="Tìm kiếm trang phục..." className="w-full px-4 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400 font-medium"/>
                 <button className="px-4 text-slate-500 hover:text-sky-500 transition-colors"><FiSearch className="text-lg"/></button>
              </div>

              <div className="hidden md:flex gap-6 items-center text-sm font-semibold text-slate-700">
                 {isAuthenticated ? (
                   <>
                     <button onClick={() => setCurrentView('profile')} className="flex items-center gap-2 hover:text-sky-600 transition-colors">
                        {avatarUrl ? <img src={avatarUrl} className="w-7 h-7 rounded-full object-cover border border-slate-200"/> : <FiUser className="text-xl"/>}
                        Tài khoản {isAdmin && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-1">Admin</span>}
                     </button>
                     <div className="flex items-center gap-2 cursor-pointer hover:text-sky-600 transition-colors relative group" onClick={() => setIsCartOpen(true)}>
                        <div className="relative p-1">
                          <FiShoppingCart className="text-2xl"/>
                          {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-sky-500 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full shadow-sm border-2 border-white transition-all group-hover:scale-110">
                              {cartItemCount}
                            </span>
                          )}
                        </div>
                        <span>Giỏ hàng</span>
                     </div>
                   </>
                 ) : (
                   <button onClick={() => setShowLoginModal(true)} className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md">
                     Đăng nhập
                   </button>
                 )}
              </div>
           </div>
        </header>

        <main className="flex-grow flex flex-col pb-10">

          {/* TRANG CHỦ */}
          {currentView === 'home' && (
            <div className="w-full flex flex-col animate-fade-in">
               <div className="w-full h-[70vh] md:h-[80vh] flex flex-col md:flex-row">
                  {lookbook.map((block, index) => (
                    <div key={block.id} className="flex-1 relative group cursor-pointer overflow-hidden border-r border-white/20" onClick={(e) => {
                      if(e.target.tagName !== 'INPUT' && e.target.tagName !== 'svg' && e.target.tagName !== 'LABEL') setCurrentView('shop');
                    }}>
                      <img src={block.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt={block.title} />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-500"></div>
                      <div className="absolute bottom-10 left-0 w-full text-center md:text-left md:left-8 z-10 pointer-events-none">
                        <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-widest transform translate-y-4 md:translate-y-8 opacity-100 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 drop-shadow-lg">
                          {block.title.split(' ').map((word, i) => <span key={i} className="block">{word}</span>)}
                        </h3>
                      </div>
                      {isAdmin && (
                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <label className="bg-white/90 hover:bg-white text-slate-900 p-3 rounded-full cursor-pointer shadow-lg flex items-center justify-center transition-colors" title="Đổi ảnh cột này">
                            <FiCamera className="text-xl"/>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLookbookUpload(e, index)} />
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
               </div>
               <div className="w-full bg-white py-20 px-6 text-center border-b border-slate-100">
                 <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Đậm chất riêng.</h2>
                 <p className="text-slate-500 max-w-2xl mx-auto mb-10 font-medium">Chúng tôi tin rằng thời trang không chỉ là áo quần, mà là ngôn ngữ không lời để thể hiện cá tính thực sự của bạn.</p>
                 <button onClick={() => setCurrentView('shop')} className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-black transition-transform hover:scale-105 shadow-xl shadow-slate-900/20">
                   Khám phá ngay
                 </button>
               </div>
            </div>
          )}
          
          {/* CỬA HÀNG */}
          {currentView === 'shop' && (
            <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-8 md:py-10 animate-fade-in">
              <div className="bg-[#eef5fc] rounded-[32px] p-8 md:p-12 mb-10 border border-blue-50 flex flex-col md:flex-row items-center justify-between shadow-sm overflow-hidden relative min-h-[320px]">
                
                <div className="max-w-xl relative z-10 pointer-events-none">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">New Collection 2026</span>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">Thời trang phong cách,<br/>đậm chất riêng.</h2>
                  <p className="text-slate-600 mb-6 font-medium">Khám phá hàng trăm mẫu áo thun, áo khoác và phụ kiện chất lượng cao với mức giá không thể tuyệt vời hơn.</p>
                </div>
                
                {isAdmin && !isEditingBanner && (
                  <button onClick={() => setIsEditingBanner(true)} className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur text-slate-900 p-2 px-3 rounded-lg shadow-sm border border-slate-200 hover:text-sky-600 text-xs font-bold flex items-center gap-2 transition-colors">
                    <FiEdit3/> Chỉnh Banner (Canva Mode)
                  </button>
                )}

                <div 
                  className={`absolute right-0 bottom-0 top-0 w-full md:w-1/2 items-center justify-center flex transition-all ${isEditingBanner ? 'z-20 border-4 border-dashed border-sky-400 bg-sky-50/30 cursor-move' : 'pointer-events-none z-0'}`}
                  onMouseDown={handleBannerMouseDown}
                  onMouseMove={handleBannerMouseMove}
                  onMouseUp={handleBannerMouseUp}
                  onMouseLeave={handleBannerMouseUp}
                  onWheel={handleBannerWheel}
                >
                  <img 
                    src={bannerImage} 
                    alt="Banner" 
                    draggable={false} 
                    className={`h-[90%] w-auto object-contain drop-shadow-2xl ${isEditingBanner ? 'opacity-100' : 'opacity-90'}`} 
                    style={{ transform: `translate(${bannerConfig.x}px, ${bannerConfig.y}px) scale(${bannerConfig.scale})` }}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"; e.target.className = "h-[80%] w-auto object-contain mix-blend-multiply opacity-50 drop-shadow-xl" }} 
                  />
                  
                  {isEditingBanner && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2 px-4 rounded-full shadow-2xl flex items-center gap-4 cursor-default animate-fade-in-up" onMouseDown={e => e.stopPropagation()}>
                      <FiMove className="text-xl text-slate-400"/>
                      <span className="text-xs font-bold text-slate-300 whitespace-nowrap hidden sm:inline">Kéo & Cuộn chuột</span>
                      <div className="w-px h-6 bg-slate-700 mx-1"></div>
                      
                      {/* NÚT ĐỔI ẢNH BANNER */}
                      <label className="bg-slate-700 hover:bg-slate-600 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap">
                         <FiCamera/> Đổi ảnh
                         <input type="file" accept="image/*" className="hidden" onChange={handleBannerImageUpload} />
                      </label>

                      <button onClick={handleSaveBanner} className="bg-sky-500 hover:bg-sky-600 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 transition-colors"><FiSave/> Lưu</button>
                    </div>
                  )}
                </div>
              </div>

              {isLoadingShop ? (
                <div className="flex justify-center py-32"><FiRefreshCcw className="text-4xl text-sky-500 animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {localProducts.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 group">
                      <div className="bg-white rounded-[32px] border border-slate-200 relative aspect-[4/5] flex items-center justify-center p-8 cursor-pointer hover:shadow-2xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-500 overflow-hidden" onClick={() => { setSelectedProduct(item); setCurrentView('productDetail'); }}>
                         <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out" />
                         <button onClick={(e) => handleAddToCart(item, e)} className="absolute bottom-5 right-5 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-110 hover:bg-sky-500 transition-all shadow-lg shadow-slate-900/30">
                           <FiPlus className="text-2xl"/>
                         </button>
                      </div>
                      <div className="px-2">
                        <h3 className="text-slate-800 font-bold text-sm line-clamp-1 mb-1 cursor-pointer hover:text-sky-600 transition-colors" onClick={() => { setSelectedProduct(item); setCurrentView('productDetail'); }}>{item.name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1.5">
                            {fakeColorSpheres.map((gradient, idx) => (
                              <div key={idx} className={`w-4 h-4 rounded-full shadow-inner border border-slate-200/50 bg-gradient-to-br ${gradient}`}></div>
                            ))}
                          </div>
                          <span className="text-base font-black text-slate-900">${item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CHI TIẾT SẢN PHẨM */}
          {currentView === 'productDetail' && selectedProduct && (
            <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-8 md:py-12 animate-fade-in">
              <div className="text-xs font-bold text-slate-400 mb-8 tracking-wider uppercase flex items-center gap-2">
                <button onClick={() => setCurrentView('shop')} className="hover:text-slate-800 transition-colors flex items-center gap-1"><FiCornerUpLeft/> Quay lại</button>
                <span>/</span><span>Cửa hàng</span><span>/</span><span className="text-slate-800 truncate">{selectedProduct.name}</span>
              </div>
              <div className="bg-white rounded-[40px] border border-slate-100 p-6 md:p-12 flex flex-col md:flex-row gap-10 lg:gap-16 shadow-sm">
                <div className="w-full md:w-1/2 aspect-square bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center p-12 relative group">
                   <img src={selectedProduct.imageUrl} className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500" alt={selectedProduct.name}/>
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">{selectedProduct.name}</h1>
                  <div className="flex items-center text-sm gap-4 mb-8">
                    <span className="text-amber-400 font-bold flex items-center gap-1 text-lg"><FiStar className="fill-current"/> {selectedProduct.rating}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 font-medium underline underline-offset-4">{selectedProduct.reviews} Đánh giá</span>
                  </div>
                  <div className="text-4xl font-black text-sky-600 mb-8">${selectedProduct.price}</div>
                  <div className="space-y-4 text-sm font-medium text-slate-700 mb-10 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-3"><FiTruck className="text-2xl text-sky-500"/> Giao hàng miễn phí toàn quốc</div>
                    <div className="flex items-center gap-3"><FiShield className="text-2xl text-emerald-500"/> Đổi trả miễn phí 30 ngày</div>
                  </div>
                  <div className="mb-12">
                    <p className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Mô tả chi tiết</p>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">{selectedProduct.description}</p>
                  </div>
                  <button onClick={(e) => handleAddToCart(selectedProduct, e)} className="mt-auto w-full bg-slate-900 text-white py-5 rounded-full font-black text-sm tracking-widest uppercase hover:bg-black transition-transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20">
                    <FiShoppingCart className="text-xl"/> THÊM VÀO GIỎ HÀNG
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TRANG CÁ NHÂN */}
          {currentView === 'profile' && user && (
            <div className="max-w-5xl mx-auto w-full px-4 py-8 animate-fade-in-up">
              <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-200 mb-6 relative">
                <div className="h-48 md:h-72 w-full bg-gradient-to-r from-sky-400 to-indigo-500 relative flex items-center justify-center overflow-hidden">
                  {coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" alt="Cover"/> : <FiImage className="text-6xl text-white opacity-20"/>}
                  <div className="absolute bottom-4 right-4">
                    <label htmlFor="coverUpload" className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white hover:text-slate-900 transition-all cursor-pointer shadow-md">
                      <FiCamera className="text-lg"/> Đổi ảnh bìa
                    </label>
                    <input type="file" id="coverUpload" accept="image/*" onChange={(e) => handleProfileUpload(e, 'cover')} className="hidden" />
                  </div>
                </div>
                
                <div className="px-6 md:px-12 pb-8 relative">
                  <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-full p-1.5 absolute -top-16 md:-top-24 border border-slate-100 shadow-xl z-10">
                    <div className="w-full h-full bg-slate-900 text-white rounded-full flex items-center justify-center text-5xl font-black relative overflow-hidden group">
                      {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar"/> : user?.email?.charAt(0).toUpperCase() || 'U'}
                      <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <FiCamera className="text-white text-3xl"/>
                      </label>
                      <input type="file" id="avatarUpload" accept="image/*" onChange={(e) => handleProfileUpload(e, 'avatar')} className="hidden" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 pb-2 gap-3 relative z-20">
                    <button onClick={handleLogout} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2">
                      <FiLogOut/> Đăng xuất
                    </button>
                    {isAdmin && (
                      <button onClick={() => setCurrentView('admin')} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-md">
                        <FiSettings/> Quản Trị Kho
                      </button>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0 relative z-20">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900">{user?.email?.split('@')[0]}</h2>
                    <p className="text-slate-500 font-medium mb-4">{user?.email}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">{userRole || 'Khách hàng'}</span>
                      <span className="bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"><FiCheckCircle/> Thành viên</span>
                      {isAdmin && <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold">Admin</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-8 border-t border-slate-100 pt-6 overflow-x-auto custom-scrollbar relative z-20">
                    <button className="text-slate-900 font-black border-b-4 border-slate-900 pb-2 whitespace-nowrap uppercase tracking-widest text-sm">Đơn hàng của tôi</button>
                    <button className="text-slate-400 font-bold hover:text-slate-900 pb-2 whitespace-nowrap transition-colors uppercase tracking-widest text-sm">Sản phẩm yêu thích</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm text-center py-24">
                <FiArchive className="text-6xl text-slate-200 mx-auto mb-6"/>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-slate-500 text-base font-medium">Khi bạn mua sắm, danh sách hóa đơn sẽ hiển thị tại đây.</p>
              </div>
            </div>
          )}

          {/* QUẢN TRỊ ADMIN */}
          {currentView === 'admin' && isAdmin && (
            <div className="max-w-6xl mx-auto w-full px-4 py-8 md:py-12 animate-fade-in">
              <div className="text-xs font-bold text-slate-400 mb-6 tracking-wider uppercase flex items-center gap-2">
                <button onClick={() => setCurrentView('profile')} className="hover:text-slate-800 transition-colors flex items-center gap-1"><FiCornerUpLeft/> Hồ sơ</button>
                <span>/</span><span className="text-slate-800 truncate">Quản lý kho hàng</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                 <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3"><FiArchive className="text-slate-900"/> Quản lý Cửa Hàng</h2>
                 <button onClick={() => setShowAddModal(true)} className="bg-sky-500 text-white px-6 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20">
                   <FiPlus className="text-xl"/> Đăng Sản Phẩm Mới
                 </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 mb-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2"><FiUser/> Dữ liệu Khảo sát Khách hàng</h3>
                <div className="flex flex-wrap gap-3">
                  {usersList.length === 0 ? <p className="text-sm text-slate-400 font-medium">Chưa có dữ liệu</p> : 
                    usersList.map(u => (
                      <div key={u.uid} className="bg-slate-50 px-4 py-3 rounded-2xl text-sm border border-slate-100 flex flex-col gap-1">
                        <span className="font-black text-slate-800">{u.email.split('@')[0]}</span>
                        <span className="text-xs text-sky-600 font-bold uppercase tracking-wider">{u.role || 'Chưa chọn'}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-black border-b border-slate-200">
                        <th className="p-5 pl-8">Hình ảnh</th>
                        <th className="p-5">Tên sản phẩm</th>
                        <th className="p-5">Giá bán</th>
                        <th className="p-5 text-right pr-8">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localProducts.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-5 pl-8">
                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm"><img src={item.imageUrl} className="w-full h-full object-contain mix-blend-multiply" alt=""/></div>
                          </td>
                          <td className="p-5 font-bold text-base text-slate-800 max-w-[250px] truncate">{item.name}</td>
                          <td className="p-5 font-black text-slate-900 text-lg">${item.price}</td>
                          <td className="p-5 text-right pr-8">
                            <button onClick={() => handleDeleteProduct(item.id)} className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-full transition-colors font-bold text-xs flex items-center gap-2 ml-auto"><FiTrash2 className="text-sm"/> Xóa Bỏ</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* FOOTER CHUYÊN NGHIỆP KIỂU PACDORA */}
        <footer className="bg-[#111111] text-white pt-16 pb-8 mt-auto border-t border-slate-800 flex-shrink-0">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
              <div className="lg:col-span-1">
                <h2 className="text-3xl font-black tracking-tighter mb-6">Trimi.</h2>
                <div className="flex gap-4 text-slate-400">
                   <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"><FiInstagram className="text-lg"/></div>
                   <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"><FaFacebook className="text-lg"/></div>
                   <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"><FiLinkedin className="text-lg"/></div>
                   <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"><FiYoutube className="text-lg"/></div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6">Sản phẩm</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">Tất cả sản phẩm</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Thời trang Nam</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Thời trang Nữ</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Phụ kiện (Accessories)</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Bộ sưu tập mới nhất</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6">Hỗ trợ khách hàng</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">Theo dõi đơn hàng</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Chính sách đổi trả</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Chính sách giao hàng</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Hướng dẫn chọn size</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Câu hỏi thường gặp</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6">Dịch vụ</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">In ấn theo yêu cầu</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Khách hàng doanh nghiệp</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Thẻ quà tặng (Gift Cards)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6">Về Trimi</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">Câu chuyện thương hiệu</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Tuyển dụng</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Liên hệ chúng tôi</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center border-t border-slate-800 pt-8 text-xs text-slate-500 font-medium">
              <p>© Copyright Trimi 2026. All rights reserved.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <span className="hover:text-white cursor-pointer transition-colors">Privacy policy</span>
                <span>·</span>
                <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              </div>
            </div>
          </div>
        </footer>

        {/* MODAL ĐĂNG NHẬP */}
        {showLoginModal && !isAuthenticated && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 md:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowLoginModal(false)}></div>
            <div className="bg-white rounded-[40px] w-full max-w-5xl relative z-10 shadow-2xl flex overflow-hidden min-h-[550px]">
              <div className="hidden md:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
                 <div className="relative z-10">
                   <h2 className="text-4xl font-black text-white mb-6 leading-tight">Gia nhập thế giới<br/>Thời trang Trimi.</h2>
                   <p className="text-slate-400 font-medium text-lg leading-relaxed">Đăng nhập để thêm sản phẩm yêu thích vào giỏ hàng và theo dõi đơn hàng của bạn mọi lúc, mọi nơi.</p>
                 </div>
                 <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
                 <div className="absolute top-1/4 -right-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col relative bg-white">
                <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-2xl"/></button>
                <h3 className="text-3xl font-black text-slate-900 mb-8">{authMode === 'login' ? 'Đăng nhập vào Trimi' : 'Tạo tài khoản mới'}</h3>
                <div className="flex flex-col gap-4 mb-8">
                  <button onClick={handleGoogleLogin} className="w-full bg-[#101828] text-white py-4 font-bold text-sm rounded-full hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20">
                    <FcGoogle className="text-xl bg-white rounded-full p-0.5" /> Tiếp tục với Google
                  </button>
                  <button className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 rounded-full">
                    <FaFacebook className="text-xl text-[#1877F2]"/> Tiếp tục với Facebook
                  </button>
                </div>
                <div className="flex items-center py-2 mb-6"><div className="flex-grow border-t border-slate-200"></div><span className="mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Hoặc</span><div className="flex-grow border-t border-slate-200"></div></div>
                <div className="flex flex-col gap-4 mb-6">
                  <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Nhập Email" className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium" />
                  <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Nhập Mật khẩu" className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium" />
                  <button onClick={handleEmailAuth} className="w-full bg-sky-500 text-white py-4 font-black text-sm rounded-full hover:bg-sky-600 transition-all mt-2 uppercase tracking-widest shadow-lg shadow-sky-500/30">
                    {authMode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
                  </button>
                </div>
                <div className="text-center text-sm font-medium text-slate-600 mb-8">
                  {authMode === 'login' ? <>Chưa có tài khoản? <button onClick={() => setAuthMode('register')} className="text-sky-600 font-bold hover:underline">Tạo ngay</button></> : <>Đã có tài khoản? <button onClick={() => setAuthMode('login')} className="text-sky-600 font-bold hover:underline">Đăng nhập</button></>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL KHẢO SÁT */}
        {showSurveyModal && isAuthenticated && (
          <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
            <div className="bg-white rounded-[40px] p-8 md:p-14 w-full max-w-3xl relative z-10 shadow-2xl animate-fade-in-up text-center">
              <span className="text-6xl mb-6 block">👋</span>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Bạn là ai?</h3>
              <p className="text-slate-500 font-medium mb-10 text-lg">Giúp Trimi mang đến trải nghiệm cá nhân hóa tốt nhất cho bạn.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surveyRoles.map((role, idx) => (
                  <button key={idx} onClick={async () => {
                    setUserRole(role); setShowSurveyModal(false);
                    if (user) { try { await setDoc(doc(db, "users", user.uid), { email: user.email, role: role }, { merge: true }); } catch(e){} }
                    showToast('Cảm ơn bạn đã hoàn thành!');
                  }} className="bg-white border-2 border-slate-100 text-slate-700 py-5 px-6 rounded-2xl font-bold text-base hover:border-sky-500 hover:text-sky-600 transition-all shadow-sm hover:shadow-md">
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL THÊM SẢN PHẨM ADMIN */}
        {showAddModal && isAdmin && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
            <div className="bg-white rounded-[40px] p-8 md:p-10 w-full max-w-2xl relative z-10 shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3"><FiPlus className="text-sky-500 bg-sky-50 p-2 rounded-full"/> Đăng Sản Phẩm</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-3 rounded-full transition-colors"><FiX className="text-xl"/></button>
               </div>
               <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Hình ảnh sản phẩm (PNG/JPG)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-[24px] p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer group">
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setNewProd({ ...newProd, imagePreview: URL.createObjectURL(file) });
                      }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {newProd.imagePreview ? <img src={newProd.imagePreview} className="h-40 object-contain mix-blend-multiply drop-shadow-md" alt="Preview" /> : <><FiUploadCloud className="text-5xl text-slate-300 mb-3 group-hover:text-sky-500 transition-colors"/><p className="text-sm font-medium text-slate-500">Bấm hoặc kéo thả ảnh vào đây</p></>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Tên sản phẩm</label>
                      <input type="text" value={newProd.name} onChange={(e) => setNewProd({...newProd, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Giá bán ($)</label>
                      <input type="number" value={newProd.price} onChange={(e) => setNewProd({...newProd, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Mô tả chi tiết</label>
                    <textarea value={newProd.desc} onChange={(e) => setNewProd({...newProd, desc: e.target.value})} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium resize-none"></textarea>
                  </div>
               </div>
               <div className="pt-8 border-t border-slate-100 mt-4 flex justify-end gap-4">
                 <button onClick={() => setShowAddModal(false)} className="px-8 py-4 rounded-full font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">Hủy Bỏ</button>
                 <button onClick={handleSubmitNewProduct} className="px-8 py-4 rounded-full font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/30">
                   <FiCheckCircle className="text-lg"/> Đăng Lên Cửa Hàng
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* GIỎ HÀNG SIDEBAR */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[5000] flex justify-end pointer-events-auto">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
            <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-fade-in-right">
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><FiShoppingCart className="text-sky-500"/> Giỏ Hàng ({cartItemCount})</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition-colors"><FiX className="text-xl"/></button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-slate-50/50">
                {cart.length === 0 ? (
                  <div className="text-center mt-32 flex flex-col items-center">
                    <div className="w-32 h-32 bg-white shadow-sm rounded-full flex items-center justify-center mb-6"><FiShoppingCart className="text-6xl text-slate-200"/></div>
                    <p className="text-slate-500 font-medium mb-8 text-base">Giỏ hàng của bạn đang trống.</p>
                    <button onClick={() => {setIsCartOpen(false); setCurrentView('shop')}} className="px-10 py-4 bg-slate-900 text-white text-sm font-bold tracking-widest uppercase rounded-full shadow-lg shadow-slate-900/20 hover:bg-black transition-all">Mua Sắm Ngay</button>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex gap-5 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative pr-12 group hover:border-slate-300 transition-colors">
                      <div className="w-24 h-24 bg-slate-50 rounded-2xl p-3 flex-shrink-0 border border-slate-100">
                        <img src={item.imageUrl} className="w-full h-full object-contain mix-blend-multiply" alt=""/>
                      </div>
                      <div className="flex-1 flex flex-col justify-center py-1">
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug pr-2">{item.name}</h4>
                        <p className="text-slate-900 font-black text-lg mt-1">${item.price}</p>
                        <div className="flex items-center border border-slate-200 rounded-xl w-fit mt-3 overflow-hidden bg-slate-50">
                          <button onClick={() => updateCartQuantity(item.id, -1)} className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200 transition-colors">-</button>
                          <span className="px-4 text-xs font-black text-slate-900 bg-white py-1.5 border-x border-slate-200">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, 1)} className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200 transition-colors">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors" title="Xóa khỏi giỏ">
                        <FiTrash2 className="text-xl"/>
                      </button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-6 md:p-8 border-t border-slate-100 bg-white">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Tổng thanh toán</span>
                    <span className="text-4xl font-black text-slate-900">${cartTotal}</span>
                  </div>
                  <button onClick={() => { alert(`Thanh toán thành công đơn hàng $${cartTotal}!`); setCart([]); setIsCartOpen(false); }} className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-full text-sm font-bold tracking-widest uppercase shadow-xl shadow-slate-900/20 transition-all flex justify-center items-center gap-2">
                    <FiCheckCircle className="text-lg"/> Thanh Toán Ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}