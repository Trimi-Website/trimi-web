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
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth, googleProvider, db } from './firebase';
import {
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged, signOut, FacebookAuthProvider,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, deleteDoc, collection, onSnapshot, arrayUnion,
} from 'firebase/firestore';

// Constants & Utils
import { dict, productDict, initialProducts, defaultLookbookData, fakeColorSpheres, daNangDistricts } from './constants/data';
import { compressImage } from './utils/imageUtils';

// Components
// VirtualRoom removed — 3D feature disabled for performance
import SizeGuideModal from './components/SizeGuideModal';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import FriendsModal from './components/FriendModal';
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
import FriendsView from "./views/FriendsView";
import HomeView from './views/HomeView';
import ShopView from './views/ShopView';
import ProductDetailView from './views/ProductDetailView';
import ProfileView from './views/ProfileView';
import AdminView from './views/AdminView';
import ShipperView from './views/ShipperView';

export default function App() {
  const mainRef = useRef(null);
  const lastClickPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);
  const scrollTopTimeout = useRef(null);

  // ─── AUTH ─────────────────────────────────────────────────────────────────
  const [danangWeather, setDanangWeather] = useState('Đang cập nhật...');
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
  const [pendingRequests, setPendingRequests] = useState([]); // incoming friend requests

  // ─── THÊM CẤU HÌNH CHO LITTLE TRIMI ───
  const [littleTrimiConfig, setLittleTrimiConfig] = useState({
    color: localStorage.getItem('trimi_sphere_color') || '#d946ef', // Màu mặc định
    effect: localStorage.getItem('trimi_sphere_effect') || 'spin'    // Hiệu ứng mặc định: 'spin', 'wave', 'heartbeat', 'relax'
  });

  // Hàm để lưu cấu hình vào localStorage (Chuyền hàm này xuống SettingsDrawer)
  const updateLittleTrimiConfig = (newConfig) => {
    const config = { ...littleTrimiConfig, ...newConfig };
    setLittleTrimiConfig(config);
    if (config.color) localStorage.setItem('trimi_sphere_color', config.color);
    if (config.effect) localStorage.setItem('trimi_sphere_effect', config.effect);
  };

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
  const [unreadBellCount, setUnreadBellCount] = useState(0);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

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
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  // showVirtualRoom removed — 3D feature disabled
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
  // isShipper: admin is always a shipper (can upload proofs + manage deliveries).
  // Role-based check (UID-granted via admin dashboard) takes priority.
  // Email fallback covers the hardcoded initial shippers.
  const SHIPPER_EMAILS_FALLBACK = ['phanbasongtoan112@gmail.com', '690demonking069@gmail.com'];
  const isShipper = isAdmin || userRole === 'shipper' || SHIPPER_EMAILS_FALLBACK.includes(user?.email);
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
  // ── LẤY THỜI TIẾT ĐÀ NẴNG CHO AI ──
  useEffect(() => {
    // API wttr.in trả về format: Nhiệt độ + Tình trạng (VD: +32°C Clear)
    fetch('https://wttr.in/DaNang?format=%t+%C&M')
      .then(res => res.text())
      .then(text => setDanangWeather(text.replace('+', ''))) // Xóa dấu + cho tự nhiên
      .catch(() => setDanangWeather('Không xác định'));
  }, []);
  // ── FIX LỖI SCROLL KHI RELOAD TRANG ──
  useEffect(() => {
    // Tắt tính năng tự động nhớ vị trí cuộn của trình duyệt
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Ép trang web cuộn lên top (0,0) mỗi khi tải lại
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768 && currentView === 'home') {
      setCurrentView('shop'); setCurrentCategory('all');
    }
  }, []);

  // Handle result from signInWithRedirect (fires if user was redirected back after Google login)
  useEffect(() => {
    getRedirectResult(auth)
      .then(result => {
        if (result?.user) {
          setShowLoginModal(false);
        }
      })
      .catch(err => {
        if (err.code !== 'auth/no-auth-event') {
          console.error('Redirect result error:', err.code);
        }
      });
  }, []);

  useEffect(() => {
    const handleClick = (e) => { lastClickPos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // NotificationBell broadcasts its unread count so BottomNav badge stays in sync
  useEffect(() => {
    const handler = (e) => setUnreadBellCount(e.detail ?? 0);
    document.addEventListener('trimi:bell-count', handler);
    return () => document.removeEventListener('trimi:bell-count', handler);
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
      // ── BUG FIX 4: was `if (isAdmin)` only — shippers also need all orders
      //    so ShipperView can filter by shipper.uid/email on the client side
      if (isAdmin || userRole === 'shipper') setAdminOrders(sorted);
      setMyOrders(sorted.filter(o => o.uid === user.uid));
    }, (err) => { console.error('Orders snapshot error:', err); });
    return () => unsub();
  }, [user, isAdmin, userRole]);

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
            // Always load role — needed for isShipper check
            setUserRole(data.role || 'Khách hàng');
            const isSurveyDone = localStorage.getItem(`trimi_survey_done_${currentUser.uid}`);
            if (!data.isSurveyCompleted && !isSurveyDone) {
              setSurveyData(prev => ({ ...prev, name: data.nickname || baseEmailName }));
              setShowSurveyModal(true); setSurveyStep(1);
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

  // Real-time listener for current user's own doc — updates chat, role, AND friends list
  // so that UID-granted Shipper role takes effect instantly without re-login.
  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setChatMessages(data.messages || []);
      setHasUnreadUser(data.hasUnreadUser || false);
      setFriendsList(data.friends || []);
      // KEY: update role in real-time so UID-granted Shipper role works instantly
      if (data.role && data.role !== userRole) setUserRole(data.role);
    });
  }, [user?.uid]); // intentionally only uid — avoids stale closure re-subscribe

  // Listen for incoming friend requests (type='friend_request' in notification bucket)
  useEffect(() => {
    if (!user) return;
    const ref = collection(db, 'notifications', user.uid, 'items');
    return onSnapshot(ref, (snap) => {
      const requests = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.type === 'friend_request' && data.fromUid && !friendsList.includes(data.fromUid)) {
          requests.push({ id: d.id, ...data });
        }
      });
      setPendingRequests(requests);
    }, () => {});
  }, [user, friendsList]);

  useEffect(() => {
    // Guard: activeChatTarget must be a user object with a valid uid string
    if (!user || !activeChatTarget || activeChatTarget === 'admin' || isAdmin) return;
    if (!activeChatTarget?.uid || typeof activeChatTarget.uid !== 'string') return;
    const chatId = [user.uid, activeChatTarget.uid].sort().join('_');
    if (!chatId || chatId.includes('undefined')) return; // extra safety
    return onSnapshot(
      doc(db, 'p2p_chats', chatId),
      (docSnap) => {
        setP2pMessages(docSnap.exists() ? (docSnap.data()?.messages || []) : []);
      },
      (err) => { console.warn('[P2P] snapshot error:', err.code); setP2pMessages([]); }
    );
  }, [user?.uid, activeChatTarget?.uid, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !adminChatUser?.uid) return;
    return onSnapshot(
      doc(db, 'users', adminChatUser.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setAdminChatUser(prev => prev ? { ...prev, messages: docSnap.data()?.messages || [] } : prev);
        }
      },
      (err) => console.warn('[AdminChat] snapshot error:', err.code)
    );
  }, [isAdmin, adminChatUser?.uid]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  // Accepts either a plain string or a rich object { title, body, type }
  const showToast = (msg, type = 'default') => {
    setToastMsg(typeof msg === 'string' ? { title: msg, body: null, type } : msg);
    setTimeout(() => setToastMsg(null), 3000);
  };const requireLogin = (action) => {
  if (!isAuthenticated) {
    setShowLoginModal(true);
    return;
  }
  action();
};

