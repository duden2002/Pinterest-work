import React, { useEffect, useState } from "react";
import { getFollowing } from "../api";

const FollowingList = ({ userId }) => {
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await getFollowing(userId);
        setFollowing(response.data);
      } catch (error) {
        console.error("Ошибка при получении подписок:", error);
      }
    };

    fetchFollowing();
  }, [userId]);

  return (
    <div>
      <h2>Подписки</h2>
      <ul>
        {following.map((user) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default FollowingList;