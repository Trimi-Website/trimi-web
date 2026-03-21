import { useState, useEffect, useRef } from 'react'; // <--- Thêm useRef vào đây
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
  VI: { home: "Trang chủ", shop: "Cửa hàng", nav_shirt: "Áo", nav_pants: "Quần", nav_acc: "Linh kiện", shirt_all: "Tất cả Áo", pants_all: "Tất cả Quần", acc_all: "Tất cả Phụ kiện", shirt_1: "Áo thun", shirt_2: "Áo sơ mi", shirt_3: "Áo khoác", pants_1: "Quần Jeans", pants_2: "Quần Kaki", pants_3: "Quần Short", acc_1: "Mũ / Nón", acc_2: "Túi xách", acc_3: "Trang sức", login: "Đăng nhập", search: "Tìm kiếm...", cart: "Giỏ hàng", account: "Tài khoản", logout: "Đăng xuất", adminMenu: "Quản Trị Kho", sloganTitle: "Đậm chất riêng.", sloganDesc: "Chúng tôi tin rằng thời trang không chỉ là áo quần, mà là ngôn ngữ không lời để thể hiện cá tính thực sự của bạn.", explore: "Khám phá ngay", newCol: "New Collection 2026", heroTitle: "Thời trang phong cách,\nđậm chất riêng.", heroDesc: "Khám phá hàng trăm mẫu áo thun, áo khoác và phụ kiện chất lượng cao với mức giá không thể tuyệt vời hơn.", addToCart: "THÊM VÀO GIỎ HÀNG", desc: "Mô tả chi tiết", ship: "Chỉ giao trong địa phận Đà Nẵng", return: "Đổi trả miễn phí 5 ngày", myOrders: "Đơn hàng của tôi", wishlist: "Yêu thích", noOrders: "Chưa có đơn hàng nào", noOrdersDesc: "Khi bạn mua sắm, danh sách hóa đơn sẽ hiển thị tại đây.", total: "Tổng thanh toán", checkout: "Thanh Toán Ngay", emptyCart: "Giỏ hàng của bạn đang trống.", startShop: "Mua sắm ngay", f_prod: "Sản phẩm", f_all: "Tất cả sản phẩm", f_men: "Thời trang Nam", f_women: "Thời trang Nữ", f_acc: "Phụ kiện", f_sup: "Hỗ trợ khách hàng", f_track: "Theo dõi đơn hàng", f_ret: "Chính sách đổi trả", f_ship: "Chính sách giao hàng", f_size: "Hướng dẫn chọn size", f_serv: "Dịch vụ", f_print: "In ấn theo yêu cầu", f_b2b: "Khách hàng doanh nghiệp", f_gift: "Thẻ quà tặng", f_about: "Về Trimi", f_story: "Câu chuyện thương hiệu", f_career: "Tuyển dụng", f_contact: "Liên hệ chúng tôi", f_priv: "Chính sách bảo mật", f_term: "Điều khoản", chatHelp: "Trạm hỗ trợ Trimi", chatHow: "👋 Chúng tôi có thể giúp gì cho bạn?", chatWithUs: "Chat Với Admin", sendMsg: "Gửi tin nhắn", replyFast: "Phản hồi ngay lập tức", faqs: "Câu hỏi thường gặp", faqAcc: "Tài khoản của tôi", faqBill: "Thanh toán & Đơn hàng", faqShip: "Vận chuyển", chatInput: "Nhập tin nhắn...", roleCustomer: "Khách hàng", roleVerified: "Thành viên", roleAdmin: "Quản trị viên", changeCover: "Đổi ảnh bìa", adminDashboard: "Trạm Quản Trị", adminAdd: "Đăng Sản Phẩm", adminUsers: "Khách hàng", adminNoData: "Chưa có dữ liệu", adminImg: "Hình ảnh", adminName: "Tên sản phẩm", adminPrice: "Giá bán", adminAction: "Hành động", adminDel: "Xóa Bỏ", adminCare: "Chăm Sóc Khách Hàng", adminWait: "Chưa có khách hàng", online: "Đang trực tuyến", offline: "Ngoại tuyến", adminInbox: "Hộp thư khách hàng", all_products: "Tất cả sản phẩm", no_products: "Chưa có sản phẩm nào trong danh mục này", no_products_desc: "Vui lòng quay lại sau hoặc chọn danh mục khác.", order_summary: "Thông tin đơn hàng", qr_pay: "Thanh toán QR", qr_scan_desc: "Vui lòng quét mã QR bằng ứng dụng ngân hàng. Hệ thống sẽ tự động xác nhận khi nhận được tiền.", order_price: "Tiền hàng", shipping_fee: "Phí vận chuyển", deposit: "Cần cọc (30%)", waiting_payment: "Đang xử lý đơn hàng...", confirm_paid: "Xác nhận đã chuyển khoản", community: "Cộng đồng Trimi", add_friend: "Kết bạn", deposit_30: "Cọc 30%", pay_full: "Thanh toán 100%", cancel_order: "Hủy đơn hàng", sort_label: "Sắp xếp:", sort_default: "Mới nhất", sort_low_high: "Giá: Thấp đến Cao", sort_high_low: "Giá: Cao đến Thấp" },
  EN: { home: "Home", shop: "Shop", nav_shirt: "Shirts", nav_pants: "Pants", nav_acc: "Accessories", shirt_all: "All Shirts", pants_all: "All Pants", acc_all: "All Accessories", shirt_1: "T-Shirts", shirt_2: "Dress Shirts", shirt_3: "Jackets", pants_1: "Jeans", pants_2: "Khakis", pants_3: "Shorts", acc_1: "Hats", acc_2: "Bags", acc_3: "Jewelry", login: "Login", search: "Search...", cart: "Cart", account: "Account", logout: "Logout", adminMenu: "Admin Panel", sloganTitle: "Your Unique Vibe.", sloganDesc: "We believe fashion is not just clothing, but a silent language to express your true self.", explore: "Explore Now", newCol: "New Collection 2026", heroTitle: "Stylish fashion,\nunique vibe.", heroDesc: "Discover hundreds of high-quality items.", addToCart: "ADD TO CART", desc: "Description", ship: "Shipping within Da Nang only", return: "5-Day Free Returns", myOrders: "My Orders", wishlist: "Wishlist", noOrders: "No orders yet", noOrdersDesc: "Your invoices will appear here.", total: "Total", checkout: "Checkout Now", emptyCart: "Your cart is empty.", startShop: "Start Shopping", f_prod: "Products", f_all: "All Products", f_men: "Men's Fashion", f_women: "Women's Fashion", f_acc: "Accessories", f_sup: "Support", f_track: "Track Order", f_ret: "Return Policy", f_ship: "Shipping", f_size: "Size Guide", f_serv: "Services", f_print: "Print on Demand", f_b2b: "Corporate Clients", f_gift: "Gift Cards", f_about: "About", f_story: "Brand Story", f_career: "Careers", f_contact: "Contact Us", f_priv: "Privacy Policy", f_term: "Terms of Service", chatHelp: "Trimi Help", chatHow: "👋 How can we help you today?", chatWithUs: "Chat With Admin", sendMsg: "Send a message", replyFast: "Instant reply", faqs: "FAQs", faqAcc: "My Account", faqBill: "Billing", faqShip: "Shipping", chatInput: "Type a message...", roleCustomer: "Customer", roleVerified: "Member", roleAdmin: "Admin", changeCover: "Change Cover", adminDashboard: "Dashboard", adminAdd: "Add Product", adminUsers: "Customers", adminNoData: "No data", adminImg: "Image", adminName: "Name", adminPrice: "Price", adminAction: "Action", adminDel: "Delete", adminCare: "Customer Care", adminWait: "No customers yet", online: "Online", offline: "Offline", adminInbox: "Inbox", all_products: "All Products", no_products: "No products in this category", no_products_desc: "Please come back later.", order_summary: "Order Summary", qr_pay: "QR Payment", qr_scan_desc: "Scan the QR code. System will auto-verify.", order_price: "Subtotal", shipping_fee: "Shipping", deposit: "Deposit (30%)", waiting_payment: "Processing order...", confirm_paid: "Confirm Transfer", community: "Community", add_friend: "Add Friend", deposit_30: "30% Deposit", pay_full: "Pay 100%", cancel_order: "Cancel Order", sort_label: "Sort by:", sort_default: "Latest", sort_low_high: "Price: Low to High", sort_high_low: "Price: High to Low" }
};

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
  { id: 1, title: 'Men Collection', img: '/1.jpg', targetCategory: 'shirt_1' },
  { id: 2, title: 'Streetwear', img: '/2.jpg', targetCategory: 'pants_1' },
  { id: 3, title: 'Accessories', img: '/3.jpg', targetCategory: 'acc_2' },
  { id: 4, title: 'New Arrivals', img: '/4.jpg', targetCategory: 'all' },
  // ĐÂY LÀ MỤC THỨ 5 MỚI THÊM VÀO:
  { id: 5, title: 'Women Collection', img: '/5.jpg', targetCategory: 'shirt_2' } 
];

const fakeColorSpheres = ['from-white to-slate-300', 'from-zinc-700 to-black', 'from-amber-200 to-amber-600', 'from-sky-300 to-sky-600'];

