import { FiInstagram, FiLinkedin, FiYoutube } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';

// CHANGE 2: footer is hidden on mobile (hidden), visible on desktop (md:block)
export default function Footer({ t, navigateTo, showToast, setShowPrivacyModal, setShowTermsModal, setShowStoryModal, setShowCareerModal, setShowContactModal, requireLogin }) {
  return (
    <footer className="hidden md:block bg-[#111111] text-white pt-16 pb-8 mt-auto border-t border-slate-800 flex-shrink-0 z-30 relative transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div className="lg:col-span-1">
            <h2 className="text-[65px] font-brush mb-2 leading-[0.8] tracking-wider">Trimi</h2>
            <div className="flex gap-4 text-slate-400 mt-6">
              <button aria-label="Instagram" onClick={() => showToast('Đang chuyển đến Instagram!')} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FiInstagram className="text-lg"/></button>
              <a aria-label="Facebook" href="https://www.facebook.com/profile.php?id=61578555688928" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FaFacebook className="text-lg"/></a>
              <button aria-label="LinkedIn" onClick={() => showToast('Đang chuyển đến LinkedIn!')} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FiLinkedin className="text-lg"/></button>
              <button aria-label="YouTube" onClick={() => showToast('Đang chuyển đến YouTube!')} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 cursor-pointer transition-colors"><FiYoutube className="text-lg"/></button>
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
  );
}
