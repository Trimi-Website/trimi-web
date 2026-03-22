import { useState, useEffect, useRef } from 'react';
import {
  FiMenu, FiHome, FiLock, FiLogOut, FiShoppingCart, FiSearch,
  FiUser, FiTrash2, FiCheckCircle, FiRefreshCcw, FiSettings,
  FiPlus, FiUploadCloud, FiArchive, FiCamera, FiEdit3, FiSave, FiImage,
  FiMessageCircle, FiCreditCard, FiMonitor, FiInstagram, FiLinkedin, FiYoutube,
  FiGlobe, FiSend, FiLoader, FiArrowUp, FiMoon, FiSun, FiUsers, FiUserPlus,
  FiUpload, FiCornerUpLeft, FiX, FiStar, FiTruck, FiShield, FiMail,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

// Firebase
import { auth, googleProvider, db } from './firebase';
import {
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged, signOut, FacebookAuthProvider,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, deleteDoc, collection, onSnapshot, arrayUnion,
} from 'firebase/firestore';

// Constants & Utils
import { dict, productDict, initialProducts, defaultLookbookData, fakeColorSpheres, daNangDistricts } from './constants/data';
import { compressImage } from './utils/imageUtils';

// Components
import PushNotification from './components/PushNotification';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import ChatWidget from './components/ChatWidget';
import UnifiedMenuDrawer from './components/UnifiedMenuDrawer';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import LoginModal from './components/LoginModal';
import SettingsDrawer from './components/SettingsDrawer';
import SurveyModal from './components/SurveyModal';
import AdminProductModals from './components/AdminProductModals';
import InfoModals from './components/InfoModals';

// Views
import HomeView from './views/HomeView';
import ShopView from './views/ShopView';
import ProductDetailView from './views/ProductDetailView';
import ProfileView from './views/ProfileView';
import AdminView from './views/AdminView';

export default function App() {
  const mainRef = useRef(null);
  const lastClickPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);
  const scrollTopTimeout = useRef(null);

  // ─── AUTH ─────────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Hải Châu');
  const [friendsList, setFriendsList] = useState([]);

  // ─── NAVIGATION ───────────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState('home');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewHistory, setViewHistory] = useState([]);
  const [animType, setAnimType] = useState('none');

  // ─── UI / THEME ───────────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('trimi_theme') === 'dark');
  const [isMobile, setIsMobile] = useState(false);
  const [lang, setLang] = useState('VI');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [isUnifiedMenuOpen, setIsUnifiedMenuOpen] = useState(false);

  // ─── SEARCH ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedTag, setSelectedTag] = useState(null);

  // ─── PRODUCTS ─────────────────────────────────────────────────────────────
  const [localProducts, setLocalProducts] = useState([]);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [lookbook, setLookbook] = useState(defaultLookbookData);
  const [previewImg, setPreviewImg] = useState(null);

  // ─── CART & CHECKOUT ──────────────────────────────────────────────────────
  const [cart, setCart] = useState(() => {
    try { const s = localStorage.getItem('trimi_cart'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('deposit');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [successOrderInfo, setSuccessOrderInfo] = useState(null);
  const [receiptImg, setReceiptImg] = useState(null);

  // ─── ORDERS ───────────────────────────────────────────────────────────────
  const [adminOrders, setAdminOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  // ─── AUTH MODAL ───────────────────────────────────────────────────────────
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ─── SETTINGS DRAWER ──────────────────────────────────────────────────────
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({});
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // ─── SURVEY ───────────────────────────────────────────────────────────────
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyStep, setSurveyStep] = useState(1);
  const [surveyData, setSurveyData] = useState({ name: '', theme: 'System', source: '', occupation: '', interests: '' });

  // ─── CHAT ─────────────────────────────────────────────────────────────────
  const [usersList, setUsersList] = useState([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [hasUnreadUser, setHasUnreadUser] = useState(false);
  const [adminChatUser, setAdminChatUser] = useState(null);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [activeChatTarget, setActiveChatTarget] = useState(null);
  const [p2pMessages, setP2pMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const adminChatContainerRef = useRef(null);

  // ─── INFO MODALS ──────────────────────────────────────────────────────────
  const [showCookieConsent, setShowCookieConsent] = useState(() => !localStorage.getItem('trimi_cookies'));
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', price: '', category: 'shirt_1', desc: '', imagePreview: null });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [cancelTag, setCancelTag] = useState('');
  const [cancelNote, setCancelNote] = useState('');

  // ─── DERIVED ──────────────────────────────────────────────────────────────
  const isAdmin = user?.email === 'phanbasongtoan112@gmail.com';
  const t = (key) => dict[lang]?.[key] || dict['VI'][key] || key;
  const t_prod = (id, field, defaultValue) => productDict[lang]?.[`${id}_${field}`] || defaultValue;
  const cartItemCount = cart.reduce((total, i) => total + (Number(i.quantity) || 0), 0);
  const cartProductsTotal = cart.reduce((total, i) => total + ((Number(i.price) || 0) * (Number(i.quantity) || 1)), 0);
  const shippingFee = (district === 'Hải Châu' || district === 'Thanh Khê' || district === 'Sơn Trà') ? 0 : 20000;
  const cartFinalTotal = cartProductsTotal + shippingFee;
  const depositAmount = Math.round(cartFinalTotal * 0.3);
  const finalPayAmount = paymentMode === 'deposit' ? depositAmount : cartFinalTotal;
  const totalAdminUnread = usersList.filter(u => u.hasUnreadAdmin).length;

  const translateTag = (tag) => {
    if (!tag) return '';
    const k = tag.toLowerCase().trim().replace('#', '');
    const map = {
      'nam': { VI: 'Nam', EN: 'Men' }, 'nu': { VI: 'Nữ', EN: 'Women' }, 'nữ': { VI: 'Nữ', EN: 'Women' },
      'ao': { VI: 'Áo', EN: 'Shirt' }, 'áo': { VI: 'Áo', EN: 'Shirt' },
      'quan': { VI: 'Quần', EN: 'Pants' }, 'quần': { VI: 'Quần', EN: 'Pants' },
      'linhkien': { VI: 'Linh kiện', EN: 'Parts' }, 'linh kiện': { VI: 'Linh kiện', EN: 'Parts' },
      'phukien': { VI: 'Phụ kiện', EN: 'Accessories' }, 'phụ kiện': { VI: 'Phụ kiện', EN: 'Accessories' },
    };
    return map[k] ? map[k][lang] : tag;
  };

  // ─── PRODUCT FILTER & SORT ────────────────────────────────────────────────
  let displayedProducts = localProducts.filter(p => {
    if (currentCategory === 'all') return true;
    if (currentCategory === 'shirt_all') return p.category?.includes('shirt');
    if (currentCategory === 'pants_all') return p.category?.includes('pants');
    if (currentCategory === 'acc_all') return p.category?.includes('acc');
    return p.category === currentCategory;
  });
  if (searchQuery.trim()) {
    displayedProducts = displayedProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (selectedTag) {
    displayedProducts = displayedProducts.filter(p =>
      p.tags && p.tags.some(tag => tag.toLowerCase().includes(selectedTag.toLowerCase()))
    );
  }
  if (sortOrder === 'asc') displayedProducts.sort((a, b) => Number(a.price) - Number(b.price));
  else if (sortOrder === 'desc') displayedProducts.sort((a, b) => Number(b.price) - Number(a.price));

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (window.innerWidth < 768 && currentView === 'home') {
      setCurrentView('shop'); setCurrentCategory('all');
    }
  }, []);

  useEffect(() => {
    const handleClick = (e) => { lastClickPos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.getElementsByTagName('head')[0].appendChild(link); }
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('trimi_theme', 'dark');
      link.href = '/favicon1.ico';
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('trimi_theme', 'light');
      link.href = '/favicon2.ico';
    }
  }, [isDarkMode]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > 400 && currentScrollY < lastScrollY.current) {
            setShowScrollTop(true);
            clearTimeout(scrollTopTimeout.current);
            scrollTopTimeout.current = setTimeout(() => setShowScrollTop(false), 2000);
          } else if (currentScrollY > lastScrollY.current || currentScrollY <= 400) {
            setShowScrollTop(false);
            clearTimeout(scrollTopTimeout.current);
          }
          if (currentScrollY < 80) {
            setIsHeaderVisible(true);
          } else if (Math.abs(currentScrollY - lastScrollY.current) > 10) {
            if (currentScrollY > lastScrollY.current) {
              setIsHeaderVisible(false);
              clearTimeout(scrollTimeout.current);
            } else {
              clearTimeout(scrollTimeout.current);
              scrollTimeout.current = setTimeout(() => setIsHeaderVisible(true), 150);
            }
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(scrollTimeout.current); clearTimeout(scrollTopTimeout.current); };
  }, []);

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state) {
        setCurrentView(e.state.view || 'home'); setCurrentCategory(e.state.category || 'all'); setSelectedProduct(e.state.product || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.history.replaceState({ view: currentView, category: currentCategory, product: selectedProduct }, '', `?view=${currentView}`);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, currentCategory, selectedProduct]);

  useEffect(() => { localStorage.setItem('trimi_cart', JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    if (cart.length === 0 && showCheckoutModal) { setShowCheckoutModal(false); showToast("Giỏ hàng trống!"); }
  }, [cart, showCheckoutModal]);

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatMessages, p2pMessages, isChatBoxOpen]);
  useEffect(() => {
    if (adminChatContainerRef.current) adminChatContainerRef.current.scrollTop = adminChatContainerRef.current.scrollHeight;
  }, [adminChatUser?.messages]);

  useEffect(() => {
    let isMounted = true;
    const failsafe = setTimeout(() => { if (isMounted && isLoadingShop) { setLocalProducts(initialProducts); setIsLoadingShop(false); } }, 3000);
    const unsub = onSnapshot(collection(db, 'products'),
      (snapshot) => {
        clearTimeout(failsafe);
        if (!isMounted) return;
        if (snapshot.empty) {
          initialProducts.forEach(p => setDoc(doc(db, "products", p.id), p).catch(() => {}));
          setLocalProducts(initialProducts);
        } else {
          const prods = [];
          snapshot.forEach(d => prods.push({ ...d.data(), id: d.id }));
          setLocalProducts(prods.sort((a, b) => b.id - a.id));
        }
        setIsLoadingShop(false);
      },
      () => { clearTimeout(failsafe); if (isMounted) { setLocalProducts(initialProducts); setIsLoadingShop(false); } }
    );
    return () => { isMounted = false; clearTimeout(failsafe); unsub(); };
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordersData = [];
      snapshot.forEach(d => ordersData.push({ id: d.id, ...d.data() }));
      const sorted = ordersData.sort((a, b) => b.createdAt - a.createdAt);
      if (isAdmin) setAdminOrders(sorted);
      setMyOrders(sorted.filter(o => o.uid === user.uid));
    }, () => {});
    return () => unsub();
  }, [user, isAdmin]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser); setIsAuthenticated(true); setShowLoginModal(false);
        const baseEmailName = currentUser.email ? currentUser.email.split('@')[0] : 'Guest';
        try {
          await setDoc(doc(db, 'users', currentUser.uid), { email: currentUser.email || '', lastActive: Date.now(), isOnline: true }, { merge: true });
          const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAvatarUrl(data.avatar || currentUser.photoURL || '');
            setCoverUrl(data.cover || '');
            setNickname(data.nickname || baseEmailName);
            setPhone(data.phone || ''); setAddress(data.address || ''); setDistrict(data.district || 'Hải Châu');
            setFriendsList(data.friends || []);
            const isSurveyDone = localStorage.getItem(`trimi_survey_done_${currentUser.uid}`);
            if (!data.isSurveyCompleted && !isSurveyDone) {
              setSurveyData(prev => ({ ...prev, name: data.nickname || baseEmailName }));
              setShowSurveyModal(true); setSurveyStep(1);
            } else {
              setUserRole(data.role || 'Khách hàng');
            }
          } else {
            setSurveyData(prev => ({ ...prev, name: baseEmailName }));
            setShowSurveyModal(true); setSurveyStep(1);
          }
        } catch (error) { console.error("Lỗi đồng bộ DB:", error); }
        const presenceInterval = setInterval(() => {
          setDoc(doc(db, 'users', currentUser.uid), { lastActive: Date.now(), isOnline: true }, { merge: true }).catch(() => {});
        }, 30000);
        const handleUnload = () => { setDoc(doc(db, 'users', currentUser.uid), { isOnline: false }, { merge: true }).catch(() => {}); };
        window.addEventListener('beforeunload', handleUnload);
        return () => { clearInterval(presenceInterval); window.removeEventListener('beforeunload', handleUnload); };
      } else {
        setIsAuthenticated(false); setUser(null); setAvatarUrl(''); setCoverUrl(''); setNickname('');
        setChatMessages([]); setHasUnreadUser(false); setFriendsList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      return onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = [];
        snapshot.forEach(d => {
          const data = d.data();
          const isCurrentlyOnline = data.isOnline && (Date.now() - data.lastActive < 60000);
          if (d.id !== user?.uid) usersData.push({ uid: d.id, ...data, isOnline: isCurrentlyOnline });
        });
        setUsersList(usersData);
      });
    }
  }, [isAuthenticated, user?.uid]);

  useEffect(() => {
    if (!user || isAdmin) return;
    return onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) { setChatMessages(docSnap.data().messages || []); setHasUnreadUser(docSnap.data().hasUnreadUser || false); }
    });
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user || !activeChatTarget || activeChatTarget === 'admin' || isAdmin) return;
    const chatId = [user.uid, activeChatTarget.uid].sort().join('_');
    return onSnapshot(doc(db, 'p2p_chats', chatId), (docSnap) => {
      if (docSnap.exists()) setP2pMessages(docSnap.data().messages || []); else setP2pMessages([]);
    });
  }, [user, activeChatTarget, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !adminChatUser) return;
    return onSnapshot(doc(db, 'users', adminChatUser.uid), (docSnap) => {
      if (docSnap.exists()) setAdminChatUser(prev => ({ ...prev, messages: docSnap.data().messages || [] }));
    });
  }, [isAdmin, adminChatUser?.uid]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  // Accepts either a plain string or a rich object { title, body, type }
  const showToast = (msg, type = 'default') => {
    setToastMsg(typeof msg === 'string' ? { title: msg, body: null, type } : msg);
    setTimeout(() => setToastMsg(null), 3000);
  };
  const requireLogin = (action) => { if (!isAuthenticated) { setShowLoginModal(true); return; } action(); };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const navigateTo = (view, category = 'all', product = null) => {
    setCurrentView(view); setCurrentCategory(category); setSelectedProduct(product);
    setSearchQuery(''); setIsUnifiedMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ view, category, product }, '', `?view=${view}`);
  };

  const handleThemeToggle = (e, forceMode = null) => {
    const nextMode = forceMode !== null ? forceMode : !isDarkMode;
    if (nextMode === isDarkMode) return;
    if (!document.startViewTransition) { setIsDarkMode(nextMode); return; }
    const x = e?.clientX || window.innerWidth / 2;
    const y = e?.clientY || window.innerHeight / 2;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 150;
    const transition = document.startViewTransition(() => { setIsDarkMode(nextMode); });
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.87, 0, 0.13, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  };

  const handleEmailAuth = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) return alert("Vui lòng nhập email hợp lệ.");
    if (password.length < 6) return alert("Mật khẩu ít nhất 6 ký tự!");
    try {
      if (authMode === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      setShowLoginModal(false);
    } catch { alert("Lỗi đăng nhập: Sai email hoặc mật khẩu."); }
  };

  const handleFacebookLogin = async (e) => {
    if (e) e.preventDefault();
    try { await signInWithPopup(auth, new FacebookAuthProvider()); setShowLoginModal(false); }
    catch (error) { console.error("Lỗi FB:", error); alert("Không thể đăng nhập Facebook lúc này."); }
  };

  const handleGoogleLogin = async (e) => {
    if (e) e.preventDefault();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) { setShowLoginModal(false); showToast("Đăng nhập thành công!"); }
    } catch (error) {
      console.error("Lỗi Google:", error);
      alert("⚠️ LỖI TRÌNH DUYỆT CHẶN (COOP/CORS) ⚠️\nVui lòng đổi 'localhost' thành '127.0.0.1' trên thanh địa chỉ rồi Enter.");
    }
  };

  const handleLogout = async () => {
    if (user) await setDoc(doc(db, 'users', user.uid), { isOnline: false }, { merge: true }).catch(() => {});
    await signOut(auth);
    setChatMessages([]); setAdminChatUser(null); setActiveChatTarget(null);
    navigateTo('home', 'all');
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) return alert("Tên không được để trống!");
    setNickname(tempName); setIsEditingName(false);
    localStorage.setItem(`trimi_name_${user.uid}`, tempName);
    if (user) { try { await setDoc(doc(db, "users", user.uid), { nickname: tempName }, { merge: true }); } catch { } }
    showToast('Đã cập nhật biệt danh!');
  };

  const handleProfileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    compressImage(file, async (compressedBase64) => {
      if (type === 'avatar') { setAvatarUrl(compressedBase64); localStorage.setItem(`trimi_avatar_${user.uid}`, compressedBase64); await setDoc(doc(db, "users", user.uid), { avatar: compressedBase64 }, { merge: true }).catch(() => {}); }
      if (type === 'cover') { setCoverUrl(compressedBase64); localStorage.setItem(`trimi_cover_${user.uid}`, compressedBase64); await setDoc(doc(db, "users", user.uid), { cover: compressedBase64 }, { merge: true }).catch(() => {}); }
      showToast('Đã lưu ảnh cá nhân!');
    });
    e.target.value = null;
  };

  const handleAddToCart = (item, e) => {
    e.stopPropagation();
    setIsHeaderVisible(true);
    setTimeout(() => { if (window.scrollY > 80) setIsHeaderVisible(false); }, 2500);
    if (e && e.currentTarget) {
      const button = e.currentTarget;
      let image = button.parentElement?.querySelector('img');
      if (!image) image = document.getElementById('detail-main-image');
      const cartIcon = document.getElementById('header-cart-icon');
      if (image && cartIcon) {
        const imageRect = image.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();
        const flyer = document.createElement('img');
        flyer.src = image.src;
        flyer.className = "fixed object-cover shadow-2xl z-[10000] animate-add-to-cart-fly pointer-events-none rounded-xl border-2 border-white/50";
        const size = 60;
        flyer.style.width = `${size}px`; flyer.style.height = `${size}px`;
        const startX = imageRect.left + imageRect.width / 2 - size / 2;
        const startY = imageRect.top + imageRect.height / 2 - size / 2;
        flyer.style.left = `${startX}px`; flyer.style.top = `${startY}px`;
        flyer.style.setProperty('--diff-x', `${cartRect.left + cartRect.width / 2 - size / 2 - startX}px`);
        flyer.style.setProperty('--diff-y', `${cartRect.top + cartRect.height / 2 - size / 2 - startY}px`);
        document.body.appendChild(flyer);
        flyer.addEventListener('animationend', () => {
          document.body.removeChild(flyer);
          cartIcon.classList.add('scale-125', 'text-sky-500');
          setTimeout(() => cartIcon.classList.remove('scale-125', 'text-sky-500'), 300);
        });
      }
    }
    const currentStock = item.stock !== undefined ? item.stock : 50;
    if (currentStock <= 0) return showToast("Sản phẩm này đã hết hàng!");
    setCart((prevCart) => {
      const existingItem = prevCart.find(i => i.id === item.id);
      if (existingItem) {
        if (existingItem.quantity >= currentStock) { showToast(`Chỉ còn ${currentStock} sản phẩm trong kho!`); return prevCart; }
        return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1, addedAt: Date.now() } : i);
      }
      return [...prevCart, { ...item, quantity: 1, addedAt: Date.now() }];
    });
  };

  const updateCartQuantity = (id, delta) => setCart(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));

  const handleProceedCheckout = () => {
    requireLogin(() => {
      if (!address || !phone) {
        showToast("Vui lòng điền Số điện thoại và Địa chỉ để chúng tôi giao hàng!");
        navigateTo('profile');
        setTimeout(() => { setTempSettings({ nickname, phone, address, district }); setIsSettingsDrawerOpen(true); }, 800);
      } else {
        const newOrderId = 'TRIMI' + Date.now().toString().slice(-5) + Math.floor(Math.random() * 1000);
        setCurrentOrderId(newOrderId); setReceiptImg(null);
        setIsCartOpen(false); setShowCheckoutModal(true);
      }
    });
  };

  const handleConfirmPayment = async () => {
    if (!receiptImg) { alert("Vui lòng tải lên biên lai chuyển khoản để hệ thống xác nhận!"); return; }
    setIsCheckingPayment(true);
    const orderData = {
      orderId: currentOrderId, uid: user.uid, customerName: nickname,
      customerEmail: user.email, customerPhone: phone,
      customerAddress: `${address}, ${district}, Đà Nẵng`,
      items: cart, totalAmount: cartProductsTotal, shippingFee, finalAmount: cartFinalTotal,
      paidAmount: finalPayAmount, paymentMode,
      status: 'Chờ xác nhận thanh toán', receiptImage: receiptImg, createdAt: Date.now(),
    };
    try {
      await setDoc(doc(db, 'orders', currentOrderId), orderData);
      cart.forEach(async (item) => {
        const currentStock = item.stock !== undefined ? item.stock : 50;
        await setDoc(doc(db, 'products', item.id), { stock: Math.max(0, currentStock - item.quantity) }, { merge: true }).catch(() => {});
      });
      if (user) {
        await setDoc(doc(db, 'users', user.uid), { purchaseHistory: arrayUnion(...cart.map(i => i.id)) }, { merge: true }).catch(() => {});
      }
      // ── NOTIFICATION 1: Alert admin about the new order ──────────────────
      await setDoc(
        doc(db, 'notifications', 'admin', 'items', `order_${currentOrderId}`),
        {
          type:      'new_order',
          title:     '🛒 Đơn hàng mới!',
          body:      `${nickname} vừa đặt đơn ${currentOrderId} — ${finalPayAmount.toLocaleString('vi-VN')}đ`,
          isRead:    false,
          createdAt: Date.now(),
          orderId:   currentOrderId,
        }
      ).catch(() => {});
      setTimeout(() => {
        setIsCheckingPayment(false);
        setSuccessOrderInfo(currentOrderId);
        setCart([]); setShowCheckoutModal(false); showToast('Đặt hàng thành công!');
        navigateTo('profile');
      }, 1500);
    } catch (error) {
      console.error(error); setIsCheckingPayment(false);
      alert("Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại.");
    }
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) compressImage(file, (base64) => setReceiptImg(base64));
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm(t('adminDel') + '?')) {
      setLocalProducts(localProducts.filter(p => p.id !== id));
      try { await deleteDoc(doc(db, 'products', id)); showToast(t('adminDel') + ' thành công!'); } catch { }
    }
  };

  const handleSubmitNewProduct = async () => {
    if (!newProd.name || !newProd.price || !newProd.imagePreview) return alert("Vui lòng điền đủ thông tin!");
    const newId = Date.now().toString();
    const tagsArray = newProd.tags ? newProd.tags.split(',').map(tag => tag.trim().replace('#', '')) : [];
    const product = { id: newId, name: newProd.name, price: parseFloat(newProd.price), rating: 5.0, reviews: 0, category: newProd.category, imageUrl: newProd.imagePreview, description: newProd.desc || 'Sản phẩm chính hãng.', tags: tagsArray };
    setLocalProducts([product, ...localProducts]);
    setShowAddModal(false); setNewProd({ name: '', price: '', category: 'shirt_1', desc: '', imagePreview: null });
    try { await setDoc(doc(db, 'products', newId), product); showToast('Đã thêm sản phẩm lên cửa hàng!'); } catch { }
  };

  const handleAddFriend = async (e, targetUid) => {
    e.stopPropagation();
    if (!user) return;
    try { await setDoc(doc(db, 'users', user.uid), { friends: arrayUnion(targetUid) }, { merge: true }); showToast('Đã thêm vào danh bạ!'); } catch { }
  };

  const openAdminChat = async () => {
    setActiveChatTarget('admin'); setIsChatBoxOpen(true); setIsHelpOpen(false);
    if (user) { setHasUnreadUser(false); await setDoc(doc(db, 'users', user.uid), { hasUnreadUser: false }, { merge: true }).catch(() => {}); }
  };
  const openP2PChat = (targetUser) => { setActiveChatTarget(targetUser); setIsChatBoxOpen(true); setIsHelpOpen(false); };
  const openAdminChatWithUser = async (u) => {
    setAdminChatUser(u); setActiveChatTarget(u); setIsChatBoxOpen(true); setIsHelpOpen(false);
    await setDoc(doc(db, 'users', u.uid), { hasUnreadAdmin: false }, { merge: true }).catch(() => {});
  };

  const handleUserSendMessage = async () => {
    if (!chatInput.trim() || !user || !activeChatTarget) return;
    const userMsgText = chatInput.trim();
    setChatInput('');
    if (isAdmin) {
      const newMessage = { sender: 'bot', text: userMsgText, timestamp: Date.now() };
      try {
        await setDoc(doc(db, 'users', activeChatTarget.uid), { messages: arrayUnion(newMessage), lastUpdated: Date.now(), hasUnreadUser: true }, { merge: true });
        // ── NOTIFICATION 2a: Admin → User message alert ──────────────────
        await setDoc(
          doc(db, 'notifications', activeChatTarget.uid, 'items', `msg_${Date.now()}`),
          {
            type:      'new_message',
            title:     '💬 Tin nhắn từ Trimi',
            body:      `Admin: ${userMsgText.substring(0, 80)}${userMsgText.length > 80 ? '...' : ''}`,
            isRead:    false,
            createdAt: Date.now(),
          }
        ).catch(() => {});
      } catch { }
      return;
    }
    const newMessage = { sender: user.uid, text: userMsgText, timestamp: Date.now() };
    if (activeChatTarget === 'admin') {
      try {
        await setDoc(doc(db, 'users', user.uid), { messages: arrayUnion(newMessage), lastUpdated: Date.now(), userEmail: user.email || '', nickname, avatar: avatarUrl, hasUnreadAdmin: true }, { merge: true });
        // ── NOTIFICATION 2b: User → Admin message alert ──────────────────
        await setDoc(
          doc(db, 'notifications', 'admin', 'items', `msg_${Date.now()}`),
          {
            type:      'new_message',
            title:     '💬 Tin nhắn mới từ khách',
            body:      `${nickname}: ${userMsgText.substring(0, 80)}${userMsgText.length > 80 ? '...' : ''}`,
            isRead:    false,
            createdAt: Date.now(),
          }
        ).catch(() => {});
        const lowerMsg = userMsgText.toLowerCase();
        let aiReply = '';
        if (lowerMsg.includes('ship') || lowerMsg.includes('giao')) aiReply = 'Trimi AI: Tụi mình freeship nội thành Đà Nẵng. Các quận khác phí ship là 20k nha!';
        else if (lowerMsg.includes('cọc') || lowerMsg.includes('thanh toán')) aiReply = 'Trimi AI: Khi đặt hàng, bạn cần thanh toán cọc trước 30% qua mã QR nhé.';
        else if (lowerMsg.includes('chào') || lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('yo')) aiReply = 'Trimi AI: Chào bạn! Trimi có thể giúp gì cho bạn hôm nay?';
        else if (lowerMsg.includes('địa chỉ') || lowerMsg.includes('đà nẵng')) aiReply = 'Trimi AI: Hiện tại Trimi chỉ hỗ trợ giao dịch và ship hàng trong Đà Nẵng thôi ạ.';
        else if (lowerMsg.includes('size') || lowerMsg.includes('kích thước')) aiReply = 'Trimi AI: Bạn cho mình xin chiều cao và cân nặng để tư vấn size chuẩn nhất nhé!';
        else if (lowerMsg.includes('giá')) aiReply = 'Trimi AI: Dạ giá sản phẩm được niêm yết công khai trên web. Bạn vào mục Cửa hàng để xem nhé!';
        if (aiReply) {
          setTimeout(async () => {
            await setDoc(doc(db, 'users', user.uid), { messages: arrayUnion({ sender: 'bot', text: aiReply, timestamp: Date.now() }), hasUnreadUser: true }, { merge: true });
          }, 100);
        }
      } catch { }
    } else {
      const chatId = [user.uid, activeChatTarget.uid].sort().join('_');
      try { await setDoc(doc(db, 'p2p_chats', chatId), { messages: arrayUnion(newMessage), lastUpdated: Date.now() }, { merge: true }); } catch { }
    }
  };

  const chatProps = {
    isAdmin, isHelpOpen, setIsHelpOpen, isChatBoxOpen, setIsChatBoxOpen,
    activeChatTarget, setActiveChatTarget, adminChatUser, setAdminChatUser,
    chatInput, setChatInput, chatMessages, p2pMessages, hasUnreadUser,
    totalAdminUnread, usersList, friendsList, chatContainerRef, adminChatContainerRef,
    handleUserSendMessage, openAdminChat, openP2PChat, openAdminChatWithUser, handleAddFriend,
    requireLogin, t, isDarkMode, user, avatarUrl, nickname,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      <style>{`
        .cartoon-ease { transition-timing-function: cubic-bezier(0.68, -0.6, 0.27, 1.55) !important; }
        .font-brush { font-family: 'Playfair Display', serif; font-style: italic; font-weight: 800; }
        html, body, #root { overflow-x: hidden !important; overflow-y: auto !important; height: auto !important; min-height: 100vh !important; }
        .grecaptcha-badge { visibility: hidden !important; }
        a, button, label, .cursor-pointer, [role="button"] { cursor: pointer !important; }
        body.dark-mode { background-color: #111111 !important; color: #f8fafc !important; }
        .dark-mode .bg-\\[\\#f8fafc\\] { background-color: #111111 !important; }
        .dark-mode .bg-white, .dark-mode .bg-slate-50, .dark-mode .bg-slate-100 { background-color: #1e293b !important; border-color: #334155 !important; }
        .dark-mode .border-slate-100, .dark-mode .border-slate-200, .dark-mode .border-blue-100 { border-color: #334155 !important; }
        .dark-mode .text-slate-900, .dark-mode .text-slate-800 { color: #ffffff !important; }
        .dark-mode .text-slate-700, .dark-mode .text-slate-600, .dark-mode .text-slate-500 { color: #cbd5e1 !important; }
        .dark-mode input, .dark-mode select, .dark-mode textarea { background-color: #0f172a !important; color: #ffffff !important; border-color: #334155 !important; }
        .dark-mode button.bg-slate-900 { background-color: #38bdf8 !important; color: #0f172a !important; }
        ::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
        ::view-transition-old(root) { z-index: 1; }
        ::view-transition-new(root) { z-index: 999999; }
        main { position: relative; overflow: hidden; width: 100%; }
        .cartoon-ease { transition-timing-function: cubic-bezier(0.68, -0.6, 0.27, 1.55) !important; }
        .btn-run-away { transform: translateX(120vw) rotate(15deg) !important; transition: transform 0.6s cubic-bezier(0.68, -0.6, 0.27, 1.55) !important; }
        .anim-home-to-shop-prepare #other-pages-content { transform: translateX(100%); transition: none; }
        .anim-home-to-shop-run .hero-buy-button { transform: translateX(100vw); transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1); }
        .anim-home-to-shop-run #home-page-content { transform: translateX(-100%); transition: transform 0.7s cubic-bezier(0.68, -0.6, 0.27, 1.55); }
        .anim-home-to-shop-run #other-pages-content { transform: translateX(0); transition: transform 0.7s cubic-bezier(0.68, -0.6, 0.27, 1.55); transition-delay: 0.1s; }
        .page-transition-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: white; z-index: 9999; opacity: 0; visibility: hidden; transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out; }
        .page-transition-overlay.active { opacity: 1; visibility: visible; }
        @keyframes toastProgress { from { width: 100%; } to { width: 0%; } }
      `}</style>

      <div className={`min-h-screen w-full font-sans flex flex-col relative transition-colors duration-300 ${isDarkMode ? 'dark-mode text-white bg-[#111111]' : 'text-slate-900 bg-[#f8fafc]'}`}>

        {/* SCROLL TO TOP BUTTON */}
        <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 md:bottom-28 md:left-auto md:-translate-x-0 md:right-8 z-[8500] flex flex-col gap-3">
          {showScrollTop && (
            <button onClick={scrollToTop} aria-label="Cuộn lên đầu trang" className="bg-slate-900/70 backdrop-blur-md border border-white/10 text-white w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-sky-500 hover:scale-110 transition-all">
              <FiArrowUp className="text-2xl"/>
            </button>
          )}
        </div>

        {/* CHAT WIDGET */}
        <ChatWidget {...chatProps} />

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        {/* FIX: setCurrentView is now passed so the search bar can switch to
            the shop view WITHOUT calling navigateTo (which would clear the query) */}
        <Header
          currentView={currentView}
          isDarkMode={isDarkMode}
          isHeaderVisible={isHeaderVisible}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isMobileSearchOpen={isMobileSearchOpen}
          setIsMobileSearchOpen={setIsMobileSearchOpen}
          cartItemCount={cartItemCount}
          isAdmin={isAdmin}
          hasUnreadUser={hasUnreadUser}
          totalAdminUnread={totalAdminUnread}
          currentCategory={currentCategory}
          lang={lang}
          t={t}
          navigateTo={navigateTo}
          setCurrentView={setCurrentView}
          setIsCartOpen={setIsCartOpen}
          setIsUnifiedMenuOpen={setIsUnifiedMenuOpen}
          setIsHelpOpen={setIsHelpOpen}
          displayedProducts={displayedProducts}
          t_prod={t_prod}
          user={user}
        />

        {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
        <main ref={mainRef} className={`flex-grow block relative w-full overflow-x-hidden pb-[65px] md:pb-0 ${currentView === 'home' ? 'pt-0' : 'pt-[100px] md:pt-[130px]'}`}>

          {currentView === 'home' && window.innerWidth >= 768 && (
            <HomeView isDarkMode={isDarkMode} t={t} navigateTo={navigateTo} lookbook={lookbook} />
          )}

          {currentView === 'shop' && (
            <ShopView
              isDarkMode={isDarkMode} t={t} t_prod={t_prod} currentCategory={currentCategory}
              selectedTag={selectedTag} setSelectedTag={setSelectedTag}
              sortOrder={sortOrder} setSortOrder={setSortOrder}
              isLoadingShop={isLoadingShop} displayedProducts={displayedProducts}
              navigateTo={navigateTo} handleAddToCart={handleAddToCart}
              translateTag={translateTag} fakeColorSpheres={fakeColorSpheres}
            />
          )}

          {currentView === 'productDetail' && selectedProduct && (
            <ProductDetailView
              isDarkMode={isDarkMode} t={t} t_prod={t_prod} isAdmin={isAdmin}
              selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct}
              handleAddToCart={handleAddToCart} setIsCartOpen={setIsCartOpen}
              setEditFormData={setEditFormData} setShowEditModal={setShowEditModal}
            />
          )}

          {/* FIX: db={db} was missing — cancel order button needs it */}
          {currentView === 'profile' && user && (
            <ProfileView
              isDarkMode={isDarkMode} t={t} isAdmin={isAdmin} user={user}
              nickname={nickname} setNickname={setNickname}
              avatarUrl={avatarUrl} coverUrl={coverUrl}
              isEditingName={isEditingName} setIsEditingName={setIsEditingName}
              tempName={tempName} setTempName={setTempName}
              handleSaveName={handleSaveName} handleProfileUpload={handleProfileUpload}
              handleLogout={handleLogout} myOrders={myOrders} showToast={showToast}
              navigateTo={navigateTo} setSurveyStep={setSurveyStep} setShowSurveyModal={setShowSurveyModal}
              setTempSettings={setTempSettings} setIsSettingsDrawerOpen={setIsSettingsDrawerOpen}
              phone={phone} address={address} district={district} lang={lang}
              db={db}
            />
          )}

          {currentView === 'admin' && isAdmin && (
            <AdminView
              isDarkMode={isDarkMode} t={t} t_prod={t_prod}
              localProducts={localProducts} setLocalProducts={setLocalProducts}
              adminOrders={adminOrders} usersList={usersList}
              handleDeleteProduct={handleDeleteProduct}
              setShowAddModal={setShowAddModal} setEditFormData={setEditFormData} setShowEditModal={setShowEditModal}
              openAdminChatWithUser={openAdminChatWithUser}
              setPreviewImg={setPreviewImg} showToast={showToast} navigateTo={navigateTo}
              db={db}
            />
          )}
        </main>

        {/* BOTTOM NAV (Mobile) */}
        <BottomNav isDarkMode={isDarkMode} currentView={currentView} navigateTo={navigateTo} requireLogin={requireLogin} />

        {/* FOOTER */}
        <Footer
          t={t} navigateTo={navigateTo} showToast={showToast} requireLogin={requireLogin}
          setShowPrivacyModal={setShowPrivacyModal} setShowTermsModal={setShowTermsModal}
          setShowStoryModal={setShowStoryModal} setShowCareerModal={setShowCareerModal}
          setShowContactModal={setShowContactModal}
        />

        {/* ── MODALS ─────────────────────────────────────────────────────────── */}

        <CartModal
          isDarkMode={isDarkMode} t={t} t_prod={t_prod} isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen} cart={cart} cartItemCount={cartItemCount}
          paymentMode={paymentMode} setPaymentMode={setPaymentMode}
          cartFinalTotal={cartFinalTotal} depositAmount={depositAmount}
          updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart}
          handleProceedCheckout={handleProceedCheckout} navigateTo={navigateTo}
        />

        <CheckoutModal
          isDarkMode={isDarkMode} t={t} t_prod={t_prod} showCheckoutModal={showCheckoutModal}
          setShowCheckoutModal={setShowCheckoutModal} cart={cart} cartProductsTotal={cartProductsTotal}
          shippingFee={shippingFee} cartFinalTotal={cartFinalTotal} paymentMode={paymentMode}
          depositAmount={depositAmount} currentOrderId={currentOrderId}
          receiptImg={receiptImg} isCheckingPayment={isCheckingPayment}
          handleReceiptUpload={handleReceiptUpload} handleConfirmPayment={handleConfirmPayment}
          removeFromCart={removeFromCart}
        />

        <LoginModal
          showLoginModal={showLoginModal}
          isAuthenticated={isAuthenticated}
          setShowLoginModal={setShowLoginModal}
          authMode={authMode} setAuthMode={setAuthMode}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          handleEmailAuth={handleEmailAuth}
          handleGoogleLogin={handleGoogleLogin}
          handleFacebookLogin={handleFacebookLogin}
          t={t}
        />

        <SettingsDrawer
          isSettingsDrawerOpen={isSettingsDrawerOpen} setIsSettingsDrawerOpen={setIsSettingsDrawerOpen}
          isDarkMode={isDarkMode} isAuthenticated={isAuthenticated} user={user} t={t}
          tempSettings={tempSettings} setTempSettings={setTempSettings}
          setNickname={setNickname} setPhone={setPhone} setAddress={setAddress} setDistrict={setDistrict}
          handleThemeToggle={handleThemeToggle} setLang={setLang} showToast={showToast}
          daNangDistricts={daNangDistricts} db={db}
        />

        <SurveyModal
          showSurveyModal={showSurveyModal} isAuthenticated={isAuthenticated}
          isDarkMode={isDarkMode} surveyStep={surveyStep} setSurveyStep={setSurveyStep}
          surveyData={surveyData} setSurveyData={setSurveyData}
          handleThemeToggle={handleThemeToggle} setNickname={setNickname}
          setUserRole={setUserRole} setShowSurveyModal={setShowSurveyModal}
          showToast={showToast} user={user} db={db}
        />

        <AdminProductModals
          isAdmin={isAdmin} isDarkMode={isDarkMode} t={t}
          showAddModal={showAddModal} setShowAddModal={setShowAddModal}
          newProd={newProd} setNewProd={setNewProd} handleSubmitNewProduct={handleSubmitNewProduct}
          showEditModal={showEditModal} setShowEditModal={setShowEditModal}
          editFormData={editFormData} setEditFormData={setEditFormData}
          localProducts={localProducts} setLocalProducts={setLocalProducts}
          setSelectedProduct={setSelectedProduct} showToast={showToast} db={db}
          compressImage={compressImage}
        />

        <InfoModals
          isDarkMode={isDarkMode} t={t}
          showPrivacyModal={showPrivacyModal} setShowPrivacyModal={setShowPrivacyModal}
          showTermsModal={showTermsModal} setShowTermsModal={setShowTermsModal}
          showStoryModal={showStoryModal} setShowStoryModal={setShowStoryModal}
          showCareerModal={showCareerModal} setShowCareerModal={setShowCareerModal}
          showContactModal={showContactModal} setShowContactModal={setShowContactModal}
          showCookieConsent={showCookieConsent} setShowCookieConsent={setShowCookieConsent}
          previewImg={previewImg} setPreviewImg={setPreviewImg}
          successOrderInfo={successOrderInfo} setSuccessOrderInfo={setSuccessOrderInfo}
          setIsHelpOpen={setIsHelpOpen}
        />

        <UnifiedMenuDrawer
          isUnifiedMenuOpen={isUnifiedMenuOpen} setIsUnifiedMenuOpen={setIsUnifiedMenuOpen}
          isDarkMode={isDarkMode} handleThemeToggle={handleThemeToggle}
          lang={lang} setLang={setLang} currentView={currentView}
          isAuthenticated={isAuthenticated} handleLogout={handleLogout}
          navigateTo={navigateTo} requireLogin={requireLogin} t={t}
          showToast={showToast}
          setShowPrivacyModal={setShowPrivacyModal}
          setShowTermsModal={setShowTermsModal}
          setShowStoryModal={setShowStoryModal}
          setShowCareerModal={setShowCareerModal}
          setShowContactModal={setShowContactModal}
        />

        {/* PUSH NOTIFICATION — email-card style, slides from top */}
        <PushNotification toast={toastMsg} onDismiss={() => setToastMsg(null)} />
      </div>
    </>
  );
}
