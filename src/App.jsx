import { Suspense, useState, useRef, useEffect, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Icons
import { FiSliders, FiMenu, FiMic, FiSave, FiImage, FiMusic, FiMail, FiLock, FiLogOut, FiUpload, FiRefreshCcw, FiCpu, FiAlertTriangle } from 'react-icons/fi';
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 p-8 text-center backdrop-blur-md">
          <FiAlertTriangle className="text-6xl text-red-500 mb-4 animate-pulse" />
          <h2 className="text-2xl font-black text-red-400 mb-2">LỖI TẢI FILE 3D!</h2>
          <p className="text-white/80 font-mono text-sm mb-6 bg-red-500/20 p-4 rounded-xl border border-red-500/50">{this.state.errorMsg}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold border border-white/20">Tải lại trang</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function RoomEnvironment() {
  const { scene } = useGLTF('/room.glb');
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
    });
  }, [scene]);
  return <primitive object={scene} scale={3} position={[0, -3.1, 0]} />; 
}

// =========================================================
// THUẬT TOÁN TỰ ĐỘNG CĂN CHỈNH ÁO (AUTO-FIT HEURISTIC)
// =========================================================
function Character({ modelUrl, equippedShirtUrl, manualScale, manualOffsetY, shirtScale }) {
  const { scene: bodyScene } = useGLTF(modelUrl);
  const { scene: shirtScene } = useGLTF(equippedShirtUrl || modelUrl); 
  
  const groupRef = useRef();
  const shirtRef = useRef();
  const [modelConfig, setModelConfig] = useState({ scale: 1, position: [0, 0, 0] });

  // 1. Căn chỉnh cơ thể
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

      bodyScene.traverse((child) => {
        if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
      });
    }
  }, [bodyScene, modelUrl]);

  // 2. Tự động tính toán đo lường và gắn áo vào ngực (Không bẻ cong được tư thế)
  useEffect(() => {
    if(shirtScene && equippedShirtUrl && equippedShirtUrl !== modelUrl) {
      shirtScene.traverse((child) => {
        if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
      });

      // Đo kích thước người
      const bodyBox = new THREE.Box3().setFromObject(bodyScene);
      const bodySize = new THREE.Vector3();
      const bodyCenter = new THREE.Vector3();
      bodyBox.getSize(bodySize);
      bodyBox.getCenter(bodyCenter);

      // Đo kích thước áo ban đầu
      const shirtBox = new THREE.Box3().setFromObject(shirtScene);
      const shirtSize = new THREE.Vector3();
      const shirtCenter = new THREE.Vector3();
      shirtBox.getSize(shirtSize);
      shirtBox.getCenter(shirtCenter);

      if (shirtRef.current) {
        // Thuật toán scale áo cho bề ngang vừa bằng bề ngang người
        const autoScale = (bodySize.x / shirtSize.x) * 1.1; // Rộng hơn người 10%
        shirtRef.current.scale.set(autoScale, autoScale, autoScale);

        // Đẩy áo vào vị trí lồng ngực (Ước tính khoảng 70% chiều cao cơ thể)
        const chestY = bodyBox.min.y + (bodySize.y * 0.7);
        shirtRef.current.position.set(
          bodyCenter.x - (shirtCenter.x * autoScale),
          chestY - (shirtCenter.y * autoScale),
          bodyCenter.z - (shirtCenter.z * autoScale)
        );
      }
    }
  }, [shirtScene, bodyScene, equippedShirtUrl, modelUrl]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = modelConfig.position[1] + manualOffsetY;
    }
  });

  return (
    <group ref={groupRef} position={[modelConfig.position[0], 0, modelConfig.position[2]]}>
      <primitive object={bodyScene} scale={modelConfig.scale * manualScale} />
      {equippedShirtUrl && equippedShirtUrl !== modelUrl && (
        <group ref={shirtRef}>
          {/* Vẫn giữ shirtScale từ UI để user tinh chỉnh thêm nếu thuật toán bị lệch */}
          <primitive object={shirtScene} scale={shirtScale} />
        </group>
      )}
    </group>
  );
}

