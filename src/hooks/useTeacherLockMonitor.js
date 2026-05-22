import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import teacherAPI from '../services/teacherAPI';

const DEFAULT_LOCK_MESSAGE = 'Tài khoản của bạn đã bị tạm khóa.';

function findTeacherByEmail(teachers, email) {
  if (!email) return null;
  const key = email.trim().toLowerCase();
  return teachers.find((t) => t.email?.trim().toLowerCase() === key) || null;
}

export function useTeacherLockMonitor(currentUser) {
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
      const teachers = await teacherAPI.getAllTeachers({ fresh: true });
      applyLockState(findTeacherByEmail(teachers, currentUser.email));
    } catch (error) {
      console.error('Không kiểm tra được trạng thái tài khoản:', error);
    }
  }, [applyLockState, currentUser?.email]);

  const handleLogoutToLogin = useCallback(() => {
    const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (user?.email) {
      const heartbeats = JSON.parse(localStorage.getItem('user_heartbeats') || '{}');
      delete heartbeats[user.email];
      localStorage.setItem('user_heartbeats', JSON.stringify(heartbeats));
    }
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
