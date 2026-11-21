import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon';
import { useApp } from '../../context/AppContext';

const toneIcon = { success: 'CheckCircle2', error: 'AlertTriangle', info: 'Info' };

/** Global toast host — mounted once inside the app shell. */
export default function ToastHost() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="cb-toast-wrap">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`cb-toast ${t.type}`}
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <span className={`stat-icon ${t.type === 'success' ? 'green' : t.type === 'error' ? 'neon' : ''}`} style={{ width: 34, height: 34, borderRadius: 10 }}>
              <Icon name={toneIcon[t.type] || 'Info'} size={16} />
            </span>
            <div style={{ flex: 1 }}>
              <strong>{t.title}</strong>
              {t.message ? <p>{t.message}</p> : null}
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
              <Icon name="X" size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
