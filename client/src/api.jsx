import axios from "axios"


export const checkSubscriptionStatus = async (userId) => {
  const response = await axios.get(`http://localhost:3001/auth/subscriptions/status/${userId}`, {
    withCredentials: true, // Передаем cookie с токеном
  });
  console.log(response.data)
  return response.data; // Ожидаем, что сервер вернет объект { isSubscribed: true/false }
}

export const subscribeToUser = async (userId) => {
  return axios.post(`http://localhost:3001/auth/subscribe/${userId}`, {}, {
    withCredentials: true, // Добавляем для передачи cookie
  });
};

export const unsubscribeFromUser = async (userId) => {
  return axios.post(`http://localhost:3001/auth/unsubscribe/${userId}`, {}, {
    withCredentials: true,
  });
};

export const getFollowers = async (userId) => {
  return axios.get(`http://localhost:3001/auth/followers/${userId}`, {
    withCredentials: true,
  });
};

export const getFollowing = async (userId) => {
  return axios.get(`http://localhost:3001/auth/following/${userId}`, {
    withCredentials: true,
  });
};