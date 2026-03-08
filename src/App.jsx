import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Icons 
import { FiSliders, FiMenu, FiMic, FiSave, FiImage, FiMusic, FiMail, FiLock, FiUser, FiRefreshCcw, FiUpload } from 'react-icons/fi';
import { BiCloset } from 'react-icons/bi';
import { FcGoogle } from 'react-icons/fc';

// Firebase
import { auth, googleProvider, db, storage } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// =========================================================
// 1. COMPONENT CHARACTER (Tải Model động)
// =========================================================
function Character({ modelUrl, manualScale, manualOffsetY }) {
  const { scene } = useGLTF(modelUrl); // Dùng modelUrl truyền từ ngoài vào
  const groupRef = useRef();
  const [modelConfig, setModelConfig] = useState({ scale: 1, position: [0, 0, 0] });

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const targetHeight = 6.2; 
      const scaleRatio = targetHeight / size.y;
      const floorY = -3.1;
      const posY = floorY - (box.min.y * scaleRatio);

      setModelConfig({ scale: scaleRatio, position: [-center.x * scaleRatio, posY, -center.z * scaleRatio] });
    }
  }, [scene, modelUrl]); // Chạy lại khi đổi model

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current && modelConfig.position[1] !== 0) {
      groupRef.current.position.y = modelConfig.position[1] + manualOffsetY + Math.sin(t * 1.5) * 0.015; 
    }
  });

  return (
    <group ref={groupRef} position={[modelConfig.position[0], 0, modelConfig.position[2]]}>
      <primitive object={scene} scale={modelConfig.scale * manualScale} />
    </group>
  );
}

