import { useState, useEffect, useRef } from 'react';

import { 
  FiMenu, FiMail, FiLock, FiLogOut, FiShoppingCart, FiSearch, 
  FiUser, FiStar, FiTruck, FiShield, FiCornerUpLeft, FiX, 
  FiTrash2, FiCheckCircle, FiRefreshCcw, FiSettings, 
  FiPlus, FiUploadCloud, FiArchive, FiCamera, FiEdit3, FiSave, FiMove, FiImage,
  FiMessageCircle, FiCreditCard, FiMonitor, FiInstagram, FiLinkedin, FiYoutube, FiGlobe, FiSend
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

// Firebase
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot, arrayUnion } from 'firebase/firestore';

// ==========================================
// BỘ NÉN ẢNH CHỐNG LỖI FIREBASE (MAX 1MB)
// ==========================================
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
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

// ==========================================
// TỪ ĐIỂN ĐA NGÔN NGỮ (i18n)
// ==========================================
const dict = {
  VI: { home: "Trang chủ", shop: "Cửa hàng", men: "Nam", women: "Nữ", collection: "Bộ sưu tập", login: "Đăng nhập", search: "Tìm kiếm trang phục...", cart: "Giỏ hàng", account: "Tài khoản", logout: "Đăng xuất", adminMenu: "Quản Trị Kho", sloganTitle: "Đậm chất riêng.", sloganDesc: "Chúng tôi tin rằng thời trang không chỉ là áo quần, mà là ngôn ngữ không lời để thể hiện cá tính thực sự của bạn.", explore: "Khám phá ngay", newCol: "New Collection 2026", heroTitle: "Thời trang phong cách,\nđậm chất riêng.", heroDesc: "Khám phá hàng trăm mẫu áo thun, áo khoác và phụ kiện chất lượng cao với mức giá không thể tuyệt vời hơn.", addToCart: "THÊM VÀO GIỎ HÀNG", desc: "Mô tả chi tiết", ship: "Giao hàng miễn phí toàn quốc", return: "Đổi trả miễn phí 30 ngày", myOrders: "Đơn hàng của tôi", wishlist: "Sản phẩm yêu thích", noOrders: "Chưa có đơn hàng nào", noOrdersDesc: "Khi bạn mua sắm, danh sách hóa đơn sẽ hiển thị tại đây.", total: "Tổng thanh toán", checkout: "Thanh Toán Ngay", emptyCart: "Giỏ hàng của bạn đang trống.", startShop: "Mua sắm ngay", f_prod: "Sản phẩm", f_all: "Tất cả sản phẩm", f_men: "Thời trang Nam", f_women: "Thời trang Nữ", f_acc: "Phụ kiện", f_sup: "Hỗ trợ khách hàng", f_track: "Theo dõi đơn hàng", f_ret: "Chính sách đổi trả", f_ship: "Chính sách giao hàng", f_size: "Hướng dẫn chọn size", f_serv: "Dịch vụ", f_print: "In ấn theo yêu cầu", f_b2b: "Khách hàng doanh nghiệp", f_gift: "Thẻ quà tặng", f_about: "Về Trimi", f_story: "Câu chuyện thương hiệu", f_career: "Tuyển dụng", f_contact: "Liên hệ chúng tôi", f_priv: "Chính sách bảo mật", f_term: "Điều khoản dịch vụ", chatHelp: "Trạm hỗ trợ Trimi", chatHow: "👋 Chúng tôi có thể giúp gì cho bạn?", chatWithUs: "Chat Với Chúng Tôi", sendMsg: "Gửi tin nhắn", replyFast: "Phản hồi ngay lập tức", faqs: "Câu hỏi thường gặp", faqAcc: "Tài khoản của tôi", faqBill: "Thanh toán & Đơn hàng", faqShip: "Vận chuyển", chatInput: "Nhập tin nhắn...", roleCustomer: "Khách hàng", roleVerified: "Thành viên", roleAdmin: "Quản trị viên", changeCover: "Đổi ảnh bìa", adminDashboard: "Trạm Quản Trị", adminAdd: "Đăng Sản Phẩm Mới", adminUsers: "Dữ liệu Khách hàng", adminNoData: "Chưa có dữ liệu", adminImg: "Hình ảnh", adminName: "Tên sản phẩm", adminPrice: "Giá bán", adminAction: "Hành động", adminDel: "Xóa Bỏ", adminCare: "Chăm Sóc Khách Hàng (Real-time)", adminWait: "Chưa có khách hàng", online: "Đang trực tuyến", offline: "Ngoại tuyến", adminInbox: "Hộp thư khách hàng" },
  EN: { home: "Home", shop: "Shop", men: "Men", women: "Women", collection: "Collections", login: "Login", search: "Search clothes...", cart: "Cart", account: "Account", logout: "Logout", adminMenu: "Admin Panel", sloganTitle: "Your Unique Vibe.", sloganDesc: "We believe fashion is not just clothing, but a silent language to express your true self.", explore: "Explore Now", newCol: "New Collection 2026", heroTitle: "Stylish fashion,\nunique vibe.", heroDesc: "Discover hundreds of high-quality t-shirts, jackets and accessories at unbeatable prices.", addToCart: "ADD TO CART", desc: "Description", ship: "Free Nationwide Shipping", return: "30-Day Free Returns", myOrders: "My Orders", wishlist: "Wishlist", noOrders: "No orders yet", noOrdersDesc: "When you shop, your invoices will appear here.", total: "Total", checkout: "Checkout Now", emptyCart: "Your cart is empty.", startShop: "Start Shopping", f_prod: "Products", f_all: "All Products", f_men: "Men's Fashion", f_women: "Women's Fashion", f_acc: "Accessories", f_sup: "Customer Support", f_track: "Track Order", f_ret: "Return Policy", f_ship: "Shipping Policy", f_size: "Size Guide", f_serv: "Services", f_print: "Print on Demand", f_b2b: "Corporate Clients", f_gift: "Gift Cards", f_about: "About Trimi", f_story: "Brand Story", f_career: "Careers", f_contact: "Contact Us", f_priv: "Privacy Policy", f_term: "Terms of Service", chatHelp: "Trimi Help Center", chatHow: "👋 How can we help you today?", chatWithUs: "Chat With Us", sendMsg: "Send a message", replyFast: "Instant reply", faqs: "FAQs", faqAcc: "My Account", faqBill: "Billing & Orders", faqShip: "Shipping", chatInput: "Type a message...", roleCustomer: "Customer", roleVerified: "Member", roleAdmin: "Admin", changeCover: "Change Cover", adminDashboard: "Admin Dashboard", adminAdd: "Add New Product", adminUsers: "Customer Data", adminNoData: "No data", adminImg: "Image", adminName: "Product Name", adminPrice: "Price", adminAction: "Action", adminDel: "Delete", adminCare: "Customer Care (Real-time)", adminWait: "No customers yet", online: "Online", offline: "Offline", adminInbox: "Customer Inbox" },
  KO: { home: "홈", shop: "가게", men: "남성", women: "여성", collection: "컬렉션", login: "로그인", search: "의류 검색...", cart: "장바구니", account: "계정", logout: "로그아웃", adminMenu: "관리자 패널", sloganTitle: "나만의 스타일.", sloganDesc: "우리는 패션이 단순한 옷이 아니라 진정한 개성을 표현하는 침묵의 언어라고 믿습니다.", explore: "지금 탐색하기", newCol: "2026 새로운 컬렉션", heroTitle: "스타일리시한 패션,\n독특한 분위기.", heroDesc: "탁월한 가격에 수백 가지의 고품질 티셔츠, 재킷 및 액세서리를 발견하세요.", addToCart: "장바구니에 추가", desc: "세부 정보", ship: "전국 무료 배송", return: "30일 무료 반품", myOrders: "내 주문", wishlist: "위시리스트", noOrders: "아직 주문이 없습니다", noOrdersDesc: "쇼핑을 하면 여기에 송장이 표시됩니다.", total: "총액", checkout: "결제하기", emptyCart: "장바구니가 비어 있습니다.", startShop: "쇼핑 시작", f_prod: "제품", f_all: "모든 제품", f_men: "남성 패션", f_women: "여성 패션", f_acc: "액세서리", f_sup: "고객 지원", f_track: "주문 배송조회", f_ret: "반품 정책", f_ship: "배송 정보", f_size: "사이즈 가이드", f_serv: "서비스", f_print: "맞춤형 인쇄", f_b2b: "기업 고객", f_gift: "기프트 카드", f_about: "Trimi 소개", f_story: "브랜드 스토리", f_career: "채용", f_contact: "문의하기", f_priv: "개인정보 보호정책", f_term: "서비스 약관", chatHelp: "Trimi 도움말 센터", chatHow: "👋 무엇을 도와드릴까요?", chatWithUs: "우리와 채팅", sendMsg: "메시지 보내기", replyFast: "즉각적인 답변", faqs: "자주 묻는 질문", faqAcc: "내 계정", faqBill: "결제 및 주문", faqShip: "배송", chatInput: "메시지 입력...", roleCustomer: "고객", roleVerified: "회원", roleAdmin: "관리자", changeCover: "커버 변경", adminDashboard: "관리자 대시보드", adminAdd: "새 제품 추가", adminUsers: "고객 데이터", adminNoData: "데이터 없음", adminImg: "이미지", adminName: "제품 이름", adminPrice: "가격", adminAction: "동작", adminDel: "삭제", adminCare: "고객 관리", adminWait: "고객이 없습니다", online: "온라인", offline: "오프라인", adminInbox: "고객받은 편지함" },
  JA: { home: "ホーム", shop: "ショップ", men: "メンズ", women: "レディース", collection: "コレクション", login: "ログイン", search: "衣類を検索...", cart: "カート", account: "アカウント", logout: "ログアウト", adminMenu: "管理パネル", sloganTitle: "独自のスタイル。", sloganDesc: "ファッションは単なる服ではなく、本当の個性を表現する沈黙の言語だと私たちは信じています。", explore: "今すぐ探索", newCol: "新コレクション 2026", heroTitle: "スタイリッシュなファッション、\n独特の雰囲気。", heroDesc: "高品質のTシャツ、ジャケット、アクセサリーを破格の価格で発見してください。", addToCart: "カートに追加", desc: "説明", ship: "全国送料無料", return: "30日間無料返品", myOrders: "私の注文", wishlist: "ウィッシュリスト", noOrders: "まだ注文はありません", noOrdersDesc: "買い物をすると、ここに請求書が表示されます。", total: "合計", checkout: "チェックアウト", emptyCart: "カートは空です。", startShop: "買い物を始める", f_prod: "製品", f_all: "すべての製品", f_men: "メンズファッション", f_women: "レディースファッション", f_acc: "アクセサリー", f_sup: "顧客サポート", f_track: "注文状況の確認", f_ret: "返品ポリシー", f_ship: "配送情報", f_size: "サイズガイド", f_serv: "サービス", f_print: "オンデマンド印刷", f_b2b: "企業のお客様", f_gift: "ギフトカード", f_about: "Trimiについて", f_story: "ブランドストーリー", f_career: "採用情報", f_contact: "お問い合わせ", f_priv: "プライバシーポリシー", f_term: "利用規約", chatHelp: "Trimiヘルプセンター", chatHow: "👋 今日はどのようなご用件ですか？", chatWithUs: "チャットする", sendMsg: "メッセージを送る", replyFast: "即時返信", faqs: "よくある質問", faqAcc: "マイアカウント", faqBill: "請求と注文", faqShip: "配送", chatInput: "メッセージを入力...", roleCustomer: "お客様", roleVerified: "メンバー", roleAdmin: "管理者", changeCover: "カバーを変更", adminDashboard: "管理ダッシュボード", adminAdd: "新製品の追加", adminUsers: "顧客データ", adminNoData: "データなし", adminImg: "画像", adminName: "製品名", adminPrice: "価格", adminAction: "アクション", adminDel: "削除", adminCare: "カスタマーケア", adminWait: "顧客はいません", online: "オンライン", offline: "オフライン", adminInbox: "顧客の受信トレイ" },
  ZH: { home: "首页", shop: "商店", men: "男装", women: "女装", collection: "收藏", login: "登录", search: "搜索衣服...", cart: "购物车", account: "帐户", logout: "登出", adminMenu: "管理面板", sloganTitle: "独特的风格。", sloganDesc: "我们相信时尚不仅是衣服，更是表达你真实个性的无声语言。", explore: "立即探索", newCol: "2026 新系列", heroTitle: "时尚的风格，\n独特的氛围。", heroDesc: "以无与伦比的价格发现数百款高品质的T恤、夹克和配饰。", addToCart: "加入购物车", desc: "详细描述", ship: "全国免费送货", return: "30天免费退货", myOrders: "我的订单", wishlist: "心愿单", noOrders: "暂无订单", noOrdersDesc: "当您购物时，您的发票将显示在这里。", total: "总计", checkout: "立即结账", emptyCart: "您的购物车是空的。", startShop: "开始购物", f_prod: "产品", f_all: "所有产品", f_men: "男士时尚", f_women: "女士时尚", f_acc: "配件", f_sup: "客户支持", f_track: "跟踪订单", f_ret: "退货政策", f_ship: "运输政策", f_size: "尺码指南", f_serv: "服务", f_print: "按需打印", f_b2b: "企业客户", f_gift: "礼品卡", f_about: "关于 Trimi", f_story: "品牌故事", f_career: "招聘", f_contact: "联系我们", f_priv: "隐私政策", f_term: "服务条款", chatHelp: "Trimi 帮助中心", chatHow: "👋 今天我们能怎么帮助您？", chatWithUs: "与我们聊天", sendMsg: "发送消息", replyFast: "即刻回复", faqs: "常见问题", faqAcc: "我的帐户", faqBill: "账单与订单", faqShip: "运输", chatInput: "输入消息...", roleCustomer: "顾客", roleVerified: "会员", roleAdmin: "管理员", changeCover: "更改封面", adminDashboard: "管理仪表板", adminAdd: "添加新产品", adminUsers: "客户数据", adminNoData: "没有数据", adminImg: "图像", adminName: "产品名称", adminPrice: "价格", adminAction: "行动", adminDel: "删除", adminCare: "客户服务", adminWait: "暂无客户", online: "在线", offline: "离线", adminInbox: "客户收件箱" },
  FR: { home: "Accueil", shop: "Boutique", men: "Hommes", women: "Femmes", collection: "Collections", login: "Connexion", search: "Rechercher...", cart: "Panier", account: "Compte", logout: "Déconnexion", adminMenu: "Panneau Admin", sloganTitle: "Style unique.", sloganDesc: "Nous croyons que la mode n'est pas seulement des vêtements.", explore: "Explorer", newCol: "Nouvelle Collection", heroTitle: "Mode élégante,\nambiance unique.", heroDesc: "Découvrez des t-shirts de haute qualité à des prix imbattables.", addToCart: "AJOUTER", desc: "Description", ship: "Livraison Gratuite", return: "Retours 30 Jours", myOrders: "Mes Commandes", wishlist: "Favoris", noOrders: "Aucune commande", noOrdersDesc: "Vos factures apparaîtront ici.", total: "Total", checkout: "Payer", emptyCart: "Panier vide.", startShop: "Acheter", f_prod: "Produits", f_all: "Tous les produits", f_men: "Mode Homme", f_women: "Mode Femme", f_acc: "Accessoires", f_sup: "Support", f_track: "Suivre la commande", f_ret: "Retours", f_ship: "Livraison", f_size: "Guide des tailles", f_serv: "Services", f_print: "Impression", f_b2b: "B2B", f_gift: "Cartes Cadeaux", f_about: "À propos", f_story: "Histoire", f_career: "Carrières", f_contact: "Contact", f_priv: "Confidentialité", f_term: "Conditions", chatHelp: "Centre d'aide", chatHow: "👋 Comment vous aider?", chatWithUs: "Discuter", sendMsg: "Envoyer un message", replyFast: "Réponse instantanée", faqs: "FAQs", faqAcc: "Mon Compte", faqBill: "Facturation", faqShip: "Livraison", chatInput: "Taper un message...", roleCustomer: "Client", roleVerified: "Membre", roleAdmin: "Admin", changeCover: "Changer la couverture", adminDashboard: "Tableau de bord", adminAdd: "Ajouter", adminUsers: "Clients", adminNoData: "Aucune donnée", adminImg: "Image", adminName: "Nom", adminPrice: "Prix", adminAction: "Action", adminDel: "Supprimer", adminCare: "Service Client", adminWait: "Aucun client", online: "En ligne", offline: "Hors ligne", adminInbox: "Boîte de réception" },
  IT: { home: "Home", shop: "Negozio", men: "Uomo", women: "Donna", collection: "Collezioni", login: "Accedi", search: "Cerca abiti...", cart: "Carrello", account: "Account", logout: "Esci", adminMenu: "Admin", sloganTitle: "Stile Unico.", sloganDesc: "La moda è un linguaggio silenzioso per esprimere la tua personalità.", explore: "Esplora Ora", newCol: "Nuova Collezione", heroTitle: "Moda elegante,\natmosfera unica.", heroDesc: "Scopri accessori di alta qualità a prezzi imbattibili.", addToCart: "AGGIUNGI", desc: "Descrizione", ship: "Spedizione Gratuita", return: "Resi 30 Giorni", myOrders: "I Miei Ordini", wishlist: "Desideri", noOrders: "Nessun ordine", noOrdersDesc: "Le tue fatture appariranno qui.", total: "Totale", checkout: "Paga Ora", emptyCart: "Carrello vuoto.", startShop: "Acquista", f_prod: "Prodotti", f_all: "Tutti i prodotti", f_men: "Uomo", f_women: "Donna", f_acc: "Accessori", f_sup: "Supporto", f_track: "Traccia Ordine", f_ret: "Resi", f_ship: "Spedizione", f_size: "Guida Taglie", f_serv: "Servizi", f_print: "Stampa", f_b2b: "Clienti Aziendali", f_gift: "Gift Cards", f_about: "Chi Siamo", f_story: "Storia", f_career: "Carriere", f_contact: "Contatti", f_priv: "Privacy", f_term: "Termini", chatHelp: "Centro Assistenza", chatHow: "👋 Come possiamo aiutarti?", chatWithUs: "Chatta con noi", sendMsg: "Invia messaggio", replyFast: "Risposta veloce", faqs: "FAQs", faqAcc: "Account", faqBill: "Fatturazione", faqShip: "Spedizione", chatInput: "Scrivi messaggio...", roleCustomer: "Cliente", roleVerified: "Membro", roleAdmin: "Admin", changeCover: "Cambia Copertina", adminDashboard: "Dashboard Admin", adminAdd: "Aggiungi", adminUsers: "Clienti", adminNoData: "Nessun dato", adminImg: "Immagine", adminName: "Nome", adminPrice: "Prezzo", adminAction: "Azione", adminDel: "Elimina", adminCare: "Assistenza", adminWait: "Nessun cliente", online: "Online", offline: "Offline", adminInbox: "Posta in arrivo" },
  RU: { home: "Главная", shop: "Магазин", men: "Мужчины", women: "Женщины", collection: "Коллекции", login: "Войти", search: "Поиск одежды...", cart: "Корзина", account: "Аккаунт", logout: "Выйти", adminMenu: "Админ", sloganTitle: "Уникальный стиль.", sloganDesc: "Мода - это безмолвный язык для выражения вашей личности.", explore: "Исследовать", newCol: "Новая коллекция", heroTitle: "Стильная мода,\nуникальная атмосфера.", heroDesc: "Откройте для себя высококачественные футболки и аксессуары.", addToCart: "В КОРЗИНУ", desc: "Описание", ship: "Бесплатная доставка", return: "Возврат 30 дней", myOrders: "Мои заказы", wishlist: "Избранное", noOrders: "Нет заказов", noOrdersDesc: "Здесь будут ваши счета.", total: "Итого", checkout: "Оформить", emptyCart: "Корзина пуста.", startShop: "Начать покупки", f_prod: "Товары", f_all: "Все товары", f_men: "Мужчинам", f_women: "Женщинам", f_acc: "Аксессуары", f_sup: "Поддержка", f_track: "Отследить заказ", f_ret: "Возврат", f_ship: "Доставка", f_size: "Размеры", f_serv: "Услуги", f_print: "Печать", f_b2b: "B2B", f_gift: "Подарочные карты", f_about: "О нас", f_story: "История", f_career: "Карьера", f_contact: "Контакты", f_priv: "Конфиденциальность", f_term: "Условия", chatHelp: "Центр помощи", chatHow: "👋 Как мы можем помочь?", chatWithUs: "Чат с нами", sendMsg: "Отправить сообщение", replyFast: "Быстрый ответ", faqs: "Частые вопросы", faqAcc: "Аккаунт", faqBill: "Оплата", faqShip: "Доставка", chatInput: "Введите сообщение...", roleCustomer: "Клиент", roleVerified: "Участник", roleAdmin: "Админ", changeCover: "Изменить обложку", adminDashboard: "Панель", adminAdd: "Добавить", adminUsers: "Клиенты", adminNoData: "Нет данных", adminImg: "Фото", adminName: "Название", adminPrice: "Цена", adminAction: "Действие", adminDel: "Удалить", adminCare: "Поддержка", adminWait: "Нет клиентов", online: "Онлайн", offline: "Офлайн", adminInbox: "Входящие" }
};

