import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -30px); }
  to { opacity: 1; transform: translate(-50%, 0); }
`;

const ToastBox = styled.div`
  position: fixed;
  ${({ position }) => position === 'top' ? 'top: 2rem;' : 'bottom: 2rem;'}
  left: 50%;
  transform: translate(-50%, 0); /* Always keep centered */
  z-index: 9999;
  min-width: 220px;
  max-width: 90vw;
  background: rgba(30,40,60,0.95);
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px #00c6ff33;
  padding: 1rem 1.5rem;
  font-size: 1.08rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: ${fadeIn} 0.3s ease;
  border: 2px solid ${({ type }) =>
    type === 'success' ? '#00ffb3' : type === 'error' ? '#ff4d4f' : type === 'warning' ? '#ffe066' : '#00c6ff'};
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 1rem;
`;

export default function Toast({ message, type = 'info', onClose, duration = 3000, position = 'bottom' }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;
  return (
    <ToastBox type={type} position={position}>
      {type === 'success' && '✅'}
      {type === 'error' && '❌'}
      {type === 'info' && 'ℹ️'}
      {type === 'warning' && '⚠️'}
      <span>{message}</span>
      <CloseBtn onClick={onClose} aria-label="Close notification">×</CloseBtn>
    </ToastBox>
  );
} 