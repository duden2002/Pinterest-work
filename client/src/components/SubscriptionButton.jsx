import React, { useEffect, useState, useRef } from "react";
import { subscribeToUser, unsubscribeFromUser, checkSubscriptionStatus } from "../api";
import Notifications from '../components/Notifications';
import { AuthContext } from "../helpers/AuthContext";
import { useContext } from "react";



const SubscriptionButton = ({ userId, onSubscribe, onUnsubscribe, visible, username }) => {
  let checkRef = useRef(null)
   const { authState } = useContext(AuthContext);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [variant, setVariant] = useState(false);

  // Проверяем статус подписки при загрузке компонента
  useEffect(() => {
    setVariant(visible)
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

  const clickedButton = () => {
    if(authState.status) {
      if(subscribed) {
        handleUnsubscribe();
        checkRef.current.notifyError(`Вы отписались от ${username}`)
      } else {
        handleSubscribe();
        checkRef.current.notifySuccess(`Вы подписались на ${username}`)
      }
    } else {
      checkRef.current.notifyError('Авторизуйтесь для подписки')
    }
  }

  return (
  <div>  
      <Notifications ref={checkRef} />
      {variant ? (
      <button className={!subscribed ? "subscribe" : "unScribe"} onClick={() => {clickedButton()}}>
        {subscribed ? "Отписаться" : "Подписаться"}
      </button>
      ) : (
        <button className={!subscribed ? "subscriptionButton" : "unSubscriptionButton"} onClick={() => {clickedButton()}}>
        {subscribed ? "Отписаться" : "Подписаться"}
      </button>
      )
    
    }
  </div>
  );
};

export default SubscriptionButton;

