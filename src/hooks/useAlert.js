'use client';
import { useState, useCallback } from 'react';

export function useAlert() {
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    autoClose: true,
    duration: 5000
  });

  const showAlert = useCallback((options) => {
    if (typeof options === 'string') {
      // If just a string is passed, treat it as an info message
      setAlert({
        isOpen: true,
        type: 'info',
        title: '',
        message: options,
        autoClose: true,
        duration: 5000
      });
    } else {
      setAlert({
        isOpen: true,
        type: 'info',
        title: '',
        message: '',
        autoClose: true,
        duration: 5000,
        ...options
      });
    }
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    showAlert({
      type: 'success',
      title,
      message,
      autoClose: true,
      duration: 4000
    });
  }, [showAlert]);

  const showError = useCallback((message, title = 'Error') => {
    showAlert({
      type: 'error',
      title,
      message,
      autoClose: false // Errors should be manually dismissed
    });
  }, [showAlert]);

  const showWarning = useCallback((message, title = 'Warning') => {
    showAlert({
      type: 'warning',
      title,
      message,
      autoClose: true,
      duration: 6000
    });
  }, [showAlert]);

  const showInfo = useCallback((message, title = '') => {
    showAlert({
      type: 'info',
      title,
      message,
      autoClose: true,
      duration: 5000
    });
  }, [showAlert]);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    alert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert
  };
}