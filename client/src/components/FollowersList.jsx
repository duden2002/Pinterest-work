import React, { useEffect, useState } from "react";
import { getFollowers } from "../api";

const FollowersList = ({ userId }) => {
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await getFollowers(userId);
        setFollowers(response.data);
      } catch (error) {
        console.error("Ошибка при получении подписчиков:", error);
      }
    };

    fetchFollowers();
  }, [userId]);

  return (
    <div>
      <h2>Подписчики</h2>
      <ul>
        {followers.map((follower) => (
          <li key={follower.id}>{follower.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default FollowersList;