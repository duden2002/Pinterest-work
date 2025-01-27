import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { useContext } from "react";
import axios from "axios";

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { authState, setAuthState } = useContext(AuthContext);
  const [userPhoto, setUserPhoto] = useState("");
  const { setViewPostsButton } = useContext(AuthContext);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  axios
    .get(`http://localhost:3001/auth/basicinfo/${authState.id}`)
    .then((response) => {
      setUserPhoto(response.data.userPhoto);
    });

  const logout = () => {
    axios
      .post("http://localhost:3001/auth/logout", {}, { withCredentials: true })
      .then(() => {
        setAuthState({ username: "", id: 0, status: false });
      });
  };


  return (
    <div className="dropdown-container" onClick={() => {setIsOpen(!isOpen)}}>
      {userPhoto ? (
        <img src={userPhoto} className="dropdown-trigger" />
      ) : (
        <span className="dropdown-trigger">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="48px"
            viewBox="0 -960 960 960"
            width="48px"
            fill="#000000"
          >
            <path d="M222-255q63-44 125-67.5T480-346q71 0 133.5 23.5T739-255q44-54 62.5-109T820-480q0-145-97.5-242.5T480-820q-145 0-242.5 97.5T140-480q0 61 19 116t63 109Zm257.81-195q-57.81 0-97.31-39.69-39.5-39.68-39.5-97.5 0-57.81 39.69-97.31 39.68-39.5 97.5-39.5 57.81 0 97.31 39.69 39.5 39.68 39.5 97.5 0 57.81-39.69 97.31-39.68 39.5-97.5 39.5Zm.66 370Q398-80 325-111.5t-127.5-86q-54.5-54.5-86-127.27Q80-397.53 80-480.27 80-563 111.5-635.5q31.5-72.5 86-127t127.27-86q72.76-31.5 155.5-31.5 82.73 0 155.23 31.5 72.5 31.5 127 86t86 127.03q31.5 72.53 31.5 155T848.5-325q-31.5 73-86 127.5t-127.03 86Q562.94-80 480.47-80Zm-.47-60q55 0 107.5-16T691-212q-51-36-104-55t-107-19q-54 0-107 19t-104 55q51 40 103.5 56T480-140Zm0-370q34 0 55.5-21.5T557-587q0-34-21.5-55.5T480-664q-34 0-55.5 21.5T403-587q0 34 21.5 55.5T480-510Zm0-77Zm0 374Z" />
          </svg>
        </span>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#000000"
        className={isOpen ? 'headerAvatarSvg' : 'none'}
      >
        <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
      </svg>

      <div className={`dropdown-menu ${isOpen ? "open" : "closed"}`}>
        <ul>
          {userPhoto ? (
            <li>
              <img className="little_avatar" src={userPhoto} alt="" />
              {authState.username}
            </li>
          ) : (
            <li>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
              >
                <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
              </svg>
              {authState.username}
            </li>
          )}
          <li></li>
          <li>
            <Link
              to={`/profile/${authState.id}`}
              onClick={() => {
                setIsOpen(!isOpen), setViewPostsButton(false);
              }}
            >
              Профиль
            </Link>
          </li>
          <li>
            <Link
              to={"/CreatePost"}
              onClick={() => {
                setIsOpen(!isOpen), setViewPostsButton(false);
              }}
            >
              Создать Пост
            </Link>
          </li>
          <li onClick={logout}>
            <Link
              to={"/"}
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            >
              Выйти
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DropdownMenu;