// =========================================================
// COMPONENT CHÍNH
// =========================================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [user, setUser] = useState(null);
  const [isRigging, setIsRigging] = useState(false);
  const [rigProgress, setRigProgress] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [modelUrl, setModelUrl] = useState('/7_3_2026.glb'); 
  const [equippedShirtUrl, setEquippedShirtUrl] = useState(null); 
  const [bgImage, setBgImage] = useState("url('/bg_default.jpg')"); 

  const [isPlaying, setIsPlaying] = useState(false); 
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showMenu, setShowMenu] = useState(false); 
  
  // Đã set mặc định Độ cao Y = 0.0
  const [manualScale, setManualScale] = useState(0.9); 
  const [manualOffsetY, setManualOffsetY] = useState(0.0); 
  const [shirtScale, setShirtScale] = useState(1); 

  const controlsRef = useRef(); 
  const imageInputRef = useRef(null);
  const modelInputRef = useRef(null); 
  const audioInputRef = useRef(null);
  const audioRef = useRef(null); 

  const clothingItems = [
    { id: 'shirt_01', name: 'Áo Khoác Da AI', type: 'top', color: 'bg-stone-900', fileUrl: '/shirt.glb' },
    { id: 'shirt_02', name: 'Sơ mi Trắng AI', type: 'top', color: 'bg-slate-200', fileUrl: '/shirt.glb' },
  ];
  const [equippingItem, setEquippingItem] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        startAutoRigProcess();

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
        return prev + 15;
      });
    }, 400);
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
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const localUrl = URL.createObjectURL(file);
    if (type === 'bg') setBgImage(`url('${localUrl}')`);
    if (type === 'music') { audioRef.current.src = localUrl; audioRef.current.play(); setIsPlaying(true); }
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
    if (!audioRef.current.getAttribute('src')) { audioInputRef.current.click(); return; }
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleEquipItem = async (item) => {
    setEquippingItem(item.id);
    setTimeout(() => {
      setEquippedShirtUrl(item.fileUrl); 
      setEquippingItem(null);
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="w-screen h-screen relative flex items-center justify-center bg-cover bg-center transition-all" style={{ backgroundImage: "url('/bg_default.jpg')" }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
        <div className="relative z-10 bg-black/60 backdrop-blur-2xl p-10 rounded-[2.5rem] w-[420px] shadow-[0_0_50px_rgba(236,72,153,0.3)] border border-white/10">
          <div className="flex justify-center mb-6"><h1 className="text-6xl font-black tracking-tighter bg-gradient-to-br from-pink-500 to-indigo-500 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">TRIMI.</h1></div>
          <h2 className="text-2xl font-bold text-center text-white mb-8">{authMode === 'login' ? 'Vào không gian ảo' : 'Tạo tài khoản Web3'}</h2>
          
          <div className="flex flex-col gap-4">
            <div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg" /><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Nhập Email (VD: test@gmail.com)" className="w-full bg-white/5 text-white rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-pink-500 border border-white/10" /></div>
            <div className="relative"><FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg" /><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Mật khẩu (Ít nhất 6 ký tự)" className="w-full bg-white/5 text-white rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-pink-500 border border-white/10" /></div>
            <button onClick={handleEmailAuth} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-2xl py-4 font-bold text-sm hover:scale-105 transition-all mt-4">{authMode === 'login' ? 'BẮT ĐẦU' : 'ĐĂNG KÝ NGAY'}</button>
            <div className="flex items-center py-2"><div className="flex-grow border-t border-white/10"></div><span className="mx-4 text-white/40 text-xs">HOẶC</span><div className="flex-grow border-t border-white/10"></div></div>
            <button onClick={handleGoogleLogin} className="w-full bg-white/10 border border-white/20 text-white rounded-2xl py-3.5 font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-3"><FcGoogle className="text-xl" /> Tiếp tục với Google</button>
          </div>
          <div className="mt-6 text-center text-sm text-white/50">{authMode === 'login' ? <>Chưa có tài khoản? <button onClick={() => setAuthMode('register')} className="text-pink-400">Đăng ký</button></> : <>Đã có tài khoản? <button onClick={() => setAuthMode('login')} className="text-pink-400">Đăng nhập</button></>}</div>
        </div>
      </div>
    );
  }

  if (isRigging) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-900 bg-cover bg-center" style={{ backgroundImage: bgImage }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl"></div>
        <div className="relative z-10 flex flex-col items-center">
          <FiCpu className="text-7xl text-pink-500 animate-bounce drop-shadow-[0_0_20px_#ec4899] mb-6" />
          <h2 className="text-4xl font-black text-white tracking-widest mb-2">LOADING...</h2>
          <p className="text-pink-300/80 mb-8 tracking-wider font-mono text-sm uppercase">AI Auto-Rigging & SMPL-X Processing</p>
          <div className="w-80 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-300" style={{ width: `${rigProgress}%` }}></div>
          </div>
          <span className="text-white/60 font-mono mt-3">{rigProgress}% Hoàn tất</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden font-sans bg-slate-900 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: bgImage }}>
      <audio ref={audioRef} loop />
      <input type="file" ref={imageInputRef} onChange={(e) => handleFileUpload(e, 'bg')} accept="image/*" className="hidden" />
      <input type="file" ref={audioInputRef} onChange={(e) => handleFileUpload(e, 'music')} accept="audio/*" className="hidden" />
      <input type="file" ref={modelInputRef} onChange={(e) => handleFileUpload(e, 'model')} accept=".glb,.gltf" className="hidden" />
      
      <div className="absolute inset-0 z-0">
        <CanvasErrorBoundary>
          <Canvas 
            camera={{ position: [0, 1.5, 5], fov: 45 }} 
            shadows 
            gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
          >
            <ambientLight intensity={0.4} /> 
            <directionalLight 
              position={[-5, 10, 8]} 
              intensity={2.5} 
              castShadow 
              shadow-mapSize={[2048, 2048]} 
              shadow-camera-near={0.5}
              shadow-camera-far={50}
              shadow-bias={-0.0001}
            />
            <directionalLight position={[5, 5, -5]} intensity={1} color="#fbcfe8" />
            
            <Environment preset="apartment" />
            
            <Suspense fallback={null}>
              <RoomEnvironment />
              <Character modelUrl={modelUrl} equippedShirtUrl={equippedShirtUrl} manualScale={manualScale} manualOffsetY={manualOffsetY} shirtScale={shirtScale} />
              
              {/* Đã sửa lỗi nhấp nháy bằng cách nâng Y lên -3.09 */}
              <ContactShadows position={[0, -3.09, 0]} opacity={0.7} scale={10} blur={2.5} far={10} color="#000000" resolution={1024} />
            </Suspense>
            
            <OrbitControls 
              ref={controlsRef} 
              makeDefault 
              enableDamping={true} 
              dampingFactor={0.05} 
              enablePan={true} 
              panSpeed={0.8}
              minDistance={1.5} 
              maxDistance={7} 
              maxPolarAngle={Math.PI / 2 - 0.05} 
              target={[0, 1.5, 0]} 
            />
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-6 left-6 pointer-events-auto flex flex-col gap-4">
          <button onClick={() => { setShowAdjust(!showAdjust); setShowWardrobe(false); }} className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl transition-all shadow-lg ${showAdjust ? 'border-pink-500 text-pink-500 bg-black/80' : 'border-white/20 text-white hover:border-pink-400 bg-black/40 backdrop-blur-md'}`}><FiSliders /></button>
          <button onClick={() => { setShowWardrobe(!showWardrobe); setShowAdjust(false); }} className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl transition-all shadow-lg ${showWardrobe ? 'border-pink-500 text-pink-500 bg-black/80' : 'border-white/20 text-white hover:border-pink-400 bg-black/40 backdrop-blur-md'}`}><BiCloset /></button>
        </div>

        {showAdjust && (
          <div className="absolute top-6 left-24 w-80 bg-black/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 pointer-events-auto z-10">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><FiSliders className="text-pink-500"/> Chỉnh Model</h3>
            <div className="mb-6"><label className="text-white/70 text-sm mb-2 block">Cỡ Người: {manualScale.toFixed(1)}x</label><input type="range" min="0.5" max="2" step="0.1" value={manualScale} onChange={(e) => setManualScale(parseFloat(e.target.value))} className="w-full accent-pink-500" /></div>
            <div className="mb-6"><label className="text-white/70 text-sm mb-2 block">Độ cao Y: {manualOffsetY.toFixed(1)}</label><input type="range" min="-4" max="4" step="0.1" value={manualOffsetY} onChange={(e) => setManualOffsetY(parseFloat(e.target.value))} className="w-full accent-pink-500" /></div>
            <div className="mb-8 pt-4 border-t border-white/10">
               <label className="text-white/70 text-sm mb-2 block">Cỡ Áo tinh chỉnh: {shirtScale.toFixed(2)}x</label>
               <input type="range" min="0.5" max="2" step="0.05" value={shirtScale} onChange={(e) => setShirtScale(parseFloat(e.target.value))} className="w-full accent-emerald-400" />
            </div>
            <button onClick={() => {controlsRef.current?.reset(); setManualScale(0.9); setManualOffsetY(0.0); setShirtScale(1)}} className="w-full py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-pink-600">RESET VỀ GỐC</button>
          </div>
        )}

        {showWardrobe && (
          <div className="absolute top-0 left-24 w-[400px] h-full bg-black/80 backdrop-blur-2xl pointer-events-auto p-6 overflow-y-auto border-r border-white/10 custom-scrollbar z-10">
            <div className="flex justify-between items-center mb-8 pt-6">
               <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 text-2xl font-black flex items-center gap-2"><BiCloset/> Trimi Wardrobe</h2>
               {equippedShirtUrl && (
                  <button onClick={() => setEquippedShirtUrl(null)} className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/50 hover:bg-red-500 hover:text-white transition-all font-bold">Tháo đồ</button>
               )}
            </div>
            <div className="grid grid-cols-2 gap-4 pb-20">
              {clothingItems.map((item) => (
                <div key={item.id} onClick={() => handleEquipItem(item)} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-pink-500/50 cursor-pointer transition-all group relative overflow-hidden">
                  <div className={`w-full h-24 rounded-xl mb-3 flex items-center justify-center shadow-inner ${item.color}`}>
                    {equippingItem === item.id ? <FiCpu className="text-3xl text-white animate-spin" /> : <BiCloset className="text-3xl text-white/50 group-hover:text-white transition-all" />}
                  </div>
                  <h3 className="text-white text-sm font-bold truncate">{item.name}</h3>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">{item.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="absolute top-6 right-6 pointer-events-auto flex flex-col items-end z-30">
          <button onClick={() => setShowMenu(!showMenu)} className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl transition-all shadow-lg ${showMenu ? 'border-pink-500 text-pink-500 bg-black/80' : 'border-white/20 text-white hover:border-pink-400 bg-black/40 backdrop-blur-md'}`}>
            <FiMenu />
          </button>
          {showMenu && (
            <div className="mt-4 w-64 bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-2 shadow-2xl flex flex-col animate-fade-in-up">
              <div className="px-4 py-3 border-b border-white/10 mb-2"><p className="text-white/50 text-xs">Đang đăng nhập:</p><p className="text-white font-bold truncate">{user?.email}</p></div>
              <button onClick={() => imageInputRef.current.click()} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all text-sm font-semibold"><FiImage className="text-lg text-indigo-400"/> Thay đổi phông nền</button>
              <button onClick={() => modelInputRef.current.click()} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all text-sm font-semibold"><FiUpload className="text-lg text-emerald-400"/> Tải lên Base Model</button>
              <button onClick={toggleMusic} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all text-sm font-semibold"><FiMusic className={`text-lg ${isPlaying ? 'text-pink-500' : 'text-amber-400'}`}/> Bật/Tắt Nhạc Nền</button>
              <button className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all text-sm font-semibold"><FiMic className="text-lg text-blue-400"/> Ra lệnh giọng nói AI</button>
              <button onClick={handleSaveData} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all text-sm font-semibold border-t border-white/5 mt-1"><FiSave className="text-lg text-white"/> Lưu thiết lập</button>
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all text-sm font-bold mt-1"><FiLogOut className="text-lg"/> Đăng xuất</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}