// =========================================================
// 2. COMPONENT CHÍNH APP
// =========================================================
export default function App() {
  // STATE XÁC THỰC
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // STATE DỮ LIỆU APP (Sẽ load từ Database)
  const [bgImage, setBgImage] = useState("url('/bg_room.jpg')"); 
  const [modelUrl, setModelUrl] = useState('/7_3_2026.glb'); // Model mặc định cố định
  const [isPlaying, setIsPlaying] = useState(false); 

  // STATE GIAO DIỆN
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [manualScale, setManualScale] = useState(1);
  const [manualOffsetY, setManualOffsetY] = useState(0);

  const controlsRef = useRef(); 
  const imageInputRef = useRef(null); 
  const audioInputRef = useRef(null); 
  const modelInputRef = useRef(null); // Ref cho nút Tải Model
  const audioRef = useRef(null); 

  // --- TỰ ĐỘNG KIỂM TRA ĐĂNG NHẬP VÀ LOAD DỮ LIỆU ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        // Load data từ Firestore
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.bgImage) setBgImage(data.bgImage);
          if (data.modelUrl) setModelUrl(data.modelUrl);
          if (data.musicUrl && audioRef.current) {
            audioRef.current.src = data.musicUrl;
            // Trình duyệt có thể chặn autoplay, chờ người dùng click nhạc
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // --- LOGIC AUTHENTICATION ---
  const handleEmailAuth = async () => {
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert("Lỗi đăng nhập: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) { console.error(error); }
  };

  // --- LOGIC UPLOAD FILE (Ảnh, Nhạc, Model) LÊN FIREBASE ---
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    
    // Tạm thời set hiển thị local cho nhanh
    const localUrl = URL.createObjectURL(file);
    if (type === 'bg') setBgImage(`url('${localUrl}')`);
    if (type === 'music') { audioRef.current.src = localUrl; audioRef.current.play(); setIsPlaying(true); }
    if (type === 'model') setModelUrl(localUrl);

    // Bắt đầu đẩy file lên Firebase Storage ở chế độ chạy ngầm
    try {
      const storageRef = ref(storage, `users/${user.uid}/${type}_${file.name}`);
      await uploadBytes(storageRef, file);
      const firebaseUrl = await getDownloadURL(storageRef);
      
      // Sau khi đẩy xong, lưu Link gốc vào Firestore
      const updateData = {};
      if (type === 'bg') updateData.bgImage = `url('${firebaseUrl}')`;
      if (type === 'music') updateData.musicUrl = firebaseUrl;
      if (type === 'model') updateData.modelUrl = firebaseUrl;
      
      await setDoc(doc(db, "users", user.uid), updateData, { merge: true });
    } catch (error) {
      console.error("Lỗi upload: ", error);
    }
  };

  // --- LOGIC LƯU TRẠNG THÁI (Nút Save) ---
  const handleSaveData = async () => {
    if (!user) return alert("Bạn cần đăng nhập!");
    await setDoc(doc(db, "users", user.uid), {
      bgImage: bgImage,
      modelUrl: modelUrl,
      musicUrl: audioRef.current.src
    }, { merge: true });
    alert("Đã lưu thiết lập của bạn lên Đám mây!");
  };

  const toggleMusic = () => {
    if (!audioRef.current.getAttribute('src')) {
      audioInputRef.current.click(); 
      return;
    }
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const resetView = () => {
    if (controlsRef.current) controlsRef.current.reset(); 
    setManualScale(1);   
    setManualOffsetY(0); 
  };

  // =========================================================
  // GIAO DIỆN 1: MÀN HÌNH LOGIN (GIỮ NGUYÊN CSS)
  // =========================================================
  if (!isAuthenticated) {
    return (
      <div className="w-screen h-screen relative flex items-center justify-center bg-cover bg-center transition-all" style={{ backgroundImage: "url('/bg_room.jpg')" }}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>
        <div className="relative z-10 bg-white/95 backdrop-blur-xl p-10 rounded-[2.5rem] w-[420px] shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white">
          <div className="flex justify-center mb-6"><h1 className="text-5xl font-black tracking-tighter text-slate-900">TRIMI.</h1></div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">{authMode === 'login' ? 'Đăng nhập vào không gian ảo' : 'Tạo tài khoản Trimi'}</h2>
          <p className="text-slate-500 text-center text-sm mb-8">Trải nghiệm phòng thử đồ 3D cá nhân hóa của bạn.</p>
          
          <div className="flex flex-col gap-4">
            <div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" /><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email của bạn" className="w-full bg-slate-100/80 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 transition-all" /></div>
            <div className="relative"><FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" /><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Mật khẩu" className="w-full bg-slate-100/80 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 transition-all" /></div>
            
            <button onClick={handleEmailAuth} className="w-full bg-orange-500 text-white rounded-2xl py-4 font-bold text-sm hover:bg-orange-600 transition-all shadow-lg mt-4 hover:scale-105">
              {authMode === 'login' ? 'BẮT ĐẦU TRẢI NGHIỆM' : 'ĐĂNG KÝ NGAY'}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div><span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold">HOẶC TÀI KHOẢN MẠNG</span><div className="flex-grow border-t border-slate-200"></div>
            </div>
            
            <button onClick={handleGoogleLogin} className="w-full bg-white border-2 border-slate-200 text-slate-700 rounded-2xl py-3.5 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 shadow-sm">
              <FcGoogle className="text-xl" /> Tiếp tục với Google
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm font-semibold text-slate-500">
            {authMode === 'login' ? (
              <>Chưa có tài khoản? <button onClick={() => setAuthMode('register')} className="text-orange-600 hover:underline">Đăng ký</button></>
            ) : (
              <>Đã có tài khoản? <button onClick={() => setAuthMode('login')} className="text-orange-600 hover:underline">Đăng nhập</button></>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // GIAO DIỆN 2: APP 3D CHÍNH THỨC (GIỮ NGUYÊN CSS)
  // =========================================================
  return (
    <div className="w-screen h-screen relative overflow-hidden font-sans bg-slate-100 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: bgImage }}>
      <audio ref={audioRef} loop />
      {/* File Inputs ẩn, gọi hàm đẩy lên Firebase */}
      <input type="file" ref={imageInputRef} onChange={(e) => handleFileUpload(e, 'bg')} accept="image/*" className="hidden" />
      <input type="file" ref={audioInputRef} onChange={(e) => handleFileUpload(e, 'music')} accept="audio/*" className="hidden" />
      <input type="file" ref={modelInputRef} onChange={(e) => handleFileUpload(e, 'model')} accept=".glb,.gltf" className="hidden" />
      
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} shadows>
          <ambientLight intensity={0.8} /> 
          <directionalLight position={[0, 5, 8]} intensity={3} castShadow shadow-mapSize={2048} />
          <directionalLight position={[-5, 3, 5]} intensity={1.5} color="#e0f2fe" />
          <Environment preset="apartment" blur={0.6} />

          <Suspense fallback={null}>
            <Character modelUrl={modelUrl} manualScale={manualScale} manualOffsetY={manualOffsetY} />
            <ContactShadows position={[0, -3.1, 0]} opacity={0.85} scale={12} blur={2} far={10} color="#000000" />
          </Suspense>

          <OrbitControls ref={controlsRef} makeDefault enableDamping={true} dampingFactor={0.05} enablePan={true} minDistance={4} maxDistance={15} target={[0, 0, 0]} />
        </Canvas>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* ICON TRÁI */}
        <div className="absolute top-6 left-6 pointer-events-auto flex flex-col gap-6 items-center z-20">
          <button onClick={() => { setShowAdjust(!showAdjust); setShowWardrobe(false); }} className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center text-3xl transition-all drop-shadow-md hover:scale-110 ${showAdjust ? 'border-orange-500 text-orange-500 bg-white/30' : 'border-black/80 text-black/80 hover:text-black hover:border-black'}`} title="Căn chỉnh góc nhìn"><FiSliders /></button>
          
          <button onClick={() => imageInputRef.current.click()} className="w-14 h-14 rounded-full border-[3px] border-black/80 flex items-center justify-center text-black/80 hover:text-black hover:border-black transition-all drop-shadow-md text-2xl bg-white/10 hover:bg-white/40" title="Đổi nền"><FiImage /></button>
          
          {/* NÚT TẢI MODEL TỪ MÁY */}
          <button onClick={() => modelInputRef.current.click()} className="w-14 h-14 rounded-full border-[3px] border-black/80 flex items-center justify-center text-black/80 hover:text-black hover:border-black transition-all drop-shadow-md text-2xl bg-white/10 hover:bg-white/40" title="Tải model .glb từ máy"><FiUpload /></button>
          
          <button onClick={() => { setShowWardrobe(!showWardrobe); setShowAdjust(false); }} className={`w-16 h-16 rounded-full border-[3px] flex items-center justify-center text-4xl transition-all drop-shadow-md hover:scale-110 ${showWardrobe ? 'border-orange-500 text-orange-500 bg-white/30' : 'border-black/80 text-black/80 hover:text-black hover:border-black'}`}><BiCloset /></button>
        </div>

        {/* BẢNG CĂN CHỈNH */}
        {showAdjust && (
          <div className="absolute top-6 left-28 w-80 bg-black/70 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto transition-all z-10 animate-fade-in-up">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><FiSliders className="text-orange-500"/> Chỉnh khung hình Model</h3>
            <div className="mb-6">
              <label className="text-white/70 text-sm font-semibold mb-2 flex justify-between"><span>Độ to nhỏ (Scale)</span><span className="text-orange-400">{manualScale.toFixed(1)}x</span></label>
              <input type="range" min="0.5" max="2" step="0.1" value={manualScale} onChange={(e) => setManualScale(parseFloat(e.target.value))} className="w-full accent-orange-500" />
            </div>
            <div className="mb-8">
              <label className="text-white/70 text-sm font-semibold mb-2 flex justify-between"><span>Độ cao gót chân (Y)</span><span className="text-orange-400">{manualOffsetY.toFixed(1)}</span></label>
              <input type="range" min="-4" max="4" step="0.1" value={manualOffsetY} onChange={(e) => setManualOffsetY(parseFloat(e.target.value))} className="w-full accent-orange-500" />
              <p className="text-white/40 text-[11px] mt-2 italic">* Kéo thanh này để chân chạm đúng bóng đổ.</p>
            </div>
            <button onClick={resetView} className="w-full py-3 bg-white/10 hover:bg-orange-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-orange-400 shadow-lg"><FiRefreshCcw className="text-lg" /> ĐẶT LẠI MẶC ĐỊNH</button>
          </div>
        )}

        {/* TỦ ĐỒ */}
        {showWardrobe && (
          <div className="absolute top-0 left-32 w-[420px] h-full bg-black/40 backdrop-blur-xl pointer-events-auto p-8 overflow-y-auto transition-all shadow-2xl custom-scrollbar z-10 border-l border-white/10">
            <h2 className="text-white text-2xl font-bold mt-16 mb-6 flex items-center gap-2"><BiCloset className="text-orange-400" /> Tủ đồ của bạn</h2>
            <div className="grid grid-cols-4 gap-4 pb-20">
              {[...Array(28)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-3xl border border-white/10 hover:bg-white/20 transition-all shadow-inner flex items-center justify-center cursor-pointer hover:border-white/40 hover:scale-105 group"><span className="text-white/20 text-xs font-bold group-hover:text-white/80 transition-all">+</span></div>
              ))}
            </div>
          </div>
        )}

        {/* ICON PHẢI */}
        <div className="absolute top-6 right-6 pointer-events-auto flex flex-col gap-6 items-center z-20">
          <button className="text-black/80 hover:text-black transition text-5xl font-black drop-shadow-md hover:scale-110"><FiMenu /></button>
          <button onClick={toggleMusic} className={`transition text-5xl font-black drop-shadow-md hover:scale-110 ${isPlaying ? 'text-orange-500' : 'text-black/80 hover:text-black'}`}><FiMusic /></button>
          <button className="text-black/80 hover:text-black transition text-5xl font-black drop-shadow-md hover:scale-110"><FiMic /></button>
          
          {/* NÚT LƯU LÊN FIREBASE */}
          <button onClick={handleSaveData} title="Lưu lên Đám mây" className="text-black/80 hover:text-black transition text-5xl font-black mt-4 drop-shadow-md hover:scale-110 text-orange-500"><FiSave /></button>
        </div>

      </div>
    </div>
  );
}