import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { FiX, FiCheck } from 'react-icons/fi';

// 1. Component hiển thị Model 3D
function AvatarModel({ avatarUrl }) {
  // useGLTF sẽ tự động tải file 3D từ link RPM trả về
  const { scene } = useGLTF(avatarUrl);
  return <primitive object={scene} scale={1.2} position={[0, -1, 0]} />;
}

// 2. Component Phòng Thử Đồ chính
export default function VirtualRoom({ isOpen, onClose }) {
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('trimi_avatar_3d') || null);
  const [isCreating, setIsCreating] = useState(!avatarUrl); // Nếu chưa có avatar thì mở iframe tạo

  // Lắng nghe tin nhắn từ Iframe của Ready Player Me
  useEffect(() => {
    const handleMessage = (event) => {
      // Đảm bảo tin nhắn đến từ Ready Player Me
      if (event.data?.source !== 'readyplayerme') return;

      // Khi tạo xong, nó sẽ ném ra cái link .glb
      if (event.data.eventName === 'v1.avatar.exported') {
        const url = event.data.data.url;
        setAvatarUrl(url);
        localStorage.setItem('trimi_avatar_3d', url); // Lưu lại để lần sau vào không phải tạo lại
        setIsCreating(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300000] bg-slate-900/95 flex items-center justify-center backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-5xl h-[85vh] bg-slate-800 rounded-3xl overflow-hidden relative shadow-2xl border border-slate-700 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 absolute top-0 w-full z-10">
          <h2 className="text-white font-black text-xl tracking-widest">TRIMI VIRTUAL ROOM</h2>
          <button onClick={onClose} className="p-2 bg-white/10 text-white rounded-full hover:bg-red-500 transition-colors">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Nội dung chính: Iframe nặn người HOẶC Canvas xem 3D */}
        <div className="flex-1 w-full h-full relative mt-16">
          {isCreating ? (
            // IFRAME CỦA READY PLAYER ME
            <iframe
                id="rpm-frame"
                className="w-full h-full border-none bg-slate-900"
                src="https://demo.readyplayer.me/avatar?frameApi&clearCache=true" 
                allow="camera; microphone; clipboard-write; autoplay; display-capture"
                title="Ready Player Me"
              />
          ) : (
            // CANVAS RENDER 3D CỦA REACT THREE FIBER
            <div className="w-full h-full flex flex-col items-center">
              <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
                {/* Ánh sáng */}
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <Environment preset="city" /> {/* Môi trường ánh sáng xịn */}
                
                {/* Gọi Nhân vật ra */}
                {avatarUrl && <AvatarModel avatarUrl={avatarUrl} />}
                
                {/* Bóng đổ dưới chân */}
                <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2} far={4} />
                
                {/* Cho phép dùng chuột xoay nhân vật */}
                <OrbitControls enableZoom={true} minDistance={1} maxDistance={5} target={[0, 0.5, 0]} />
              </Canvas>

              {/* Nút tùy chọn dưới đáy */}
              <div className="absolute bottom-6 flex gap-4">
                <button 
                  onClick={() => setIsCreating(true)}
                  className="px-6 py-3 bg-slate-700 text-white font-bold rounded-full hover:bg-slate-600 transition"
                >
                  Nặn lại nhân vật
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 py-3 bg-sky-500 text-white font-bold rounded-full hover:bg-sky-600 transition flex items-center gap-2 shadow-lg shadow-sky-500/30"
                >
                  <FiCheck /> Chốt nhân vật này
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}