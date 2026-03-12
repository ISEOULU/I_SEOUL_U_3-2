import { useState, useCallback } from 'react';
import type { Notification } from '../../../types';

/**
 * 알림 상태 + 부수 효과(addNotification)를 갖는 비즈니스 로직.
 * utils가 아닌 feature로 두어, 외부 상태 사용·상태 변경을 한 곳에서 관리.
 */
export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (message: string, type: 'error' | 'success' | 'warning' = 'success') => {
      const id = Date.now().toString();
      setNotifications((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    },
    []
  );

  return { notifications, setNotifications, addNotification };
}
