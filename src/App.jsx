import { useState, useEffect, useRef } from 'react';

import { 
  FiMenu, FiMail, FiLock, FiLogOut, FiShoppingCart, FiSearch, 
  FiUser, FiStar, FiTruck, FiShield, FiCornerUpLeft, FiX, 
  FiTrash2, FiCheckCircle, FiRefreshCcw, FiSettings, 
  FiPlus, FiUploadCloud, FiArchive, FiCamera, FiEdit3, FiSave, FiMove, FiImage,
  FiMessageCircle, FiCreditCard, FiMonitor, FiInstagram, FiLinkedin, FiYoutube, FiGlobe, FiSend, FiLoader,
  FiArrowUp, FiMoon, FiSun, FiUsers, FiUserPlus, FiUpload
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

// Firebase
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, FacebookAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot, arrayUnion } from 'firebase/firestore';

const compressImage = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200; 
      const scaleSize = MAX_WIDTH / img.width;
      canvas.width = scaleSize < 1 ? MAX_WIDTH : img.width;
      canvas.height = scaleSize < 1 ? img.height * scaleSize : img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/jpeg', 0.6)); 
    };
    img.onerror = () => callback(e.target.result); 
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const daNangDistricts = [
  { name: 'Hải Châu', fee: 0 }, { name: 'Thanh Khê', fee: 0 }, { name: 'Sơn Trà', fee: 0 },
  { name: 'Ngũ Hành Sơn', fee: 20000 }, { name: 'Cẩm Lệ', fee: 20000 }, { name: 'Liên Chiểu', fee: 20000 }, { name: 'Hòa Vang', fee: 20000 }
];

const dict = {
  VI: { home: "Trang chủ", shop: "Cửa hàng", nav_shirt: "Áo", nav_pants: "Quần", nav_acc: "Linh kiện", shirt_all: "Tất cả Áo", pants_all: "Tất cả Quần", acc_all: "Tất cả Phụ kiện", shirt_1: "Áo thun", shirt_2: "Áo sơ mi", shirt_3: "Áo khoác", pants_1: "Quần Jeans", pants_2: "Quần Kaki", pants_3: "Quần Short", acc_1: "Mũ / Nón", acc_2: "Túi xách", acc_3: "Trang sức", login: "Đăng nhập", search: "Tìm kiếm...", cart: "Giỏ hàng", account: "Tài khoản", logout: "Đăng xuất", adminMenu: "Quản Trị Kho", sloganTitle: "Đậm chất riêng.", sloganDesc: "Chúng tôi tin rằng thời trang không chỉ là áo quần, mà là ngôn ngữ không lời để thể hiện cá tính thực sự của bạn.", explore: "Khám phá ngay", newCol: "New Collection 2026", heroTitle: "Thời trang phong cách,\nđậm chất riêng.", heroDesc: "Khám phá hàng trăm mẫu áo thun, áo khoác và phụ kiện chất lượng cao với mức giá không thể tuyệt vời hơn.", addToCart: "THÊM VÀO GIỎ HÀNG", desc: "Mô tả chi tiết", ship: "Giao hàng miễn phí toàn quốc", return: "Đổi trả miễn phí 30 ngày", myOrders: "Đơn hàng của tôi", wishlist: "Yêu thích", noOrders: "Chưa có đơn hàng nào", noOrdersDesc: "Khi bạn mua sắm, danh sách hóa đơn sẽ hiển thị tại đây.", total: "Tổng thanh toán", checkout: "Thanh Toán Ngay", emptyCart: "Giỏ hàng của bạn đang trống.", startShop: "Mua sắm ngay", f_prod: "Sản phẩm", f_all: "Tất cả sản phẩm", f_men: "Thời trang Nam", f_women: "Thời trang Nữ", f_acc: "Phụ kiện", f_sup: "Hỗ trợ khách hàng", f_track: "Theo dõi đơn hàng", f_ret: "Chính sách đổi trả", f_ship: "Chính sách giao hàng", f_size: "Hướng dẫn chọn size", f_serv: "Dịch vụ", f_print: "In ấn theo yêu cầu", f_b2b: "Khách hàng doanh nghiệp", f_gift: "Thẻ quà tặng", f_about: "Về Trimi", f_story: "Câu chuyện thương hiệu", f_career: "Tuyển dụng", f_contact: "Liên hệ chúng tôi", f_priv: "Chính sách bảo mật", f_term: "Điều khoản", chatHelp: "Trạm hỗ trợ Trimi", chatHow: "👋 Chúng tôi có thể giúp gì cho bạn?", chatWithUs: "Chat Với Admin", sendMsg: "Gửi tin nhắn", replyFast: "Phản hồi ngay lập tức", faqs: "Câu hỏi thường gặp", faqAcc: "Tài khoản của tôi", faqBill: "Thanh toán & Đơn hàng", faqShip: "Vận chuyển", chatInput: "Nhập tin nhắn...", roleCustomer: "Khách hàng", roleVerified: "Thành viên", roleAdmin: "Quản trị viên", changeCover: "Đổi ảnh bìa", adminDashboard: "Trạm Quản Trị", adminAdd: "Đăng Sản Phẩm", adminUsers: "Khách hàng", adminNoData: "Chưa có dữ liệu", adminImg: "Hình ảnh", adminName: "Tên sản phẩm", adminPrice: "Giá bán", adminAction: "Hành động", adminDel: "Xóa Bỏ", adminCare: "Chăm Sóc Khách Hàng", adminWait: "Chưa có khách hàng", online: "Đang trực tuyến", offline: "Ngoại tuyến", adminInbox: "Hộp thư khách hàng", all_products: "Tất cả sản phẩm", no_products: "Chưa có sản phẩm nào trong danh mục này", no_products_desc: "Vui lòng quay lại sau hoặc chọn danh mục khác.", order_summary: "Thông tin đơn hàng", qr_pay: "Thanh toán QR", qr_scan_desc: "Vui lòng quét mã QR bằng ứng dụng ngân hàng. Hệ thống sẽ tự động xác nhận khi nhận được tiền.", order_price: "Tiền hàng", shipping_fee: "Phí vận chuyển", deposit: "Cần cọc (30%)", waiting_payment: "Đang xử lý đơn hàng...", confirm_paid: "Xác nhận đã chuyển khoản", community: "Cộng đồng Trimi", add_friend: "Kết bạn" },
  EN: { home: "Home", shop: "Shop", nav_shirt: "Shirts", nav_pants: "Pants", nav_acc: "Accessories", shirt_all: "All Shirts", pants_all: "All Pants", acc_all: "All Accessories", shirt_1: "T-Shirts", shirt_2: "Dress Shirts", shirt_3: "Jackets", pants_1: "Jeans", pants_2: "Khakis", pants_3: "Shorts", acc_1: "Hats", acc_2: "Bags", acc_3: "Jewelry", login: "Login", search: "Search...", cart: "Cart", account: "Account", logout: "Logout", adminMenu: "Admin Panel", sloganTitle: "Your Unique Vibe.", sloganDesc: "We believe fashion is not just clothing, but a silent language to express your true self.", explore: "Explore Now", newCol: "New Collection 2026", heroTitle: "Stylish fashion,\nunique vibe.", heroDesc: "Discover hundreds of high-quality items.", addToCart: "ADD TO CART", desc: "Description", ship: "Free Nationwide Shipping", return: "30-Day Free Returns", myOrders: "My Orders", wishlist: "Wishlist", noOrders: "No orders yet", noOrdersDesc: "Your invoices will appear here.", total: "Total", checkout: "Checkout Now", emptyCart: "Your cart is empty.", startShop: "Start Shopping", f_prod: "Products", f_all: "All Products", f_men: "Men's Fashion", f_women: "Women's Fashion", f_acc: "Accessories", f_sup: "Support", f_track: "Track Order", f_ret: "Return Policy", f_ship: "Shipping", f_size: "Size Guide", f_serv: "Services", f_print: "Print on Demand", f_b2b: "Corporate Clients", f_gift: "Gift Cards", f_about: "About", f_story: "Brand Story", f_career: "Careers", f_contact: "Contact Us", f_priv: "Privacy Policy", f_term: "Terms of Service", chatHelp: "Trimi Help", chatHow: "👋 How can we help you today?", chatWithUs: "Chat With Admin", sendMsg: "Send a message", replyFast: "Instant reply", faqs: "FAQs", faqAcc: "My Account", faqBill: "Billing", faqShip: "Shipping", chatInput: "Type a message...", roleCustomer: "Customer", roleVerified: "Member", roleAdmin: "Admin", changeCover: "Change Cover", adminDashboard: "Dashboard", adminAdd: "Add Product", adminUsers: "Customers", adminNoData: "No data", adminImg: "Image", adminName: "Name", adminPrice: "Price", adminAction: "Action", adminDel: "Delete", adminCare: "Customer Care", adminWait: "No customers yet", online: "Online", offline: "Offline", adminInbox: "Inbox", all_products: "All Products", no_products: "No products in this category", no_products_desc: "Please come back later.", order_summary: "Order Summary", qr_pay: "QR Payment", qr_scan_desc: "Scan the QR code. System will auto-verify.", order_price: "Subtotal", shipping_fee: "Shipping", deposit: "Deposit (30%)", waiting_payment: "Processing order...", confirm_paid: "Confirm Transfer", community: "Community", add_friend: "Add Friend" }
};

