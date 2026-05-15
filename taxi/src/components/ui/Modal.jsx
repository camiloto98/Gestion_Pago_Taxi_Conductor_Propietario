import { AnimatePresence, motion } from 'framer-motion';

export default function Modal({ open, title, onClose, children, footer }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="ui-modal__backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            className="ui-modal glass"
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            <div className="ui-modal__header">
              <div className="ui-modal__title">{title}</div>
              <button className="ui-modal__close" onClick={onClose} aria-label="Cerrar">
                ×
              </button>
            </div>
            <div className="ui-modal__body">{children}</div>
            {footer ? <div className="ui-modal__footer">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