export default function App() {
  const mainRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [animType, setAnimType] = useState('none');
  
  const [currentView, setCurrentView] = useState('home'); 
  const [currentCategory, setCurrentCategory] = useState('all'); 
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedTag, setSelectedTag] = useState(null);
  const [isUnifiedMenuOpen, setIsUnifiedMenuOpen] = useState(false);
  // LƯU TỌA ĐỘ CHUỘT ĐỂ LÀM TÂM CHO VÒNG TRÒN LAN TỎA
  const lastClickPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  useEffect(() => {
    const handleClick = (e) => { lastClickPos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);
  

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('trimi_theme') === 'dark');
  const [isMobile, setIsMobile] = useState(false);
  // HIỆU ỨNG TỎA VÒNG TRÒN "CỰC CHÁY" KHI ĐỔI THEME
  const handleThemeToggle = (e, forceMode = null) => {
    const nextMode = forceMode !== null ? forceMode : !isDarkMode;
    if (nextMode === isDarkMode) return; // Bỏ qua nếu giống mode cũ

    // Fallback nếu trình duyệt cũ không hỗ trợ
    if (!document.startViewTransition) {
      setIsDarkMode(nextMode);
      return;
    }

    // Lấy tọa độ chuột để làm tâm vòng tròn
    const x = e?.clientX || window.innerWidth / 2;
    const y = e?.clientY || window.innerHeight / 2;
    
    // FIX LỖI GÓC TAM GIÁC: Cộng thêm 150px vào bán kính để đảm bảo quét sạch 100% 4 góc màn hình
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 150;

    const transition = document.startViewTransition(() => {
      setIsDarkMode(nextMode);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];
      
      document.documentElement.animate(
        { clipPath: clipPath },
        {
          duration: 700, // Tốc độ vệt sáng (0.7 giây)
          easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };
  
  const [showCookieConsent, setShowCookieConsent] = useState(() => !localStorage.getItem('trimi_cookies'));
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({}); // State tạm để lưu thay đổi trước khi bấm lưu
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
  const [adminOrders, setAdminOrders] = useState([]); 
  const [myOrders, setMyOrders] = useState([]); 
  const [previewImg, setPreviewImg] = useState(null); 
  const [adminTab, setAdminTab] = useState('products'); 
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [cancelTag, setCancelTag] = useState('');
  const [cancelNote, setCancelNote] = useState('');
  const [isLoadingShop, setIsLoadingShop] = useState(true); 

  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyStep, setSurveyStep] = useState(1);
  const [surveyData, setSurveyData] = useState({ name: '', theme: 'System', source: '', occupation: '', interests: '' });
  
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
  const [successOrderInfo, setSuccessOrderInfo] = useState(null);
  const [receiptImg, setReceiptImg] = useState(null);

  const [toastMsg, setToastMsg] = useState(''); 
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isAdmin = user?.email === 'phanbasongtoan112@gmail.com';
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', price: '', category: 'shirt_1', desc: '', imagePreview: null });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [activeImgIdx, setActiveImageIdx] = useState(0); 
  
  const [lang, setLang] = useState('VI');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const languages = [{ code: 'VI', label: 'Tiếng Việt' }, { code: 'EN', label: 'English' }];
  const t = (key) => dict[lang]?.[key] || dict['VI'][key] || key;
  const t_prod = (id, field, defaultValue) => productDict[lang]?.[`${id}_${field}`] || defaultValue;

  const translateTag = (tag) => {
    if (!tag) return '';
    const t = tag.toLowerCase().trim().replace('#', '');
    const map = {
      'nam': { VI: 'Nam', EN: 'Men' }, 'nu': { VI: 'Nữ', EN: 'Women' }, 'nữ': { VI: 'Nữ', EN: 'Women' },
      'ao': { VI: 'Áo', EN: 'Shirt' }, 'áo': { VI: 'Áo', EN: 'Shirt' },
      'quan': { VI: 'Quần', EN: 'Pants' }, 'quần': { VI: 'Quần', EN: 'Pants' },
      'linhkien': { VI: 'Linh kiện', EN: 'Parts' }, 'linh kiện': { VI: 'Linh kiện', EN: 'Parts' },
      'phukien': { VI: 'Phụ kiện', EN: 'Accessories' }, 'phụ kiện': { VI: 'Phụ kiện', EN: 'Accessories' }
    };
    return map[t] ? map[t][lang] : tag;
  };

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

  const [lookbook, setLookbook] = useState(defaultLookbookData);
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
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('trimi_theme', 'dark');
      link.href = '/favicon1.ico'; // Favicon 1 cho Dark
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('trimi_theme', 'light');
      link.href = '/favicon2.ico'; // Favicon 2 cho Light
    }
  }, [isDarkMode]);

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null); // Biến để nhận diện thao tác thả tay

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 400) setShowScrollTop(true); 
      else setShowScrollTop(false);

      if (currentScrollY < 80) {
        setIsHeaderVisible(true); // Gần đầu trang luôn hiện
      } else if (Math.abs(currentScrollY - lastScrollY.current) > 10) {
        if (currentScrollY > lastScrollY.current) {
          // LƯỚT XUỐNG -> Ẩn ngay lập tức
          setIsHeaderVisible(false);
          clearTimeout(scrollTimeout.current);
        } else {
          // LƯỚT LÊN -> Chờ người dùng thả tay (dừng cuộn 150ms) mới hiện Header
          clearTimeout(scrollTimeout.current);
          scrollTimeout.current = setTimeout(() => {
            setIsHeaderVisible(true);
          }, 150); 
        }
        lastScrollY.current = currentScrollY;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout.current);
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // STATE QUẢN LÝ HIỆU ỨNG CHUYỂN TRANG
  const [isPageLoading, setIsPageLoading] = useState(false);

  const navigateTo = (view, category = 'all', product = null) => {
    const isSameProduct = (selectedProduct && product) ? selectedProduct.id === product.id : selectedProduct === product;
    if (currentView === view && currentCategory === category && isSameProduct) return;

    // Hàm thực hiện chuyển đổi dữ liệu
    const updateState = () => {
      setCurrentView(view);
      setCurrentCategory(category);
      if (view === 'productDetail') setSelectedProduct(product);
      window.history.pushState({ view, category, product }, '', `?view=${view}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    // Nếu trình duyệt không hỗ trợ, chuyển trang lập tức
    if (!document.startViewTransition) {
      updateState();
      return;
    }

    // BẮT ĐẦU HIỆU ỨNG LAN TỎA GIỐNG VIDEO
    const transition = document.startViewTransition(() => {
      updateState();
    });

    transition.ready.then(() => {
      const { x, y } = lastClickPos.current;
      const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 500, // Tốc độ vòng tròn lan ra (0.5s)
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
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
    let isMounted = true;
    const failsafe = setTimeout(() => {
      if (isMounted && isLoadingShop) {
        setLocalProducts(initialProducts);
        setIsLoadingShop(false);
      }
    }, 3000);

    const unsub = onSnapshot(collection(db, 'products'), 
      (snapshot) => {
        clearTimeout(failsafe);
        if (!isMounted) return;
        if (snapshot.empty) {
          initialProducts.forEach(p => setDoc(doc(db, "products", p.id), p).catch(()=>{}));
          setLocalProducts(initialProducts);
        } else {
          const prods = [];
          snapshot.forEach((doc) => prods.push({ ...doc.data(), id: doc.id }));
          setLocalProducts(prods.sort((a,b) => b.id - a.id));
        }
        setIsLoadingShop(false);
      },
      (error) => {
        clearTimeout(failsafe);
        if (isMounted) {
          setLocalProducts(initialProducts); 
          setIsLoadingShop(false);
        }
      }
    );
    return () => { isMounted = false; clearTimeout(failsafe); unsub(); };
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordersData = [];
      snapshot.forEach((doc) => ordersData.push({ id: doc.id, ...doc.data() }));
      const sorted = ordersData.sort((a, b) => b.createdAt - a.createdAt);
      if (isAdmin) setAdminOrders(sorted);
      setMyOrders(sorted.filter(o => o.uid === user.uid)); 
    }, (error) => {});
    return () => unsub();
  }, [user, isAdmin]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        setShowLoginModal(false);

        const baseEmailName = currentUser.email ? currentUser.email.split('@')[0] : 'Guest';
        try {
          await setDoc(doc(db, 'users', currentUser.uid), { email: currentUser.email || '', lastActive: Date.now(), isOnline: true }, { merge: true });
          const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAvatarUrl(data.avatar || currentUser.photoURL || '');
            setCoverUrl(data.cover || '');
            setNickname(data.nickname || baseEmailName);
            setPhone(data.phone || '');
            setAddress(data.address || '');
            setDistrict(data.district || 'Hải Châu');
            setFriendsList(data.friends || []);

            const isSurveyDoneLocal = localStorage.getItem(`trimi_survey_done_${currentUser.uid}`);
            if (!data.isSurveyCompleted && !isSurveyDoneLocal) {
              setSurveyData(prev => ({ ...prev, name: data.nickname || baseEmailName }));
              setShowSurveyModal(true);
              setSurveyStep(1);
            } else {
              setUserRole(data.role || 'Khách hàng');
            }
          } else {
            setSurveyData(prev => ({ ...prev, name: baseEmailName }));
            setShowSurveyModal(true);
            setSurveyStep(1);
          }
        } catch (error) {
          console.error("Lỗi đồng bộ DB:", error);
        }

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

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); };
  const requireLogin = (action) => { if (!isAuthenticated) { setShowLoginModal(true); return; } action(); };

  const handleEmailAuth = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) return alert("Vui lòng nhập email hợp lệ.");
    if (password.length < 6) return alert("Mật khẩu ít nhất 6 ký tự!");
    try {
      if (authMode === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      setShowLoginModal(false);
    } catch (error) { alert("Lỗi đăng nhập: Sai email hoặc mật khẩu."); }
  };

  const handleFacebookLogin = async (e) => { 
    if (e) e.preventDefault();
    try { 
      await signInWithPopup(auth, new FacebookAuthProvider()); 
      setShowLoginModal(false);
    } catch (error) { console.error("Lỗi FB:", error); alert("Không thể đăng nhập Facebook lúc này."); } 
  };

  const handleGoogleLogin = async (e) => { 
    if (e) e.preventDefault();
    try { 
      const result = await signInWithPopup(auth, googleProvider); 
      if (result.user) {
        setShowLoginModal(false);
        showToast("Đăng nhập thành công!");
      }
    } catch (error) { 
      console.error("Lỗi Google:", error); 
      alert("⚠️ LỖI TRÌNH DUYỆT CHẶN (COOP/CORS) ⚠️\nBạn đang chạy bằng 'localhost'. Vui lòng nhìn lên thanh địa chỉ của Chrome và đổi chữ 'localhost' thành '127.0.0.1' rồi Enter để đăng nhập Google được nhé!"); 
    } 
  };

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

  const handleAddToCart = (item, e) => {
    e.stopPropagation(); 

    // 1. ÉP HEADER HIỆN RA KHI MUA HÀNG & TỰ ẨN SAU 2.5 GIÂY
    setIsHeaderVisible(true);
    setTimeout(() => {
      if (window.scrollY > 80) setIsHeaderVisible(false);
    }, 2500);

    // 2. HIỆU ỨNG ẢNH SẢN PHẨM BAY VÀO GIỎ HÀNG
    if (e && e.currentTarget) {
      const button = e.currentTarget;
      // Tìm ảnh: Nếu ở trang chủ thì tìm gần nút, nếu ở trang chi tiết thì tìm bằng ID
      let image = button.parentElement?.querySelector('img');
      if (!image) image = document.getElementById('detail-main-image');
      const cartIcon = document.getElementById('header-cart-icon');

      if (image && cartIcon) {
        const imageRect = image.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        // Dùng thẻ <img> thay vì <div> để hiển thị ảnh
        const flyer = document.createElement('img');
        flyer.src = image.src; // Lấy đúng ảnh của sản phẩm
        flyer.className = "fixed object-cover shadow-2xl z-[10000] animate-add-to-cart-fly pointer-events-none rounded-xl border-2 border-white/50";
        
        // Kích thước ảnh bay (To hơn bi cũ để nhìn rõ ảnh)
        const size = 60; 
        flyer.style.width = `${size}px`;
        flyer.style.height = `${size}px`;
        
        const startX = imageRect.left + imageRect.width / 2 - size / 2;
        const startY = imageRect.top + imageRect.height / 2 - size / 2;
        flyer.style.left = `${startX}px`;
        flyer.style.top = `${startY}px`;

        const endX = cartRect.left + cartRect.width / 2 - size / 2;
        const endY = cartRect.top + cartRect.height / 2 - size / 2;
        
        flyer.style.setProperty('--diff-x', `${endX - startX}px`);
        flyer.style.setProperty('--diff-y', `${endY - startY}px`);

        document.body.appendChild(flyer);

        flyer.addEventListener('animationend', () => {
          document.body.removeChild(flyer);
          cartIcon.classList.add('scale-125', 'text-sky-500'); 
          setTimeout(() => cartIcon.classList.remove('scale-125', 'text-sky-500'), 300);
        });
      }
    }
    
    // 3. LOGIC XỬ LÝ SỐ LƯỢNG
    const currentStock = item.stock !== undefined ? item.stock : 50; 
    if (currentStock <= 0) return showToast("Sản phẩm này đã hết hàng!");

    setCart((prevCart) => {
      const existingItem = prevCart.find(i => i.id === item.id);
      if (existingItem) {
        if (existingItem.quantity >= currentStock) {
          showToast(`Chỉ còn ${currentStock} sản phẩm trong kho!`);
          return prevCart;
        }
        return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1, addedAt: Date.now() } : i);
      }
      return [...prevCart, { ...item, quantity: 1, addedAt: Date.now() }];
    });
  };

  const updateCartQuantity = (id, delta) => setCart(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
  
  useEffect(() => {
    if (cart.length === 0 && showCheckoutModal) {
      setShowCheckoutModal(false);
      showToast("Giỏ hàng trống!");
    }
  }, [cart, showCheckoutModal]);
  
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

      cart.forEach(async (item) => {
        const productRef = doc(db, 'products', item.id);
        const currentStock = item.stock !== undefined ? item.stock : 50;
        const newStock = Math.max(0, currentStock - item.quantity);
        await setDoc(productRef, { stock: newStock }, { merge: true }).catch(()=>{});
      });

      if (user) {
        const purchasedIds = cart.map(item => item.id);
        await setDoc(doc(db, 'users', user.uid), { 
          purchaseHistory: arrayUnion(...purchasedIds) 
        }, { merge: true }).catch(()=>{});
      }

      setTimeout(() => {
        setIsCheckingPayment(false);
        setSuccessOrderInfo(currentOrderId); // Gọi Popup thành công thay cho alert
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
    const tagsArray = newProd.tags ? newProd.tags.split(',').map(t => t.trim().replace('#','')) : [];
const product = { id: newId, name: newProd.name, price: parseFloat(newProd.price), rating: 5.0, reviews: 0, category: newProd.category, imageUrl: newProd.imagePreview, description: newProd.desc || 'Sản phẩm chính hãng.', tags: tagsArray };
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
  
  if (selectedTag) {
    displayedProducts = displayedProducts.filter(p => p.tags && p.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase())));
  }
  if (sortOrder === 'asc') {
    displayedProducts.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortOrder === 'desc') {
    displayedProducts.sort((a, b) => Number(b.price) - Number(a.price));
  }
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-brush { font-family: 'Playfair Display', serif; font-style: italic; font-weight: 800; }
        html, body, #root { overflow: visible !important; overflow-y: auto !important; height: auto !important; min-height: 100vh !important; }
        
        .grecaptcha-badge { visibility: hidden !important; }
        a, button, label, .cursor-pointer, [role="button"] { cursor: pointer !important; }

        body.dark-mode { background-color: #111111 !important; color: #f8fafc !important; }
        .dark-mode .bg-\[\#f8fafc\] { background-color: #111111 !important; }
        .dark-mode .bg-white, .dark-mode .bg-slate-50, .dark-mode .bg-slate-100 { background-color: #1e293b !important; border-color: #334155 !important; }
        .dark-mode .border-slate-100, .dark-mode .border-slate-200, .dark-mode .border-blue-100 { border-color: #334155 !important; }
        .dark-mode .text-slate-900, .dark-mode .text-slate-800 { color: #ffffff !important; }
        .dark-mode .text-slate-700, .dark-mode .text-slate-600, .dark-mode .text-slate-500 { color: #cbd5e1 !important; }
        .dark-mode input, .dark-mode select, .dark-mode textarea { background-color: #0f172a !important; color: #ffffff !important; border-color: #334155 !important; }
        .dark-mode button.bg-slate-900 { background-color: #38bdf8 !important; color: #0f172a !important; }

        /* 1. CSS CHO HIỆU ỨNG VÒNG TRÒN DARK/LIGHT MODE */
        ::view-transition-old(root),
        ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
        ::view-transition-old(root) { z-index: 1; }
        ::view-transition-new(root) { z-index: 999999; }

        /* =========================================================
           3. CSS CHO HIỆU ỨNG CHUYỂN TRANG MỚI (TỔNG HỢP)
           ========================================================= */
        main { position: relative; overflow: hidden; width: 100vw; }

        /* --- LOẠI 1: KÉO TRANG (HOME -> SHOP) - Phong cách Hoạt hình --- */
        
        /* Nhịp điệu hoạt hình (có độ nảy) */
        .cartoon-ease { transition-timing-function: cubic-bezier(0.68, -0.6, 0.27, 1.55) !important; }

        /* Nút Mua Ngay chạy mất dép (Hoạt hình) */
        .btn-run-away {
            transform: translateX(120vw) rotate(15deg) !important;
            transition: transform 0.6s cubic-bezier(0.68, -0.6, 0.27, 1.55) !important;
        }

        /* Trạng thái 1: Chuẩn bị kéo - Shop đứng sẵn ở bên phải màn hình */
        .anim-home-to-shop-prepare #other-pages-content { transform: translateX(100%); transition: none; }
        
        /* Trạng thái 2: Chạy - Nút "Mua ngay" bay sang phải */
        .anim-home-to-shop-run .hero-buy-button { transform: translateX(100vw); transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1); }
        
        /* Trạng thái 2: Chạy - Trang chủ bị kéo sang trái */
        .anim-home-to-shop-run #home-page-content { transform: translateX(-100%); transition: transform 0.7s cubic-bezier(0.68, -0.6, 0.27, 1.55); }
        
        /* Trạng thái 2: Chạy - Trang Shop được kéo vào giữa */
        .anim-home-to-shop-run #other-pages-content { transform: translateX(0); transition: transform 0.7s cubic-bezier(0.68, -0.6, 0.27, 1.55); transition-delay: 0.1s; }

        /* --- LOẠI 2: GIỌT NƯỚC LAN TỎA (SHOP -> HOME) - Giống đổi mode --- */
        
        /* ============================================================ */
/* STYLE CHUYỂN TRANG DẠNG CHỚP (LIKE LIGHT/DARK MODE)       */
/* ============================================================ */
.page-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: white; /* Màu nền lúc chuyển, có thể đổi tùy ý */
  z-index: 9999; /* Luôn trên cùng */
  
  /* Bắt đầu: Ẩn đi hoàn toàn */
  opacity: 0;
  visibility: hidden;
  
  /* Hiệu ứng mượt mà */
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
}

/* Khi đang tải trang */
.page-transition-overlay.active {
  opacity: 1;
  visibility: visible;
}
        }
      `}</style>

      <div className={`min-h-screen w-full font-sans flex flex-col relative transition-colors duration-300 ${isDarkMode ? 'dark-mode text-white bg-[#111111]' : 'text-slate-900 bg-[#f8fafc]'}`}>
        
        {/* NÚT CUỘN CHỐNG MỎI TAY */}
        <div className="fixed bottom-[95px] right-4 md:bottom-28 md:right-8 z-[8500] flex flex-col gap-3">
          {showScrollTop && (
            <button onClick={scrollToTop} className="bg-slate-900/50 backdrop-blur-md border border-white/10 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-sky-500 hover:scale-110 transition-all">
               <FiArrowUp className="text-2xl"/>
            </button>
          )}
        </div>
        {/* BONG BÓNG CHAT VÀ CỘNG ĐỒNG */}
        <div className="fixed bottom-[85px] right-4 md:bottom-8 md:right-8 z-[9000] flex flex-col items-end">
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

          {isChatBoxOpen && activeChatTarget && (
            <div className="bg-white w-[340px] h-[480px] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] mb-4 overflow-hidden border border-slate-200 animate-fade-in-up origin-bottom-right flex flex-col">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center rounded-t-2xl shadow-md z-10">
                <button onClick={() => { setIsChatBoxOpen(false); setIsHelpOpen(true); setActiveChatTarget(null); setAdminChatUser(null); }} className="text-slate-300 hover:text-white flex items-center gap-2 font-bold text-sm">
                  <FiCornerUpLeft/> Quay lại
                </button>
                <div className="flex items-center gap-2">
                   {activeChatTarget !== 'admin' && <div className={`w-2 h-2 rounded-full ${activeChatTarget.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>}
                   <span className="text-sm font-bold truncate max-w-[120px]">{activeChatTarget === 'admin' ? t('chatWithUs') : activeChatTarget.nickname}</span>
                </div>
              </div>
              <div ref={chatContainerRef} className="flex-grow bg-slate-50 p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
                <div className="flex justify-center mb-2"><span className="text-xs text-slate-400 font-medium bg-white px-3 py-1 rounded-full border border-slate-100">Hôm nay</span></div>
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

          {/* NÚT BONG BÓNG CHAT (HIỆN LÊN KHI MỌI KHUNG CHAT ĐÃ ĐÓNG) */}
          {(!isChatBoxOpen && !isHelpOpen) && (
            <button onClick={() => setIsHelpOpen(true)} className="relative w-14 h-14 bg-slate-900/50 backdrop-blur-md border border-white/10 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-sky-500 hover:scale-105 transition-all">
               <FiMessageCircle className="text-2xl" />
               {/* CHẤM XANH BÁO ONLINE CHO KHÁCH HÀNG */}
               {!isAdmin && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white/50 rounded-full shadow-sm"></span>}
               {(!isAdmin && hasUnreadUser) && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white/50 animate-bounce">1</span>}
               {(isAdmin && totalAdminUnread > 0) && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white/50 animate-bounce">{totalAdminUnread}</span>}
            </button>
          )}
        </div>

        {/* HEADER CHÍNH (ĐÃ DỌN SẠCH CHỈ CÒN 1 Ô TÌM KIẾM Ở SHOP) */}
        // ✏️ Sửa thành:
        <header className={`fixed top-0 left-0 w-full z-[100] border-b flex-shrink-0 transition-all duration-500 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'} ${currentView === 'home' ? (isDarkMode ? 'bg-[#111111]/30 border-slate-800' : 'bg-white/30 border-slate-200') : (isDarkMode ? 'bg-[#111111] border-slate-800' : 'bg-white border-slate-200 shadow-sm')}`}>
           <div className={`max-w-[1400px] mx-auto px-4 md:px-8 transition-all duration-500 ${currentView === 'home' ? 'py-2' : 'pt-3 pb-0'}`}>
              <div className={`flex items-center justify-between gap-3 md:gap-4 transition-all duration-500 ${currentView === 'home' ? 'pb-0' : 'pb-2 md:pb-3'}`}>
                 
                 {/* LOGO */}
                 <div className="flex items-center flex-shrink-0">
                    <h1 className={`font-brush tracking-wide cursor-pointer transition-all duration-500 ${currentView === 'home' ? 'text-3xl md:text-4xl' : 'text-4xl md:text-[52px]'} ${isDarkMode ? 'text-white hover:text-sky-400' : 'text-slate-900 hover:text-sky-600'}`} onClick={() => navigateTo('home', 'all')} style={{ lineHeight: '1' }}>
                      Trimi
                    </h1>
                 </div>
                 
                 {/* THANH TÌM KIẾM (CHỈ HIỆN Ở SHOP - ĐÃ SỬA LỖI TRÙNG LẶP) */}
                 {currentView !== 'home' ? (
                   <div className="flex relative w-full max-w-[400px] flex-grow mx-2 md:mx-6 animate-fade-in">
                      <div className={`flex rounded-full w-full overflow-hidden border shadow-inner z-50 relative h-9 md:h-10 ${isDarkMode ? 'bg-white/10 border-slate-700 text-white focus-within:border-sky-500' : 'bg-slate-100 border-transparent focus-within:border-slate-300 focus-within:bg-white text-slate-800'}`}>
                         <input type="text" value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setCurrentView('shop');}} placeholder={t('search')} className="w-full px-4 text-xs md:text-sm outline-none bg-transparent placeholder-slate-400 font-medium"/>
                         <button className="px-3 md:px-4 text-slate-400 hover:text-sky-500 transition-colors"><FiSearch className="text-base md:text-lg"/></button>
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
                           )) : <div className="px-4 py-3 text-sm text-slate-500 text-center font-medium">Không tìm thấy sản phẩm</div>}
                        </div>
                      )}
                   </div>
                 ) : (
                   <div className="flex-grow"></div> /* Thẻ rỗng để đẩy Logo và Menu về 2 góc */
                 )}

                 {/* CÁC NÚT ICON BÊN PHẢI */}
                 <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 flex-shrink-0 relative z-[1001]">
                    <div className={`flex items-center gap-2 cursor-pointer transition-colors relative group p-1.5 md:p-2 ${isDarkMode ? 'text-white hover:text-sky-400' : 'text-slate-900 hover:text-sky-600'}`} onClick={() => setIsCartOpen(true)}>
                       <div id="header-cart-icon" className="relative transition-transform duration-300">
                         <FiShoppingCart className={`${currentView === 'home' ? 'text-xl' : 'text-2xl'}`}/>
                         {cartItemCount > 0 && (
                           <span className="absolute -top-1 -right-2 bg-sky-500 text-white w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full shadow-sm border border-white">
                             {cartItemCount}
                           </span>
                         )}
                       </div>
                    </div>
                    <button onClick={() => setIsUnifiedMenuOpen(true)} className={`hidden md:block p-1.5 md:p-2 transition-colors cursor-pointer relative z-[1100] ${isDarkMode ? 'text-white hover:text-sky-400' : 'text-slate-900 hover:text-sky-600'}`}>
                       <FiMenu className={`${currentView === 'home' ? 'text-2xl' : 'text-3xl'}`} />
                    </button>
                 </div>
              </div>

              {/* MENU ÁO QUẦN - ẨN ĐI KHI Ở TRANG CHỦ */}
              <div className={`overflow-hidden transition-all duration-500 ${currentView === 'home' ? 'max-h-0 opacity-0' : 'max-h-[50px] opacity-100'}`}>
                  <nav className="flex overflow-x-auto custom-scrollbar lg:justify-center gap-6 md:gap-2 text-[11px] md:text-[13px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-100 relative z-30 pb-2 md:pb-0 pt-2 md:pt-0 whitespace-nowrap">
                     <div className="relative group cursor-pointer flex-shrink-0">
                       <button onClick={() => navigateTo('shop', 'all')} className={`md:px-6 md:py-4 border-b-2 transition-colors ${currentView === 'shop' && currentCategory === 'all' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>{t('shop')}</button>
                     </div>
                     <div className="relative group cursor-pointer flex-shrink-0">
                       <button onClick={() => navigateTo('shop', 'shirt_all')} className={`md:px-6 md:py-4 border-b-2 transition-colors uppercase ${currentCategory.includes('shirt') ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>{t('nav_shirt')}</button>
                     </div>
                     <div className="relative group cursor-pointer flex-shrink-0">
                       <button onClick={() => navigateTo('shop', 'pants_all')} className={`md:px-6 md:py-4 border-b-2 transition-colors uppercase ${currentCategory.includes('pants') ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>{t('nav_pants')}</button>
                     </div>
                     <div className="relative group cursor-pointer flex-shrink-0">
                       <button onClick={() => navigateTo('shop', 'acc_all')} className={`md:px-6 md:py-4 border-b-2 transition-colors uppercase ${currentCategory.includes('acc') ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>{t('nav_acc')}</button>
                     </div>
                  </nav>
              </div>
           </div>
        </header>

        <main ref={mainRef} className={`flex-grow flex relative overflow-hidden transition-all duration-500 pb-[70px] md:pb-0 ${currentView === 'home' ? 'pt-0' : 'pt-[110px] md:pt-[130px]'}`}>
          {currentView === 'home' && (
            <div className="w-full animate-fade-in relative">
                
                {/* --- KHU VỰC 1: BANNER ĐƯỢC ĐÓNG ĐINH (FIXED) VÀO MÀN HÌNH --- */}
                {/* ĐÃ FIX CHUẨN: Kéo top-0 và h-screen để ảnh phủ kín nóc màn hình */}
                <div className="fixed top-0 left-0 right-0 h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 overflow-hidden z-0 pt-[50px] md:pt-[60px]">
                    
                    {/* ẢNH NỀN FULL */}
                    <div className="absolute inset-0 w-full h-full bg-[#0f172a]">
                        <img src="/banner_model_light.jpg" className={`absolute inset-0 w-full h-full object-cover object-right-top md:object-right transition-opacity duration-1000 ease-in-out ${isDarkMode ? 'opacity-0' : 'opacity-100'}`} alt="Trimi Light" />
                        <img src="/banner_model_dark.jpg" className={`absolute inset-0 w-full h-full object-cover object-right-top md:object-right transition-opacity duration-1000 ease-in-out ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} alt="Trimi Dark" />
                    </div>
                    
                    {/* LỚP PHỦ GRADIENT TỐI */}
                    <div className="absolute inset-0 bg-black/50 md:bg-gradient-to-r md:from-black/90 md:to-transparent"></div>

                    {/* NỘI DUNG CHỮ */}
                    <div className="relative z-10 w-full max-w-2xl mt-10 md:mt-0">
                       <h1 className="text-5xl md:text-7xl lg:text-8xl font-brush mb-6 leading-[0.9] text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
                          <span className="whitespace-nowrap">Dám Khác Biệt.</span><br/>
                          <span className="whitespace-nowrap">Dám Là Trimi.</span>
                       </h1>
                       <p className="mb-10 font-medium text-sm md:text-base leading-relaxed text-slate-200 drop-shadow-md max-w-lg">Chúng tôi tin rằng thời trang là ngôn ngữ không lời để thể hiện cá tính thực sự của bạn. Trải nghiệm sự khác biệt ngay hôm nay.</p>
                       <button id="btn-mua-ngay" onClick={() => navigateTo('shop', 'all')} className="bg-white text-slate-900 px-10 py-4 rounded-full font-black uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-3 w-fit text-sm cursor-pointer shadow-sky-500/20">
                          Mua ngay <FiShoppingCart className="text-xl"/>
                      </button>
                    </div>
                </div>

                {/* --- KHU VỰC 2: KHOẢNG TRỐNG TÀNG HÌNH ĐỂ TẠO THANH CUỘN --- */}
                {/* Đoạn này tạo ra 1 khoảng trống bằng đúng chiều cao màn hình để đẩy phần nội dung xuống dưới */}
                <div className="w-full h-screen bg-transparent pointer-events-none relative z-0"></div>

                {/* --- KHU VỰC 3: PHẦN NỘI DUNG TRƯỢT ĐÈ LÊN TRÊN (CÓ ĐỔ BÓNG ĐEN PHÍA TRÊN) --- */}
                <div className={`relative z-10 w-full flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.8)] ${isDarkMode ? 'bg-[#111111]' : 'bg-[#f8fafc]'}`}>
                    
                    {/* LOOKBOOK GRID (5 MỤC) */}
                    <div className="w-full h-auto md:h-[70vh] grid grid-cols-2 md:grid-cols-5 relative transition-all duration-300 bg-black">
                      {lookbook.map((block) => (
                        <div key={block.id} className="w-full h-[30vh] md:h-full relative group cursor-pointer overflow-hidden border-r border-b border-white/10" onClick={() => navigateTo('shop', block.targetCategory || 'all')}>
                          <img src={block.img} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out opacity-80 group-hover:opacity-100 group-hover:scale-110" alt={block.title} />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500"></div>
                          <div className="absolute inset-0 flex items-center justify-center md:items-end md:justify-start md:bottom-10 md:left-6 lg:left-8 z-10 pointer-events-none p-4">
                            <h3 className="text-white text-center md:text-left text-base md:text-xl lg:text-2xl font-black uppercase tracking-widest transform md:translate-y-6 opacity-100 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 drop-shadow-md">
                              {block.title.split(' ').map((word, i) => <span key={i} className="block">{word}</span>)}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* SLOGAN (ĐÃ ĐỔI FONT VIẾT TAY TRÊN NỀN SKY-500 NHƯ ÁO) */}
                    <div className={`w-full py-16 md:py-24 px-6 text-center border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} transition-colors duration-300`}>
                      <h2 className="text-6xl md:text-8xl font-brush mb-6 text-sky-500 normal-case tracking-normal drop-shadow-sm">{t('sloganTitle')}</h2>
                      <p className={`max-w-xl mx-auto mb-10 font-medium text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('sloganDesc')}</p>
                    </div>

                </div>
            </div>
          )}
          
          {currentView === 'shop' && (
            <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-8 md:py-10 animate-fade-in">
              {currentCategory === 'all' && (
                <div className="w-full h-[180px] md:h-[250px] rounded-[32px] overflow-hidden mb-8 shadow-sm border border-slate-100 relative group cursor-pointer" onClick={() => navigateTo('shop', 'all')}>
                   {/* LƯU Ý: TẠO 1 TẤM ẢNH TÊN LÀ shop_banner.jpg BỎ VÀO THƯ MỤC public CỦA BẠN NHÉ */}
                   <img src="/shop_banner.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Shop Banner" />
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                </div>
              )}

              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-sky-500 rounded-full"></div>
                    <h2 className={`text-2xl font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {currentCategory.includes('_all') ? t(currentCategory) : (currentCategory === 'all' ? t('all_products') : t(currentCategory))}
                    </h2>
                    {selectedTag && (
                      <button onClick={() => setSelectedTag(null)} className="ml-4 bg-sky-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-red-500 transition-colors">
                         #{translateTag(selectedTag)} <FiX/>
                      </button>
                    )}
                 </div>
                 
                 {/* BỘ LỌC SẮP XẾP GIÁ */}
                 <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500">{t('sort_label')}</span>
                    <select 
                       value={sortOrder} 
                       onChange={(e) => setSortOrder(e.target.value)} 
                       className={`border rounded-full px-5 py-2.5 outline-none focus:border-sky-500 text-sm font-bold cursor-pointer transition-colors appearance-none pr-10 relative ${isDarkMode ? 'bg-[#111111] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                    >
                       <option value="default">{t('sort_default')}</option>
                       <option value="asc">{t('sort_low_high')}</option>
                       <option value="desc">{t('sort_high_low')}</option>
                    </select>
                 </div>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 px-1 md:px-0">
                  {displayedProducts.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 group">
                      <div className="bg-slate-100 rounded-[32px] border border-slate-200 relative aspect-[4/5] flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-sky-400 hover:-translate-y-2 hover:scale-[1.02] hover:rotate-1 overflow-hidden" onClick={() => navigateTo('productDetail', currentCategory, item)}>
                         <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                         <button onClick={(e) => handleAddToCart(item, e)} className="absolute bottom-3 right-3 md:bottom-5 md:right-5 w-9 h-9 md:w-12 md:h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-110 hover:bg-sky-500 transition-all shadow-lg shadow-slate-900/30">
                           <FiPlus className="text-lg md:text-2xl"/>
                         </button>
                      </div>
                      <div className="px-2">
                        {/* HIỂN THỊ TAGS */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 mb-1 mt-2 flex-wrap">
                            {item.tags.map((t, idx) => (
                              <span key={idx} onClick={(e) => { e.stopPropagation(); setSelectedTag(t); }} className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md hover:bg-sky-100 hover:text-sky-600 transition-colors cursor-pointer border border-slate-300 shadow-sm font-bold">#{translateTag(t)}</span>
                            ))}
                          </div>
                        )}
                        <h3 className={`font-bold text-xs md:text-sm line-clamp-1 mb-1 cursor-pointer transition-colors hover:text-sky-500 mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} onClick={() => navigateTo('productDetail', currentCategory, item)}>{t_prod(item.id, 'name', item.name)}</h3>
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

          {currentView === 'productDetail' && selectedProduct && (
            <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-2 md:py-4 animate-fade-in flex items-center justify-center min-h-[calc(100vh-120px)]">
              
              // ✏️ Sửa thành:
              <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
                
                {/* ẢNH SẢN PHẨM (ĐÃ THÊM TÍNH NĂNG ZOOM KÍNH LÚP) */}
                <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col gap-3 flex-shrink-0">
                  <div 
                    className="w-full h-[300px] md:h-[350px] lg:h-[450px] bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[32px] flex items-center justify-center relative overflow-hidden cursor-crosshair group shadow-inner"
                    onMouseMove={(e) => {
                      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - left) / width) * 100;
                      const y = ((e.clientY - top) / height) * 100;
                      e.currentTarget.querySelector('img').style.transformOrigin = `${x}% ${y}%`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.querySelector('img').style.transformOrigin = `center center`;
                    }}
                  >
                     <img 
                        id="detail-main-image" 
                        src={(selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images[activeImgIdx] : selectedProduct.imageUrl} 
                        className="w-full h-full object-cover transition-transform duration-[0.4s] ease-out group-hover:scale-[2.5]" 
                        alt={selectedProduct.name}
                     />
                  </div>
                  
                  {/* Băng chuyền các ảnh nhỏ */}
                  {(selectedProduct.images && selectedProduct.images.length > 1) && (
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar py-1">
                      {selectedProduct.images.map((img, idx) => (
                        <div key={idx} onClick={() => setActiveImageIdx(idx)} className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${activeImgIdx === idx ? 'border-sky-500 shadow-md' : 'border-transparent hover:border-slate-300'}`}>
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div> {/* <-- CHÍNH LÀ CÁI THẺ DIV ĐÓNG NÀY ĐÃ BỊ XÓA NHẦM LÀM LỖI WEB ĐÓ! */}

                {/* THÔNG TIN SẢN PHẨM */}
                <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col justify-center relative">
                  {isAdmin && (
                    <button onClick={() => { setEditFormData({ ...selectedProduct, images: selectedProduct.images || [selectedProduct.imageUrl] }); setShowEditModal(true); }} className="absolute top-0 right-0 bg-white border border-slate-200 text-slate-800 p-2.5 rounded-full hover:text-sky-600 hover:border-sky-300 shadow-sm transition-all cursor-pointer z-10" title="Chỉnh sửa sản phẩm">
                      <FiEdit3 className="text-lg" />
                    </button>
                  )}
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-tight pr-10">{t_prod(selectedProduct.id, 'name', selectedProduct.name)}</h1>
                  <div className="flex items-center text-xs gap-3 mb-4">
                    <span className="text-amber-400 font-bold flex items-center gap-1 text-sm"><FiStar className="fill-current"/> {selectedProduct.rating}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 font-medium underline underline-offset-4">{selectedProduct.reviews} Đánh giá</span>
                  </div>
                  <div className="text-3xl font-black text-sky-600 mb-6">{(Number(selectedProduct.price) || 0).toLocaleString('vi-VN')}đ</div>

                  <div className="flex gap-3 mb-6 w-full">
                    <button onClick={(e) => handleAddToCart(selectedProduct, e)} className="flex-1 md:flex-none md:px-6 bg-sky-50 text-sky-600 border border-sky-200 py-3 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-sky-100 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                      <FiShoppingCart className="text-lg"/> Thêm
                    </button>
                    <button onClick={(e) => { handleAddToCart(selectedProduct, e); setIsCartOpen(true); }} className="flex-[2] bg-slate-900 text-white py-3 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-black transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 cursor-pointer">
                      <FiCheckCircle className="text-lg"/> Mua Ngay
                    </button>
                  </div>

                  <div className="space-y-2 text-xs font-medium text-slate-700 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2"><FiTruck className="text-lg text-sky-500"/> {t('ship')}</div>
                    <div className="flex items-center gap-2"><FiShield className="text-lg text-emerald-500"/> {t('return')}</div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">{t('desc')}</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line line-clamp-3 hover:line-clamp-none transition-all">{t_prod(selectedProduct.id, 'desc', selectedProduct.description)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  <div className="flex justify-end pt-6 pb-2 gap-3 relative z-20 flex-wrap">
                    <button onClick={handleLogout} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2 border border-slate-200">
                      <FiLogOut/> {t('logout')}
                    </button>
                    {isAdmin && (
                      <>
                        <button onClick={() => { setSurveyStep(1); setShowSurveyModal(true); }} className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-md">
                          <FiMonitor/> Test Khảo sát
                        </button>
                        <button onClick={() => navigateTo('admin')} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-md">
                          <FiSettings/> {t('adminMenu')}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0 relative z-20">
                    {!isEditingName ? (
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                        {nickname}
                        <button onClick={() => {setTempName(nickname); setIsEditingName(true)}} className="text-sm text-slate-400 hover:text-sky-500 transition-colors p-1.5 bg-slate-50 rounded-full border border-slate-100" title="Đổi biệt danh"><FiEdit3/></button>
                        <button onClick={() => {
                           setTempSettings({
                              nickname: nickname,
                              phone: phone,
                              address: address,
                              district: district,
                              theme: isDarkMode ? 'dark' : 'light',
                              lang: lang
                           });
                           setIsSettingsDrawerOpen(true);
                        }} className="text-sm text-slate-400 hover:text-sky-500 transition-colors p-1.5 bg-slate-50 rounded-full border border-slate-100 ml-1" title="Cài đặt Profile, Giao diện & Ngôn ngữ"><FiSettings/></button>
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
                  <div className={`flex gap-8 border-b pt-6 overflow-x-auto custom-scrollbar relative z-20 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                     {['Đơn hàng của tôi'].map((tab, idx) => (
                       <button key={idx} className={`pb-3 whitespace-nowrap font-bold text-sm tracking-wide transition-colors ${isDarkMode ? 'text-white border-b-2 border-white' : 'text-slate-900 border-b-2 border-slate-900'}`}>{tab}</button>
                     ))}
                  </div>
                </div>
              </div>
              
              {myOrders.length === 0 ? (
                <div className={`rounded-[40px] p-8 border shadow-sm text-center py-24 ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200'}`}>
                  <FiArchive className={`text-6xl mx-auto mb-6 ${isDarkMode ? 'text-slate-600' : 'text-slate-200'}`}/>
                  <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{t('noOrders')}</h3>
                  <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{t('noOrdersDesc')}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {myOrders.map(order => (
                    <div key={order.id} className={`p-6 rounded-[32px] border shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
                      <div>
                        <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mã đơn: {order.orderId}</h4>
                        <p className={`text-sm mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                        <div className="space-y-1">
                          {order.items.map((it, idx) => <p key={idx} className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>- {it.name} <span className="text-sky-500 font-bold ml-1">x{it.quantity}</span></p>)}
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0">
                        <span className="text-xl font-black text-sky-500">{order.paidAmount.toLocaleString('vi-VN')}đ <span className="text-xs text-slate-500 font-medium">({order.paymentMode === 'full' ? '100%' : 'Cọc 30%'})</span></span>
                        <span className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm ${
                          order.status.includes('Hoàn thành') ? 'bg-emerald-500 text-white' : 
                          order.status.includes('hủy') || order.status.includes('từ chối') ? 'bg-red-500 text-white' : 'bg-amber-400 text-amber-950'
                        }`}>{order.status}</span>
                        {/* NÚT HỦY ĐƠN */}
                        {order.status === 'Chờ xác nhận thanh toán' && (
                          <button onClick={async () => {
                            if(window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) {
                              await setDoc(doc(db, 'orders', order.id), { status: 'Khách hàng tự hủy đơn' }, { merge: true });
                              showToast('Đã hủy đơn thành công! Đơn sẽ bị xóa sau 5 giây.');
                              setTimeout(() => { deleteDoc(doc(db, 'orders', order.id)); }, 5000);
                            }
                          }} className="text-xs font-bold text-red-500 hover:underline cursor-pointer mt-1">Hủy đơn hàng</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === 'admin' && isAdmin && (
            <div className="max-w-[1400px] mx-auto w-full px-4 py-8 md:py-12 animate-fade-in flex flex-col gap-8">
              <div>
                <div className="text-xs font-bold text-slate-400 mb-6 tracking-wider uppercase flex items-center gap-2">
                  <button onClick={() => navigateTo('profile')} className="hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"><FiCornerUpLeft/> {t('account')}</button>
                  <span>/</span><span className="text-slate-800 truncate">{t('adminDashboard')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                   <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3 justify-start"><FiArchive className="text-sky-500"/> {t('adminDashboard')}</h2>
                   
                   <div className="flex justify-center">
                     <div className="bg-slate-100 p-1.5 rounded-full flex gap-1 w-fit">
                        <button onClick={() => setAdminTab('products')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${adminTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Kho Hàng</button>
                        <button onClick={() => setAdminTab('orders')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${adminTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                           Đơn Đặt Hàng 
                           {adminOrders.length > 0 && <span className="bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{adminOrders.length}</span>}
                        </button>
                        <button onClick={() => setAdminTab('feedback')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${adminTab === 'feedback' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Phản Hồi & Hủy</button>
                     </div>
                   </div>

                   <div className="flex justify-end">
                     {adminTab === 'products' && (
                       <button onClick={() => setShowAddModal(true)} className="bg-sky-500 text-white px-6 py-3.5 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-sky-600 transition-colors">
                         <FiPlus className="text-xl"/> Thêm Sản Phẩm
                       </button>
                     )}
                   </div>
                </div>
              </div>
              
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  {adminTab === 'products' && (
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
                              <button onClick={() => handleDeleteProduct(item.id)} className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-full transition-colors font-bold text-xs flex items-center justify-center gap-2 ml-auto cursor-pointer"><FiTrash2 className="text-sm"/> {t('adminDel')}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {adminTab === 'orders' && (
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-black border-b border-slate-200">
                          <th className="p-5 pl-8">Mã Đơn / Thời gian</th>
                          <th className="p-5">Khách hàng</th>
                          <th className="p-5">Sản phẩm</th>
                          <th className="p-5">Thanh toán</th>
                          <th className="p-5 text-center">Ảnh Bill</th>
                          <th className="p-5 text-right pr-8">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminOrders.length === 0 ? (
                           <tr><td colSpan="6" className="p-10 text-center text-slate-400 font-medium">Chưa có đơn hàng nào.</td></tr>
                        ) : (
                          adminOrders.map((order) => {
                            const customerUser = usersList.find(u => u.uid === order.uid);
                            return (
                            <tr key={order.id} className={`border-b transition-colors ${isDarkMode ? 'border-slate-700/50 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                              <td className="p-5 pl-8">
                                <span className={`font-black block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.orderId}</span>
                                <span className={`text-xs font-medium mt-1 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                              </td>
                              <td className="p-5 text-sm">
                                <span className={`font-bold block ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.customerName}</span>
                                <span className={`block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{order.customerPhone}</span>
                                <span className={`text-xs mt-1 block max-w-[200px] line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{order.customerAddress}</span>
                                {customerUser && (
                                  <button onClick={() => openAdminChatWithUser(customerUser)} className="mt-3 text-xs font-bold bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 w-fit cursor-pointer border border-sky-500/20">
                                    <FiMessageCircle/> Nhắn tin
                                  </button>
                                )}
                              </td>
                              <td className="p-5 text-sm">
                                <div className="space-y-1 max-w-[250px]">
                                  {order.items.map((it, idx) => (
                                    <div key={idx} className={`font-medium truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>- {it.name} <b className="text-sky-500">x{it.quantity}</b></div>
                                  ))}
                                </div>
                              </td>
                              <td className="p-5">
                                <span className="font-black text-sky-500 block text-base">{order.paidAmount.toLocaleString('vi-VN')}đ</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-1 ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{order.paymentMode === 'full' ? 'Đã CK 100%' : 'Đã Cọc 30%'}</span>
                              </td>
                              <td className="p-5 text-center">
                                {order.receiptImage ? (
                                  <div onClick={() => setPreviewImg(order.receiptImage)} className="inline-block relative group">
                                    <img src={order.receiptImage} className={`w-16 h-16 object-cover rounded-xl border shadow-sm transition-transform cursor-pointer group-hover:scale-105 ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`} alt="Bill"/>
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><FiSearch className="text-white text-xl"/></div>
                                  </div>
                                ) : <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Không có</span>}
                              </td>
                              <td className="p-5 text-right pr-8">
                                 <select 
                                    value={order.status}
                                    onChange={async (e) => {
                                      await setDoc(doc(db, 'orders', order.id), { status: e.target.value }, { merge: true });
                                      showToast('Đã cập nhật trạng thái đơn!');
                                    }}
                                    className={`border text-sm font-bold rounded-xl px-4 py-2 outline-none cursor-pointer transition-colors focus:border-sky-500 mb-2 w-full ${isDarkMode ? 'bg-[#111111] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                                 >
                                    <option value="Chờ xác nhận thanh toán">Chờ duyệt Bill</option>
                                    <option value="Đang chuẩn bị hàng">Đang chuẩn bị hàng</option>
                                    <option value="Đang giao hàng">Đang giao hàng</option>
                                    <option value="Hoàn thành">Hoàn thành</option>
                                    <option value="Khách hàng tự hủy đơn">Khách tự hủy</option>
                                    <option value="Đơn không đạt yêu cầu">Không đạt (Bill lỗi)</option>
                                 </select>
                                 <div className="flex flex-wrap justify-end gap-1.5 mt-2">
                                   <button onClick={async () => { await setDoc(doc(db, 'orders', order.id), { status: 'Hoàn thành' }, { merge: true }); showToast('Đã đánh dấu Hoàn Thành'); }} className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer">Thành công</button>
                                   <button onClick={async () => { await setDoc(doc(db, 'orders', order.id), { status: 'Đơn không đạt yêu cầu' }, { merge: true }); showToast('Đã Từ chối'); }} className="bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-500 hover:text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer">Từ chối</button>
                                   
                                   <button onClick={async () => { 
                                     if(window.confirm('Xóa vĩnh viễn đơn hàng này khỏi hệ thống?')) {
                                       await deleteDoc(doc(db, 'orders', order.id));
                                       showToast('Đã xóa đơn hàng!');
                                     }
                                   }} className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer w-full mt-1 flex justify-center items-center gap-1"><FiTrash2/> Xóa Đơn</button>
                                 </div>
                              </td>
                            </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  )}
                  {adminTab === 'feedback' && (
                    <div className="p-6 md:p-8 flex flex-col gap-8 text-slate-800">
                      {/* DANH SÁCH LÝ DO HỦY ĐƠN */}
                      <div>
                        <h3 className="text-xl font-black mb-4 flex items-center gap-2"><FiArchive className="text-red-500"/> Các đơn bị khách hủy</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {adminOrders.filter(o => o.cancelReason).length === 0 ? <p className="text-slate-500 text-sm">Chưa có đơn hàng nào bị hủy.</p> : 
                            adminOrders.filter(o => o.cancelReason).map(o => (
                              <div key={o.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-bold text-slate-900">{o.orderId}</span>
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold">{o.cancelReason}</span>
                                </div>
                                <p className="text-sm font-medium">Khách: {o.customerName} - {o.customerPhone}</p>
                                <div className="mt-3 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 italic">
                                  "{o.cancelComment || 'Không để lại lời nhắn.'}"
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                      
                      <hr className="border-slate-200"/>

                      {/* DANH SÁCH KHẢO SÁT USER */}
                      <div>
                        <h3 className="text-xl font-black mb-4 flex items-center gap-2"><FiUsers className="text-sky-500"/> Dữ liệu Khảo sát Khách hàng</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {usersList.filter(u => u.isSurveyCompleted).length === 0 ? <p className="text-slate-500 text-sm">Chưa có ai làm khảo sát.</p> : 
                            usersList.filter(u => u.isSurveyCompleted).map(u => (
                              <div key={u.uid} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                                <p className="font-bold text-base flex items-center gap-2">{u.avatar ? <img src={u.avatar} className="w-6 h-6 rounded-full"/> : <FiUser/>} {u.nickname || u.email?.split('@')[0]}</p>
                                <p className="text-sm"><span className="text-slate-500 text-xs uppercase block">Nghề nghiệp</span> <span className="font-medium">{u.role}</span></p>
                                <p className="text-sm"><span className="text-slate-500 text-xs uppercase block">Nguồn biết đến</span> <span className="font-medium bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-xs">{u.discoverySource}</span></p>
                                <p className="text-sm"><span className="text-slate-500 text-xs uppercase block">Sở thích Mua sắm</span> <span className="font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">{u.interests}</span></p>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
        {/* --- BOTTOM NAVIGATION BAR (CHỈ HIỆN TRÊN MOBILE) --- */}
        <nav className={`md:hidden fixed bottom-0 left-0 w-full z-[9999] border-t px-2 pb-safe flex justify-around items-center h-[65px] transition-colors duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] ${isDarkMode ? 'bg-[#181512] border-slate-800' : 'bg-white border-slate-200'}`}>
            <button onClick={() => navigateTo('home', 'all')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentView === 'home' ? 'text-sky-500' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill={currentView === 'home' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span className="text-[10px] font-bold">Trang chủ</span>
            </button>
            <button onClick={() => navigateTo('shop', 'all')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentView === 'shop' ? 'text-sky-500' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                <FiShoppingCart className="text-2xl" fill={currentView === 'shop' ? "currentColor" : "none"} />
                <span className="text-[10px] font-bold">Cửa hàng</span>
            </button>
            <button onClick={() => requireLogin(() => navigateTo('profile'))} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentView === 'profile' ? 'text-sky-500' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                <FiUser className="text-2xl" fill={currentView === 'profile' ? "currentColor" : "none"} />
                <span className="text-[10px] font-bold">Tài khoản</span>
            </button>
            <button onClick={() => setIsUnifiedMenuOpen(true)} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <FiMenu className="text-2xl" />
                <span className="text-[10px] font-bold">Menu</span>
            </button>
        </nav>
        <footer className="bg-[#111111] text-white pt-16 pb-8 mt-auto border-t border-slate-800 flex-shrink-0 z-30 relative transition-colors duration-300">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
              <div className="lg:col-span-1">
                <h2 className="text-[65px] font-brush mb-2 leading-[0.8] tracking-wider">Trimi</h2>
                <div className="flex gap-4 text-slate-400 mt-6">
                   <div onClick={() => showToast('Đang chuyển đến Instagram!')} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FiInstagram className="text-lg"/></div>
                   <a href="https://www.facebook.com/profile.php?id=61578555688928" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FaFacebook className="text-lg"/></a>
                   <div onClick={() => showToast('Đang chuyển đến LinkedIn!')} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FiLinkedin className="text-lg"/></div>
                   <div onClick={() => showToast('Đang chuyển đến YouTube!')} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FiYoutube className="text-lg"/></div>
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
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => requireLogin(() => navigateTo('profile'))}>{t('f_track')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => setShowTermsModal(true)}>{t('f_ret')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => setShowTermsModal(true)}>{t('f_ship')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => showToast('Tính năng Bảng Size đang được cập nhật!')}>{t('f_size')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6">{t('f_about')}</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => setShowStoryModal(true)}>{t('f_story')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => setShowCareerModal(true)}>{t('f_career')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors" onClick={() => setShowContactModal(true)}>{t('f_contact')}</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center border-t border-slate-800 pt-8 text-xs text-slate-500 font-medium">
              <p>© Copyright Trimi 2026. All rights reserved.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <span onClick={() => setShowPrivacyModal(true)} className="hover:text-white cursor-pointer transition-colors font-bold">{t('f_priv')}</span>
                <span>·</span>
                <span onClick={() => setShowTermsModal(true)} className="hover:text-white cursor-pointer transition-colors font-bold">{t('f_term')}</span>
              </div>
            </div>
          </div>
        </footer>

        {/* MODAL GIỎ HÀNG (GỌN NHẸ - KHÔNG CHẶN TƯƠNG TÁC NỀN) */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[99999] flex justify-end pointer-events-none">
            {/* Đã xóa lớp nền chặn chuột để user có thể bấm nút mua ở background */}
            
            {/* Khung giỏ hàng: Kích hoạt lại pointer-events-auto để bấm được vào giỏ hàng */}
            <div className={`relative w-full max-w-[360px] h-full flex flex-col shadow-2xl animate-fade-in-right backdrop-blur-xl border-l pointer-events-auto ${isDarkMode ? 'bg-[#181512]/60 border-white/10 text-white' : 'bg-[#f7f3ed]/70 border-black/10 text-slate-900'}`}>
              
              <div className={`flex justify-between items-center p-4 md:p-5 border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
                <h2 className="text-xl font-black flex items-center gap-2"><FiShoppingCart className="text-sky-500"/> Giỏ hàng ({cartItemCount})</h2>
                <button onClick={() => setIsCartOpen(false)} className={`p-2 rounded-full transition-colors cursor-pointer ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-black/5 hover:bg-black/10 text-slate-500'}`}><FiX className="text-xl"/></button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center mt-20 flex flex-col items-center">
                    <div className={`w-20 h-20 shadow-sm rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-white/50'}`}><FiShoppingCart className={`text-4xl ${isDarkMode ? 'text-slate-500' : 'text-slate-300'}`}/></div>
                    <p className={`font-medium mb-6 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('emptyCart')}</p>
                    <button onClick={() => {setIsCartOpen(false); navigateTo('shop', 'all')}} className="px-6 py-3 bg-sky-500 text-white text-xs font-bold tracking-widest uppercase rounded-full shadow-lg hover:bg-sky-600 transition-all cursor-pointer">{t('startShop')}</button>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className={`flex gap-3 p-3 rounded-2xl border relative pr-10 group transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white/40 border-black/5 hover:border-black/10 shadow-sm'}`}>
                      <div className={`w-16 h-16 rounded-xl p-1 flex-shrink-0 border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white/50 border-black/5'}`}>
                        <img src={item.imageUrl} className="w-full h-full object-cover rounded-lg" alt=""/>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-xs font-bold line-clamp-2 leading-snug">{t_prod(item.id, 'name', item.name)}</h4>
                        <p className="font-black text-sm mt-0.5 text-sky-500">{(Number(item.price) || 0).toLocaleString('vi-VN')}đ</p>
                        <div className={`flex items-center border rounded-lg w-fit mt-2 overflow-hidden ${isDarkMode ? 'border-white/20 bg-black/20' : 'border-black/10 bg-white/50'}`}>
                          <button onClick={() => updateCartQuantity(item.id, -1)} className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>-</button>
                          <span className={`px-3 text-xs font-black py-1 border-x ${isDarkMode ? 'border-white/20 bg-white/5' : 'border-black/10 bg-white'}`}>{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, 1)} className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className={`absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-colors cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`} title="Xóa">
                        <FiTrash2 className="text-base"/>
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {cart.length > 0 && (
                <div className={`p-5 border-t ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-black/10 bg-white/30'}`}>
                  <div className={`flex gap-2 mb-4 p-1.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white/50 border-black/5'}`}>
                    <button onClick={() => setPaymentMode('deposit')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${paymentMode === 'deposit' ? (isDarkMode ? 'bg-white/20 text-white shadow-sm' : 'bg-white shadow-sm text-slate-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>{t('deposit_30')}</button>
                    <button onClick={() => setPaymentMode('full')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${paymentMode === 'full' ? (isDarkMode ? 'bg-white/20 text-white shadow-sm' : 'bg-white shadow-sm text-slate-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>{t('pay_full')}</button>
                  </div>
                  <div className="flex justify-between items-end mb-4">
                    <span className={`font-bold uppercase tracking-widest text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{paymentMode === 'deposit' ? t('deposit') : t('total')}</span>
                    <span className="text-2xl font-black text-sky-500">{paymentMode === 'deposit' ? depositAmount.toLocaleString('vi-VN') : cartFinalTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <button onClick={handleProceedCheckout} className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase shadow-xl transition-all flex justify-center items-center gap-2 cursor-pointer">
                    <FiCheckCircle className="text-base"/> {t('checkout')}
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
                            <div key={idx} className="flex justify-between items-center text-sm font-medium group">
                                <span className="text-slate-600 line-clamp-1 pr-2 flex-1">{t_prod(item.id, 'name', item.name)} <span className="text-sky-600 font-bold ml-1">x{item.quantity}</span></span>
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-900 font-bold whitespace-nowrap">{((Number(item.price) || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ</span>
                                  <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer" title="Xóa khỏi đơn">
                                      <FiTrash2 className="text-base" />
                                  </button>
                                </div>
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
                      Nội dung CK: <span style={{ color: '#000' }} className="font-black text-sm">{currentOrderId}</span>
                    </div>

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

        {/* UNIFIED SETTINGS DRAWER (CÀI ĐẶT HỢP NHẤT) */}
        {isSettingsDrawerOpen && isAuthenticated && user && (
           <div className="fixed inset-0 z-[100000] flex justify-end animate-fade-in">
              {/* Lớp nền mờ */}
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSettingsDrawerOpen(false)}></div>
              
              {/* Khung Drawer - Chứa Profile, Giao diện, Ngôn ngữ */}
              <div className={`relative w-full max-w-[400px] h-full flex flex-col shadow-2xl animate-fade-in-right backdrop-blur-xl border-l overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-[#181512]/90 border-white/10 text-white' : 'bg-[#f7f3ed]/95 border-black/10 text-slate-900'}`}>
                 
                 {/* Header Drawer */}
                 <div className={`flex justify-between items-center p-5 border-b ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white'}`}>
                    <h2 className="text-xl font-black flex items-center gap-2"><FiSettings className="text-sky-500"/> Cài đặt hợp nhất</h2>
                    <button onClick={() => setIsSettingsDrawerOpen(false)} className={`p-2 rounded-full transition-colors cursor-pointer ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-black/5 hover:bg-black/10 text-slate-500'}`}><FiX className="text-xl"/></button>
                 </div>

                 {/* NỘI DUNG CÀI ĐẶT (ĐÃ XÓA GIAO DIỆN & NGÔN NGỮ) */}
                 <div className="flex-grow p-6 flex flex-col gap-8">
                    
                    {/* KHỐI 1: THÔNG TIN CÁ NHÂN */}
                    <div>
                       <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><FiUser/> {t('account')}</p>
                       <div className="space-y-4">
                          <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Biệt danh hiển thị</label>
                             <input type="text" value={tempSettings.nickname || ''} onChange={e => setTempSettings({...tempSettings, nickname: e.target.value})} className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 text-sm font-bold ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-black/10 shadow-inner'}`}/>
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t('f_contact')}</label>
                             <input type="tel" value={tempSettings.phone || ''} onChange={e => setTempSettings({...tempSettings, phone: e.target.value})} placeholder="09xxxx..." className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 text-sm font-medium ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-black/10 shadow-inner'}`}/>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Số nhà, Tên đường</label>
                                 <input type="text" value={tempSettings.address || ''} onChange={e => setTempSettings({...tempSettings, address: e.target.value})} placeholder="123 ABC..." className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 text-sm font-medium ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-black/10 shadow-inner'}`}/>
                              </div>
                              <div>
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Khu vực (Đà Nẵng)</label>
                                 <select value={tempSettings.district || 'Hải Châu'} onChange={e => setTempSettings({...tempSettings, district: e.target.value})} className={`w-full border rounded-full px-4 py-3 outline-none focus:border-sky-500 text-sm font-medium cursor-pointer ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-white border-black/10 shadow-inner'}`}>
                                    {daNangDistricts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                 </select>
                              </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* FOOTER DRAWER: NÚT LƯU */}
                 <div className={`p-5 border-t mt-auto sticky bottom-0 ${isDarkMode ? 'border-white/10 bg-[#181512]/90' : 'border-black/10 bg-[#f7f3ed]/95'}`}>
                    <button onClick={async () => {
                        // Logic Lưu hợp nhất
                        if(!tempSettings.nickname?.trim()) return alert("Biệt danh không được để trống!");
                        const hasLetters = /[a-zA-ZÀ-ỹ]/.test(tempSettings.address);
                        if (!hasLetters && tempSettings.address) return alert("Địa chỉ không hợp lệ! Vui lòng nhập rõ Tên Đường/Phường/Xã.");

                        // 1. Cập nhật state UI
                        setNickname(tempSettings.nickname); setPhone(tempSettings.phone); setAddress(tempSettings.address); setDistrict(tempSettings.district);
                        handleThemeToggle(null, tempSettings.theme === 'dark'); 
                        setLang(tempSettings.lang);

                        // 2. Lưu lên Firestore
                        try { await setDoc(doc(db, "users", user.uid), tempSettings, { merge: true }); } catch(e) {}
                        
                        showToast('Đã lưu tất cả cài đặt!');
                        setIsSettingsDrawerOpen(false); // Đóng Drawer
                    }} className="w-full bg-sky-500 hover:bg-sky-600 text-white py-4 rounded-full font-black text-sm tracking-widest uppercase shadow-xl shadow-sky-500/30 transition-all flex justify-center items-center gap-2 cursor-pointer">
                       <FiSave className="text-xl"/> Lưu Thay Đổi
                    </button>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-sm font-bold text-slate-700 mb-3">Danh mục</label>
                       <select value={newProd.category} onChange={(e) => setNewProd({...newProd, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium">
                          <option value="shirt_1">{t('shirt_1')}</option> <option value="shirt_2">{t('shirt_2')}</option> <option value="shirt_3">{t('shirt_3')}</option>
                          <option value="pants_1">{t('pants_1')}</option> <option value="pants_2">{t('pants_2')}</option> <option value="pants_3">{t('pants_3')}</option>
                          <option value="acc_1">{t('acc_1')}</option> <option value="acc_2">{t('acc_2')}</option> <option value="acc_3">{t('acc_3')}</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-slate-700 mb-3">Tags (Cách nhau dấu phẩy)</label>
                       <input type="text" placeholder="nam, áo, streetwear" value={newProd.tags || ''} onChange={(e) => setNewProd({...newProd, tags: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"/>
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

        {/* MODAL SỬA SẢN PHẨM ADMIN TRỰC TIẾP */}
        {showEditModal && isAdmin && editFormData && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
            <div className="bg-white rounded-[40px] p-8 md:p-10 w-full max-w-2xl relative z-10 shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center mb-6 text-slate-900">
                 <h3 className="text-2xl font-black flex items-center gap-3"><FiEdit3 className="text-sky-500"/> Sửa Sản Phẩm</h3>
                 <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-2.5 rounded-full cursor-pointer"><FiX className="text-xl"/></button>
               </div>
               <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-5 text-slate-800">
                  <div>
                    <label className="block text-sm font-bold mb-2">Thư viện ảnh (Tối đa 10 ảnh)</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                       {editFormData.images && editFormData.images.map((img, idx) => (
                         <div key={idx} className="w-20 h-20 relative group rounded-xl overflow-hidden border border-slate-200">
                           <img src={img} className="w-full h-full object-cover" />
                           <button onClick={() => setEditFormData({...editFormData, images: editFormData.images.filter((_, i) => i !== idx)})} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><FiTrash2/></button>
                         </div>
                       ))}
                       {(!editFormData.images || editFormData.images.length < 10) && (
                         <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 hover:text-sky-500 hover:border-sky-300 transition-colors cursor-pointer bg-slate-50">
                           <FiPlus className="text-2xl"/>
                           <input type="file" multiple accept="image/*" onChange={(e) => {
                             const files = Array.from(e.target.files);
                             if ((editFormData.images?.length || 0) + files.length > 10) return alert("Tối đa 10 ảnh!");
                             files.forEach(file => compressImage(file, (base64) => setEditFormData(prev => ({...prev, images: [...(prev.images || []), base64]}))));
                           }} className="hidden"/>
                         </label>
                       )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500" placeholder="Tên sản phẩm"/>
                    <input type="number" value={editFormData.price} onChange={(e) => setEditFormData({...editFormData, price: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500" placeholder="Giá tiền"/>
                  </div>
                  <textarea value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500 resize-none" placeholder="Mô tả sản phẩm"></textarea>
               </div>
               <div className="pt-6 border-t border-slate-100 mt-4 flex justify-end gap-3">
                 <button onClick={() => setShowEditModal(false)} className="px-6 py-3 rounded-full font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 cursor-pointer">Hủy</button>
                 <button onClick={async () => {
                   const finalData = { ...editFormData, price: parseFloat(editFormData.price), imageUrl: editFormData.images?.[0] || editFormData.imageUrl };
                   await setDoc(doc(db, 'products', editFormData.id), finalData, { merge: true });
                   setLocalProducts(localProducts.map(p => p.id === editFormData.id ? finalData : p));
                   setSelectedProduct(finalData);
                   setShowEditModal(false);
                   showToast('Cập nhật thành công!');
                 }} className="px-8 py-3 rounded-full font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-lg cursor-pointer">Lưu</button>
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
                  <button onClick={(e) => handleGoogleLogin(e)} type="button" className="w-full bg-[#101828] text-white py-4 font-bold rounded-full flex items-center justify-center gap-3 cursor-pointer hover:bg-black transition-colors"><FcGoogle className="text-xl bg-white rounded-full p-0.5" /> Google</button>
                  <button onClick={(e) => handleFacebookLogin(e)} type="button" className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white py-4 font-bold rounded-full flex items-center justify-center gap-3 cursor-pointer transition-colors shadow-md"><FaFacebook className="text-xl"/> Facebook</button>
                </div>
                <div className="flex items-center mb-6"><div className="flex-grow border-t border-slate-100"></div><span className="mx-4 text-slate-400 text-xs font-bold uppercase">Hoặc</span><div className="flex-grow border-t border-slate-100"></div></div>
                <div className="flex flex-col gap-4 mb-6">
                  <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth(e)} placeholder="Email" className="bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:border-sky-500" />
                  <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth(e)} placeholder="Mật khẩu" className="bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:border-sky-500" />
                  <button onClick={(e) => handleEmailAuth(e)} type="button" className="bg-sky-500 text-white py-4 font-black rounded-full uppercase shadow-lg cursor-pointer hover:bg-sky-600 transition-colors">{authMode === 'login' ? t('login') : 'Đăng Ký'}</button>
                </div>

                <div className="text-center text-sm font-medium text-slate-600 mb-8">{authMode === 'login' ? <>Chưa có tài khoản? <button onClick={() => setAuthMode('register')} className="text-sky-600 font-bold underline">Tạo ngay</button></> : <>Đã có tài khoản? <button onClick={() => setAuthMode('login')} className="text-sky-600 font-bold underline">Đăng nhập</button></>}</div>
              </div>
            </div>
          </div>
        )}

        {/* ONBOARDING KHẢO SÁT (MULTI-STEP) */}
        {showSurveyModal && isAuthenticated && (
          <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-[#111111]' : 'bg-slate-50'} animate-fade-in`}>
            <div className="w-full max-w-3xl relative z-10 flex flex-col text-left">
              
              {surveyStep < 5 && (
                <div className={`w-64 h-1 rounded-full mx-auto mb-16 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${(surveyStep / 4) * 100}%` }}></div>
                </div>
              )}

              {surveyStep === 1 && (
                <div className="mx-auto w-full max-w-md animate-fade-in-up">
                  <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Chào mừng đến với Trimi!</h2>
                  <p className={`mb-8 text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hãy cá nhân hóa trải nghiệm của bạn</p>
                  
                  <input type="text" value={surveyData.name} onChange={e => setSurveyData({...surveyData, name: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter' && surveyData.name.trim()) setSurveyStep(2); }} placeholder="Nhập tên và nhấn Enter..." className={`w-full border rounded-full px-5 py-3.5 outline-none focus:border-sky-500 transition-colors mb-8 ${isDarkMode ? 'bg-transparent border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`} />
                  <p className={`text-sm mb-3 font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Chọn giao diện yêu thích</p>
                  <div className="flex gap-3 mb-10">
                    {['Dark', 'Light'].map(mode => (
                      <button key={mode} onClick={(e) => { 
                        setSurveyData({...surveyData, theme: mode});
                        handleThemeToggle(e, mode === 'Dark'); 
                      }} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${surveyData.theme === mode ? (isDarkMode ? 'bg-white text-black border-white font-bold shadow-lg' : 'bg-slate-900 text-white border-slate-900 font-bold shadow-lg') : (isDarkMode ? 'border-slate-700 text-slate-400 hover:border-sky-500 hover:text-sky-400' : 'border-slate-200 text-slate-500 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50')}`}>
                        {mode === 'Dark' ? <FiMoon/> : <FiSun/>} {mode}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setSurveyStep(2)} className={`font-bold px-8 py-3 rounded-full transition-all cursor-pointer transform hover:scale-105 ${isDarkMode ? 'bg-sky-500 text-white hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.4)]' : 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg'}`}>Tiếp tục</button>
                </div>
              )}

              {surveyStep === 2 && (
                <div className="mx-auto w-full text-center animate-fade-in-up">
                  <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Bạn biết đến chúng tôi qua đâu?</h2>
                  <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto mb-16">
                    {['Facebook', 'Instagram', 'TikTok', 'Google', 'Bạn bè giới thiệu', 'YouTube', 'Khác'].map(src => (
                      <button key={src} onClick={() => { setSurveyData({...surveyData, source: src}); setSurveyStep(3); }} className={`px-6 py-3 rounded-full border transition-all cursor-pointer flex items-center gap-2 transform hover:-translate-y-1 hover:shadow-lg ${isDarkMode ? 'border-slate-700 text-slate-300 hover:border-sky-500 hover:bg-sky-500/10 hover:text-sky-400' : 'border-slate-200 text-slate-600 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 font-medium'}`}>
                        {src}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between w-full max-w-xl mx-auto px-4">
                    <button onClick={() => setSurveyStep(1)} className={`cursor-pointer font-bold transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Quay lại</button>
                    <button onClick={() => setSurveyStep(3)} className={`cursor-pointer font-bold transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Bỏ qua</button>
                  </div>
                </div>
              )}

              {surveyStep === 3 && (
                <div className="mx-auto w-full text-center animate-fade-in-up">
                  <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Nghề nghiệp của bạn là gì?</h2>
                  <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Chọn công việc mô tả đúng nhất về bạn.</p>
                  <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto mb-16">
                    {['Sinh viên', 'Nhân viên văn phòng', 'Designer', 'Lập trình viên / IT', 'Kinh doanh tự do', 'Khác'].map(occ => (
                      <button key={occ} onClick={() => { setSurveyData({...surveyData, occupation: occ}); setSurveyStep(4); }} className={`px-6 py-3 rounded-full border transition-all cursor-pointer flex items-center gap-2 transform hover:-translate-y-1 hover:shadow-lg ${isDarkMode ? 'border-slate-700 text-slate-300 hover:border-sky-500 hover:bg-sky-500/10 hover:text-sky-400' : 'border-slate-200 text-slate-600 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 font-medium'}`}>
                        {occ}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between w-full max-w-2xl mx-auto px-4">
                    <button onClick={() => setSurveyStep(2)} className={`cursor-pointer font-bold transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Quay lại</button>
                    <button onClick={() => setSurveyStep(4)} className={`cursor-pointer font-bold transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Bỏ qua</button>
                  </div>
                </div>
              )}

              {surveyStep === 4 && (
                <div className="mx-auto w-full text-center animate-fade-in-up">
                  <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Sở thích mua sắm của bạn?</h2>
                  <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Chọn phong cách bạn thường hay mua nhất.</p>
                  <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto mb-16">
                    {['Áo thun Basic', 'Streetwear', 'Sơ mi công sở', 'Quần Jeans / Kaki', 'Phụ kiện (Nón, Balo)', 'Tất cả'].map(int => (
                      <button key={int} onClick={() => { 
                        setSurveyData({...surveyData, interests: int}); 
                        setSurveyStep(5); // Chuyển sang bước Loading
                        setTimeout(async () => {
                          setUserRole(surveyData.occupation || 'Khách hàng');
                          setNickname(surveyData.name); 
                          localStorage.setItem(`trimi_name_${user?.uid}`, surveyData.name);
                          localStorage.setItem(`trimi_survey_done_${user?.uid}`, 'true'); // Khóa vĩnh viễn trên máy này
                          setShowSurveyModal(false);
                          if (user) {
                            try {
                              await setDoc(doc(db, "users", user.uid), { 
                                nickname: surveyData.name, role: surveyData.occupation || 'Khách hàng',
                                discoverySource: surveyData.source, interests: int, isSurveyCompleted: true 
                              }, { merge: true });
                            } catch(e) {}
                          }
                          showToast('Hoàn tất thiết lập!');
                        }, 2500); 
                      }} className={`px-6 py-3 rounded-full border transition-all cursor-pointer flex items-center gap-2 transform hover:-translate-y-1 hover:shadow-lg ${isDarkMode ? 'border-slate-700 text-slate-300 hover:border-sky-500 hover:bg-sky-500/10 hover:text-sky-400' : 'border-slate-200 text-slate-600 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 font-medium'}`}>
                        {int}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between w-full max-w-2xl mx-auto px-4">
                    <button onClick={() => setSurveyStep(3)} className={`cursor-pointer font-bold transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Quay lại</button>
                  </div>
                </div>
              )}

              {/* LOADING SCREEN MỚI: SANG TRỌNG VÀ ĐƠN GIẢN */}
              {surveyStep === 5 && (
                <div className="mx-auto w-full text-center flex flex-col items-center justify-center animate-fade-in py-10">
                  <div className="relative w-24 h-24 mb-8">
                     <div className={`absolute inset-0 border-4 rounded-full ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}></div>
                     <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <FiCheckCircle className="text-sky-500 text-3xl animate-pulse"/>
                     </div>
                  </div>
                  <h2 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Đang cá nhân hóa...</h2>
                  <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Phân tích sở thích và chuẩn bị không gian của bạn</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* MODAL CÂU CHUYỆN THƯƠNG HIỆU */}
        {showStoryModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowStoryModal(false)}></div>
            <div className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-2xl relative z-10 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar animate-fade-in-up">
              <button onClick={() => setShowStoryModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>
              <h2 className="text-4xl font-brush text-slate-900 mb-6">Trimi Studio</h2>
              <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-wider">Dám Khác Biệt. Dám Là Trimi.</h3>
              <div className="space-y-4 text-slate-600 leading-relaxed text-sm font-medium">
                <p>Được thành lập vào năm 2026 tại thành phố Đà Nẵng năng động, <b>Trimi</b> ra đời từ niềm đam mê thời trang streetwear mãnh liệt.</p>
                <p>Chúng tôi không chỉ bán quần áo. Chúng tôi tin rằng thời trang là ngôn ngữ không lời mạnh mẽ nhất để thể hiện cá tính thực sự, cái tôi độc bản của mỗi người.</p>
                <p>Từng đường kim, mũi chỉ, từng bản in trên các bộ sưu tập của Trimi đều mang theo thông điệp: <i>"Hãy tự tin mặc những gì bạn yêu thích, đừng để ai định nghĩa phong cách của bạn."</i></p>
                <p className="pt-4 text-sky-600 font-bold italic">Hãy đồng hành cùng Trimi trên hành trình định hình phong cách cá nhân nhé!</p>
              </div>
            </div>
          </div>
        )}

        {/* MODAL TUYỂN DỤNG */}
        {showCareerModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowCareerModal(false)}></div>
            <div className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-2xl relative z-10 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar animate-fade-in-up">
              <button onClick={() => setShowCareerModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>
              <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase">Cơ Hội Nghề Nghiệp</h2>
              <p className="text-slate-500 mb-8 text-sm">Gia nhập đội ngũ năng động tại Trimi Studio Đà Nẵng.</p>
              
              <div className="space-y-4">
                 <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 hover:border-sky-500 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="font-bold text-slate-900">1. Nhân viên Sáng tạo Nội dung (Content Creator)</h4>
                       <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Đang mở</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">Yêu cầu: Có gu thẩm mỹ tốt, biết quay dựng video TikTok/Reels cơ bản. Yêu thích thời trang Streetwear.</p>
                 </div>

                 <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 hover:border-sky-500 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="font-bold text-slate-900">2. Chuyên viên Tư vấn Khách hàng</h4>
                       <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Đang mở</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">Yêu cầu: Giao tiếp tốt, kiên nhẫn, có kinh nghiệm trực page và chốt đơn là một lợi thế.</p>
                 </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                 <p className="text-sm text-slate-600 font-medium mb-3">Gửi CV và Portfolio (nếu có) của bạn về Email:</p>
                 <a href="mailto:phanbasongtoan112@gmail.com" className="text-lg font-black text-sky-500 hover:underline">phanbasongtoan112@gmail.com</a>
              </div>
            </div>
          </div>
        )}

        {/* MODAL LIÊN HỆ CHÚNG TÔI */}
        {showContactModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowContactModal(false)}></div>
            <div className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-md relative z-10 shadow-2xl animate-fade-in-up text-center">
              <button onClick={() => setShowContactModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>
              
              <div className="w-20 h-20 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <FiMail className="text-4xl"/>
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase">Liên Hệ Trimi</h2>
              
              <div className="space-y-4 text-slate-600 font-medium text-sm mb-8 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="flex items-center gap-3"><FiTruck className="text-sky-500 text-lg"/> Đà Nẵng, Việt Nam</p>
                <p className="flex items-center gap-3"><FiMail className="text-sky-500 text-lg"/> phanbasongtoan112@gmail.com</p>
                <p className="flex items-center gap-3"><FaFacebook className="text-sky-500 text-lg"/> fb.com/trimi.studio</p>
              </div>

              <button 
                onClick={() => {
                   setShowContactModal(false);
                   setIsHelpOpen(true);
                }} 
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-full hover:bg-sky-500 transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <FiMessageCircle className="text-lg"/> Chat Trực Tiếp Với Admin
              </button>
            </div>
          </div>
        )}
        {/* MODAL CHÍNH SÁCH BẢO MẬT */}
        {showPrivacyModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowPrivacyModal(false)}></div>
            <div className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-3xl relative z-10 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar">
              <button onClick={() => setShowPrivacyModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>
              <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase">Chính sách bảo mật</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
                <p><b>1. Thu thập thông tin:</b> Trimi thu thập thông tin cá nhân (Tên, SĐT, Địa chỉ) chỉ nhằm mục đích xử lý đơn hàng và giao nhận tại Đà Nẵng.</p>
                <p><b>2. Sử dụng Cookie:</b> Chúng tôi sử dụng Cookie và lịch sử xem hàng để AI gợi ý sản phẩm phù hợp với phong cách của bạn.</p>
                <p><b>3. Bảo mật thanh toán:</b> Hình ảnh biên lai chuyển khoản được lưu trữ an toàn để đối soát và sẽ không chia sẻ cho bên thứ ba.</p>
                <p><b>4. Quyền của người dùng:</b> Bạn có quyền yêu cầu xóa lịch sử mua hàng hoặc tài khoản bất cứ lúc nào thông qua trạm hỗ trợ.</p>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ĐIỀU KHOẢN DỊCH VỤ */}
        {showTermsModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowTermsModal(false)}></div>
            <div className="bg-white rounded-[32px] p-8 md:p-12 w-full max-w-3xl relative z-10 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar">
              <button onClick={() => setShowTermsModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><FiX className="text-xl"/></button>
              <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase">Điều khoản dịch vụ</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
                <p><b>1. Phạm vi giao hàng:</b> Hiện tại Trimi chỉ hỗ trợ giao hàng trong địa phận Đà Nẵng. Các đơn hàng ngoại tỉnh vui lòng liên hệ Admin.</p>
                <p><b>2. Quy định thanh toán:</b> Quý khách cần thanh toán cọc 30% hoặc 100% giá trị đơn hàng thông qua mã QR và tải ảnh bill để xác nhận đơn.</p>
                <p><b>3. Chính sách đổi trả:</b> Hỗ trợ đổi trả miễn phí trong vòng 5 ngày nếu sản phẩm có lỗi từ nhà sản xuất hoặc không đúng size.</p>
                <p><b>4. Trách nhiệm:</b> Người dùng cam kết cung cấp đúng thông tin liên lạc. Mọi hành vi spam bill giả sẽ bị khóa tài khoản vĩnh viễn.</p>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PHÓNG TO ẢNH BILL CỦA ADMIN */}
        {previewImg && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewImg(null)}>
            <button className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors cursor-pointer"><FiX className="text-2xl"/></button>
            <img src={previewImg} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} alt="Bill Preview" />
          </div>
        )}
        {/* MODAL THÔNG BÁO ĐẶT HÀNG THÀNH CÔNG (DÁN VÀO ĐÂY) */}
        {successOrderInfo && (
           <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-[32px] p-8 text-center max-w-sm w-full shadow-2xl transform transition-all animate-fade-in-up">
                 <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <FiCheckCircle className="text-5xl" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 mb-2">Tuyệt vời!</h3>
                 <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                   Đơn hàng <strong className="text-sky-600 font-bold">{successOrderInfo}</strong> của bạn đã được ghi nhận.<br/>Chúng tôi sẽ duyệt bill và chuẩn bị hàng ngay!
                 </p>
                 <button onClick={() => setSuccessOrderInfo(null)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-full hover:bg-sky-500 transition-colors shadow-lg cursor-pointer">Xác nhận</button>
              </div>
           </div>
        )}

        {/* BẢNG THÔNG BÁO COOKIE & CHÍNH SÁCH BẢO MẬT (CHỈ HIỆN LẦN ĐẦU) */}
        {showCookieConsent && (
          <div className="fixed bottom-0 left-0 w-full bg-slate-900 text-white p-4 md:px-8 z-[99999] flex flex-col md:flex-row justify-between items-center text-sm shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-fade-in-up">
            <p className="mb-4 md:mb-0 font-medium text-slate-300 text-center md:text-left">
              Trimi sử dụng cookie để theo dõi trải nghiệm nhằm cung cấp các đề xuất AI chính xác nhất. Khi tiếp tục, bạn đồng ý với <span onClick={() => setShowPrivacyModal(true)} className="text-sky-400 cursor-pointer font-bold hover:underline">Chính sách bảo mật</span> của chúng tôi.
            </p>
            <button 
              onClick={() => {
                localStorage.setItem('trimi_cookies', 'true');
                setShowCookieConsent(false);
              }} 
              className="bg-sky-500 hover:bg-sky-600 px-8 py-2.5 rounded-full font-bold text-white shadow-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Tôi đồng ý
            </button>
          </div>
        )}

        {/* MENU 3 GẠCH (TRẢI NGANG, HÌNH VUÔNG, KHÔNG GÂY BLUR) */}
        {isUnifiedMenuOpen && (
           <>
              {/* Lớp nền tàng hình để click ra ngoài thì đóng menu */}
              <div className="fixed inset-0 z-[99998]" onClick={() => setIsUnifiedMenuOpen(false)}></div>
              
              {/* 3 Icon xổ ngang (flex-row), bo góc hình vuông (rounded-2xl) */}
              <div className={`fixed top-[70px] right-4 md:right-8 z-[99999] flex flex-row gap-2 p-2 rounded-2xl shadow-2xl animate-fade-in border ${isDarkMode ? 'bg-[#181512] border-slate-800' : 'bg-white border-slate-100'}`}>
                 
                 {/* 1. Icon Tài Khoản */}
                 <button onClick={() => { setIsUnifiedMenuOpen(false); requireLogin(() => navigateTo('profile')); }} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-sky-600'}`} title="Tài khoản">
                    <FiUser />
                 </button>

                 {/* 2. Icon Đổi Nền (Sáng/Tối) - ĐÃ GẮN HIỆU ỨNG */}
                 <button onClick={(e) => {handleThemeToggle(e); setIsUnifiedMenuOpen(false);}} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${isDarkMode ? 'text-sky-400 hover:bg-slate-800' : 'text-sky-500 hover:bg-slate-100'}`} title="Đổi giao diện">
                    {isDarkMode ? <FiSun /> : <FiMoon />}
                 </button>

                 {/* 3. Icon Đổi Ngôn Ngữ */}
                 <button onClick={() => {setLang(lang === 'VI' ? 'EN' : 'VI'); setIsUnifiedMenuOpen(false);}} className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black transition-all ${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-sky-600'}`} title="Đổi ngôn ngữ">
                    {lang}
                 </button>

              </div>
           </>
        )}

      </div>
    </>
  );
}