// ==========================================
// TỪ ĐIỂN DỊCH TÊN VÀ NỘI DUNG SẢN PHẨM
// ==========================================
const productDict = {
  VI: {
    '101_name': 'Áo Thun Basic Premium', '101_desc': 'Áo thun basic cao cấp, chất liệu cotton 100% thoáng mát, form dáng chuẩn.',
    '102_name': 'Áo Thun Streetwear Form Rộng', '102_desc': 'Áo thun oversize phong cách đường phố, chất vải dày dặn.',
    '201_name': 'Áo Sơ Mi Oxford Cổ Điển', '201_desc': 'Áo sơ mi Oxford thanh lịch, phù hợp công sở và tiệc sang trọng.',
    '202_name': 'Áo Sơ Mi Kẻ Sọc Năng Động', '202_desc': 'Áo sơ mi họa tiết kẻ sọc trẻ trung, vải lụa mỏng nhẹ.',
    '301_name': 'Áo Khoác Da Biker', '301_desc': 'Áo khoác da thật phong cách Biker cực ngầu.',
    '302_name': 'Áo Khoác Denim Vintage', '302_desc': 'Áo khoác jean cổ điển, chất denim mềm mại.',
    '401_name': 'Quần Jeans Slim Fit Xanh', '401_desc': 'Quần jeans xanh ôm dáng, co giãn thoải mái.',
    '402_name': 'Quần Jeans Rách Đường Phố', '402_desc': 'Quần jeans rách cá tính, chuẩn phong cách streetwear.',
    '501_name': 'Quần Khaki Màu Be', '501_desc': 'Quần khaki màu be tinh tế, dễ phối đồ.',
    '601_name': 'Quần Short Đi Biển', '601_desc': 'Quần short mỏng nhẹ, nhanh khô cho mùa hè.',
    '701_name': 'Mũ Lưỡi Trai Cổ Điển', '701_desc': 'Mũ lưỡi trai phong cách thể thao, 100% cotton.',
    '801_name': 'Balo Da Urban', '801_desc': 'Balo da đa năng, chống sốc tốt cho laptop 15.6 inch.',
    '802_name': 'Túi Tote Canvas', '802_desc': 'Túi tote vải canvas bền bỉ, tiện dụng mọi lúc mọi nơi.',
    '901_name': 'Dây Chuyền Bạc Không Gỉ', '901_desc': 'Dây chuyền bạc cao cấp, không đen không gỉ.',
    '902_name': 'Vòng Tay Titan Tối Giản', '902_desc': 'Vòng tay nam titan thiết kế tối giản, nam tính.'
  },
  EN: {
    '101_name': 'Premium Basic T-Shirt', '101_desc': 'Premium basic t-shirt, 100% breathable cotton, standard fit.',
    '102_name': 'Oversized Street Tee', '102_desc': 'Streetwear style oversized t-shirt, thick and durable fabric.',
    '201_name': 'Classic Oxford Shirt', '201_desc': 'Elegant Oxford shirt, suitable for office and formal events.',
    '202_name': 'Striped Casual Shirt', '202_desc': 'Youthful striped shirt, lightweight silk fabric.',
    '301_name': 'Leather Biker Jacket', '301_desc': 'Real leather jacket in a cool biker style.',
    '302_name': 'Denim Vintage Jacket', '302_desc': 'Classic denim jacket with soft denim fabric.',
    '401_name': 'Slim Fit Blue Jeans', '401_desc': 'Slim fit blue jeans with comfortable stretch.',
    '402_name': 'Ripped Street Jeans', '402_desc': 'Edgy ripped jeans, perfect for streetwear style.',
    '501_name': 'Beige Khaki Trousers', '501_desc': 'Subtle beige khaki trousers, easy to mix and match.',
    '601_name': 'Summer Board Shorts', '601_desc': 'Lightweight, quick-drying shorts for summer.',
    '701_name': 'Classic Baseball Cap', '701_desc': 'Sporty baseball cap, 100% cotton.',
    '801_name': 'Leather Urban Backpack', '801_desc': 'Versatile leather backpack, good shockproof for laptop.',
    '802_name': 'Canvas Tote Bag', '802_desc': 'Durable canvas tote bag, convenient anytime, anywhere.',
    '901_name': 'Stainless Silver Necklace', '901_desc': 'Premium silver necklace, rust-proof and non-tarnishing.',
    '902_name': 'Minimalist Cuff Bracelet', '902_desc': 'Minimalist, masculine titanium cuff bracelet.'
  }
};

