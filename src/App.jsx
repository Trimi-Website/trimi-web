import { Suspense, useState, useRef, useEffect, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Icons
import { FiSliders, FiMenu, FiMic, FiSave, FiImage, FiMusic, FiMail, FiLock, FiLogOut, FiUpload, FiRefreshCcw, FiCpu, FiAlertTriangle, FiShoppingBag, FiSearch, FiChevronDown, FiUser, FiStar, FiTruck, FiShield, FiCornerUpLeft, FiX, FiPlayCircle } from 'react-icons/fi';
import { BiCloset } from 'react-icons/bi';
import { FcGoogle } from 'react-icons/fc';

// Firebase
import { auth, googleProvider, db, storage } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// =========================================================
// 0. ERROR BOUNDARY
// =========================================================
class CanvasErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, errorMsg: '' }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorMsg: error.message }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50 p-8 text-center backdrop-blur-md">
          <FiAlertTriangle className="text-5xl text-sky-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">LỖI TẢI FILE 3D</h2>
          <p className="text-slate-500 font-mono text-xs mb-6 bg-slate-100 p-4 rounded-lg border border-slate-200">{this.state.errorMsg}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2 bg-sky-500 text-white rounded-md font-medium text-sm hover:bg-sky-600 transition-all">Tải lại trang</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// =========================================================
// 1. COMPONENT NHÂN VẬT 
// =========================================================
function Character({ modelUrl, equippedShirtUrl, manualScale, manualOffsetY, shirtScale }) {
  const { scene: bodyScene } = useGLTF(modelUrl);
  const { scene: shirtScene } = useGLTF(equippedShirtUrl || modelUrl); 
  
  const groupRef = useRef();
  const shirtRef = useRef();
  const [modelConfig, setModelConfig] = useState({ scale: 1, position: [0, 0, 0] });

  // Tính toán Base Size
  useEffect(() => {
    if (bodyScene) {
      const box = new THREE.Box3().setFromObject(bodyScene);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const targetHeight = 6.2; 
      const scaleRatio = targetHeight / size.y;
      const floorY = -3.1;
      const posY = floorY - (box.min.y * scaleRatio);
      setModelConfig({ scale: scaleRatio, position: [-center.x * scaleRatio, posY, -center.z * scaleRatio] });

      bodyScene.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    }
  }, [bodyScene, modelUrl]);

  // Thuật toán đo ngực và ướm áo AI
  useEffect(() => {
    if(shirtScene && equippedShirtUrl && equippedShirtUrl !== modelUrl) {
      shirtScene.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
      const bodyBox = new THREE.Box3().setFromObject(bodyScene);
      const bodySize = new THREE.Vector3();
      const bodyCenter = new THREE.Vector3();
      bodyBox.getSize(bodySize);
      bodyBox.getCenter(bodyCenter);

      const shirtBox = new THREE.Box3().setFromObject(shirtScene);
      const shirtSize = new THREE.Vector3();
      const shirtCenter = new THREE.Vector3();
      shirtBox.getSize(shirtSize);
      shirtBox.getCenter(shirtCenter);

      if (shirtRef.current) {
        const autoScale = (bodySize.x / shirtSize.x) * 1.1; 
        shirtRef.current.scale.set(autoScale, autoScale, autoScale);
        const chestY = bodyBox.min.y + (bodySize.y * 0.7);
        shirtRef.current.position.set(
          bodyCenter.x - (shirtCenter.x * autoScale),
          chestY - (shirtCenter.y * autoScale),
          bodyCenter.z - (shirtCenter.z * autoScale)
        );
      }
    }
  }, [shirtScene, bodyScene, equippedShirtUrl, modelUrl]);

  // SỨC SỐNG: Hiệu ứng thở và xoay nhẹ nhàng
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = modelConfig.position[1] + manualOffsetY + Math.sin(t * 1.5) * 0.015;
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[modelConfig.position[0], 0, modelConfig.position[2]]}>
      <primitive object={bodyScene} scale={modelConfig.scale * manualScale} />
      {equippedShirtUrl && equippedShirtUrl !== modelUrl && (
        <group ref={shirtRef}><primitive object={shirtScene} scale={shirtScale} /></group>
      )}
    </group>
  );
}

