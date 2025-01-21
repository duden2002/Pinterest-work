import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import PostFilter from "../components/PostFilter";
import Notifications from "../components/Notifications";
import UsersButtons from "../components/UsersButtons";


function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [listOfPosts, setListOfPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const { authState } = useContext(AuthContext);
  const postFilterRef = useRef(null);
  const notiRef = useRef(null);
  const [focusImage, setFocusImage] = useState(null)
  const [focusBtn, setFocusBtn] = useState(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = authState.status
          ? await axios.get("http://localhost:3001/posts", {
              withCredentials: true,
            })
          : await axios.get("http://localhost:3001/posts/default");
  
        const likedPostIds =
          response.data.likedPosts?.map((like) => like.PostId) || [];
        const collectPostIds =
          response.data.collect?.map((mark) => mark.PostId) || [];

        const postsWithPhotos = response.data.listOfPosts.map((post) => {
          const userPhoto = Array.isArray(response.data.usersImages)
            ? response.data.usersImages.find((user) => user.id === post.UserId)
            : null;
        
          return {
            ...post,
            Liked: likedPostIds.includes(post.id),
            Collect: collectPostIds.includes(post.id),
            userPhoto: userPhoto && userPhoto.userPhoto && !userPhoto.userPhoto.includes("null")
            ? `http://localhost:3001/${userPhoto.userPhoto}`
            : null,
          };
        });
  
        setListOfPosts(postsWithPhotos);
        setFilteredPosts(postsWithPhotos); // Изначально показываем все посты
  
      } catch (error) {
        notiRef.current.notifyError("Ошибка при загрузке постов");
        console.error(error);
      }
    };
  
    fetchPosts();
  }, [authState.status]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tagsFromURL = urlParams.get("tags");
    if (tagsFromURL) {
      const tagsToSearch = tagsFromURL
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      setSearchTag(tagsFromURL);
      // Обновляем фильтрацию через функцию из PostFilter
      setFilteredPosts(
        listOfPosts.filter((post) =>
          tagsToSearch.every((tag) => post.tags && post.tags.includes(tag))
        )
      );
    } else {
      setSearchTag("");
      setFilteredPosts(listOfPosts);
    }
  }, [location.search, listOfPosts]);

  const handleTagClickFromParent = (tag) => {
    if (postFilterRef.current) {
      postFilterRef.current.handleTagClick(tag); // Вызываем метод дочернего компонента
    }
  };

  return (
    <div>
      <Notifications ref={notiRef} />
      <PostFilter
        ref={postFilterRef}
        searchTag={searchTag}
        setSearchTag={setSearchTag}
        listOfPosts={listOfPosts}
        setFilteredPosts={setFilteredPosts}
      />

<div className="main-cards">
        {filteredPosts.map((post) => (
          <div className="cards" key={post.id}>
            <div className="card">
              <img
                className="postImg"
                onClick={() => {
                  navigate(`/post/${post.id}`);
                }}
                onMouseEnter={() => {
                  setFocusImage(post.id);
                }}
                onMouseLeave={() => {
                  setFocusImage(null);
                }}
                style={{ filter: focusBtn === post.id ? "brightness(0.5)" : "" }}
                src={post.imagePath}
                alt={post.title}
              />
              <div className="tags customScrollbar">
                {post.tags &&
                  Array.isArray(post.tags) &&
                  post.tags.map((tag, index) => (
                    <span
                      key={index}
                      onClick={() => handleTagClickFromParent(tag)}
                      className="tag"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
              <div className="postTitle">
                <b>{post.title}</b>
              </div>
              <div onClick={() => {!authState.status && (notiRef.current.notifyError("Авторизуйтесь для просмотра профиля"))}}>
                <Link className="postUser" to={(authState.status ? `/profile/${post.UserId}` : null )}>
                  {post.userPhoto === null ? (
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32px"
                    viewBox="0 -960 960 960"
                    width="32px"
                    fill="#000000"
                  >
                    <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
                  </svg>
                  ) : (
                    <img src={post.userPhoto} alt="User" />
                  )}
                  {post.username}
                </Link>
              </div>

              <UsersButtons
                post={post}
                focusImage={focusImage}
                focusBtn={focusBtn}
                setFocusBtn={setFocusBtn}
                authState={authState}
                setListOfPosts={setListOfPosts}
                listOfPosts={listOfPosts}
                setFilteredPosts={setFilteredPosts}
                filteredPosts={filteredPosts}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