const initialProducts = [
  { id: '101', name: 'Premium Basic T-Shirt', price: 250000, rating: 4.8, reviews: 120, category: 'shirt_1', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', description: 'Áo thun basic cao cấp, chất liệu cotton 100% thoáng mát, form dáng chuẩn.' },
  { id: '102', name: 'Oversized Street Tee', price: 290000, rating: 4.9, reviews: 85, category: 'shirt_1', imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop', description: 'Áo thun oversize phong cách đường phố, chất vải dày dặn.' },
  { id: '201', name: 'Classic Oxford Shirt', price: 450000, rating: 4.7, reviews: 90, category: 'shirt_2', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop', description: 'Áo sơ mi Oxford thanh lịch, phù hợp công sở và tiệc sang trọng.' },
  { id: '202', name: 'Striped Casual Shirt', price: 395000, rating: 4.6, reviews: 60, category: 'shirt_2', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop', description: 'Áo sơ mi họa tiết kẻ sọc trẻ trung, vải lụa mỏng nhẹ.' },
  { id: '301', name: 'Leather Biker Jacket', price: 1200000, rating: 4.9, reviews: 200, category: 'shirt_3', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop', description: 'Áo khoác da thật phong cách Biker cực ngầu.' },
  { id: '302', name: 'Denim Vintage Jacket', price: 850000, rating: 4.8, reviews: 150, category: 'shirt_3', imageUrl: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=800&auto=format&fit=crop', description: 'Áo khoác jean cổ điển, chất denim mềm mại.' },
  { id: '401', name: 'Slim Fit Blue Jeans', price: 550000, rating: 4.7, reviews: 310, category: 'pants_1', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop', description: 'Quần jeans xanh ôm dáng, co giãn thoải mái.' },
  { id: '402', name: 'Ripped Street Jeans', price: 650000, rating: 4.8, reviews: 180, category: 'pants_1', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop', description: 'Quần jeans rách cá tính, chuẩn phong cách streetwear.' },
  { id: '501', name: 'Beige Khaki Trousers', price: 480000, rating: 4.6, reviews: 95, category: 'pants_2', imageUrl: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=800&auto=format&fit=crop', description: 'Quần khaki màu be tinh tế, dễ phối đồ.' },
  { id: '601', name: 'Summer Board Shorts', price: 250000, rating: 4.5, reviews: 70, category: 'pants_3', imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop', description: 'Quần short mỏng nhẹ, nhanh khô cho mùa hè.' },
  { id: '701', name: 'Classic Baseball Cap', price: 180000, rating: 4.9, reviews: 420, category: 'acc_1', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop', description: 'Mũ lưỡi trai phong cách thể thao, 100% cotton.' },
  { id: '801', name: 'Leather Urban Backpack', price: 750000, rating: 4.8, reviews: 110, category: 'acc_2', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', description: 'Balo da đa năng, chống sốc tốt cho laptop 15.6 inch.' },
  { id: '802', name: 'Canvas Tote Bag', price: 220000, rating: 4.7, reviews: 340, category: 'acc_2', imageUrl: 'https://images.unsplash.com/photo-1597589827317-4c6d6e0a90bd?q=80&w=800&auto=format&fit=crop', description: 'Túi tote vải canvas bền bỉ, tiện dụng mọi lúc mọi nơi.' },
  { id: '901', name: 'Silver Chain Necklace', price: 350000, rating: 4.9, reviews: 88, category: 'acc_3', imageUrl: 'https://images.unsplash.com/photo-1599643478524-fb66f4ceb5d8?q=80&w=800&auto=format&fit=crop', description: 'Dây chuyền bạc cao cấp, không đen không gỉ.' },
  { id: '902', name: 'Minimalist Cuff Bracelet', price: 280000, rating: 4.6, reviews: 65, category: 'acc_3', imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop', description: 'Vòng tay nam titan thiết kế tối giản, nam tính.' }
];

const defaultLookbookData = [
  { id: 1, title: 'Men Collection', img: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=800&auto=format&fit=crop', targetCategory: 'shirt_1' },
  { id: 2, title: 'Streetwear', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop', targetCategory: 'pants_1' },
  { id: 3, title: 'Accessories', img: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800&auto=format&fit=crop', targetCategory: 'acc_2' },
  { id: 4, title: 'New Arrivals', img: 'https://images.unsplash.com/photo-1529139574466-a303027c028b?q=80&w=800&auto=format&fit=crop', targetCategory: 'all' }
];

const surveyRoles = ["Tín đồ Thời trang", "Thiết kế viên", "Sinh viên", "Chủ doanh nghiệp", "Khác"];
const fakeColorSpheres = ['from-white to-slate-300', 'from-zinc-700 to-black', 'from-amber-200 to-amber-600', 'from-sky-300 to-sky-600'];

export default function App() {
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  const [currentView, setCurrentView] = useState('home'); 
  const [currentCategory, setCurrentCategory] = useState('all'); 
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('trimi_theme') === 'dark');
  const [isMobile, setIsMobile] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [userRole, setUserRole] = useState(''); 
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [nickname, setNickname] = useState(''); 
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Hải Châu');
  const [friendsList, setFriendsList] = useState([]);
  
  const [tempProfile, setTempProfile] = useState({});

  const [localProducts, setLocalProducts] = useState([]); 
  const [isLoadingShop, setIsLoadingShop] = useState(true); 
  
  const [cart, setCart] = useState(() => {
    try { const saved = localStorage.getItem('trimi_cart'); return saved ? JSON.parse(saved) : []; } 
    catch(e) { return []; }
  });

  useEffect(() => { localStorage.setItem('trimi_cart', JSON.stringify(cart)); }, [cart]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('deposit'); 
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [receiptImg, setReceiptImg] = useState(null);

  const [toastMsg, setToastMsg] = useState(''); 
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isAdmin = user?.email === 'phanbasongtoan112@gmail.com';
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', price: '', category: 'shirt_1', desc: '', imagePreview: null });
  
  const [lang, setLang] = useState('VI');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const languages = [{ code: 'VI', label: 'Tiếng Việt' }, { code: 'EN', label: 'English' }];
  const t = (key) => dict[lang]?.[key] || dict['VI'][key] || key;
  const t_prod = (id, field, defaultValue) => productDict[lang]?.[`${id}_${field}`] || defaultValue;

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

  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [bannerConfig, setBannerConfig] = useState(() => JSON.parse(localStorage.getItem('trimi_banner')) || { x: 0, y: 0, scale: 1 });
  const [bannerImage, setBannerImage] = useState(() => localStorage.getItem('trimi_banner_img') || '/banner.png');
  const [lookbook, setLookbook] = useState(() => JSON.parse(localStorage.getItem('trimi_lookbook')) || defaultLookbookData);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const cartItemCount = cart.reduce((t, i) => t + (Number(i.quantity) || 0), 0);
  const cartProductsTotal = cart.reduce((t, i) => t + ((Number(i.price) || 0) * (Number(i.quantity) || 1)), 0);
  const shippingFee = (district === 'Hải Châu' || district === 'Thanh Khê' || district === 'Sơn Trà') ? 0 : 20000;
  const cartFinalTotal = cartProductsTotal + shippingFee;
  const depositAmount = Math.round(cartFinalTotal * 0.3);
  const finalPayAmount = paymentMode === 'deposit' ? depositAmount : cartFinalTotal;

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('trimi_theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('trimi_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => { if (window.scrollY > 400) setShowScrollTop(true); else setShowScrollTop(false); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const navigateTo = (view, category = 'all', product = null) => {
    setCurrentView(view); setCurrentCategory(category);
    if(view === 'productDetail') setSelectedProduct(product);
    window.history.pushState({ view, category, product }, '', `?view=${view}`);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

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

  useEffect(() => { if(chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [chatMessages, p2pMessages, isChatBoxOpen]);
  useEffect(() => { if(adminChatContainerRef.current) adminChatContainerRef.current.scrollTop = adminChatContainerRef.current.scrollHeight; }, [adminChatUser?.messages]);

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, 'config', 'storefront'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lookbook) { setLookbook(data.lookbook); localStorage.setItem('trimi_lookbook', JSON.stringify(data.lookbook)); }
        if (data.bannerConfig) { setBannerConfig(data.bannerConfig); localStorage.setItem('trimi_banner', JSON.stringify(data.bannerConfig)); }
        if (data.bannerImage) { setBannerImage(data.bannerImage); localStorage.setItem('trimi_banner_img', data.bannerImage); }
      }
      setIsConfigLoaded(true);
    });
    return () => unsubConfig();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (snapshot.empty) {
        initialProducts.forEach(p => setDoc(doc(db, "products", p.id), p).catch(()=>{}));
        setLocalProducts(initialProducts);
      } else {
        const prods = [];
        snapshot.forEach((doc) => prods.push({ ...doc.data(), id: doc.id }));
        setLocalProducts(prods.sort((a,b) => b.id - a.id));
      }
      setIsLoadingShop(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser); setIsAuthenticated(true); setShowLoginModal(false);
        const localRole = localStorage.getItem(`trimi_role_${currentUser.uid}`);
        if(localRole) setUserRole(localRole);

        const baseEmailName = currentUser.email ? currentUser.email.split('@')[0] : 'Guest';
        try {
          await setDoc(doc(db, 'users', currentUser.uid), { email: currentUser.email || '', lastActive: Date.now(), isOnline: true }, { merge: true });
          const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.role) setUserRole(data.role); else if (!localRole) setShowSurveyModal(true);
            setAvatarUrl(data.avatar || ''); setCoverUrl(data.cover || '');
            setNickname(data.nickname || baseEmailName);
            setPhone(data.phone || ''); setAddress(data.address || ''); setDistrict(data.district || 'Hải Châu');
            setFriendsList(data.friends || []);
          } else if (!localRole) { setShowSurveyModal(true); setNickname(baseEmailName); }
        } catch (error) {}

        const presenceInterval = setInterval(() => { setDoc(doc(db, 'users', currentUser.uid), { lastActive: Date.now(), isOnline: true }, { merge: true }).catch(()=>{}); }, 30000);
        const handleUnload = () => { setDoc(doc(db, 'users', currentUser.uid), { isOnline: false }, { merge: true }).catch(()=>{}); };
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
        snapshot.forEach((doc) => {
          const data = doc.data();
          const isCurrentlyOnline = data.isOnline && (Date.now() - data.lastActive < 60000);
          if (doc.id !== user?.uid) {
            usersData.push({ uid: doc.id, ...data, isOnline: isCurrentlyOnline });
          }
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
      if (docSnap.exists()) { setP2pMessages(docSnap.data().messages || []); } else { setP2pMessages([]); }
    });
  }, [user, activeChatTarget, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !adminChatUser) return;
    return onSnapshot(doc(db, 'users', adminChatUser.uid), (docSnap) => {
      if (docSnap.exists()) setAdminChatUser(prev => ({ ...prev, messages: docSnap.data().messages || [] }));
    });
  }, [isAdmin, adminChatUser?.uid]);

  const totalAdminUnread = usersList.filter(u => u.hasUnreadAdmin).length;

  const openAdminChat = async () => {
    setActiveChatTarget('admin');
    setIsChatBoxOpen(true); setIsHelpOpen(false);
    if (user) { setHasUnreadUser(false); await setDoc(doc(db, 'users', user.uid), { hasUnreadUser: false }, { merge: true }).catch(()=>{}); }
  };

  const openP2PChat = (targetUser) => {
    setActiveChatTarget(targetUser);
    setIsChatBoxOpen(true); setIsHelpOpen(false);
  };

  const openAdminChatWithUser = async (u) => {
    setAdminChatUser(u); 
    setActiveChatTarget(u); 
    setIsChatBoxOpen(true); 
    setIsHelpOpen(false); 
    await setDoc(doc(db, 'users', u.uid), { hasUnreadAdmin: false }, { merge: true }).catch(()=>{});
  };

  const handleAddFriend = async (e, targetUid) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { friends: arrayUnion(targetUid) }, { merge: true });
      showToast('Đã thêm vào danh bạ!');
    } catch(e) {}
  };

  const handleUserSendMessage = async () => {
    if(!chatInput.trim() || !user || !activeChatTarget) return;
    const userMsgText = chatInput.trim();
    setChatInput('');
    
    if (isAdmin) {
       const newMessage = { sender: 'bot', text: userMsgText, timestamp: Date.now() };
       try { 
         await setDoc(doc(db, 'users', activeChatTarget.uid), { messages: arrayUnion(newMessage), lastUpdated: Date.now(), hasUnreadUser: true }, { merge: true }); 
       } catch(e) {}
       return;
    }

    const newMessage = { sender: user.uid, text: userMsgText, timestamp: Date.now() };
    
    if (activeChatTarget === 'admin') {
      try {
        await setDoc(doc(db, 'users', user.uid), { messages: arrayUnion(newMessage), lastUpdated: Date.now(), userEmail: user.email || '', nickname: nickname, avatar: avatarUrl, hasUnreadAdmin: true }, { merge: true });
        
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
      } catch(e) {}
    } else {
      const chatId = [user.uid, activeChatTarget.uid].sort().join('_');
      try {
        await setDoc(doc(db, 'p2p_chats', chatId), { messages: arrayUnion(newMessage), lastUpdated: Date.now() }, { merge: true });
      } catch(e) {}
    }
  };

  const handleAdminSendMessage = async () => {
    if(!adminChatInput.trim() || !adminChatUser) return;
    const newMessage = { sender: 'bot', text: adminChatInput, timestamp: Date.now() };
    setAdminChatInput('');
    try { await setDoc(doc(db, 'users', adminChatUser.uid), { messages: arrayUnion(newMessage), lastUpdated: Date.now(), hasUnreadUser: true }, { merge: true }); } catch(e) {}
  };

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); };
  const requireLogin = (action) => { if (!isAuthenticated) { setShowLoginModal(true); return; } action(); };

  const handleEmailAuth = async () => {
    if (!email || !email.includes('@')) return alert("Vui lòng nhập email hợp lệ.");
    if (password.length < 6) return alert("Mật khẩu ít nhất 6 ký tự!");
    try {
      if (authMode === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {}
  };

  const handleFacebookLogin = async () => { try { await signInWithPopup(auth, new FacebookAuthProvider()); } catch (error) {} };
  const handleGoogleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (error) {} };

  const handleLogout = async () => {
    if(user) await setDoc(doc(db, 'users', user.uid), { isOnline: false }, { merge: true }).catch(()=>{});
    await signOut(auth); setChatMessages([]); setAdminChatUser(null); setActiveChatTarget(null); navigateTo('home', 'all'); 
  };

  const handleSaveSettings = async () => {
    if(!tempProfile.nickname?.trim() || !tempProfile.phone?.trim() || !tempProfile.address?.trim()) return alert("Vui lòng điền đủ Tên hiển thị, Số điện thoại và Địa chỉ!");
    
    const hasLetters = /[a-zA-ZÀ-ỹ]/.test(tempProfile.address);
    if (!hasLetters) return alert("Địa chỉ không hợp lệ! Vui lòng nhập rõ Tên Đường/Phường/Xã (ví dụ: 123 Lê Lợi).");

    setNickname(tempProfile.nickname); setPhone(tempProfile.phone); setAddress(tempProfile.address); setDistrict(tempProfile.district);
    setShowSettingsModal(false);
    if (user) {
      try { await setDoc(doc(db, "users", user.uid), { nickname: tempProfile.nickname, phone: tempProfile.phone, address: tempProfile.address, district: tempProfile.district }, { merge: true }); } catch(e) {}
    }
    showToast('Đã lưu Cài đặt bảo mật!');
  };

  const handleSaveName = async () => {
    if(!tempName.trim()) return alert("Tên không được để trống!");
    setNickname(tempName); setIsEditingName(false); localStorage.setItem(`trimi_name_${user.uid}`, tempName);
    if (user) { try { await setDoc(doc(db, "users", user.uid), { nickname: tempName }, { merge: true }); } catch(e) {} }
    showToast('Đã cập nhật biệt danh!');
  };

  const handleProfileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    compressImage(file, async (compressedBase64) => {
      if(type === 'avatar') { setAvatarUrl(compressedBase64); localStorage.setItem(`trimi_avatar_${user.uid}`, compressedBase64); await setDoc(doc(db, "users", user.uid), { avatar: compressedBase64 }, { merge: true }).catch(()=>{}); }
      if(type === 'cover') { setCoverUrl(compressedBase64); localStorage.setItem(`trimi_cover_${user.uid}`, compressedBase64); await setDoc(doc(db, "users", user.uid), { cover: compressedBase64 }, { merge: true }).catch(()=>{}); }
      showToast('Đã lưu ảnh cá nhân!');
    });
    e.target.value = null;
  };

  const handleLookbookUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    compressImage(file, async (compressedBase64) => {
      const updatedLookbook = [...lookbook]; updatedLookbook[index].img = compressedBase64;
      setLookbook(updatedLookbook); localStorage.setItem('trimi_lookbook', JSON.stringify(updatedLookbook)); 
      try { await setDoc(doc(db, "config", "storefront"), { lookbook: updatedLookbook }, { merge: true }); showToast('Đã cập nhật trang chủ!'); } catch (err) {}
    });
    e.target.value = null;
  };

  const handleBannerImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    compressImage(file, async (compressedBase64) => {
      setBannerImage(compressedBase64); localStorage.setItem('trimi_banner_img', compressedBase64); 
      try { await setDoc(doc(db, "config", "storefront"), { bannerImage: compressedBase64 }, { merge: true }); showToast('Đã đổi ảnh Banner thành công!'); } catch(err) {}
    });
    e.target.value = null;
  };

  const handleBannerMouseDown = (e) => { if (!isEditingBanner) return; setIsDragging(true); setDragStart({ x: e.clientX - bannerConfig.x, y: e.clientY - bannerConfig.y }); };
  const handleBannerMouseMove = (e) => { if (!isDragging || !isEditingBanner) return; setBannerConfig({ ...bannerConfig, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleBannerMouseUp = () => { setIsDragging(false); };
  const handleBannerWheel = (e) => { if (!isEditingBanner) return; e.preventDefault(); const scaleChange = e.deltaY > 0 ? -0.1 : 0.1; setBannerConfig(prev => ({ ...prev, scale: Math.max(0.3, prev.scale + scaleChange) })); };
  const handleSaveBanner = async () => { setIsEditingBanner(false); localStorage.setItem('trimi_banner', JSON.stringify(bannerConfig)); try { await setDoc(doc(db, "config", "storefront"), { bannerConfig: bannerConfig }, { merge: true }); showToast('Đã lưu cấu hình Banner!'); } catch(err) {} };

  const handleAddToCart = (item, e) => {
    e.stopPropagation(); 
    setCart((prevCart) => {
      const existingItem = prevCart.find(i => i.id === item.id);
      if (existingItem) return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1, addedAt: Date.now() } : i);
      return [...prevCart, { ...item, quantity: 1, addedAt: Date.now() }];
    });
    showToast(t('addToCart') + '!');
  };

  const updateCartQuantity = (id, delta) => setCart(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
  
  const handleProceedCheckout = () => {
    requireLogin(() => {
      if (!address || !phone) {
        showToast("Vui lòng điền Số điện thoại và Địa chỉ để chúng tôi giao hàng!");
        navigateTo('profile');
        setTimeout(() => {setTempProfile({nickname, phone, address, district}); setShowSettingsModal(true)}, 800);
      } else {
        const newOrderId = 'TRIMI' + Date.now().toString().slice(-5) + Math.floor(Math.random() * 1000);
        setCurrentOrderId(newOrderId);
        setReceiptImg(null);
        setIsCartOpen(false);
        setShowCheckoutModal(true);
      }
    });
  };

  const handleConfirmPayment = async () => {
    if (!receiptImg) {
      alert("Vui lòng tải lên biên lai chuyển khoản để hệ thống xác nhận!");
      return;
    }

    setIsCheckingPayment(true);
    
    const orderData = {
      orderId: currentOrderId,
      uid: user.uid,
      customerName: nickname,
      customerEmail: user.email,
      customerPhone: phone,
      customerAddress: `${address}, ${district}, Đà Nẵng`,
      items: cart,
      totalAmount: cartProductsTotal,
      shippingFee: shippingFee,
      finalAmount: cartFinalTotal,
      paidAmount: finalPayAmount,
      paymentMode: paymentMode,
      status: 'Chờ xác nhận thanh toán',
      receiptImage: receiptImg,
      createdAt: Date.now()
    };

    try {
      await setDoc(doc(db, 'orders', currentOrderId), orderData);

      setTimeout(() => {
        setIsCheckingPayment(false);
        alert(`Đã gửi yêu cầu! Mã đơn: ${currentOrderId}\nChúng tôi sẽ duyệt bill và liên hệ bạn sớm nhất.`);
        setCart([]); setShowCheckoutModal(false); showToast('Đặt hàng thành công!');
        navigateTo('profile');
      }, 1500); 

    } catch (error) {
      console.error(error);
      setIsCheckingPayment(false);
      alert("Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại.");
    }
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (base64) => setReceiptImg(base64));
    }
  };

  const handleDeleteProduct = async (id) => {
    if(window.confirm(t('adminDel') + '?')) {
      setLocalProducts(localProducts.filter(p => p.id !== id)); 
      try { await deleteDoc(doc(db, 'products', id)); showToast(t('adminDel') + ' thành công!'); } catch(e) {}
    }
  };

  const handleSubmitNewProduct = async () => {
    if (!newProd.name || !newProd.price || !newProd.imagePreview) return alert("Vui lòng điền đủ thông tin!");
    const newId = Date.now().toString();
    const product = { id: newId, name: newProd.name, price: parseFloat(newProd.price), rating: 5.0, reviews: 0, category: newProd.category, imageUrl: newProd.imagePreview, description: newProd.desc || 'Sản phẩm chính hãng.' };
    setLocalProducts([product, ...localProducts]); 
    setShowAddModal(false); setNewProd({ name: '', price: '', category: 'shirt_1', desc: '', imagePreview: null });
    try { await setDoc(doc(db, 'products', newId), product); showToast('Đã thêm sản phẩm lên cửa hàng!'); } catch(e) {}
  };

  let displayedProducts = localProducts.filter(p => {
    if (currentCategory === 'all') return true;
    if (currentCategory === 'shirt_all') return p.category?.includes('shirt');
    if (currentCategory === 'pants_all') return p.category?.includes('pants');
    if (currentCategory === 'acc_all') return p.category?.includes('acc');
    return p.category === currentCategory;
  });

  if (searchQuery.trim()) {
    displayedProducts = displayedProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  if (!isConfigLoaded) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><FiRefreshCcw className="text-4xl text-sky-500 animate-spin" /></div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Water+Brush&display=swap');
        .font-brush { font-family: 'Water Brush', cursive; }
        html, body, #root { overflow: visible !important; overflow-y: auto !important; height: auto !important; min-height: 100vh !important; }
        
        /* ẨN LOGO RECAPTCHA CỦA GOOGLE ĐỂ ĐẢM BẢO THẨM MỸ */
        .grecaptcha-badge { visibility: hidden !important; }

        /* KIỂM SOÁT CURSOR: ĐẢM BẢO CHUỘT LÀ HÌNH NGÓN TAY KHI TRỎ VÀO CÁC PHẦN TỬ CÓ THỂ CLICK */
        a, button, label, .cursor-pointer, [role="button"] {
            cursor: pointer !important;
        }

        /* =======================================================
           BỘ QUY TẮC DARK MODE CHUẨN XÁC TỪNG KHUNG GIAO DIỆN
           ======================================================= */
        body.dark-mode { background-color: #0f172a !important; color: #f8fafc !important; }
        
        /* Mảng nền của App (màu #f8fafc) -> Dark Slate */
        .dark-mode .bg-\[\#f8fafc\] { background-color: #0f172a !important; }
        
        /* Đổi tất cả các khung viền Trắng / Xám nhạt -> Dark Slate sang trọng */
        .dark-mode .bg-white, 
        .dark-mode .bg-slate-50, 
        .dark-mode .bg-slate-100 { 
           background-color: #1e293b !important; 
           border-color: #334155 !important; 
        }
        
        /* Màu viền */
        .dark-mode .border-slate-100, 
        .dark-mode .border-slate-200,
        .dark-mode .border-blue-100 { border-color: #334155 !important; }

        /* Đổi chữ màu tối -> Màu trắng sáng */
        .dark-mode .text-slate-900, 
        .dark-mode .text-slate-800 { color: #ffffff !important; }
        
        .dark-mode .text-slate-700, 
        .dark-mode .text-slate-600, 
        .dark-mode .text-slate-500 { color: #cbd5e1 !important; }
        
        /* Ô nhập liệu */
        .dark-mode input, 
        .dark-mode select, 
        .dark-mode textarea { 
           background-color: #0f172a !important; 
           color: #ffffff !important; 
           border-color: #334155 !important; 
        }
        
        /* Nút Khám Phá màu Đen -> Màu xanh sáng */
        .dark-mode button.bg-slate-900 { background-color: #38bdf8 !important; color: #0f172a !important; }
        
        /* BẢO VỆ BANNER LUÔN GIỮ GIAO DIỆN GỐC (DÙ DARK MODE HAY LIGHT MODE) */
        .dark-mode .banner-protected { background-color: #eef5fc !important; border-color: #dbeafe !important;}
        .dark-mode .banner-protected h2 { color: #0f172a !important; }
        .dark-mode .banner-protected p { color: #334155 !important; }
        .dark-mode .banner-protected span { background-color: #dbeafe !important; color: #1d4ed8 !important; }
      `}</style>

      <div className={`min-h-screen w-full font-sans flex flex-col relative transition-colors duration-300 ${isDarkMode ? 'dark-mode text-white bg-[#0f172a]' : 'text-slate-900 bg-[#f8fafc]'}`}>
        
        {/* NÚT CUỘN VÀ GIỎ HÀNG NỔI CHỐNG MỎI TAY */}
        <div className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[8500] flex flex-col gap-3">
          {showScrollTop && (
            <>
              <button onClick={() => setIsCartOpen(true)} className="bg-slate-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:bg-sky-500 hover:scale-110 transition-all relative">
                 <FiShoppingCart className="text-2xl"/>
                 {cartItemCount > 0 && (
                   <span className="absolute -top-1 -right-1 bg-sky-500 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full shadow-sm border-2 border-white transition-all">
                     {cartItemCount}
                   </span>
                 )}
              </button>
              <button onClick={scrollToTop} className="bg-slate-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:bg-sky-500 hover:scale-110 transition-all">
                 <FiArrowUp className="text-2xl"/>
              </button>
            </>
          )}
        </div>

        {/* BONG BÓNG CHAT VÀ CỘNG ĐỒNG */}
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9000] flex flex-col items-end">
          
          {/* DANH SÁCH CHAT KHÁCH HÀNG / CỘNG ĐỒNG */}
          {!isAdmin && isHelpOpen && !isChatBoxOpen && (
            <div className="bg-white w-[340px] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] mb-4 overflow-hidden border border-slate-200 animate-fade-in-up origin-bottom-right">
              <div className="bg-slate-900 text-white p-5 pr-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[17px] mb-1">{t('chatHelp')}</h3>
                  <p className="text-sm text-slate-300 flex items-center gap-1">{t('chatHow')}</p>
                </div>
                <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1"><FiX className="text-xl"/></button>
              </div>
              
              <div className="p-4 border-b border-slate-100">
                 <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-3">HỖ TRỢ TRỰC TUYẾN</p>
                 <div onClick={() => requireLogin(openAdminChat)} className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm group relative">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <FiShield className="text-xl"/>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">{t('chatWithUs')}</span>
                      <span className="text-xs text-slate-500">{t('replyFast')}</span>
                    </div>
                    {hasUnreadUser && <div className="absolute top-1/2 -translate-y-1/2 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
                 </div>
              </div>

              <div className="p-4 flex-grow overflow-y-auto max-h-[300px] custom-scrollbar">
                 <div className="flex justify-between items-center mb-3">
                   <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><FiUsers/> {t('community')}</p>
                   <FiSearch className="text-slate-400"/>
                 </div>
                 
                 <div className="space-y-2">
                   {usersList.length === 0 ? <p className="text-xs text-slate-400 italic">Chưa có ai tham gia.</p> : 
                     usersList.map(u => (
                       <div key={u.uid} onClick={() => requireLogin(() => openP2PChat(u))} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors border border-transparent hover:border-slate-200">
                         <div className="flex items-center gap-3">
                           <div className="relative">
                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 font-bold text-xs text-slate-600 overflow-hidden">
                               {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover"/> : (u.nickname?.charAt(0).toUpperCase() || 'U')}
                             </div>
                             <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                           </div>
                           <div>
                             <span className="text-sm font-bold text-slate-800 block leading-none mb-1 max-w-[120px] truncate">{u.nickname || u.email?.split('@')[0]}</span>
                             <span className="text-[10px] text-slate-400 leading-none">{u.isOnline ? t('online') : t('offline')}</span>
                           </div>
                         </div>
                         {!friendsList.includes(u.uid) && (
                           <button onClick={(e) => handleAddFriend(e, u.uid)} className="text-sky-500 bg-sky-50 hover:bg-sky-500 hover:text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100" title={t('add_friend')}><FiUserPlus className="text-sm"/></button>
                         )}
                       </div>
                     ))
                   }
                 </div>
              </div>
            </div>
          )}

          {/* GIAO DIỆN CHAT CỦA ADMIN (XEM TẤT CẢ USER) */}
          {isAdmin && isHelpOpen && !activeChatTarget && (
            <div className="bg-white w-[340px] h-[480px] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] mb-4 overflow-hidden border border-slate-200 animate-fade-in-up origin-bottom-right flex flex-col">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center rounded-t-2xl shadow-md z-10">
                <h3 className="font-bold">{t('adminInbox')}</h3>
                <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-white p-1"><FiX className="text-xl"/></button>
              </div>
              <div className="flex-grow p-2 overflow-y-auto custom-scrollbar">
                {usersList.length === 0 ? <p className="text-center text-slate-400 text-sm mt-4">{t('adminWait')}</p> : 
                  usersList.map(u => (
                    <div key={u.uid} onClick={() => openAdminChatWithUser(u)} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer rounded-xl border-b border-slate-100 last:border-0 relative">
                      <div className="relative">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-slate-600 overflow-hidden">
                           {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover"/> : (u.nickname?.charAt(0).toUpperCase() || 'U')}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      </div>
                      <div className="flex-col flex flex-grow">
                        <span className="text-sm font-bold text-slate-800">{u.nickname || (u.email ? u.email.split('@')[0] : 'Khách')}</span>
                        <span className="text-xs text-slate-500">{u.isOnline ? t('online') : t('offline')}</span>
                      </div>
                      {u.hasUnreadAdmin && <div className="w-3 h-3 bg-red-500 rounded-full mr-2 shadow-sm animate-pulse"></div>}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* KHUNG CHAT RIÊNG BIỆT (DÙNG CHUNG CHO KHÁCH & ADMIN) */}
          {isChatBoxOpen && activeChatTarget && (
            <div className="bg-white w-[340px] h-[480px] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] mb-4 overflow-hidden border border-slate-200 animate-fade-in-up origin-bottom-right flex flex-col">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center rounded-t-2xl shadow-md z-10">
                <button onClick={() => { setIsChatBoxOpen(false); setIsHelpOpen(true); setActiveChatTarget(null); }} className="text-slate-300 hover:text-white flex items-center gap-2 font-bold text-sm">
                  <FiCornerUpLeft/> Quay lại
                </button>
                <div className="flex items-center gap-2">
                   {activeChatTarget !== 'admin' && <div className={`w-2 h-2 rounded-full ${activeChatTarget.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>}
                   <span className="text-sm font-bold truncate max-w-[120px]">{activeChatTarget === 'admin' ? t('chatWithUs') : activeChatTarget.nickname}</span>
                </div>
              </div>
              
              <div ref={chatContainerRef} className="flex-grow bg-slate-50 p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
                <div className="flex justify-center mb-2"><span className="text-xs text-slate-400 font-medium bg-white px-3 py-1 rounded-full border border-slate-100">Hôm nay</span></div>
                
                {/* HIỂN THỊ TIN NHẮN TÙY VÀO ĐỐI TƯỢNG */}
                {(isAdmin && activeChatTarget ? (adminChatUser?.messages || []) : (activeChatTarget === 'admin' ? chatMessages : p2pMessages)).map((msg, idx) => {
                  const isMe = msg.sender === user?.uid || (isAdmin && msg.sender === 'bot');
                  const showAvatar = !isMe;
                  
                  return (
                    <div key={idx} className={`flex gap-2 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                      {showAvatar && (
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-auto overflow-hidden shadow-sm">
                          {activeChatTarget === 'admin' || isAdmin ? <FiShield className="text-sky-500"/> : (activeChatTarget.avatar ? <img src={activeChatTarget.avatar} className="w-full h-full object-cover"/> : activeChatTarget.nickname?.charAt(0).toUpperCase())}
                        </div>
                      )}
                      <div className={`p-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100'}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                 <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleUserSendMessage()} placeholder={t('chatInput')} className="flex-grow bg-slate-100 text-slate-800 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-300" />
                 <button onClick={handleUserSendMessage} className={`p-2.5 rounded-full flex items-center justify-center transition-colors ${chatInput.trim() ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}><FiSend/></button>
              </div>
            </div>
          )}

          {/* NÚT BONG BÓNG MẶC ĐỊNH */}
          {(!isChatBoxOpen && (!isAdmin || (!isHelpOpen && !adminChatUser))) && (
            <button onClick={() => setIsHelpOpen(!isHelpOpen)} className="relative w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-black hover:scale-105 transition-all">
               {isHelpOpen ? <FiX className="text-2xl" /> : <FiMessageCircle className="text-2xl" />}
               {(!isAdmin && hasUnreadUser) && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">1</span>}
               {(isAdmin && totalAdminUnread > 0) && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">{totalAdminUnread}</span>}
            </button>
          )}
        </div>

        {/* HEADER CHÍNH */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm flex-shrink-0 transition-colors duration-300">
           <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-3 pb-0">
              
              <div className="flex items-center justify-between gap-4 pb-2 md:pb-3">
                 <div className="flex items-center">
                    <h1 className="text-5xl md:text-[52px] font-brush tracking-wide cursor-pointer text-slate-900 hover:text-sky-600 transition-colors" onClick={() => navigateTo('home', 'all')} style={{ lineHeight: '1' }}>
                      Trimi
                    </h1>
                 </div>

                 <div className="hidden md:flex relative w-full max-w-[400px] flex-grow lg:mx-6">
                    <div className="flex bg-slate-100 rounded-full h-10 w-full overflow-hidden border border-transparent focus-within:border-slate-300 focus-within:bg-white transition-all shadow-inner z-50 relative">
                       <input type="text" value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setCurrentView('shop');}} placeholder={t('search')} className="w-full px-4 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400 font-medium"/>
                       <button className="px-4 text-slate-500 hover:text-sky-500 transition-colors"><FiSearch className="text-lg"/></button>
                    </div>
                    {searchQuery && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 max-h-60 overflow-y-auto animate-fade-in-up">
                         {displayedProducts.length > 0 ? displayedProducts.map(p => (
                            <div key={p.id} onClick={() => {setSearchQuery(''); navigateTo('productDetail', p.category, p);}} className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors">
                               <img src={p.imageUrl} className="w-10 h-10 object-cover rounded-md border border-slate-100" />
                               <div className="flex-1">
                                 <p className="text-sm font-bold text-slate-800 line-clamp-1">{t_prod(p.id, 'name', p.name)}</p>
                                 <p className="text-xs text-sky-600 font-black">{(Number(p.price) || 0).toLocaleString('vi-VN')}đ</p>
                               </div>
                            </div>
                         )) : <div className="px-4 py-3 text-sm text-slate-500 text-center font-medium">Không tìm thấy sản phẩm phù hợp</div>}
                      </div>
                    )}
                 </div>

                 <div className="hidden md:flex gap-4 items-center text-sm font-semibold text-slate-700">
                    
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-500 hover:text-sky-500 transition-colors bg-slate-50 rounded-full border border-slate-200">
                      {isDarkMode ? <FiSun className="text-lg"/> : <FiMoon className="text-lg"/>}
                    </button>

                    <div className="relative">
                      <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center justify-center gap-1.5 font-bold text-slate-500 hover:text-slate-900 transition-colors bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 min-w-[70px]">
                        <FiGlobe className="text-lg"/> <span className="uppercase tracking-widest">{lang}</span>
                      </button>
                      {showLangMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in-up">
                          {languages.map(l => (
                            <button key={l.code} onClick={() => {setLang(l.code); setShowLangMenu(false)}} className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${lang === l.code ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                              {l.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {isAuthenticated ? (
                      <button onClick={() => navigateTo('profile')} className="flex items-center gap-2 hover:text-sky-600 transition-colors pl-2 border-l border-slate-200">
                         {avatarUrl ? <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover border border-slate-200"/> : <FiUser className="text-xl"/>}
                         <span className="max-w-[100px] truncate">{nickname}</span>
                      </button>
                    ) : (
                      <button onClick={() => setShowLoginModal(true)} className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md ml-2 border-l border-slate-200">
                        {t('login')}
                      </button>
                    )}

                    <div className="flex items-center gap-2 cursor-pointer hover:text-sky-600 transition-colors relative group" onClick={() => setIsCartOpen(true)}>
                       <div className="relative p-1">
                         <FiShoppingCart className="text-2xl"/>
                         {cartItemCount > 0 && (
                           <span className="absolute -top-1 -right-1 bg-sky-500 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full shadow-sm border-2 border-white transition-all group-hover:scale-110">
                             {cartItemCount}
                           </span>
                         )}
                       </div>
                       <span>{t('cart')}</span>
                    </div>
                 </div>

                 <div className="flex md:hidden items-center gap-4 text-slate-800 ml-auto">
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-slate-500">{isDarkMode ? <FiSun className="text-xl"/> : <FiMoon className="text-xl"/>}</button>
                    <button className="px-2 text-slate-500"><FiSearch className="text-xl"/></button>
                    <div className="relative p-1 cursor-pointer" onClick={() => setIsCartOpen(true)}>
                      <FiShoppingCart className="text-2xl"/>
                      {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-sky-500 text-white w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full">{cartItemCount}</span>}
                    </div>
                    {isAuthenticated ? (
                      <button onClick={() => navigateTo('profile')} className="text-slate-800"><FiUser className="text-2xl"/></button>
                    ) : (
                      <button onClick={() => setShowLoginModal(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold">{t('login')}</button>
                    )}
                 </div>
              </div>

              {/* MỞ RỘNG VÙNG CLICK MENU DANH MỤC LÊN THÀNH PADDING LỚN */}
              <nav className="hidden lg:flex items-center justify-center gap-2 text-[13px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-100 relative z-30">
                 
                 <div className="relative group cursor-pointer">
                   <button onClick={() => navigateTo('shop', 'all')} className={`px-6 py-4 border-b-2 transition-colors ${currentView === 'shop' && currentCategory === 'all' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>{t('shop')}</button>
                 </div>
                 
                 <div className="relative group cursor-pointer">
                   <button onClick={() => navigateTo('shop', 'shirt_all')} className={`px-6 py-4 border-b-2 transition-colors uppercase ${currentCategory.includes('shirt') ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>{t('nav_shirt')}</button>
                   <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
                     <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2">
                       <button onClick={() => navigateTo('shop', 'shirt_all')} className="w-full text-center px-4 py-2.5 rounded-lg text-[13px] font-bold text-sky-600 bg-sky-50 mb-1 hover:bg-sky-100 transition-colors uppercase">{t('shirt_all')}</button>
                       <button onClick={() => navigateTo('shop', 'shirt_1')} className="w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase">{t('shirt_1')}</button>
                       <button onClick={() => navigateTo('shop', 'shirt_2')} className="w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase">{t('shirt_2')}</button>
                       <button onClick={() => navigateTo('shop', 'shirt_3')} className="w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase">{t('shirt_3')}</button>
                     </div>
                   </div>
                 </div>

                 <div className="relative group cursor-pointer">
                   <button onClick={() => navigateTo('shop', 'pants_all')} className={`px-6 py-4 border-b-2 transition-colors uppercase ${currentCategory.includes('pants') ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>{t('nav_pants')}</button>
                   <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
                     <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2">
                       <button onClick={() => navigateTo('shop', 'pants_all')} className="w-full text-center px-4 py-2.5 rounded-lg text-[13px] font-bold text-sky-600 bg-sky-50 mb-1 hover:bg-sky-100 transition-colors uppercase">{t('pants_all')}</button>
                       <button onClick={() => navigateTo('shop', 'pants_1')} className="w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase">{t('pants_1')}</button>
                       <button onClick={() => navigateTo('shop', 'pants_2')} className="w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase">{t('pants_2')}</button>
                       <button onClick={() => navigateTo('shop', 'pants_3')} className="w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase">{t('pants_3')}</button>
                     </div>
                   </div>
                 </div>

                 <div className="relative group cursor-pointer">
                   <button onClick={() => navigateTo('shop', 'acc_all')} className={`px-6 py-4 border-b-2 transition-colors uppercase ${currentCategory.includes('acc') ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>{t('nav_acc')}</button>
                   <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
                     <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2">
                       <button onClick={() => navigateTo('shop', 'acc_all')} className="w-full text-center px-4 py-2.5 rounded-lg text-[13px] font-bold text-sky-600 bg-sky-50 mb-1 hover:bg-sky-100 transition-colors uppercase">{t('acc_all')}</button>
                       <button onClick={() => navigateTo('shop', 'acc_1')} className="w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase">{t('acc_1')}</button>
                       <button onClick={() => navigateTo('shop', 'acc_2')} className="w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase">{t('acc_2')}</button>
                       <button onClick={() => navigateTo('shop', 'acc_3')} className="w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase">{t('acc_3')}</button>
                     </div>
                   </div>
                 </div>

              </nav>
           </div>
        </header>

        <main className="flex-grow flex flex-col">

          {/* TRANG CHỦ MỘC MẠC */}
          {currentView === 'home' && (
            <div className="w-full flex flex-col animate-fade-in">
               <div className="w-full h-[70vh] md:h-[80vh] flex flex-col md:flex-row">
                  {lookbook.map((block, index) => (
                    <div key={block.id} className="flex-1 relative group cursor-pointer overflow-hidden border-r border-slate-200/20" onClick={(e) => {
                      if(e.target.tagName !== 'INPUT' && e.target.tagName !== 'svg' && e.target.tagName !== 'LABEL') {
                        navigateTo('shop', block.targetCategory || 'all');
                      }
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
                            <input type="file" accept="image/*" onClick={(e) => e.target.value = null} onChange={(e) => handleLookbookUpload(e, index)} className="hidden" />
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
               </div>
               <div className="w-full bg-white py-20 px-6 text-center border-b border-slate-100 transition-colors duration-300">
                 <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 uppercase tracking-tighter">{t('sloganTitle')}</h2>
                 <p className="text-slate-500 max-w-2xl mx-auto mb-10 font-medium">{t('sloganDesc')}</p>
                 <button onClick={() => navigateTo('shop', 'all')} className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-black transition-transform hover:scale-105 shadow-xl shadow-slate-900/20">
                   {t('explore')}
                 </button>
               </div>
            </div>
          )}
          
          {/* CỬA HÀNG */}
          {currentView === 'shop' && (
            <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-8 md:py-10 animate-fade-in">
              
              {currentCategory === 'all' && (
                <div className="banner-protected rounded-[32px] p-6 md:p-12 mb-6 md:mb-10 border border-blue-100 flex flex-col md:flex-row items-center justify-between shadow-sm overflow-hidden relative min-h-[320px] cursor-pointer group bg-[#eef5fc]" onClick={() => { if(!isEditingBanner) navigateTo('shop', 'all'); }}>
                  <div className="max-w-[60%] md:max-w-xl relative z-10 pointer-events-none whitespace-pre-line group-hover:-translate-y-1 transition-transform">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">{t('newCol')}</span>
                    <h2 className="text-3xl md:text-5xl font-black keep-dark-text mb-4 leading-tight">{t('heroTitle')}</h2>
                    <p className="keep-dark-text-sub mb-6 font-medium">{t('heroDesc')}</p>
                  </div>
                  
                  {isAdmin && !isEditingBanner && (
                    <button onClick={(e) => { e.stopPropagation(); setIsEditingBanner(true); }} className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur text-slate-900 p-2 px-3 rounded-lg shadow-sm border border-slate-200 hover:text-sky-600 text-xs font-bold flex items-center gap-2 transition-colors">
                      <FiEdit3/> Chỉnh Banner
                    </button>
                  )}

                  <div 
                    className={`absolute md:relative md:flex right-0 bottom-0 top-0 w-full md:w-1/2 items-center justify-end md:justify-center flex transition-all overflow-hidden md:overflow-visible ${isEditingBanner ? 'z-20 border-4 border-dashed border-sky-400 bg-sky-50/30 cursor-move' : 'pointer-events-none z-0'}`}
                    onMouseDown={handleBannerMouseDown} onMouseMove={handleBannerMouseMove} onMouseUp={handleBannerMouseUp} onMouseLeave={handleBannerMouseUp} onWheel={handleBannerWheel}
                  >
                    <img 
                      src={bannerImage} alt="Banner" draggable={false} 
                      className={`h-[90%] md:h-[90%] w-auto object-contain object-right md:object-center drop-shadow-2xl ${isEditingBanner ? 'opacity-100' : 'opacity-80 md:opacity-100 group-hover:scale-105 transition-transform duration-700 ease-out'}`} 
                      style={{ transform: isMobile ? 'scale(1)' : `translate(${bannerConfig.x}px, ${bannerConfig.y}px) scale(${bannerConfig.scale})` }}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg"; e.target.className = "h-[80%] w-auto object-contain opacity-50 drop-shadow-xl" }} 
                    />
                    
                    {isEditingBanner && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2 px-4 rounded-full shadow-2xl flex items-center gap-4 cursor-default animate-fade-in-up" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                        <FiMove className="text-xl text-slate-400"/>
                        <span className="text-xs font-bold text-slate-300 whitespace-nowrap hidden sm:inline">Kéo & Cuộn</span>
                        <div className="w-px h-6 bg-slate-700 mx-1"></div>
                        <label className="bg-slate-700 hover:bg-slate-600 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap">
                           <FiCamera/> Đổi ảnh
                           <input type="file" accept="image/*" onClick={(e) => e.target.value = null} onChange={handleBannerImageUpload} className="hidden" />
                        </label>
                        <button onClick={handleSaveBanner} className="bg-sky-500 hover:bg-sky-600 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 transition-colors"><FiSave/> Lưu</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-8 flex items-center gap-2">
                 <div className="w-2 h-8 bg-sky-500 rounded-full"></div>
                 <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">{currentCategory.includes('_all') ? t(currentCategory) : (currentCategory === 'all' ? t('all_products') : t(currentCategory))}</h2>
              </div>

              {isLoadingShop ? (
                <div className="flex justify-center py-32"><FiRefreshCcw className="text-4xl text-sky-500 animate-spin" /></div>
              ) : displayedProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <FiArchive className="text-6xl text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-800">{t('no_products')}</h3>
                  <p className="text-slate-500 mt-2">{t('no_products_desc')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 px-1 md:px-0">
                  {displayedProducts.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 group">
                      <div className="bg-slate-100 rounded-[32px] border border-slate-200 relative aspect-[4/5] flex items-center justify-center cursor-pointer hover:shadow-2xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-500 overflow-hidden" onClick={() => navigateTo('productDetail', currentCategory, item)}>
                         <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                         <button onClick={(e) => handleAddToCart(item, e)} className="absolute bottom-3 right-3 md:bottom-5 md:right-5 w-9 h-9 md:w-12 md:h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-110 hover:bg-sky-500 transition-all shadow-lg shadow-slate-900/30">
                           <FiPlus className="text-lg md:text-2xl"/>
                         </button>
                      </div>
                      <div className="px-2">
                        <h3 className="text-slate-800 font-bold text-xs md:text-sm line-clamp-1 mb-1 cursor-pointer hover:text-sky-600 transition-colors" onClick={() => navigateTo('productDetail', currentCategory, item)}>{t_prod(item.id, 'name', item.name)}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1 md:gap-1.5">
                            {fakeColorSpheres.map((gradient, idx) => (
                              <div key={idx} className={`w-3 h-3 md:w-4 md:h-4 rounded-full shadow-inner border border-slate-200/50 bg-gradient-to-br ${gradient}`}></div>
                            ))}
                          </div>
                          <span className="text-sm md:text-base font-black text-slate-900">{(Number(item.price) || 0).toLocaleString('vi-VN')}đ</span>
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
            <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-6 md:py-8 animate-fade-in">
              <div className="text-xs font-bold text-slate-400 mb-6 tracking-wider uppercase flex items-center gap-2">
                <button onClick={() => navigateTo('shop', currentCategory)} className="hover:text-slate-800 transition-colors flex items-center gap-1"><FiCornerUpLeft/> {t('shop')}</button>
                <span>/</span><span>{currentCategory.includes('_all') ? t(currentCategory) : (currentCategory === 'all' ? t('all_products') : t(selectedProduct.category))}</span><span>/</span><span className="text-slate-800 truncate">{t_prod(selectedProduct.id, 'name', selectedProduct.name)}</span>
              </div>
              <div className="bg-white rounded-[40px] border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 lg:gap-12 shadow-sm">
                
                <div className="w-full md:w-[45%] lg:w-[40%] max-h-[400px] lg:max-h-[500px] bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center relative group overflow-hidden">
                   <img src={selectedProduct.imageUrl} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt={selectedProduct.name}/>
                </div>

                <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col justify-center">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-3 leading-tight">{t_prod(selectedProduct.id, 'name', selectedProduct.name)}</h1>
                  <div className="flex items-center text-sm gap-4 mb-6">
                    <span className="text-amber-400 font-bold flex items-center gap-1 text-base"><FiStar className="fill-current"/> {selectedProduct.rating}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 font-medium underline underline-offset-4">{selectedProduct.reviews} Đánh giá</span>
                  </div>
                  <div className="text-3xl lg:text-4xl font-black text-sky-600 mb-6">{(Number(selectedProduct.price) || 0).toLocaleString('vi-VN')}đ</div>
                  <div className="space-y-3 text-sm font-medium text-slate-700 mb-8 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-3"><FiTruck className="text-xl text-sky-500"/> {t('ship')}</div>
                    <div className="flex items-center gap-3"><FiShield className="text-xl text-emerald-500"/> {t('return')}</div>
                  </div>
                  <div className="mb-10">
                    <p className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">{t('desc')}</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{t_prod(selectedProduct.id, 'desc', selectedProduct.description)}</p>
                  </div>
                  <button onClick={(e) => handleAddToCart(selectedProduct, e)} className="mt-auto w-full md:w-[80%] bg-slate-900 text-white py-4 rounded-full font-black text-sm tracking-widest uppercase hover:bg-black transition-transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20">
                    <FiShoppingCart className="text-xl"/> {t('addToCart')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TRANG CÁ NHÂN VÀ CÀI ĐẶT */}
          {currentView === 'profile' && user && (
            <div className="max-w-5xl mx-auto w-full px-4 py-8 animate-fade-in-up relative z-30">
              <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-200 mb-6 relative">
                <div className="h-48 md:h-72 w-full bg-gradient-to-r from-sky-400 to-indigo-500 relative flex items-center justify-center overflow-hidden">
                  {coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" alt="Cover"/> : <FiImage className="text-6xl text-white opacity-20"/>}
                  <div className="absolute bottom-4 right-4">
                    <label htmlFor="coverUpload" className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white hover:text-slate-900 transition-all cursor-pointer shadow-md">
                      <FiCamera className="text-lg"/> {t('changeCover')}
                    </label>
                    <input type="file" id="coverUpload" accept="image/*" onClick={(e) => e.target.value = null} onChange={(e) => handleProfileUpload(e, 'cover')} className="hidden" />
                  </div>
                </div>
                
                <div className="px-6 md:px-12 pb-8 relative">
                  <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-full p-1.5 absolute -top-16 md:-top-24 border border-slate-100 shadow-xl z-10">
                    <div className="w-full h-full bg-slate-900 text-white rounded-full flex items-center justify-center text-5xl font-black relative overflow-hidden group">
                      {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar"/> : nickname.charAt(0).toUpperCase() || 'U'}
                      <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <FiCamera className="text-white text-3xl"/>
                      </label>
                      <input type="file" id="avatarUpload" accept="image/*" onClick={(e) => e.target.value = null} onChange={(e) => handleProfileUpload(e, 'avatar')} className="hidden" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 pb-2 gap-3 relative z-20">
                    <button onClick={handleLogout} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2 border border-slate-200">
                      <FiLogOut/> {t('logout')}
                    </button>
                    {isAdmin && (
                      <button onClick={() => navigateTo('admin')} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-md">
                        <FiSettings/> {t('adminMenu')}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0 relative z-20">
                    {!isEditingName ? (
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                        {nickname}
                        <button onClick={() => {setTempName(nickname); setIsEditingName(true)}} className="text-sm text-slate-400 hover:text-sky-500 transition-colors p-1.5 bg-slate-50 rounded-full border border-slate-100" title="Đổi biệt danh"><FiEdit3/></button>
                        <button onClick={() => {setTempProfile({nickname, phone, address, district}); setShowSettingsModal(true);}} className="text-sm text-slate-400 hover:text-sky-500 transition-colors p-1.5 bg-slate-50 rounded-full border border-slate-100 ml-1" title="Cài đặt bảo mật & Địa chỉ"><FiSettings/></button>
                      </h2>
                    ) : (
                      <div className="flex items-center gap-3 mb-2">
                        <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="border-b-2 border-sky-500 text-3xl md:text-4xl font-black text-slate-900 outline-none bg-transparent w-64 md:w-80" autoFocus placeholder="Nhập biệt danh..."/>
                        <button onClick={handleSaveName} className="bg-slate-900 text-white p-2 rounded-full hover:bg-sky-500 shadow-md transition-colors"><FiCheckCircle className="text-lg"/></button>
                        <button onClick={() => setIsEditingName(false)} className="bg-slate-100 text-slate-500 p-2 rounded-full hover:bg-red-500 hover:text-white shadow-md transition-colors"><FiX className="text-lg"/></button>
                      </div>
                    )}
                    <p className="text-slate-500 font-medium mb-4 mt-2">{user?.email || 'Đăng nhập bằng Số điện thoại'}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">{t('roleCustomer')}</span>
                      <span className="bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"><FiCheckCircle/> {t('roleVerified')}</span>
                      {isAdmin && <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold">Admin</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-8 border-b border-slate-100 pt-6 overflow-x-auto custom-scrollbar relative z-20">
                     {['Tất cả', 'Chờ thanh toán', 'Vận chuyển', 'Chờ giao hàng', 'Hoàn thành', 'Đã hủy', 'Trả hàng/Hoàn tiền'].map((tab, idx) => (
                       <button key={idx} className={`pb-3 whitespace-nowrap font-bold text-sm tracking-wide transition-colors ${idx === 0 ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-900'}`}>
                         {tab}
                       </button>
                     ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm text-center py-24">
                <FiArchive className="text-6xl text-slate-200 mx-auto mb-6"/>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{t('noOrders')}</h3>
                <p className="text-slate-500 text-base font-medium">{t('noOrdersDesc')}</p>
              </div>
            </div>
          )}

          {/* QUẢN TRỊ ADMIN */}
          {currentView === 'admin' && isAdmin && (
            <div className="max-w-6xl mx-auto w-full px-4 py-8 md:py-12 animate-fade-in flex flex-col gap-8">
              <div>
                <div className="text-xs font-bold text-slate-400 mb-6 tracking-wider uppercase flex items-center gap-2">
                  <button onClick={() => navigateTo('profile')} className="hover:text-slate-800 transition-colors flex items-center gap-1"><FiCornerUpLeft/> {t('account')}</button>
                  <span>/</span><span className="text-slate-800 truncate">{t('adminDashboard')}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3"><FiArchive className="text-slate-900"/> {t('adminDashboard')}</h2>
                   <button onClick={() => setShowAddModal(true)} className="bg-sky-500 text-white px-6 py-3.5 rounded-full font-bold shadow-lg flex items-center gap-2">
                     <FiPlus className="text-xl"/> {t('adminAdd')}
                   </button>
                </div>
              </div>
              
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-black border-b border-slate-200">
                        <th className="p-5 pl-8">{t('adminImg')}</th>
                        <th className="p-5">{t('adminName')}</th>
                        <th className="p-5">{t('adminPrice')}</th>
                        <th className="p-5 text-right pr-8">{t('adminAction')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localProducts.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-5 pl-8">
                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm"><img src={item.imageUrl} className="w-full h-full object-cover rounded-xl" alt=""/></div>
                          </td>
                          <td className="p-5 font-bold text-base text-slate-800 max-w-[250px] truncate">{item.name}</td>
                          <td className="p-5 font-black text-slate-900 text-lg">{(Number(item.price) || 0).toLocaleString('vi-VN')}đ</td>
                          <td className="p-5 text-right pr-8">
                            <button onClick={() => handleDeleteProduct(item.id)} className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-full transition-colors font-bold text-xs flex items-center gap-2 ml-auto"><FiTrash2 className="text-sm"/> {t('adminDel')}</button>
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

        <footer className="bg-[#111111] text-white pt-16 pb-8 mt-auto border-t border-slate-800 flex-shrink-0 z-30 relative transition-colors duration-300">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
              <div className="lg:col-span-1">
                <h2 className="text-[65px] font-brush mb-2 leading-[0.8] tracking-wider">Trimi</h2>
                <div className="flex gap-4 text-slate-400 mt-6">
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FiInstagram className="text-lg"/></div>
                   <a href="https://www.facebook.com/profile.php?id=61578555688928" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FaFacebook className="text-lg"/></a>
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FiLinkedin className="text-lg"/></div>
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FiYoutube className="text-lg"/></div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6">{t('f_prod')}</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigateTo('shop', 'all')}>{t('f_all')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigateTo('shop', 'shirt_all')}>{t('f_men')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigateTo('shop', 'pants_all')}>{t('f_women')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => navigateTo('shop', 'acc_all')}>{t('f_acc')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6">{t('f_sup')}</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_track')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_ret')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_ship')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_size')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6">{t('f_serv')}</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_print')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_b2b')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_gift')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6">{t('f_about')}</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_story')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_career')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_contact')}</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center border-t border-slate-800 pt-8 text-xs text-slate-500 font-medium">
              <p>© Copyright Trimi 2026. All rights reserved.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <span className="hover:text-white cursor-pointer transition-colors">{t('f_priv')}</span>
                <span>·</span>
                <span className="hover:text-white cursor-pointer transition-colors">{t('f_term')}</span>
              </div>
            </div>
          </div>
        </footer>

        {/* MODAL GIỎ HÀNG */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[99999] flex justify-end pointer-events-auto">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
            <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-fade-in-right">
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><FiShoppingCart className="text-sky-500"/> {t('cart')} ({cartItemCount})</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition-colors"><FiX className="text-xl"/></button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-slate-50">
                {cart.length === 0 ? (
                  <div className="text-center mt-32 flex flex-col items-center">
                    <div className="w-32 h-32 bg-white shadow-sm rounded-full flex items-center justify-center mb-6"><FiShoppingCart className="text-6xl text-slate-200"/></div>
                    <p className="text-slate-500 font-medium mb-8 text-base">{t('emptyCart')}</p>
                    <button onClick={() => {setIsCartOpen(false); navigateTo('shop', 'all')}} className="px-10 py-4 bg-slate-900 text-white text-sm font-bold tracking-widest uppercase rounded-full shadow-lg shadow-slate-900/20 hover:bg-black transition-all">{t('startShop')}</button>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex gap-5 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative pr-12 group hover:border-slate-300 transition-colors">
                      <div className="w-24 h-24 bg-slate-50 rounded-2xl p-3 flex-shrink-0 border border-slate-100">
                        <img src={item.imageUrl} className="w-full h-full object-cover rounded-xl" alt=""/>
                      </div>
                      <div className="flex-1 flex flex-col justify-center py-1">
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug pr-2">{t_prod(item.id, 'name', item.name)}</h4>
                        <p className="text-slate-900 font-black text-lg mt-1">{(Number(item.price) || 0).toLocaleString('vi-VN')}đ</p>
                        <p className="text-[10px] text-slate-400 mt-1">Thêm lúc: {item.addedAt ? new Date(item.addedAt).toLocaleTimeString('vi-VN') : 'Mới đây'}</p>
                        <div className="flex items-center border border-slate-200 rounded-xl w-fit mt-3 overflow-hidden bg-slate-50">
                          <button onClick={() => updateCartQuantity(item.id, -1)} className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200 transition-colors">-</button>
                          <span className="px-4 text-xs font-black text-slate-900 bg-white py-1.5 border-x border-slate-200">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, 1)} className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200 transition-colors">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors" title={t('adminDel')}>
                        <FiTrash2 className="text-xl"/>
                      </button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-6 md:p-8 border-t border-slate-100 bg-white">
                  <div className="flex gap-3 mb-6 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <button onClick={() => setPaymentMode('deposit')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${paymentMode === 'deposit' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>Cọc 30%</button>
                    <button onClick={() => setPaymentMode('full')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${paymentMode === 'full' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>Thanh toán 100%</button>
                  </div>
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{paymentMode === 'deposit' ? t('deposit') : t('total')}</span>
                    <span className="text-4xl font-black text-slate-900">{paymentMode === 'deposit' ? depositAmount.toLocaleString('vi-VN') : cartFinalTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <button onClick={handleProceedCheckout} className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-full text-sm font-bold tracking-widest uppercase shadow-xl shadow-slate-900/20 transition-all flex justify-center items-center gap-2">
                    <FiCheckCircle className="text-lg"/> {t('checkout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL THANH TOÁN QR */}
        {showCheckoutModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 animate-fade-in">
             <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => !isCheckingPayment && setShowCheckoutModal(false)}></div>
             <div className="bg-white rounded-[32px] w-full max-w-4xl relative z-10 shadow-2xl flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-1/2 bg-slate-50 p-6 md:p-8 border-r border-slate-100 flex flex-col">
                    <h3 className="text-2xl font-black mb-6">{t('order_summary')}</h3>
                    <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2 max-h-[150px] md:max-h-[300px]">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm font-medium">
                                <span className="text-slate-600 line-clamp-1 pr-4">{t_prod(item.id, 'name', item.name)} <span className="text-sky-600 font-bold ml-1">x{item.quantity}</span></span>
                                <span className="text-slate-900 font-bold whitespace-nowrap">{((Number(item.price) || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
                        <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                           <span>{t('order_price')}</span>
                           <span>{cartProductsTotal.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                           <span>{t('shipping_fee')}</span>
                           <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}</span>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
                        <div className={`flex justify-between items-end ${paymentMode === 'full' ? 'bg-sky-100 p-3 rounded-xl' : 'mb-2'}`}>
                            <span className={`${paymentMode === 'full' ? 'text-sky-700' : 'text-slate-500'} font-bold uppercase tracking-widest text-xs`}>{t('total')}</span>
                            <span className={`text-2xl font-black ${paymentMode === 'full' ? 'text-sky-600' : 'text-slate-900'}`}>{cartFinalTotal.toLocaleString('vi-VN')}đ</span>
                        </div>
                        {paymentMode === 'deposit' && (
                          <div className="flex justify-between items-end bg-sky-100 p-3 rounded-xl">
                              <span className="text-sky-700 font-black uppercase tracking-widest text-sm">{t('deposit')}</span>
                              <span className="text-2xl font-black text-sky-600">{depositAmount.toLocaleString('vi-VN')}đ</span>
                          </div>
                        )}
                    </div>
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-8 text-center flex flex-col items-center justify-center relative bg-white">
                    {!isCheckingPayment && <button onClick={() => setShowCheckoutModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>}
                    
                    <h3 className="text-2xl font-black mb-2 text-slate-900">{t('qr_pay')}</h3>
                    <p className="text-sm text-slate-500 mb-4 font-medium px-4">{t('qr_scan_desc')}</p>
                    
                    <div className="bg-white p-2 rounded-3xl shadow-lg border border-slate-100 mb-4 inline-block transform hover:scale-105 transition-transform relative">
                        <img src="/qr.png" alt="QR Code" className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-xl"/>
                    </div>
                    <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-xs font-bold mb-4 border border-amber-200">
                      Nội dung CK: <span className="text-slate-900 font-black text-sm">{currentOrderId}</span>
                    </div>

                    {/* NÚT UPLOAD HÌNH ẢNH BILL - CHỐNG SPAM */}
                    <div className="w-full mb-4">
                       <label className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed ${receiptImg ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-slate-50 text-slate-500 hover:border-sky-500 hover:text-sky-600'}`}>
                         {receiptImg ? <><FiCheckCircle className="text-lg"/> Đã tải lên Bill</> : <><FiUpload className="text-lg"/> 1. Tải lên ảnh Bill chuyển khoản</>}
                         <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                       </label>
                    </div>
                    
                    <button onClick={handleConfirmPayment} disabled={isCheckingPayment || !receiptImg} className={`w-full py-4 rounded-full font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isCheckingPayment || !receiptImg ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-500 text-white hover:bg-sky-600 shadow-xl cursor-pointer'}`}>
                      {isCheckingPayment ? <><FiLoader className="text-xl animate-spin text-sky-500"/> {t('waiting_payment')}</> : <><FiCheckCircle className="text-xl"/> 2. {t('confirm_paid')}</>}
                    </button>
                    
                    <p className="text-[10px] text-slate-400 mt-4 px-4 leading-relaxed">
                       Quét mã QR. Bạn bắt buộc phải tải lên ảnh chụp màn hình chuyển khoản để có thể bấm Xác nhận.
                    </p>
                </div>
             </div>
          </div>
        )}

        {/* MODAL CÀI ĐẶT BẢO MẬT & ĐỊA CHỈ */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowSettingsModal(false)}></div>
             <div className="bg-white rounded-[32px] p-6 md:p-10 w-full max-w-xl relative z-10 shadow-2xl animate-fade-in-up">
                <button onClick={() => setShowSettingsModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2"><FiSettings className="text-sky-500"/> Cài đặt bảo mật</h3>
                
                <div className="space-y-5">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tên hiển thị</label>
                      <input type="text" value={tempProfile.nickname || ''} onChange={e => setTempProfile({...tempProfile, nickname: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500 text-sm font-bold"/>
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Số điện thoại</label>
                      <input type="tel" value={tempProfile.phone || ''} onChange={e => setTempProfile({...tempProfile, phone: e.target.value})} placeholder="09xxxx..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500 text-sm font-medium"/>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Khu vực (Đà Nẵng)</label>
                      <select value={tempProfile.district || 'Hải Châu'} onChange={e => setTempProfile({...tempProfile, district: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500 text-sm font-medium">
                         {daNangDistricts.map(d => <option key={d.name} value={d.name}>{d.name} ({d.fee === 0 ? 'Free Ship' : 'Ship 20k'})</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Số nhà, Tên đường</label>
                      <input type="text" value={tempProfile.address || ''} onChange={e => setTempProfile({...tempProfile, address: e.target.value})} placeholder="Ví dụ: 123 Đường ABC..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500 text-sm font-medium"/>
                   </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                   <button onClick={() => setShowSettingsModal(false)} className="px-6 py-3 rounded-full font-bold text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 cursor-pointer">Đóng</button>
                   <button onClick={handleSaveSettings} className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl cursor-pointer">Lưu Thông Tin</button>
                </div>
             </div>
          </div>
        )}

        {/* MODAL THÊM SẢN PHẨM ADMIN */}
        {showAddModal && isAdmin && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
            <div className="bg-white rounded-[40px] p-8 md:p-10 w-full max-w-2xl relative z-10 shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3"><FiPlus className="text-sky-500 bg-sky-50 p-2 rounded-full"/> {t('adminAdd')}</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-3 rounded-full transition-colors"><FiX className="text-xl"/></button>
               </div>
               <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">{t('adminImg')} (PNG/JPG)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-[24px] p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer group">
                      <input type="file" accept="image/*" onClick={(e) => e.target.value = null} onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) compressImage(file, (base64) => setNewProd({ ...newProd, imagePreview: base64 }));
                      }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {newProd.imagePreview ? <img src={newProd.imagePreview} className="h-40 object-cover rounded-xl drop-shadow-md" alt="Preview" /> : <><FiUploadCloud className="text-5xl text-slate-300 mb-3 group-hover:text-sky-500 transition-colors"/><p className="text-sm font-medium text-slate-500">Bấm hoặc kéo thả ảnh vào đây</p></>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">{t('adminName')}</label>
                      <input type="text" value={newProd.name} onChange={(e) => setNewProd({...newProd, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">{t('adminPrice')} (VNĐ)</label>
                      <input type="number" value={newProd.price} onChange={(e) => setNewProd({...newProd, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                     <div>
                       <label className="block text-sm font-bold text-slate-700 mb-3">Danh mục</label>
                       <select value={newProd.category} onChange={(e) => setNewProd({...newProd, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium">
                          <option value="shirt_1">{t('shirt_1')}</option>
                          <option value="shirt_2">{t('shirt_2')}</option>
                          <option value="shirt_3">{t('shirt_3')}</option>
                          <option value="pants_1">{t('pants_1')}</option>
                          <option value="pants_2">{t('pants_2')}</option>
                          <option value="pants_3">{t('pants_3')}</option>
                          <option value="acc_1">{t('acc_1')}</option>
                          <option value="acc_2">{t('acc_2')}</option>
                          <option value="acc_3">{t('acc_3')}</option>
                       </select>
                     </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">{t('desc')}</label>
                    <textarea value={newProd.desc} onChange={(e) => setNewProd({...newProd, desc: e.target.value})} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium resize-none"></textarea>
                  </div>
               </div>
               <div className="pt-8 border-t border-slate-100 mt-4 flex justify-end gap-4">
                 <button onClick={() => setShowAddModal(false)} className="px-8 py-4 rounded-full font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">Hủy Bỏ</button>
                 <button onClick={handleSubmitNewProduct} className="px-8 py-4 rounded-full font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/30 cursor-pointer">
                   <FiCheckCircle className="text-lg"/> Đăng Lên Cửa Hàng
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* MODAL LOGIN */}
        {showLoginModal && !isAuthenticated && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowLoginModal(false)}></div>
            <div className="bg-white rounded-[40px] w-full max-w-5xl relative z-10 shadow-2xl flex overflow-hidden min-h-[550px]">
              <div className="hidden md:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
                 <div className="relative z-10">
                   <h2 className="text-4xl font-black text-white mb-6 leading-tight">Gia nhập thế giới<br/>Thời trang Trimi.</h2>
                   <p className="text-slate-400 font-medium text-lg leading-relaxed">Đăng nhập để thêm sản phẩm vào giỏ hàng.</p>
                 </div>
                 <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col relative bg-white">
                <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 p-2 rounded-full transition-colors"><FiX className="text-2xl"/></button>
                <h3 className="text-3xl font-black text-slate-900 mb-8">{authMode === 'login' ? t('login') : 'Tạo tài khoản'}</h3>
                <div className="flex flex-col gap-4 mb-8">
                  <button onClick={handleGoogleLogin} className="w-full bg-[#101828] text-white py-4 font-bold rounded-full flex items-center justify-center gap-3 cursor-pointer"><FcGoogle className="text-xl bg-white rounded-full p-0.5" /> Google</button>
                  <button onClick={handleFacebookLogin} className="w-full border-2 py-4 font-bold rounded-full flex items-center justify-center gap-3 cursor-pointer"><FaFacebook className="text-xl text-[#1877F2]"/> Facebook</button>
                </div>
                <div className="flex items-center mb-6"><div className="flex-grow border-t"></div><span className="mx-4 text-slate-400 text-xs font-bold uppercase">Hoặc</span><div className="flex-grow border-t"></div></div>
                <div className="flex flex-col gap-4 mb-6">
                  <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="bg-slate-50 rounded-2xl px-5 py-4 outline-none focus:ring-1" />
                  <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Mật khẩu" className="bg-slate-50 rounded-2xl px-5 py-4 outline-none focus:ring-1" />
                  <button onClick={handleEmailAuth} className="bg-sky-500 text-white py-4 font-black rounded-full uppercase shadow-lg cursor-pointer">{authMode === 'login' ? t('login') : 'Đăng Ký'}</button>
                </div>
                <div className="text-center text-sm font-medium text-slate-600 mb-8">{authMode === 'login' ? <>Chưa có tài khoản? <button onClick={() => setAuthMode('register')} className="text-sky-600 font-bold underline">Tạo ngay</button></> : <>Đã có tài khoản? <button onClick={() => setAuthMode('login')} className="text-sky-600 font-bold underline">Đăng nhập</button></>}</div>
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
                    if (user) { 
                      localStorage.setItem(`trimi_role_${user.uid}`, role);
                      try { await setDoc(doc(db, "users", user.uid), { email: user.email || '', role: role }, { merge: true }); } catch(e){} 
                    }
                    showToast('Cảm ơn bạn đã hoàn thành!');
                  }} className="bg-white border-2 border-slate-100 text-slate-700 py-5 px-6 rounded-2xl font-bold text-base hover:border-sky-500 hover:text-sky-600 transition-all shadow-sm hover:shadow-md cursor-pointer">
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}