import { useEffect, useState } from 'react';
import {
  FiCheckCircle, FiAlertCircle, FiInfo, FiX,
  FiPackage, FiMessageCircle, FiShoppingBag,
} from 'react-icons/fi';

// Maps type → { icon, accent color, bg }
const TYPE_STYLES = {
  success:      { Icon: FiCheckCircle,  accent: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
  error:        { Icon: FiAlertCircle,  accent: 'bg-red-500',     text: 'text-red-600',     light: 'bg-red-50' },
  order_status: { Icon: FiPackage,      accent: 'bg-amber-500',   text: 'text-amber-600',   light: 'bg-amber-50' },
  new_message:  { Icon: FiMessageCircle,accent: 'bg-violet-500',  text: 'text-violet-600',  light: 'bg-violet-50' },
  new_order:    { Icon: FiShoppingBag,  accent: 'bg-sky-500',     text: 'text-sky-600',     light: 'bg-sky-50' },
  default:      { Icon: FiInfo,         accent: 'bg-sky-500',     text: 'text-sky-600',     light: 'bg-sky-50' },
};

export default function PushNotification({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!toast) return;
    // Trigger enter animation on next tick
    const t1 = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t1);
  }, [toast]);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => { setExiting(false); setVisible(false); onDismiss(); }, 300);
  };

  if (!toast) return null;

  // Accept both plain string and rich object
  const title = typeof toast === 'string' ? toast : toast.title;
  const body  = typeof toast === 'string' ? null  : toast.body;
  const type  = typeof toast === 'string' ? 'default' : (toast.type || 'default');
  const style = TYPE_STYLES[type] || TYPE_STYLES.default;
  const { Icon } = style;

  const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`
        fixed z-[999999] pointer-events-auto
        left-4 right-4 top-4
        md:left-auto md:right-5 md:top-5 md:w-[360px]
        transition-all duration-300 ease-out
        ${visible && !exiting
          ? 'translate-y-0 opacity-100'
          : '-translate-y-6 opacity-0'
        }
      `}
    >
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-slate-100 overflow-hidden flex">

        {/* Left accent bar */}
        <div className={`w-1 flex-shrink-0 ${style.accent}`}></div>

        {/* Content */}
        <div className="flex-1 p-4 flex gap-3 items-start min-w-0">

          {/* Icon */}
          <div className={`w-9 h-9 rounded-full ${style.light} flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <Icon className={`text-lg ${style.text}`}/>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            {/* Header row: sender + time */}
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trimi</span>
              <span className="text-[10px] text-slate-400 flex-shrink-0">{now}</span>
            </div>
            {/* Title */}
            <p className="text-sm font-black text-slate-900 leading-snug line-clamp-1">{title}</p>
            {/* Body */}
            {body && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{body}</p>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          className="px-3 flex items-start pt-4 text-slate-300 hover:text-slate-600 transition-colors flex-shrink-0"
        >
          <FiX className="text-sm"/>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-slate-100 rounded-full mt-1 mx-1 overflow-hidden">
        <div
          className={`h-full ${style.accent} rounded-full`}
          style={{
            animation: visible ? 'toastProgress 2.8s linear forwards' : 'none',
          }}
        ></div>
      </div>
    </div>
  );
}
