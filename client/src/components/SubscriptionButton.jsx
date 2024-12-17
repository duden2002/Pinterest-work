import React, { useEffect, useState } from "react";
import { subscribeToUser, unsubscribeFromUser, checkSubscriptionStatus } from "../api";

const SubscriptionButton = ({ userId, onSubscribe, onUnsubscribe }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Проверяем статус подписки при загрузке компонента
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const { isSubscribed } = await checkSubscriptionStatus(userId); // Предполагается, что API возвращает { isSubscribed: true/false }
        setSubscribed(isSubscribed);
      } catch (error) {
        console.error("Ошибка при проверке статуса подписки:", error);
      } finally {
        setLoading(false); // Завершаем загрузку
      }
    };

    fetchSubscriptionStatus();
  }, [userId]);

  const handleSubscribe = async () => {
    try {
      await subscribeToUser(userId);
      setSubscribed(true);
      onSubscribe(); // Уведомляем родительский компонент
    } catch (error) {
      console.error("Ошибка при подписке:", error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeFromUser(userId);
      setSubscribed(false);
      onUnsubscribe(); // Уведомляем родительский компонент
    } catch (error) {
      console.error("Ошибка при отписке:", error);
    }
  };

  if (loading) {
    return <button disabled>Загрузка...</button>; // Показываем индикатор загрузки
  }

  return (
    <button onClick={subscribed ? handleUnsubscribe : handleSubscribe}>
      {subscribed ? "Отписаться" : "Подписаться"}
    </button>
  );
};

export default SubscriptionButton;