const openSettingsDrawer = () => {
  if (!isAuthenticated) {
    setAuthMode('login');
    setShowLoginModal(true);
    showToast('Vui lòng đăng nhập để dùng tính năng Cài đặt.');
    return;
  }

  setTempSettings({
    nickname,
    phone,
    address,
    district,
    theme: isDarkMode ? 'dark' : 'light',
    lang,
  });

  setIsSettingsDrawerOpen(true);
};
  
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ── 1. THÊM HÀM ĐÓNG SẠCH SẼ MỌI MODAL/TAB ĐANG MỞ ───
  const closeAllModals = () => {
    setIsCartOpen(false);
    setIsChatBoxOpen(false); 
    setIsHelpOpen(false);     
    setShowFriendsModal(false);
    setIsUnifiedMenuOpen(false); 
    setIsSettingsDrawerOpen(false);
  };

  const navigateTo = (view, category = 'all', product = null) => {
    closeAllModals(); // Gọi hàm dọn dẹp ở đây
    setIsCartOpen(false);
    setIsChatBoxOpen(false);
    setShowFriendsModal(false);

    // ── Home → Shop: circular bloom identical to the theme toggle ─────────
    if (currentView === 'home' && view === 'shop') {
      const x = lastClickPos.current.x;
      const y = lastClickPos.current.y;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      ) + 100;

      const doSwitch = () => {
        setCurrentView(view); setCurrentCategory(category); setSelectedProduct(product);
        setSearchQuery(''); setIsUnifiedMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'instant' });
        window.history.pushState({ view, category, product }, '', `?view=${view}`);
      };

      if (!document.startViewTransition) { doSwitch(); return; }

      const transition = document.startViewTransition(doSwitch);
      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(0.87, 0, 0.13, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      });
      return;
    }
    // ── All other navigation ───────────────────────────────────────────────
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
      // Primary: popup (works on most browsers and production)
      await signInWithPopup(auth, googleProvider);
      setShowLoginModal(false);
    } catch (error) {
      console.error('Google popup error:', error.code, error.message);
      // COOP/popup-blocked fallback: use redirect flow
      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request' ||
        error.message?.toLowerCase().includes('coop') ||
        error.message?.toLowerCase().includes('cross-origin')
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          // getRedirectResult is called in the startup useEffect below
        } catch (redirectErr) {
          console.error('Google redirect error:', redirectErr);
          showToast('Không thể đăng nhập Google. Vui lòng thử lại!');
        }
      } else {
        showToast('Đăng nhập Google thất bại: ' + (error.message || 'Lỗi không xác định'));
      }
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
        setTimeout(() => {
  openSettingsDrawer();
}, 800);
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
      // ── NOTIFICATION: Alert admin about the new order ──────────────────
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

      // ── NOTIFICATION: Confirm to USER in their bell (no floating toast) ──
      await setDoc(
        doc(db, 'notifications', user.uid, 'items', `placed_${currentOrderId}`),
        {
          type:      'new_order',
          title:     '✅ Đặt hàng thành công!',
          body:      `Đơn ${currentOrderId} đã được ghi nhận. Chúng tôi sẽ xác nhận sớm!`,
          isRead:    false,
          createdAt: Date.now(),
          orderId:   currentOrderId,
        }
      ).catch(() => {});

      setTimeout(() => {
        setIsCheckingPayment(false);
        setSuccessOrderInfo(currentOrderId);
        setCart([]); setShowCheckoutModal(false);
        // No showToast here — the bell notification is the confirmation
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

  // ── Friend request system ────────────────────────────────────────────────
  // Instead of silently adding, we send a notification to the target user's
  // bell bucket. They accept/decline from the UnifiedMenu Friends section.
  const handleAddFriend = async (e, targetUid) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (!user) return;
    if (friendsList.includes(targetUid)) return showToast('Đã là bạn bè rồi!');
    try {
      await setDoc(
        doc(db, 'notifications', targetUid, 'items', `fr_${user.uid}`),
        {
          type:      'friend_request',
          title:     '👋 Lời mời kết bạn',
          body:      `${nickname} muốn kết bạn với bạn`,
          fromUid:   user.uid,
          fromName:  nickname,
          fromAvatar: avatarUrl || '',
          isRead:    false,
          createdAt: Date.now(),
        }
      );
      showToast('Đã gửi lời mời kết bạn!');
    } catch (err) {
      console.error('Lỗi Firestore:', err);
      showToast('Lỗi: Firebase Rules đang chặn quyền gửi lời mời!');
    }
  };

  const handleAcceptFriend = async (fromUid) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid),    { friends: arrayUnion(fromUid)   }, { merge: true });
      await setDoc(doc(db, 'users', fromUid),     { friends: arrayUnion(user.uid)  }, { merge: true });
      
      // Đổi notification thành dạng tin nhắn thay vì xóa
      await setDoc(doc(db, 'notifications', user.uid, 'items', `fr_${fromUid}`), {
        type: 'new_message',
        title: '✅ Đã chấp nhận kết bạn',
        body: 'Hai bạn đã trở thành bạn bè.',
        isRead: true
      }, { merge: true }).catch(() => {});

      await setDoc(doc(db, 'notifications', fromUid, 'items', `fa_${user.uid}`), {
        type: 'new_message', title: '✅ Đã chấp nhận kết bạn',
        body: `${nickname} đã chấp nhận lời mời kết bạn của bạn`,
        isRead: false, createdAt: Date.now(),
      }).catch(() => {});

      setFriendsList(prev => [...prev, fromUid]);
      setPendingRequests(prev => prev.filter(r => r.fromUid !== fromUid));
      showToast('Đã kết bạn thành công!');
    } catch (err) { console.error(err); }
  };

  const handleDeclineFriend = async (fromUid) => {
    if (!user) return;
    try {
      // Đổi notification thành dạng tin nhắn bị từ chối
      await setDoc(doc(db, 'notifications', user.uid, 'items', `fr_${fromUid}`), {
        type: 'new_message',
        title: '❌ Đã từ chối kết bạn',
        body: 'Bạn đã từ chối lời mời này.',
        isRead: true
      }, { merge: true }).catch(() => {});

      setPendingRequests(prev => prev.filter(r => r.fromUid !== fromUid));
      showToast('Đã từ chối lời mời kết bạn.');
    } catch (err) { console.error(err); }
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
        // --- BẮT ĐẦU TÍCH HỢP GEMINI AI (BẢN XOAY TUA KEY + GIỚI HẠN) ---
        // 1. Kiểm tra giới hạn lượt hỏi của khách
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        let currentUsage = userSnap.exists() ? (userSnap.data().usageCount || 0) : 0;
        const MAX_QUESTIONS_PER_USER = 5; // Cho phép khách hỏi 5 câu/ngày

        if (currentUsage >= MAX_QUESTIONS_PER_USER) {
          // Nếu khách đã hỏi quá 5 câu -> Báo hết lượt, KHÔNG gọi AI nữa
          const limitMsg = "Trimi-ni xin lỗi nha! Hôm nay cậu đã hỏi hết lượt tư vấn miễn phí rồi. Hẹn cậu quay lại ngày mai hoặc nhắn tin trực tiếp cho Fanpage Trimi để mình tư vấn thêm nhé! 🥰";
          await setDoc(userRef, { 
            messages: arrayUnion({ sender: 'bot', text: limitMsg, timestamp: Date.now() }), 
            hasUnreadUser: true 
          }, { merge: true });
        } else {
          // 2. Lấy API Key từ biến môi trường để bảo mật (Không ghi trực tiếp)
        const apiKeys = [
          import.meta.env.VITE_GEMINI_KEY_1,
          import.meta.env.VITE_GEMINI_KEY_2,
          import.meta.env.VITE_GEMINI_KEY_3,
          import.meta.env.VITE_GEMINI_KEY_4,
          import.meta.env.VITE_GEMINI_KEY_5
        ].filter(Boolean); // Lọc bỏ đi những key rỗng nếu cậu chưa nhập đủ 5 cái

          const productsInfo = localProducts.map(p => `- ${p.name}: ${p.price.toLocaleString('vi-VN')}đ`).join('\n');
          const systemPrompt = `Bạn tên là "Trimi-ni" - một Gen Z chính hiệu, stylist cực chất và là chuyên viên tư vấn của thương hiệu thời trang local brand Trimi.
          Bạn đang chat với khách hàng tên là: ${nickname}. 
          
          🌤️ BỐI CẢNH HIỆN TẠI (RẤT QUAN TRỌNG): 
          - Khách hàng đang ở khu vực Đà Nẵng.
          - Thời tiết Đà Nẵng lúc này đang là: ${danangWeather}.
          - Dựa vào thời tiết này, hãy chủ động gợi ý trang phục phù hợp (nếu trời nóng -> gợi ý áo thun mát; nếu trời lạnh/mưa -> gợi ý áo dài tay/hoodie).

          ⛔ QUY TẮC VỀ ĐỘ DÀI (CỰC KỲ QUAN TRỌNG - BẮT BUỘC TUÂN THỦ):
          - TUYỆT ĐỐI KHÔNG VIẾT DÀI DÒNG. Hãy nhắn tin giống như đang chat Messenger/Zalo với bạn bè. 
          - Khách chào ngắn (hi, hello, yo...): Chỉ chào lại đúng 1 câu ngắn.
          - Khách hỏi giá/ship/thông tin đơn giản: Trả lời thẳng vào vấn đề ngay lập tức trong 1-2 câu ngắn.
          - Khách nhờ tư vấn phối đồ: Trả lời tối đa 3 câu, ngắt dòng cho dễ đọc.
          - KHÔNG ĐƯỢC tự ý hỏi thêm hoặc kể lể dài dòng nếu khách chưa yêu cầu.

          🎯 ĐẶC ĐIỂM TÍNH CÁCH:
          - Xưng là "Trimi-ni" (hoặc Trimi) và gọi khách là "${nickname}", "cậu", "bạn". 
          - Tự nhiên, thân thiện, thả thính sương sương, dùng một ít emoji cho vui mắt.

          📜 QUY ĐỊNH & KHO HÀNG CỦA SHOP:
          - Freeship nội thành Đà Nẵng. Khách tỉnh khác phí ship 20.000đ.
          - Thanh toán: Chuyển khoản thẳng 100% hoặc cọc 30% qua mã QR.
          - Danh sách sản phẩm hiện có: \n${productsInfo}\n
          
          HƯỚNG DẪN XỬ LÝ TÌNH HUỐNG: 
          - Nếu khách hỏi ngoài lề, đùa 1 câu cực ngắn rồi khéo léo bẻ lái về quần áo Trimi.`;

          const prompt = `${systemPrompt}\n\nKhách hỏi: "${userMsgText}"\nTrimi AI trả lời:`;
          let aiReply = "";

          // 3. Vòng lặp Xoay tua Key
          for (let i = 0; i < apiKeys.length; i++) {
            try {
              const genAI = new GoogleGenerativeAI(apiKeys[i]);
              const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
              const result = await model.generateContent(prompt);
              aiReply = result.response.text().replace(/\*\*/g, '').trim();
              
              if (aiReply) break; // Lấy câu trả lời thành công thì thoát vòng lặp ngay
            } catch (error) {
              if (error.message.includes("429")) {
                console.warn(`Key số ${i+1} đã cạn. Đang tự động đổi sang Key tiếp theo...`);
                continue; // Lỗi 429 thì nhảy sang Key tiếp theo
              }
              // Lỗi mạng hoặc lỗi khác
              console.error("Lỗi AI:", error);
              aiReply = "Xin lỗi bạn, Trimi AI đang bảo trì chút xíu, bạn chờ xíu hoặc nhắn lại sau nhé! 😅";
              break;
            }
          }

          // 4. Lưu câu trả lời và Cộng thêm 1 lượt dùng cho khách
          if (aiReply) {
            setTimeout(async () => {
              await setDoc(userRef, { 
                messages: arrayUnion({ sender: 'bot', text: aiReply, timestamp: Date.now() }), 
                hasUnreadUser: true,
                usageCount: currentUsage + 1 // CỘNG 1 LƯỢT
              }, { merge: true });
            }, 100);
          }
        }
        // --- KẾT THÚC TÍCH HỢP GEMINI AI ---
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
                    /* ── 1. CÁC HIỆU ỨNG CỦA LITTLE TRIMI ─── */
        
        /* Hiệu ứng 1: Xoay vòng (Gốc) - spin */
        @keyframes spin-gradient {
          0% { transform: rotate(0deg); filter: hue-rotate(0deg); }
          100% { transform: rotate(360deg); filter: hue-rotate(360deg); }
        }

        /* Hiệu ứng 2: Sóng - wave */
        @keyframes wave-gradient {
          0%, 100% { clip-path: polygon(0% 45%, 16% 44%, 33% 50%, 54% 60%, 70% 61%, 84% 59%, 100% 52%, 100% 100%, 0% 100%); }
          50% { clip-path: polygon(0% 60%, 15% 65%, 34% 66%, 51% 62%, 67% 50%, 84% 45%, 100% 46%, 100% 100%, 0% 100%); }
        }

        /* Hiệu ứng 3: Thư giãn (Lướt nhẹ) - relax */
        @keyframes relax-gradient {
          0%, 100% { background-size: 200% 200%; background-position: left bottom; }
          50% { background-size: 150% 150%; background-position: right top; }
        }

        /* Hiệu ứng 4: Nhịp tim (Đập) - heartbeat */
        @keyframes heartbeat {
          0% { transform: scale(1); box-shadow: 0 0 15px rgba(var(--sphere-color-rgb), 0.5); }
          15% { transform: scale(1.15); box-shadow: 0 0 25px rgba(var(--sphere-color-rgb), 0.7); }
          30% { transform: scale(1); }
          45% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        /* ── 2. CLASS CHÍNH CHO QUẢ CẦU ─── */
        .magic-sphere {
          /* Sử dụng màu từ state làm biến CSS */
          background: linear-gradient(135deg, #38bdf8, var(--sphere-color), #6366f1);
          background-size: 200% 200%;
          /* Thêm shadow động theo màu */
          box-shadow: 0 0 20px rgba(var(--sphere-color-rgb), 0.6), inset 0 0 10px rgba(255,255,255,0.5);
        }

        /* ── 3. ÁP DỤNG HIỆU ỨNG ĐỘNG (Dựa trên class effect-*) ─── */
        .effect-spin { animation: spin-gradient 4s linear infinite; }
        .effect-wave { animation: relax-gradient 8s ease infinite; position: relative; }
        .effect-wave::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.2); animation: wave-gradient 4s ease-in-out infinite; }
        .effect-relax { animation: relax-gradient 6s ease-in-out infinite; }
        .effect-heartbeat { animation: heartbeat 1.5s ease-in-out infinite; }
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
        main { position: relative; overflow-x: clip; width: 100%; }
        .cartoon-ease { transition-timing-function: cubic-bezier(0.68, -0.6, 0.27, 1.55) !important; }
        .btn-run-away { transform: translateX(120vw) rotate(15deg) !important; transition: transform 0.6s cubic-bezier(0.68, -0.6, 0.27, 1.55) !important; }
        .anim-home-to-shop-prepare #other-pages-content { transform: translateX(100%); transition: none; }
        .anim-home-to-shop-run .hero-buy-button { transform: translateX(100vw); transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1); }
        .anim-home-to-shop-run #home-page-content { transform: translateX(-100%); transition: transform 0.7s cubic-bezier(0.68, -0.6, 0.27, 1.55); }
        .anim-home-to-shop-run #other-pages-content { transform: translateX(0); transition: transform 0.7s cubic-bezier(0.68, -0.6, 0.27, 1.55); transition-delay: 0.1s; }
        .page-transition-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: white; z-index: 9999; opacity: 0; visibility: hidden; transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out; }
        .page-transition-overlay.active { opacity: 1; visibility: visible; }
        @keyframes toastProgress { from { width: 100%; } to { width: 0%; } }
        @keyframes pageFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .page-fade-in { animation: pageFadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }

        /* ── PRODUCT CARD FADE-IN ENTRANCE ── */
        @keyframes trimi-card-enter {
          from { opacity: 0; transform: translateY(22px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .trimi-card-enter {
          animation: trimi-card-enter 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* ── PRODUCT CARD HOVER — premium lift + glow ── */
        .trimi-product-hover {
          transition: transform 0.28s cubic-bezier(0.22,1,0.36,1),
                      box-shadow 0.28s cubic-bezier(0.22,1,0.36,1),
                      border-color 0.22s ease !important;
          will-change: transform;
        }
        .trimi-product-hover:hover {
          transform: translateY(-8px) scale(1.025) !important;
          box-shadow: 0 24px 56px rgba(0,0,0,0.16), 0 0 0 2px #38bdf8 !important;
          border-color: #38bdf8 !important;
        }
        .trimi-product-hover:hover img {
          transform: scale(1.07);
        }

        /* ── BUTTON LIFT ── */
        .trimi-btn-lift {
          transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.2s ease !important;
          will-change: transform;
        }
        .trimi-btn-lift:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important;
        }
        .trimi-btn-lift:active { transform: translateY(0) !important; }

        /* ── ADD-TO-CART fly animation ── */
        @keyframes add-to-cart-fly {
          0%   { opacity: 1; transform: scale(1) translate(0, 0); }
          80%  { opacity: 0.8; transform: scale(0.5) translate(var(--diff-x), var(--diff-y)); }
          100% { opacity: 0; transform: scale(0.2) translate(var(--diff-x), var(--diff-y)); }
        }
        .animate-add-to-cart-fly { animation: add-to-cart-fly 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      `}</style>

      <div 
        className={`min-h-screen w-full font-sans flex flex-col relative transition-colors duration-300 ${isDarkMode ? 'dark-mode text-white bg-[#111111]' : 'text-slate-900 bg-[#f8fafc]'}`}
        // TRUYỀN BIẾN CSS VÀO ĐÂY ĐỂ ĐỔI MÀU QUẢ CẦU
        style={{ 
          '--sphere-color': littleTrimiConfig.color,
          '--sphere-color-rgb': (() => {
            const hex = littleTrimiConfig.color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `${r}, ${g}, ${b}`;
          })()
        }}
      >

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
        {(currentView === 'shop' || currentView === 'productDetail') && (
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
            requireLogin={requireLogin}
            avatarUrl={avatarUrl}
            onAcceptFriend={handleAcceptFriend}
            onDeclineFriend={handleDeclineFriend}
            onAddFriend={handleAddFriend}
            handleThemeToggle={handleThemeToggle}
          />
        )}

        {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
        <main ref={mainRef} className={`flex-grow block relative w-full overflow-x-hidden pb-[65px] md:pb-0 ${
          currentView === 'home' ? 'pt-0' :
          // Áp dụng padding-top cho Profile trên PC (md:pt-[130px])
          currentView === 'profile' ? 'pt-0 md:pt-[130px]' : 
          currentView === 'friends' ? 'pt-[55px] md:pt-[70px]' :
          (currentView === 'shop' || currentView === 'productDetail') ? 'pt-[108px] md:pt-[120px]' :
          'pt-[100px] md:pt-[130px]'
        }`}>
          {/* HOME — NO fade-in wrapper: the hero uses position:fixed which breaks
              inside any element that has a CSS transform applied to it.
              The scroll-reveal parallax effect is purely CSS/scroll-native. */}
          {currentView === 'home' && window.innerWidth >= 768 && (
            <HomeView 
              isDarkMode={isDarkMode} 
              navigateTo={navigateTo} 
              localProducts={localProducts} /* <-- TRUYỀN DATA THẬT XUỐNG ĐÂY */
            />
          )}

          {currentView === 'shop' && (
            <div key="shop" className="page-fade-in">
              <ShopView
                isDarkMode={isDarkMode} t={t} t_prod={t_prod} currentCategory={currentCategory}
                selectedTag={selectedTag} setSelectedTag={setSelectedTag}
                sortOrder={sortOrder} setSortOrder={setSortOrder}
                isLoadingShop={isLoadingShop} displayedProducts={displayedProducts}
                navigateTo={navigateTo} handleAddToCart={handleAddToCart}
                translateTag={translateTag} fakeColorSpheres={fakeColorSpheres}
                isShipper={isShipper}
                searchQuery={searchQuery}
                setSearchQuery={(q) => { setSearchQuery(q); }}
              />
            </div>
          )}

          {currentView === 'productDetail' && selectedProduct && (
            <div key={`detail-${selectedProduct.id}`} className="page-fade-in">
              <ProductDetailView
                isDarkMode={isDarkMode} t={t} t_prod={t_prod} isAdmin={isAdmin}
                selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct}
                handleAddToCart={handleAddToCart} setIsCartOpen={setIsCartOpen}
                setEditFormData={setEditFormData} setShowEditModal={setShowEditModal}
              />
            </div>
          )}

          {currentView === 'profile' && user && (
            <div key="profile" className="page-fade-in">
              <ProfileView
                isDarkMode={isDarkMode} t={t} isAdmin={isAdmin} isShipper={isShipper} user={user}
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
            </div>
          )}

          {currentView === 'admin' && isAdmin && (
            <div key="admin" className="page-fade-in">
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
            </div>
          )}

          {/* ── SHIPPER DASHBOARD ── only for authorized shipper emails */}
          {currentView === 'shipper' && isShipper && (
            <div key="shipper" className="page-fade-in">
              <ShipperView
                isDarkMode={isDarkMode}
                user={user}
                adminOrders={adminOrders}
                db={db}
                showToast={showToast}
              />
            </div>
          )}
        </main>

        {/* BOTTOM NAV (Mobile) - Chỉ hiện khi Menu đang đóng */}
        {!isUnifiedMenuOpen && (
          <div className="z-[99990] relative"> 
            <BottomNav
              isDarkMode={isDarkMode}
              currentView={currentView}
              // TRUYỀN CẤU HÌNH TRIMI
              littleTrimiConfig={littleTrimiConfig}
              navigateTo={navigateTo}
              requireLogin={requireLogin}
              cartItemCount={cartItemCount}
              hasUnreadUser={hasUnreadUser}
              totalAdminUnread={totalAdminUnread}
              isAdmin={isAdmin}
              unreadBellCount={unreadBellCount}
              pendingRequestsCount={pendingRequests.length}
              
              // Sửa 3 dòng dưới đây: Đóng tab cũ trước khi mở tab mới
              setIsHelpOpen={(val) => { if(val) closeAllModals(); setIsHelpOpen(val); }}
              setIsCartOpen={(val) => { if(val) closeAllModals(); setIsCartOpen(val); }}
              setShowFriendsModal={() => navigateTo('friends')}
              
              // Thêm dòng này cho nút Thông báo (Chuông)
              // Sửa dòng này cho nút Thông báo (Chuông)
              // Dòng 512 trong App.jsx (Code đã sửa)
              // Thêm dòng này cho nút Thông báo (Chuông)
              // Lệnh này phát tín hiệu để mở Popup Thông báo
              onNotificationClick={() => { closeAllModals(); document.dispatchEvent(new CustomEvent('trimi:open-bell')); }}
            />
          </div>
        )}

        {currentView === 'friends' && user && (
            <div key="friends" className="page-fade-in">
              <FriendsView
                isDarkMode={isDarkMode}
                user={user}
                usersList={usersList}
                friendsList={friendsList}
                pendingRequests={pendingRequests}
                onAcceptFriend={handleAcceptFriend}
                onDeclineFriend={handleDeclineFriend}
                onAddFriend={handleAddFriend}
                littleTrimiConfig={littleTrimiConfig} // Truyền cấu hình Little Trimi
              />
            </div>
          )}

        {/* ── FRIENDS MODAL (mobile) ── */}
        {showFriendsModal && (
          <FriendsModal
            isDarkMode={isDarkMode}
            user={user}
            usersList={usersList}
            friendsList={friendsList}
            pendingRequests={pendingRequests}
            onAcceptFriend={handleAcceptFriend}
            onDeclineFriend={handleDeclineFriend}
            onAddFriend={handleAddFriend}
            onChat={(u) => { setShowFriendsModal(false); openP2PChat(u); setIsHelpOpen(true); }}
            onClose={() => setShowFriendsModal(false)}
          />
        )}

        {/* FOOTER */}
        <Footer
          t={t} navigateTo={navigateTo} showToast={showToast} requireLogin={requireLogin}
          setShowPrivacyModal={setShowPrivacyModal} setShowTermsModal={setShowTermsModal}
          setShowStoryModal={setShowStoryModal} setShowCareerModal={setShowCareerModal}
          setShowContactModal={setShowContactModal}
          setShowSizeGuideModal={setShowSizeGuideModal}
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
          // THÊM 2 DÒNG NÀY:
          littleTrimiConfig={littleTrimiConfig}
          updateLittleTrimiConfig={updateLittleTrimiConfig}
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
          setShowSizeGuideModal={setShowSizeGuideModal}
          user={user}
          usersList={usersList}
          friendsList={friendsList}
          pendingRequests={pendingRequests}
          onAcceptFriend={handleAcceptFriend}
          onDeclineFriend={handleDeclineFriend}
          onAddFriend={handleAddFriend}
          setShowLoginModal={setShowLoginModal}
          setIsSettingsDrawerOpen={setIsSettingsDrawerOpen}
          littleTrimiConfig={littleTrimiConfig}
          updateLittleTrimiConfig={updateLittleTrimiConfig}
          onUserClick={(u) => {
            setIsUnifiedMenuOpen(false);
            if (isAdmin) {
              openAdminChatWithUser(u);
            } else {
              openP2PChat(u);
              setIsHelpOpen(true);
            }
          }}
        />

        {/* TOAST — tiny pill at bottom-center... */}
        {toastMsg && (
          <div className="fixed bottom-[76px] md:bottom-6 left-1/2 -translate-x-1/2 z-[999999] pointer-events-none">
            <div className="bg-slate-900/95 text-white px-5 py-2.5 rounded-full shadow-xl text-xs md:text-sm font-bold whitespace-nowrap border border-white/10 backdrop-blur-md animate-fade-in-up">
              {typeof toastMsg === 'string' ? toastMsg : toastMsg.title}
            </div>
          </div>
        )}
        <SizeGuideModal 
          isOpen={showSizeGuideModal} 
          onClose={() => setShowSizeGuideModal(false)} 
          isDarkMode={isDarkMode} 
        />
        
        {/* VirtualRoom removed — 3D feature disabled for performance */}
      </div>
    </>
  );
}
