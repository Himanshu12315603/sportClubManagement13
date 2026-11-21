import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon';
import { Button, IconButton } from './primitives';

export function Modal({ open, onClose, title, subtitle, children, footer, wide, icon }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cb-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`cb-modal ${wide ? 'wide' : ''}`}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cb-modal-head">
              <div className="cb-row" style={{ gap: 12 }}>
                {icon ? <span className="stat-icon"><Icon name={icon} size={18} /></span> : null}
                <div>
                  <h3>{title}</h3>
                  {subtitle ? <p className="small">{subtitle}</p> : null}
                </div>
              </div>
              <IconButton icon="X" label="Close" onClick={onClose} />
            </div>
            <div>{children}</div>
            {footer ? <div className="cb-row between wrap" style={{ marginTop: 22, gap: 10 }}>{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Confirmation dialog used for every destructive action in the app. */
export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Confirm', tone = 'danger', icon = 'AlertTriangle' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon={icon}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={() => { onConfirm?.(); onClose?.(); }}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="small">{message}</p>
    </Modal>
  );
}

export default Modal;
