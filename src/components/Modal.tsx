'use client';

import { useEffect, useState, type ReactNode } from 'react';

type Props = {
  title?: string;
  onClose?: () => void;
  ModalView: (props: { CloseModal: () => void }) => ReactNode;
  children: (props: { OpenModal: () => void }) => ReactNode;
};

const Modal = ({ title, onClose, ModalView, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const OpenModal = () => setIsOpen(true);
  const CloseModal = () => {
    setIsOpen(false);
    onClose?.();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <>
      {children({ OpenModal })}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
          onClick={CloseModal}>
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-surface p-6 shadow-lg"
            onClick={e => e.stopPropagation()}>
            {title && <h2 className="mb-4 text-lg font-semibold text-text">{title}</h2>}
            {ModalView({ CloseModal })}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
