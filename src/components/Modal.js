'use client';

import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';
import Cross from '@/assets/images/cross.svg';
import Image from 'next/image';

function Modal({ show, closeOnOverlayClick, onClose, title, children }) {
  const [isBrowser, setIsBrowser] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    if (show) {
      document.body.classList.add(styles.hasModal);
    } else {
      document.body.classList.remove(styles.hasModal);
    }
  }, [isBrowser, show]);

  if (!isBrowser) {
    return null;
  }

  const handleCloseClick = (e) => {
    e.preventDefault();
    onClose && onClose();
  };

  const handleCloseOverlay = (e) => {
    if (closeOnOverlayClick) {
      if (modalRef.current.contains(e.target)) {
        return;
      }
      onClose && onClose();
    }
  };

  const modalContent = show ? (
    <div className={styles.overlay} onClick={handleCloseOverlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          <a href="#" onClick={handleCloseClick} className={styles.close}>
            <Image src={Cross.src} width={20} height={20} alt="Close modal" />
          </a>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  ) : null;

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')
  );
}

export default Modal;