// =========================================================
// 2. COMPONENT CHÍNH APP
// =========================================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [user, setUser] = useState(null);
  const [isRigging, setIsRigging] = useState(false);
  const [rigProgress, setRigProgress] = useState(0);

  const [currentView, setCurrentView] = useState('shop'); 
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [showInline3D, setShowInline3D] = useState(false); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [modelUrl, setModelUrl] = useState('/7_3_2026.glb'); 
  const [equippedShirtUrl, setEquippedShirtUrl] = useState(null); 
  const [bgImage, setBgImage] = useState("url('/bg_default.jpg')"); 

  const [isPlaying, setIsPlaying] = useState(false); 
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showMenu, setShowMenu] = useState(false); 
  
  const [manualScale, setManualScale] = useState(0.85); 
  const [manualOffsetY, setManualOffsetY] = useState(0.0); 
  const [shirtScale, setShirtScale] = useState(1); 

  const [clothingItems, setClothingItems] = useState([]);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [equippingItem, setEquippingItem] = useState(null);

  const controlsRef = useRef(); 
  const imageInputRef = useRef(null);
  const modelInputRef = useRef(null); 
  const audioInputRef = useRef(null);
  const audioRef = useRef(null); 

  // FETCH API SẢN PHẨM
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://fakestoreapi.com/products/category/men's%20clothing");
        const data = await response.json();
        const formattedProducts = data.map((item) => ({
          id: item.id.toString(),
          name: item.title,
          price: `$${item.price.toFixed(2)}`, 
          rating: item.rating.rate,
          reviews: item.rating.count,
          imageUrl: item.image,
          fileUrl: '/shirt.glb', 
          type: 'Thời trang Nam',
          description: item.description
        }));
        setClothingItems(formattedProducts);
        setIsLoadingShop(false);
      } catch (error) {
        console.error("Lỗi kéo API:", error);
        setIsLoadingShop(false);
      }
    };
    fetchProducts();
  }, []);

  // KIỂM TRA ĐĂNG NHẬP FIREBASE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.bgImage) setBgImage(data.bgImage);
          if (data.modelUrl) setModelUrl(data.modelUrl);
          if (data.musicUrl && audioRef.current) audioRef.current.src = data.musicUrl;
          if (data.equippedShirtUrl) setEquippedShirtUrl(data.equippedShirtUrl);
          if(data.manualScale) setManualScale(data.manualScale);
          if(data.manualOffsetY !== undefined) setManualOffsetY(data.manualOffsetY);
          if(data.shirtScale) setShirtScale(data.shirtScale);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const startAutoRigProcess = () => {
    setIsRigging(true);
    setRigProgress(0);
    const interval = setInterval(() => {
      setRigProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsRigging(false), 500);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleEmailAuth = async () => {
    if (!email || !email.includes('@')) return alert("Vui lòng nhập email hợp lệ.");
    if (password.length < 6) return alert("Mật khẩu phải có ít nhất 6 ký tự!");
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
    setShowMenu(false);
    setCurrentView('shop'); 
    setShowInline3D(false);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const localUrl = URL.createObjectURL(file);
    if (type === 'bg') setBgImage(`url('${localUrl}')`);
    if (type === 'music') { 
      audioRef.current.src = localUrl; 
      audioRef.current.play(); 
      setIsPlaying(true); 
    }
    if (type === 'model') { setModelUrl(localUrl); startAutoRigProcess(); }
    
    try {
      const storageRef = ref(storage, `users/${user.uid}/${type}_${file.name}`);
      await uploadBytes(storageRef, file);
      const firebaseUrl = await getDownloadURL(storageRef);
      const updateData = {};
      if (type === 'bg') updateData.bgImage = `url('${firebaseUrl}')`;
      if (type === 'music') updateData.musicUrl = firebaseUrl;
      if (type === 'model') updateData.modelUrl = firebaseUrl;
      await setDoc(doc(db, "users", user.uid), updateData, { merge: true });
    } catch (error) { console.error(error); }
    setShowMenu(false);
  };

  const handleSaveData = async () => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { 
      bgImage, modelUrl, equippedShirtUrl, 
      musicUrl: audioRef.current?.src || "",
      manualScale, manualOffsetY, shirtScale 
    }, { merge: true });
    alert("Đã lưu thiết lập lên Đám mây!");
    setShowMenu(false);
  };

  const toggleMusic = () => {
    if (!audioRef.current.getAttribute('src')) { 
      audioInputRef.current.click(); 
      return; 
    }
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleInlineEquip = (item) => {
    setEquippingItem(item.id);
    setTimeout(() => {
      setEquippedShirtUrl(item.fileUrl); 
      setShowInline3D(true); 
      setEquippingItem(null);
    }, 1500);
  };

  // =========================================================
  // GIAO DIỆN 1: LOGIN 
  // =========================================================
  if (!isAuthenticated) {
    return (
      <div className="w-screen h-screen relative flex items-center justify-center bg-slate-50 transition-all">
        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: "url('/bg_default.jpg')" }}></div>
        <div className="relative z-10 bg-white/95 backdrop-blur-md p-10 rounded-xl w-[380px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-200">
          <div className="flex justify-center mb-6"><h1 className="text-5xl font-black tracking-tighter text-sky-500">Trimi.</h1></div>
          <h2 className="text-lg font-bold text-center text-slate-800 mb-8">{authMode === 'login' ? 'Đăng nhập hệ thống' : 'Tạo tài khoản mới'}</h2>
          
          <div className="flex flex-col gap-4">
            <div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email của bạn" className="w-full bg-slate-50 text-slate-800 rounded-md py-3 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-sky-400 border border-slate-200 transition-all" /></div>
            <div className="relative"><FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Mật khẩu" className="w-full bg-slate-50 text-slate-800 rounded-md py-3 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-sky-400 border border-slate-200 transition-all" /></div>
            <button onClick={handleEmailAuth} className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-md py-3 font-bold text-sm transition-all mt-2">{authMode === 'login' ? 'TIẾP TỤC' : 'ĐĂNG KÝ'}</button>
            <div className="flex items-center py-2"><div className="flex-grow border-t border-slate-200"></div><span className="mx-4 text-slate-400 text-xs font-semibold">HOẶC</span><div className="flex-grow border-t border-slate-200"></div></div>
            <button onClick={handleGoogleLogin} className="w-full bg-white border border-slate-300 text-slate-700 rounded-md py-3 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"><FcGoogle className="text-lg" /> Đăng nhập với Google</button>
          </div>
          <div className="mt-6 text-center text-xs text-slate-500">{authMode === 'login' ? <>Chưa có tài khoản? <button onClick={() => setAuthMode('register')} className="text-sky-500 font-bold hover:underline">Đăng ký</button></> : <>Đã có tài khoản? <button onClick={() => setAuthMode('login')} className="text-sky-500 font-bold hover:underline">Đăng nhập</button></>}</div>
        </div>
      </div>
    );
  }

  if (isRigging) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-50 transition-all">
        <div className="relative z-10 flex flex-col items-center">
          <FiCpu className="text-6xl text-sky-500 animate-pulse mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Đang đồng bộ 3D...</h2>
          <p className="text-slate-500 mb-8 font-mono text-xs uppercase tracking-widest">AI Auto-Rigging Processing</p>
          <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${rigProgress}%` }}></div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // GIAO DIỆN CHÍNH APP
  // =========================================================
  return (
    <div className="w-screen h-screen relative overflow-hidden font-sans bg-slate-50 text-slate-800 transition-all duration-700">
      <audio ref={audioRef} loop />
      <input type="file" ref={imageInputRef} onChange={(e) => handleFileUpload(e, 'bg')} accept="image/*" className="hidden" />
      <input type="file" ref={audioInputRef} onChange={(e) => handleFileUpload(e, 'music')} accept="audio/*" className="hidden" />
      <input type="file" ref={modelInputRef} onChange={(e) => handleFileUpload(e, 'model')} accept=".glb,.gltf" className="hidden" />
      
      {/* SÀN MUA SẮM HOẶC CHI TIẾT SẢN PHẨM */}
      {(currentView === 'shop' || currentView === 'productDetail') && (
        <div className="absolute inset-0 z-50 overflow-y-auto bg-slate-50 custom-scrollbar flex flex-col animate-fade-in">
          
          {/* HEADER XANH BABY CHUẨN */}
          <div className="bg-sky-500 shadow-sm flex-shrink-0">
             <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white cursor-pointer" onClick={() => {setCurrentView('shop'); setShowInline3D(false);}}>Trimi</h1>
                
                <div className="flex-grow max-w-lg mx-6 flex bg-white rounded shadow-sm h-10 overflow-hidden">
                   <input type="text" placeholder="Tìm kiếm trang phục, phụ kiện..." className="w-full px-4 text-sm outline-none text-slate-700"/>
                   <button className="bg-sky-50 px-4 text-sky-600 hover:bg-sky-100 transition border-l border-slate-200"><FiSearch className="text-lg"/></button>
                </div>

                <div className="flex gap-5 items-center text-sm font-medium text-white">
                   <div className="flex items-center gap-1.5 cursor-pointer hover:text-sky-100" onClick={() => setCurrentView('tryon')}>
                      <FiUser className="text-2xl"/>
                      <div className="flex flex-col leading-tight">
                         <span className="text-[10px] opacity-80">Tài khoản</span>
                         <span className="font-bold">Phòng Thử 3D</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-1.5 cursor-pointer hover:text-sky-100">
                      <div className="relative">
                        <FiShoppingBag className="text-2xl"/>
                        <span className="absolute -top-1 -right-2 bg-white text-sky-600 w-4 h-4 flex items-center justify-center text-[10px] font-black rounded-full shadow-sm">0</span>
                      </div>
                   </div>
                   <button onClick={handleLogout} className="text-white/80 hover:text-white ml-2" title="Đăng xuất"><FiLogOut className="text-xl"/></button>
                </div>
             </div>
          </div>
          
          {/* SUB HEADER TRẮNG */}
          <div className="bg-white border-b border-slate-200 text-slate-600 text-xs md:text-sm flex gap-6 px-4 py-2.5 max-w-7xl mx-auto w-full shadow-sm flex-shrink-0">
            <button className="font-bold flex items-center gap-1 hover:text-sky-500"><FiMenu/> Danh mục</button>
            <button className="hover:text-sky-500">Bán chạy nhất</button>
            <button className="hover:text-sky-500 font-semibold text-sky-600" onClick={() => setCurrentView('tryon')}>Trải nghiệm 3D</button>
          </div>

          {/* GIAO DIỆN SÀN MUA SẮM (GRID) */}
          {currentView === 'shop' && (
            <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 pb-20">
              {isLoadingShop ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-70">
                  <FiRefreshCcw className="text-4xl text-sky-500 animate-spin mb-4" />
                  <span className="font-semibold text-slate-500">Đang tải sản phẩm từ cửa hàng...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {clothingItems.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-sm transition-all group hover:shadow-md flex flex-col overflow-hidden cursor-pointer" onClick={() => { setSelectedProduct(item); setCurrentView('productDetail'); setShowInline3D(false); }}>
                      
                      {/* KHUNG ẢNH CÓ NÚT THỬ 3D NẰM BÊN TRONG */}
                      <div className="w-full aspect-[4/5] bg-white relative overflow-hidden flex items-center justify-center p-2 group/image">
                         <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain group-hover/image:scale-105 transition-transform duration-300" />
                         
                         {/* Nút Thử 3D nhỏ gọn */}
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleEquipItem(item); setCurrentView('tryon'); }} 
                           className="absolute bottom-2 right-2 bg-sky-500/90 backdrop-blur text-white py-1.5 px-3 rounded text-[10px] font-bold shadow-md hover:bg-sky-600 transition-all flex items-center gap-1 z-10"
                         >
                           <FiCpu className="text-[12px]"/> Thử 3D
                         </button>

                         {equippingItem === item.id && (
                           <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20">
                             <FiCpu className="text-3xl text-sky-500 animate-spin" />
                           </div>
                         )}
                      </div>

                      <div className="p-3 flex flex-col flex-grow border-t border-slate-100">
                        <h3 className="text-slate-800 text-xs font-medium mb-1 line-clamp-2 leading-tight group-hover:text-sky-600" title={item.name}>{item.name}</h3>
                        <div className="flex items-center text-amber-400 text-[10px] mb-1.5">
                           <FiStar className="fill-current"/><FiStar className="fill-current"/><FiStar className="fill-current"/><FiStar className="fill-current"/><FiStar className="text-slate-300"/>
                           <span className="text-slate-400 ml-1">Đã bán {item.reviews}</span>
                        </div>
                        <div className="flex-grow"></div>
                        <span className="text-base font-bold text-sky-600 mb-2">{item.price}</span>
                        
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); alert('Đã thêm vào giỏ hàng!'); }} className="w-full bg-white text-sky-600 border border-sky-300 py-1.5 rounded text-xs font-bold hover:bg-sky-50 transition-all">
                            Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GIAO DIỆN TRANG CHI TIẾT SẢN PHẨM & INLINE 3D TRY-ON */}
          {currentView === 'productDetail' && selectedProduct && (
            <div className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 pb-20 animate-fade-in-up">
              
              <div className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                <button onClick={() => {setCurrentView('shop'); setShowInline3D(false);}} className="hover:text-sky-500 font-medium flex items-center gap-1"><FiCornerUpLeft/> Trở về</button>
                <span>/</span> <span>Thời trang Nam</span> <span>/</span> <span className="truncate text-slate-800">{selectedProduct.name}</span>
              </div>

              <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-8">
                
                {/* KHUNG HIỂN THỊ TRÁI (LẬT GIỮA ẢNH 2D VÀ CANVAS 3D INLINE) */}
                <div className="w-full md:w-5/12 aspect-[3/4] bg-slate-50 border border-slate-200 rounded-md relative overflow-hidden flex items-center justify-center shadow-inner">
                  
                  {equippingItem === selectedProduct.id && (
                     <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                        <FiCpu className="text-4xl text-sky-500 animate-spin mb-2"/>
                        <span className="text-sky-600 font-bold text-sm">Đang mặc đồ...</span>
                     </div>
                  )}

                  {!showInline3D ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="w-full h-full absolute inset-0 cursor-move">
                      <CanvasErrorBoundary>
                        {/* CAMERA SETUP CHO INLINE 3D */}
                        <Canvas camera={{ position: [0, 0.8, 5.5], fov: 40 }} shadows>
                           {/* MÀU NỀN SLATE-50 */}
                           <color attach="background" args={['#f8fafc']} /> 
                           <ambientLight intensity={0.6} />
                           <directionalLight position={[-5, 5, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
                           <Environment preset="city" />
                           <Suspense fallback={null}>
                              <Character 
                                modelUrl={modelUrl} 
                                equippedShirtUrl={equippedShirtUrl} 
                                manualScale={manualScale} 
                                manualOffsetY={manualOffsetY} 
                                shirtScale={shirtScale} 
                              />
                              <ContactShadows position={[0, -3.1, 0]} opacity={0.3} scale={5} blur={2.5} far={10} color="#000000" />
                           </Suspense>
                           <OrbitControls makeDefault enablePan={true} panSpeed={0.5} minDistance={2} maxDistance={6} target={[0, 0.5, 0]} />
                        </Canvas>
                      </CanvasErrorBoundary>
                      <button onClick={() => {setShowInline3D(false); setEquippedShirtUrl(null);}} className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-slate-500 hover:text-red-500 shadow-md backdrop-blur-sm">
                        <FiX className="text-lg"/>
                      </button>
                    </div>
                  )}
                </div>

                {/* CỘT THÔNG TIN PHẢI */}
                <div className="w-full md:w-7/12 flex flex-col">
                  <h1 className="text-2xl font-medium text-slate-800 leading-snug mb-3">{selectedProduct.name}</h1>
                  <div className="flex items-center text-sm gap-4 mb-4 border-b border-slate-100 pb-3"><span className="text-amber-500 font-bold flex items-center gap-1 border-r border-slate-300 pr-4">{selectedProduct.rating} <FiStar className="fill-current"/><FiStar className="fill-current"/><FiStar className="fill-current"/><FiStar className="fill-current"/><FiStar className="text-slate-300"/></span><span className="text-slate-600"><span className="font-bold border-b border-slate-600">{selectedProduct.reviews}</span> Đánh Giá</span></div>
                  <div className="bg-slate-50 p-4 rounded-sm mb-6 flex items-center gap-4">
                    <div className="text-3xl font-black text-sky-600">{selectedProduct.price}</div>
                    <div className="bg-sky-100 text-sky-600 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">Freeship Extra</div>
                  </div>
                  <div className="text-sm text-slate-600 mb-6 space-y-4">
                    <div className="flex gap-4"><span className="w-24 text-slate-500">Vận chuyển</span><div className="flex items-start gap-2"><FiTruck className="text-lg text-emerald-500 mt-0.5"/><div><p className="font-medium text-slate-700">Miễn phí vận chuyển</p><p className="text-xs text-slate-500">Nhận hàng trong 3-5 ngày</p></div></div></div>
                    <div className="flex gap-4"><span className="w-24 text-slate-500">Bảo vệ</span><div className="flex items-center gap-2 text-slate-700"><FiShield className="text-lg text-sky-500"/> Đổi trả miễn phí trong 15 ngày</div></div>
                  </div>
                  <div className="flex-grow border-t border-slate-100 pt-4 mb-6">
                    <p className="text-sm text-slate-500 mb-2">Mô tả sản phẩm:</p>
                    <p className="text-sm text-slate-700 line-clamp-3">{selectedProduct.description}</p>
                  </div>
                  <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
                    <button className="flex-1 bg-sky-50 text-sky-600 border border-sky-500 py-3 rounded-sm font-semibold text-sm hover:bg-sky-100 transition flex items-center justify-center gap-2">
                      <FiShoppingBag/> Thêm Vào Giỏ
                    </button>
                    <button className="flex-1 bg-sky-500 text-white py-3 rounded-sm font-semibold text-sm hover:bg-sky-600 transition shadow-md">
                      Mua Ngay
                    </button>
                    {!showInline3D ? (
                      <button onClick={() => handleInlineEquip(selectedProduct)} className="flex-1 bg-slate-800 text-white py-3 rounded-sm font-bold text-sm hover:bg-slate-900 transition flex items-center justify-center gap-2 shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                        <FiCpu className="text-lg text-sky-400"/> THỬ 3D NGAY
                      </button>
                    ) : (
                      <button onClick={() => {setShowInline3D(false); setEquippedShirtUrl(null);}} className="flex-1 bg-red-50 text-red-500 border border-red-200 py-3 rounded-sm font-bold text-sm hover:bg-red-100 transition flex items-center justify-center gap-2">
                        <FiX className="text-lg"/> TẮT 3D
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LỚP RENDER PHÒNG FULL 3D */}
      {currentView === 'tryon' && (
        <div className="absolute inset-0 z-0 bg-slate-200">
          <CanvasErrorBoundary>
            {/* CAMERA FULL SCREEN Z=7.5, TÂM Y=0 */}
            <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }} shadows gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}>
              <color attach="background" args={['#2a2a2a']} /> 
              
              {/* === HỆ THỐNG CHIẾU SÁNG STUDIO ĐƯỢC TỐI ƯU === */}
              {/* 1. Ánh sáng môi trường cơ bản (tăng nhẹ) */}
              <ambientLight intensity={0.8} /> 
              
              {/* 2. Đèn SpotLight chiếu TRỰC DIỆN VÀO KHUÔN MẶT */}
              <spotLight 
                position={[0, 4, 7]} // Đặt phía trước, hơi cao một chút
                angle={0.3} 
                penumbra={1} 
                intensity={3.0} // Cường độ mạnh để làm sáng mặt
                castShadow 
                shadow-mapSize={[2048, 2048]}
              />

              {/* 3. Đèn DirectionalLight bổ trợ (Fill Light) */}
              <directionalLight 
                position={[5, 5, 5]} 
                intensity={1.0} 
                color="#e0f2fe" // Ánh sáng hơi xanh nhẹ
              />
              <directionalLight 
                position={[-5, 2, 2]} 
                intensity={0.5} 
              />
              
              {/* 4. Đèn hắt từ dưới lên để giảm bóng đổ (Key Light phụ) */}
              <directionalLight 
                position={[0, -2, 4]} 
                intensity={0.3} 
              />
              
              <Environment preset="city" />
              <Suspense fallback={null}>
                <Character modelUrl={modelUrl} equippedShirtUrl={equippedShirtUrl} manualScale={manualScale} manualOffsetY={manualOffsetY} shirtScale={shirtScale} />
                <ContactShadows position={[0, -3.1, 0]} opacity={0.6} scale={8} blur={2.0} far={10} color="#000000" resolution={1024} />
              </Suspense>
              <OrbitControls ref={controlsRef} makeDefault enableDamping={true} dampingFactor={0.05} enablePan={true} panSpeed={0.8} minDistance={2} maxDistance={10} target={[0, 0, 0]} />
            </Canvas>
          </CanvasErrorBoundary>
        </div>
      )}

      {/* LỚP UI CHO PHÒNG THỬ ĐỒ FULL MÀN HÌNH */}
      {currentView === 'tryon' && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          
          <div className="absolute top-6 left-6 pointer-events-auto z-20">
             <button onClick={() => setCurrentView('shop')} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-md font-bold text-xs hover:text-sky-500 shadow-sm flex items-center gap-2"><FiCornerUpLeft/> Quay lại Sàn mua sắm</button>
          </div>

          <div className="absolute top-20 left-6 pointer-events-auto flex flex-col gap-3 z-20">
            <button onClick={() => { setShowAdjust(!showAdjust); setShowWardrobe(false); }} className={`w-11 h-11 rounded-md border flex items-center justify-center text-lg shadow-sm ${showAdjust ? 'border-sky-500 text-sky-500 bg-slate-50' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}><FiSliders /></button>
            <button onClick={() => { setShowWardrobe(!showWardrobe); setShowAdjust(false); }} className={`w-11 h-11 rounded-md border flex items-center justify-center text-lg shadow-sm ${showWardrobe ? 'border-sky-500 text-sky-500 bg-slate-50' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}><BiCloset /></button>
          </div>

          {showAdjust && (
            <div className="absolute top-20 left-20 w-64 bg-white p-5 rounded-md border border-slate-200 pointer-events-auto z-10 shadow-lg">
              <h3 className="text-slate-800 font-bold text-sm mb-4 flex items-center gap-2"><FiSliders className="text-sky-500"/> Căn chỉnh Mô hình</h3>
              <div className="mb-4"><label className="text-slate-600 text-xs mb-1.5 block">Kích cỡ người: {manualScale.toFixed(2)}x</label><input type="range" min="0.5" max="2" step="0.05" value={manualScale} onChange={(e) => setManualScale(parseFloat(e.target.value))} className="w-full accent-sky-500 h-1.5" /></div>
              <div className="mb-4"><label className="text-slate-600 text-xs mb-1.5 block">Độ cao sàn (Y): {manualOffsetY.toFixed(2)}</label><input type="range" min="-2" max="2" step="0.05" value={manualOffsetY} onChange={(e) => setManualOffsetY(parseFloat(e.target.value))} className="w-full accent-sky-500 h-1.5" /></div>
              <div className="mb-6 pt-3 border-t border-slate-100">
                 <label className="text-slate-600 text-xs mb-1.5 block font-medium">Khớp cỡ áo: {shirtScale.toFixed(2)}x</label>
                 <input type="range" min="0.5" max="2" step="0.05" value={shirtScale} onChange={(e) => setShirtScale(parseFloat(e.target.value))} className="w-full accent-emerald-500 h-1.5" />
              </div>
              <button onClick={() => {controlsRef.current?.reset(); setManualScale(1); setManualOffsetY(0); setShirtScale(1)}} className="w-full py-2 bg-slate-100 text-slate-600 rounded-md font-semibold text-xs border border-slate-200">Đặt lại (1x, 0.0)</button>
            </div>
          )}

          {showWardrobe && (
            <div className="absolute top-0 left-20 w-[340px] h-full bg-white/95 backdrop-blur-md pointer-events-auto p-5 overflow-y-auto border-r border-slate-200 custom-scrollbar z-10 shadow-2xl animate-fade-in-right">
              <div className="flex justify-between items-center mb-6 pt-4 border-b border-slate-100 pb-3">
                 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BiCloset className="text-sky-500"/> Tủ đồ 3D cá nhân</h2>
                 {equippedShirtUrl && (
                    <button onClick={() => setEquippedShirtUrl(null)} className="text-[10px] bg-red-50 text-red-500 px-3 py-1 rounded-md border border-red-100 hover:bg-red-500 hover:text-white transition-all font-bold">Cởi đồ</button>
                 )}
              </div>
              <div className="grid grid-cols-2 gap-3 pb-20">
                {clothingItems.map((item) => (
                  <div key={item.id} onClick={() => {setEquippedShirtUrl(item.fileUrl)}} className="bg-white border border-slate-200 rounded-md p-2 hover:border-sky-500 cursor-pointer transition-all group shadow-sm">
                    <div className="w-full aspect-[4/5] rounded-sm mb-2 overflow-hidden bg-white"><img src={item.imageUrl} className="w-full h-full object-contain p-1" alt=""/></div>
                    <h3 className="text-slate-700 text-[10px] font-bold truncate">{item.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="absolute top-6 right-6 pointer-events-auto flex flex-col items-end z-30">
            <button onClick={() => setShowMenu(!showMenu)} className={`w-11 h-11 rounded-md border flex items-center justify-center text-xl shadow-sm ${showMenu ? 'border-sky-500 text-sky-500 bg-slate-50' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}><FiMenu /></button>
            {showMenu && (
              <div className="mt-2 w-64 bg-white rounded-md border border-slate-200 p-1 shadow-lg flex flex-col animate-fade-in-up">
                <button onClick={() => modelInputRef.current.click()} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded text-xs font-medium"><FiUpload className="text-sm text-emerald-500"/> Đổi Base Model</button>
                <div className="flex border border-slate-100 rounded mx-1 my-1 overflow-hidden">
                  <button onClick={() => audioInputRef.current.click()} className="flex-1 flex items-center justify-center gap-2 px-2 py-2 text-slate-600 hover:bg-slate-50 text-xs font-medium border-r border-slate-100"><FiUpload className="text-sm text-pink-500"/> Đổi Nhạc</button>
                  <button onClick={toggleMusic} className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 text-slate-600 hover:bg-slate-50 text-xs font-medium ${isPlaying ? 'text-sky-600 font-bold' : ''}`}>
                    {isPlaying ? <FiPlayCircle className="text-sm animate-pulse"/> : <FiMusic className="text-sm"/>} {isPlaying ? 'Đang phát' : 'Bật/Tắt'}
                  </button>
                </div>
                <button onClick={handleSaveData} className="flex items-center gap-2 px-3 py-2 text-sky-600 hover:bg-sky-50 border-t border-slate-100 rounded font-bold text-xs mt-1"><FiSave className="text-sm"/> LƯU MÔ HÌNH</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}