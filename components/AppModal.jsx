'use client';

import { useEffect, useRef } from 'react';

export default function AppModal({ open, onClose, title, size = 'md', children, footer, closeOnBackdrop = true }) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previouslyFocusedRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Let a form control marked with autoFocus keep focus. Focusing the dialog
    // after React mounts it otherwise steals focus from the task editor, so
    // keyboard input can be handled by the card that opened the modal instead.
    const autofocusTarget = dialogRef.current?.querySelector('[autofocus]');
    (autofocusTarget || dialogRef.current)?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="app-modal-backdrop" onMouseDown={(event) => { if (closeOnBackdrop && event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className={`app-modal app-modal-${size}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <header className="app-modal-header">
          <h2>{title}</h2>
          <button className="app-modal-close" type="button" onClick={onClose} aria-label={`Close ${title}`}>×</button>
        </header>
        <div className="app-modal-body">{children}</div>
        {footer && <footer className="app-modal-footer">{footer}</footer>}
      </section>
    </div>
  );
}
