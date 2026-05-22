import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import studentAPI from '../services/studentAPI';

const DEFAULT_LOCK_MESSAGE = 'Tài khoản của bạn đã bị tạm khóa.';

function findStudentByEmail(students, email) {
  if (!email) return null;
  const key = email.trim().toLowerCase();
  return students.find((s) => s.email?.trim().toLowerCase() === key) || null;
}

export function useStudentLockMonitor(currentUser) {
  const navigate = useNavigate();
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockReason, setLockReason] = useState(DEFAULT_LOCK_MESSAGE);

  const applyLockState = useCallback((account) => {
    if (!account || account.status === 'Locked') {
      setLockReason(account?.lockReason?.trim() || DEFAULT_LOCK_MESSAGE);
      setShowLockModal(true);
      return true;
    }
    setShowLockModal(false);
    return false;
  }, []);

  const checkAccountStatus = useCallback(async () => {
    if (!currentUser?.email) return;

    try {
      const students = await studentAPI.getAllStudents({ fresh: true });
      applyLockState(findStudentByEmail(students, currentUser.email));
    } catch (error) {
      console.error('Không kiểm tra được trạng thái tài khoản sinh viên:', error);
    }
  }, [applyLockState, currentUser?.email]);

  const handleLogoutToLogin = useCallback(() => {
    sessionStorage.removeItem('currentUser');
    apiClient.clearAuthCache();
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    if (!currentUser?.email) return undefined;

    checkAccountStatus();
    const statusTimer = setInterval(checkAccountStatus, 3000);
    return () => clearInterval(statusTimer);
  }, [checkAccountStatus, currentUser?.email]);

  return { showLockModal, lockReason, handleLogoutToLogin, checkAccountStatus };
}