const defaultLookbookData = [
  { id: 1, title: 'Men Collection', img: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=800&auto=format&fit=crop' },
  { id: 2, title: 'Streetwear', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
  { id: 3, title: 'Accessories', img: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800&auto=format&fit=crop' },
  { id: 4, title: 'New Arrivals', img: 'https://images.unsplash.com/photo-1529139574466-a303027c028b?q=80&w=800&auto=format&fit=crop' },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // USER DATA & ĐỔI TÊN
  const [userRole, setUserRole] = useState(''); 
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [nickname, setNickname] = useState(''); 
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const [localProducts, setLocalProducts] = useState([]);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(''); 

  const isAdmin = user?.email === 'phanbasongtoan112@gmail.com';
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', price: '', desc: '', imagePreview: null });
  
  // === NGÔN NGỮ ===
  const [lang, setLang] = useState('VI');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const languages = [
    { code: 'VI', label: 'Tiếng Việt' }, { code: 'EN', label: 'English' },
    { code: 'KO', label: '한국어' }, { code: 'JA', label: '日本語' },
    { code: 'ZH', label: '中文' }, { code: 'FR', label: 'Français' },
    { code: 'IT', label: 'Italiano' }, { code: 'RU', label: 'Русский' }
  ];
  const t = (key) => dict[lang]?.[key] || dict['VI'][key] || key;

  // === REAL-TIME CHAT & ADMIN DASHBOARD ===
  const [usersList, setUsersList] = useState([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [hasUnreadUser, setHasUnreadUser] = useState(false);

  const [adminChatUser, setAdminChatUser] = useState(null); 
  const [adminChatInput, setAdminChatInput] = useState('');

  const chatContainerRef = useRef(null);
  const adminChatContainerRef = useRef(null);

  // === BANNER & LOOKBOOK INIT SYNCHRONOUSLY (XÓA CHỚP ẢNH 1 GIÂY) ===
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  
  const [bannerConfig, setBannerConfig] = useState(() => {
    const saved = localStorage.getItem('trimi_banner');
    return saved ? JSON.parse(saved) : { x: 0, y: 0, scale: 1 };
  });
  
  const [bannerImage, setBannerImage] = useState(() => {
    return localStorage.getItem('trimi_banner_img') || '/banner.png';
  });
  
  const [lookbook, setLookbook] = useState(() => {
    const saved = localStorage.getItem('trimi_lookbook');
    return saved ? JSON.parse(saved) : defaultLookbook;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // ÉP CUỘN TRANG (GHI ĐÈ CSS CŨ) VÀ TIÊM FAVICON (ICON TRÌNH DUYỆT)
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = '/apple-touch-icon.png';
  }, []);

  // FIX LỖI NHẢY TRANG KHI CUỘN CHAT
  useEffect(() => {
    if(chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatMessages, isChatBoxOpen]);

  useEffect(() => {
    if(adminChatContainerRef.current) adminChatContainerRef.current.scrollTop = adminChatContainerRef.current.scrollHeight;
  }, [adminChatUser?.messages]);

  // LOAD PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://fakestoreapi.com/products/category/men's%20clothing");
        const data = await response.json();
        const formattedProducts = data.map((item) => ({
          id: item.id.toString(), name: item.title, price: item.price, rating: item.rating.rate,
          reviews: item.rating.count, imageUrl: item.image, description: item.description
        }));
        setLocalProducts(formattedProducts);
        setIsLoadingShop(false);
      } catch (error) { setIsLoadingShop(false); }
    };
    fetchProducts();
  }, []);

  // LOAD GLOBAL CONFIG TỪ CLOUD ĐỂ ĐỒNG BỘ MỌI MÁY
  useEffect(() => {
    const fetchGlobalConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'storefront');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.lookbook) setLookbook(data.lookbook);
          if (data.bannerConfig) setBannerConfig(data.bannerConfig);
          if (data.bannerImage) setBannerImage(data.bannerImage);
        }
      } catch (error) {}
    };
    fetchGlobalConfig();
  }, []);

  // === ĐĂNG NHẬP & TRẠNG THÁI REAL-TIME ONLINE ===
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        setShowLoginModal(false);
        
        const localAvatar = localStorage.getItem(`trimi_avatar_${currentUser.uid}`);
        if (localAvatar) setAvatarUrl(localAvatar); else setAvatarUrl('');
        
        const localCover = localStorage.getItem(`trimi_cover_${currentUser.uid}`);
        if (localCover) setCoverUrl(localCover); else setCoverUrl('');

        const localName = localStorage.getItem(`trimi_name_${currentUser.uid}`);
        if (localName) setNickname(localName); else setNickname(currentUser.email.split('@')[0]);

        try {
          await setDoc(doc(db, 'users', currentUser.uid), { email: currentUser.email, nickname: localName || currentUser.email.split('@')[0], lastActive: Date.now(), isOnline: true }, { merge: true });
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().role) setUserRole(docSnap.data().role);
          else setShowSurveyModal(true);
        } catch (error) {}

        const presenceInterval = setInterval(() => {
          setDoc(doc(db, 'users', currentUser.uid), { lastActive: Date.now(), isOnline: true }, { merge: true }).catch(()=>{});
        }, 30000);

        const handleUnload = () => { setDoc(doc(db, 'users', currentUser.uid), { isOnline: false }, { merge: true }).catch(()=>{}); };
        window.addEventListener('beforeunload', handleUnload);

        return () => { clearInterval(presenceInterval); window.removeEventListener('beforeunload', handleUnload); };
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setAvatarUrl('');
        setCoverUrl('');
        setNickname('');
        setChatMessages([]); 
        setHasUnreadUser(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // === LẤY DANH SÁCH USER CHO ADMIN (REAL-TIME) ===
  useEffect(() => {
    if (isAdmin && currentView === 'admin') {
      const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const isCurrentlyOnline = data.isOnline && (Date.now() - data.lastActive < 60000);
          usersData.push({ uid: doc.id, ...data, isOnline: isCurrentlyOnline });
        });
        setUsersList(usersData);
      });
      return () => unsubscribe();
    }
  }, [isAdmin, currentView]);

  // === ĐỌC TIN NHẮN REAL-TIME CỦA USER & BÁO TIN MỚI ===
  useEffect(() => {
    if (!user || isAdmin) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setChatMessages(docSnap.data().messages || []);
        setHasUnreadUser(docSnap.data().hasUnreadUser || false);
      }
    });
    return () => unsub();
  }, [user, isAdmin]);

  // === ĐỌC TIN NHẮN REAL-TIME KHI ADMIN BẤM VÀO MỘT USER ===
  useEffect(() => {
    if (!isAdmin || !adminChatUser) return;
    const unsub = onSnapshot(doc(db, 'users', adminChatUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setAdminChatUser(prev => ({ ...prev, messages: docSnap.data().messages || [] }));
      }
    });
    return () => unsub();
  }, [isAdmin, adminChatUser?.uid]);

  const totalAdminUnread = usersList.filter(u => u.hasUnreadAdmin).length;

  const openUserChat = async () => {
    setIsChatBoxOpen(true);
    setIsHelpOpen(false);
    if (user) {
      setHasUnreadUser(false);
      await setDoc(doc(db, 'users', user.uid), { hasUnreadUser: false }, { merge: true }).catch(()=>{});
    }
  };

  const openAdminChatWithUser = async (u) => {
    setAdminChatUser(u);
    await setDoc(doc(db, 'users', u.uid), { hasUnreadAdmin: false }, { merge: true }).catch(()=>{});
  };

  const handleUserSendMessage = async () => {
    if(!chatInput.trim() || !user) return;
    const newMessage = { sender: 'user', text: chatInput, timestamp: Date.now() };
    setChatInput('');
    try {
      await setDoc(doc(db, 'users', user.uid), { 
        messages: arrayUnion(newMessage), lastUpdated: Date.now(), userEmail: user.email, nickname: nickname,
        hasUnreadAdmin: true 
      }, { merge: true });
    } catch(e) { showToast("Lỗi gửi tin nhắn"); }
  };

  const handleAdminSendMessage = async () => {
    if(!adminChatInput.trim() || !adminChatUser) return;
    const newMessage = { sender: 'bot', text: adminChatInput, timestamp: Date.now() };
    setAdminChatInput('');
    try {
      await setDoc(doc(db, 'users', adminChatUser.uid), { 
        messages: arrayUnion(newMessage), lastUpdated: Date.now(),
        hasUnreadUser: true 
      }, { merge: true });
    } catch(e) { showToast("Lỗi gửi tin nhắn"); }
  };

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
    if(user) await setDoc(doc(db, 'users', user.uid), { isOnline: false }, { merge: true }).catch(()=>{});
    await signOut(auth);
    setChatMessages([]);
    setAdminChatUser(null);
    setCurrentView('home'); 
  };

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); };

  const handleSaveName = async () => {
    if(!tempName.trim()) return alert("Tên không được để trống!");
    setNickname(tempName);
    setIsEditingName(false);
    localStorage.setItem(`trimi_name_${user.uid}`, tempName);
    if (user) {
      try { await setDoc(doc(db, "users", user.uid), { nickname: tempName }, { merge: true }); }
      catch(e) {}
    }
    showToast('Đã cập nhật biệt danh!');
  };

  const handleProfileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    compressImage(file, async (compressedBase64) => {
      if(type === 'avatar') { setAvatarUrl(compressedBase64); localStorage.setItem(`trimi_avatar_${user.uid}`, compressedBase64); }
      if(type === 'cover') { setCoverUrl(compressedBase64); localStorage.setItem(`trimi_cover_${user.uid}`, compressedBase64); }
      showToast('Đã lưu ảnh cá nhân!');
    });
  };

  // === FIX LỖI CLOUD BẰNG COMPRESS ẢNH ===
  const handleLookbookUpload = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    compressImage(file, async (compressedBase64) => {
      const updatedLookbook = [...lookbook];
      updatedLookbook[index].img = compressedBase64;
      setLookbook(updatedLookbook);
      localStorage.setItem('trimi_lookbook', JSON.stringify(updatedLookbook)); // Update local immediately
      try {
        await setDoc(doc(db, "config", "storefront"), { lookbook: updatedLookbook }, { merge: true });
        showToast('Đã cập nhật trang chủ cho tất cả người dùng!');
      } catch (err) { showToast('Lỗi tải lên Cloud!'); }
    });
  };

  const handleBannerImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    compressImage(file, async (compressedBase64) => {
      setBannerImage(compressedBase64);
      localStorage.setItem('trimi_banner_img', compressedBase64); // Update local immediately
      try {
        await setDoc(doc(db, "config", "storefront"), { bannerImage: compressedBase64 }, { merge: true });
        showToast('Đã đổi ảnh Banner thành công!');
      } catch(err) { showToast('Lỗi tải lên Cloud!'); }
    });
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
  const handleSaveBanner = async () => {
    setIsEditingBanner(false);
    localStorage.setItem('trimi_banner', JSON.stringify(bannerConfig)); // Update local immediately
    try {
      await setDoc(doc(db, "config", "storefront"), { bannerConfig: bannerConfig }, { merge: true });
      showToast('Đã lưu cấu hình Banner cho toàn thế giới!');
    } catch(err) {}
  };

  const handleAddToCart = (item, e) => {
    e.stopPropagation(); 
    requireLogin(() => {
      setCart((prevCart) => {
        const existingItem = prevCart.find(i => i.id === item.id);
        if (existingItem) return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...prevCart, { ...item, quantity: 1 }];
      });
      showToast(t('addToCart') + '!');
    });
  };

  const updateCartQuantity = (id, delta) => setCart(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));
  const cartItemCount = cart.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = cart.reduce((t, i) => t + (i.price * i.quantity), 0).toFixed(2);

  const handleDeleteProduct = (id) => {
    if(window.confirm("Xóa sản phẩm này khỏi hệ thống?")) {
      setLocalProducts(localProducts.filter(p => p.id !== id));
      showToast(t('adminDel') + '!');
    }
  };

  const handleSubmitNewProduct = () => {
    if (!newProd.name || !newProd.price || !newProd.imagePreview) return alert("Vui lòng điền đủ thông tin!");
    const product = { id: Date.now().toString(), name: newProd.name, price: parseFloat(newProd.price), rating: 5.0, reviews: 0, imageUrl: newProd.imagePreview, description: newProd.desc || 'Sản phẩm chính hãng.' };
    setLocalProducts([product, ...localProducts]);
    setShowAddModal(false);
    setNewProd({ name: '', price: '', desc: '', imagePreview: null });
    showToast('Đã thêm sản phẩm lên cửa hàng!');
  };

  const fakeColorSpheres = ['from-white to-slate-300', 'from-zinc-700 to-black', 'from-amber-200 to-amber-600', 'from-sky-300 to-sky-600'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Water+Brush&display=swap');
        .font-brush { font-family: 'Water Brush', cursive; }
        html, body, #root { overflow: visible !important; overflow-y: auto !important; height: auto !important; min-height: 100vh !important; }
      `}</style>

      <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col relative">
        
        {/* ==============================================
            BONG BÓNG CHAT VÀ THÔNG BÁO TIN NHẮN MỚI
            ============================================== */}
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9000] flex flex-col items-end">
          
          {/* MENU TRỢ GIÚP (KHÁCH) */}
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
                 <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t('chatWithUs')}</p>
                 <div onClick={() => requireLogin(openUserChat)} className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm group relative">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover"/> : <FiUser className="text-xl"/>}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">{t('chatAdmin')}</span>
                      <span className="text-xs text-slate-500">{t('replyFast')}</span>
                    </div>
                    {/* BÁO TIN MỚI TRONG MENU */}
                    {hasUnreadUser && <div className="absolute top-1/2 -translate-y-1/2 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
                 </div>
              </div>
              <div className="p-4">
                 <div className="flex justify-between items-center mb-3">
                   <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">{t('faqs')}</p>
                   <FiSearch className="text-slate-400"/>
                 </div>
                 <div className="space-y-1">
                   <button className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg text-slate-700 text-sm font-medium transition-colors"><FiUser className="text-lg text-slate-400"/> {t('faqAcc')}</button>
                   <button className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg text-slate-700 text-sm font-medium transition-colors"><FiCreditCard className="text-lg text-slate-400"/> {t('faqBill')}</button>
                   <button className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg text-slate-700 text-sm font-medium transition-colors"><FiTruck className="text-lg text-slate-400"/> {t('faqShip')}</button>
                 </div>
              </div>
            </div>
          )}

          {/* HỘP THƯ CHAT CHO ADMIN (NỔI) */}
          {isAdmin && isHelpOpen && !adminChatUser && (
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
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-slate-600">{u.nickname?.charAt(0).toUpperCase() || 'U'}</div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      </div>
                      <div className="flex-col flex flex-grow">
                        <span className="text-sm font-bold text-slate-800">{u.nickname || u.email?.split('@')[0]}</span>
                        <span className="text-xs text-slate-500">{u.isOnline ? t('online') : t('offline')}</span>
                      </div>
                      {/* BÁO TIN MỚI CHO ADMIN */}
                      {u.hasUnreadAdmin && <div className="w-3 h-3 bg-red-500 rounded-full mr-2 shadow-sm animate-pulse"></div>}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* GIAO DIỆN CHAT CỦA KHÁCH HÀNG */}
          {!isAdmin && isChatBoxOpen && (
            <div className="bg-white w-[340px] h-[480px] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] mb-4 overflow-hidden border border-slate-200 animate-fade-in-up origin-bottom-right flex flex-col">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center rounded-t-2xl shadow-md z-10">
                <button onClick={() => { setIsChatBoxOpen(false); setIsHelpOpen(true); }} className="text-slate-300 hover:text-white flex items-center gap-2 font-bold text-sm">
                  <FiCornerUpLeft/> Quay lại
                </button>
                <button onClick={() => setIsChatBoxOpen(false)} className="text-slate-400 hover:text-white p-1"><FiX className="text-xl"/></button>
              </div>
              <div ref={chatContainerRef} className="flex-grow bg-slate-50 p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
                <div className="flex justify-center mb-2"><span className="text-xs text-slate-400 font-medium bg-white px-3 py-1 rounded-full border border-slate-100">Hôm nay</span></div>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm font-brush text-lg">T</div>
                    )}
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                 <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleUserSendMessage()} placeholder={t('sendMsg')} className="flex-grow bg-slate-100 text-slate-800 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-300" />
                 <button onClick={handleUserSendMessage} className={`p-2.5 rounded-full flex items-center justify-center transition-colors ${chatInput.trim() ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}><FiSend/></button>
              </div>
            </div>
          )}

          {/* GIAO DIỆN CHAT CỦA ADMIN (TRONG BUBBLE) */}
          {isAdmin && isHelpOpen && adminChatUser && (
            <div className="bg-white w-[340px] h-[480px] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] mb-4 overflow-hidden border border-slate-200 animate-fade-in-up origin-bottom-right flex flex-col">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center rounded-t-2xl shadow-md z-10">
                <button onClick={() => setAdminChatUser(null)} className="text-slate-300 hover:text-white flex items-center gap-2 font-bold text-sm">
                  <FiCornerUpLeft/> Quay lại
                </button>
                <div className="flex items-center gap-2">
                   <div className={`w-2.5 h-2.5 rounded-full ${adminChatUser.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                   <span className="text-sm font-bold truncate max-w-[120px]">{adminChatUser.nickname || adminChatUser.email?.split('@')[0]}</span>
                </div>
              </div>
              <div ref={adminChatContainerRef} className="flex-grow bg-slate-50 p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
                {(!adminChatUser.messages || adminChatUser.messages.length === 0) ? (
                  <p className="text-center text-sm text-slate-400 mt-10">Chưa có tin nhắn nào.</p>
                ) : (
                  adminChatUser.messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.sender === 'bot' ? 'ml-auto flex-row-reverse' : ''}`}>
                      {msg.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 font-bold">{adminChatUser.email?.charAt(0).toUpperCase()}</div>
                      )}
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'bot' ? 'bg-sky-500 text-white rounded-tr-sm' : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                 <input type="text" value={adminChatInput} onChange={e => setAdminChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAdminSendMessage()} placeholder="Trả lời khách..." className="flex-grow bg-slate-100 text-slate-800 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-sky-500" />
                 <button onClick={handleAdminSendMessage} className={`p-2.5 rounded-full flex items-center justify-center transition-colors ${adminChatInput.trim() ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}><FiSend/></button>
              </div>
            </div>
          )}

          {/* NÚT BONG BÓNG MẶC ĐỊNH */}
          {(!isChatBoxOpen && (!isAdmin || (!isHelpOpen && !adminChatUser))) && (
            <button onClick={() => setIsHelpOpen(!isHelpOpen)} className="relative w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-black hover:scale-105 transition-all">
               {isHelpOpen ? <FiX className="text-2xl" /> : <FiMessageCircle className="text-2xl" />}
               
               {/* CHUÔNG BÁO SỐ LƯỢNG TIN NHẮN */}
               {!isAdmin && hasUnreadUser && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">1</span>}
               {isAdmin && totalAdminUnread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">{totalAdminUnread}</span>}
            </button>
          )}
        </div>

        {toastMsg && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 flex items-center justify-center z-[5000] shadow-2xl animate-fade-in-up rounded-full pointer-events-none">
             <FiCheckCircle className="text-xl mr-2 text-emerald-400"/>
             <p className="font-semibold text-sm tracking-wide">{toastMsg}</p>
          </div>
        )}

        {/* HEADER CÓ DỊCH THUẬT */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
           <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
              <div className="flex items-center gap-8 w-full md:w-auto">
                 <h1 className="text-5xl md:text-[52px] font-brush tracking-wide cursor-pointer text-slate-900" onClick={() => setCurrentView('home')} style={{ lineHeight: '1' }}>
                   Trimi
                 </h1>
                 <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600 uppercase tracking-widest pt-2">
                   <button onClick={() => setCurrentView('home')} className={`pb-1 border-b-2 transition-colors ${currentView === 'home' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>{t('home')}</button>
                   <button onClick={() => setCurrentView('shop')} className={`pb-1 border-b-2 transition-colors ${currentView === 'shop' ? 'border-slate-900 text-slate-900' : 'border-transparent hover:text-slate-900'}`}>{t('shop')}</button>
                   <button className="pb-1 border-b-2 border-transparent hover:text-slate-900 transition-colors">{t('men')}</button>
                   <button className="pb-1 border-b-2 border-transparent hover:text-slate-900 transition-colors">{t('women')}</button>
                 </nav>
                 <div className="flex md:hidden items-center gap-4 text-slate-800 ml-auto pt-2">
                    {isAuthenticated ? (
                      <>
                        <button onClick={() => setCurrentView('profile')} className="text-slate-800"><FiUser className="text-2xl"/></button>
                        <div className="relative p-1 cursor-pointer" onClick={() => setIsCartOpen(true)}>
                          <FiShoppingCart className="text-2xl"/>
                          {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-sky-500 text-white w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full">{cartItemCount}</span>}
                        </div>
                      </>
                    ) : (
                      <button onClick={() => setShowLoginModal(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold">{t('login')}</button>
                    )}
                 </div>
              </div>

              <div className="w-full md:w-auto md:max-w-[250px] flex-grow lg:mx-6 flex bg-slate-100 rounded-full h-10 overflow-hidden border border-transparent focus-within:border-slate-300 focus-within:bg-white transition-all shadow-inner mt-2 md:mt-0">
                 <input type="text" placeholder={t('search')} className="w-full px-4 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400 font-medium"/>
                 <button className="px-4 text-slate-500 hover:text-sky-500 transition-colors"><FiSearch className="text-lg"/></button>
              </div>

              <div className="hidden md:flex gap-5 items-center text-sm font-semibold text-slate-700 pt-2">
                 {/* BỘ CHUYỂN ĐỔI NGÔN NGỮ */}
                 <div className="relative">
                   <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-1.5 font-bold text-slate-500 hover:text-slate-900 transition-colors bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
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
                   <>
                     <button onClick={() => setCurrentView('profile')} className="flex items-center gap-2 hover:text-sky-600 transition-colors pl-2 border-l border-slate-200">
                        {avatarUrl ? <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover border border-slate-200"/> : <FiUser className="text-xl"/>}
                        <span className="max-w-[100px] truncate">{nickname}</span>
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
                        <span>{t('cart')}</span>
                     </div>
                   </>
                 ) : (
                   <button onClick={() => setShowLoginModal(true)} className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md ml-2">
                     {t('login')}
                   </button>
                 )}
              </div>
           </div>
        </header>

        <main className="flex-grow flex flex-col">

          {/* TRANG CHỦ MỘC MẠC */}
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
                 <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 uppercase tracking-tighter">{t('sloganTitle')}</h2>
                 <p className="text-slate-500 max-w-2xl mx-auto mb-10 font-medium">{t('sloganDesc')}</p>
                 <button onClick={() => setCurrentView('shop')} className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-black transition-transform hover:scale-105 shadow-xl shadow-slate-900/20">
                   {t('explore')}
                 </button>
               </div>
            </div>
          )}
          
          {/* CỬA HÀNG */}
          {currentView === 'shop' && (
            <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-8 md:py-10 animate-fade-in">
              <div className="bg-[#eef5fc] rounded-[32px] p-8 md:p-12 mb-10 border border-blue-50 flex flex-col md:flex-row items-center justify-between shadow-sm overflow-hidden relative min-h-[320px]">
                
                <div className="max-w-xl relative z-10 pointer-events-none whitespace-pre-line">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">{t('newCol')}</span>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">{t('heroTitle')}</h2>
                  <p className="text-slate-600 mb-6 font-medium">{t('heroDesc')}</p>
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
                <span>/</span><span>{t('shop')}</span><span>/</span><span className="text-slate-800 truncate">{selectedProduct.name}</span>
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
                    <div className="flex items-center gap-3"><FiTruck className="text-2xl text-sky-500"/> {t('ship')}</div>
                    <div className="flex items-center gap-3"><FiShield className="text-2xl text-emerald-500"/> {t('return')}</div>
                  </div>
                  <div className="mb-12">
                    <p className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">{t('desc')}</p>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">{selectedProduct.description}</p>
                  </div>
                  <button onClick={(e) => handleAddToCart(selectedProduct, e)} className="mt-auto w-full bg-slate-900 text-white py-5 rounded-full font-black text-sm tracking-widest uppercase hover:bg-black transition-transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20">
                    <FiShoppingCart className="text-xl"/> {t('addToCart')}
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
                      <FiCamera className="text-lg"/> {t('changeCover')}
                    </label>
                    <input type="file" id="coverUpload" accept="image/*" onChange={(e) => handleProfileUpload(e, 'cover')} className="hidden" />
                  </div>
                </div>
                
                <div className="px-6 md:px-12 pb-8 relative">
                  <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-full p-1.5 absolute -top-16 md:-top-24 border border-slate-100 shadow-xl z-10">
                    <div className="w-full h-full bg-slate-900 text-white rounded-full flex items-center justify-center text-5xl font-black relative overflow-hidden group">
                      {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar"/> : nickname.charAt(0).toUpperCase() || 'U'}
                      <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <FiCamera className="text-white text-3xl"/>
                      </label>
                      <input type="file" id="avatarUpload" accept="image/*" onChange={(e) => handleProfileUpload(e, 'avatar')} className="hidden" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 pb-2 gap-3 relative z-20">
                    <button onClick={handleLogout} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2">
                      <FiLogOut/> {t('logout')}
                    </button>
                    {isAdmin && (
                      <button onClick={() => setCurrentView('admin')} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-md">
                        <FiSettings/> {t('adminMenu')}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0 relative z-20">
                    {!isEditingName ? (
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                        {nickname}
                        <button onClick={() => {setTempName(nickname); setIsEditingName(true)}} className="text-sm text-slate-400 hover:text-sky-500 transition-colors p-1 bg-slate-50 rounded-full border border-slate-100" title="Đổi biệt danh"><FiEdit3/></button>
                      </h2>
                    ) : (
                      <div className="flex items-center gap-3 mb-2">
                        <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="border-b-2 border-sky-500 text-3xl md:text-4xl font-black text-slate-900 outline-none bg-transparent w-64 md:w-80" autoFocus placeholder="Nhập biệt danh..."/>
                        <button onClick={handleSaveName} className="bg-slate-900 text-white p-2 rounded-full hover:bg-sky-500 shadow-md transition-colors"><FiCheckCircle className="text-lg"/></button>
                        <button onClick={() => setIsEditingName(false)} className="bg-slate-100 text-slate-500 p-2 rounded-full hover:bg-red-500 hover:text-white shadow-md transition-colors"><FiX className="text-lg"/></button>
                      </div>
                    )}
                    <p className="text-slate-500 font-medium mb-4 mt-2">{user?.email}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">{t('roleCustomer')}</span>
                      <span className="bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"><FiCheckCircle/> {t('roleVerified')}</span>
                      {isAdmin && <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold">{t('roleAdmin')}</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-8 border-t border-slate-100 pt-6 overflow-x-auto custom-scrollbar relative z-20">
                    <button className="text-slate-900 font-black border-b-4 border-slate-900 pb-2 whitespace-nowrap uppercase tracking-widest text-sm">{t('myOrders')}</button>
                    <button className="text-slate-400 font-bold hover:text-slate-900 pb-2 whitespace-nowrap transition-colors uppercase tracking-widest text-sm">{t('wishlist')}</button>
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
                  <button onClick={() => setCurrentView('profile')} className="hover:text-slate-800 transition-colors flex items-center gap-1"><FiCornerUpLeft/> {t('account')}</button>
                  <span>/</span><span className="text-slate-800 truncate">{t('adminMenu')}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                   <h2 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3"><FiArchive className="text-slate-900"/> {t('adminDashboard')}</h2>
                   <button onClick={() => setShowAddModal(true)} className="bg-sky-500 text-white px-6 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20">
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
                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm"><img src={item.imageUrl} className="w-full h-full object-contain mix-blend-multiply" alt=""/></div>
                          </td>
                          <td className="p-5 font-bold text-base text-slate-800 max-w-[250px] truncate">{item.name}</td>
                          <td className="p-5 font-black text-slate-900 text-lg">${item.price}</td>
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

        {/* CHÂN TRANG ĐƯỢC DỊCH THUẬT */}
        <footer className="bg-[#111111] text-white pt-16 pb-8 mt-auto border-t border-slate-800 flex-shrink-0 z-30 relative">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
              <div className="lg:col-span-1">
                <h2 className="text-[60px] md:text-[70px] font-brush mb-2 leading-[0.8] tracking-wider">Trimi</h2>
                <div className="flex gap-4 text-slate-400 mt-6">
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"><FiInstagram className="text-lg"/></div>
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"><FaFacebook className="text-lg"/></div>
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"><FiLinkedin className="text-lg"/></div>
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"><FiYoutube className="text-lg"/></div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6">{t('f_prod')}</h4>
                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_all')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_men')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_women')}</li>
                  <li className="hover:text-white cursor-pointer transition-colors">{t('f_acc')}</li>
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

        {/* ==============================================
            CÁC MODALS (CỐ ĐỊNH, DỊCH THUẬT)
            ============================================== */}
        {showLoginModal && !isAuthenticated && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 animate-fade-in">
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
                <h3 className="text-3xl font-black text-slate-900 mb-8">{authMode === 'login' ? t('login') : 'Tạo tài khoản mới'}</h3>
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
                    {authMode === 'login' ? t('login') : 'Đăng Ký'}
                  </button>
                </div>
                <div className="text-center text-sm font-medium text-slate-600 mb-8">
                  {authMode === 'login' ? <>Chưa có tài khoản? <button onClick={() => setAuthMode('register')} className="text-sky-600 font-bold hover:underline">Tạo ngay</button></> : <>Đã có tài khoản? <button onClick={() => setAuthMode('login')} className="text-sky-600 font-bold hover:underline">Đăng nhập</button></>}
                </div>
              </div>
            </div>
          </div>
        )}

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

        {showAddModal && isAdmin && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
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
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setNewProd({ ...newProd, imagePreview: URL.createObjectURL(file) });
                      }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {newProd.imagePreview ? <img src={newProd.imagePreview} className="h-40 object-contain mix-blend-multiply drop-shadow-md" alt="Preview" /> : <><FiUploadCloud className="text-5xl text-slate-300 mb-3 group-hover:text-sky-500 transition-colors"/><p className="text-sm font-medium text-slate-500">Bấm hoặc kéo thả ảnh vào đây</p></>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">{t('adminName')}</label>
                      <input type="text" value={newProd.name} onChange={(e) => setNewProd({...newProd, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">{t('adminPrice')} ($)</label>
                      <input type="number" value={newProd.price} onChange={(e) => setNewProd({...newProd, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-sky-500 focus:bg-white transition-all text-sm font-medium"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">{t('desc')}</label>
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
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><FiShoppingCart className="text-sky-500"/> {t('cart')} ({cartItemCount})</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition-colors"><FiX className="text-xl"/></button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-slate-50/50">
                {cart.length === 0 ? (
                  <div className="text-center mt-32 flex flex-col items-center">
                    <div className="w-32 h-32 bg-white shadow-sm rounded-full flex items-center justify-center mb-6"><FiShoppingCart className="text-6xl text-slate-200"/></div>
                    <p className="text-slate-500 font-medium mb-8 text-base">{t('emptyCart')}</p>
                    <button onClick={() => {setIsCartOpen(false); setCurrentView('shop')}} className="px-10 py-4 bg-slate-900 text-white text-sm font-bold tracking-widest uppercase rounded-full shadow-lg shadow-slate-900/20 hover:bg-black transition-all">{t('startShop')}</button>
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
                      <button onClick={() => removeFromCart(item.id)} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors" title={t('adminDel')}>
                        <FiTrash2 className="text-xl"/>
                      </button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-6 md:p-8 border-t border-slate-100 bg-white">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('total')}</span>
                    <span className="text-4xl font-black text-slate-900">${cartTotal}</span>
                  </div>
                  <button onClick={() => { alert(`Thanh toán thành công đơn hàng $${cartTotal}!`); setCart([]); setIsCartOpen(false); }} className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-full text-sm font-bold tracking-widest uppercase shadow-xl shadow-slate-900/20 transition-all flex justify-center items-center gap-2">
                    <FiCheckCircle className="text-lg"/> {t('checkout')}
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