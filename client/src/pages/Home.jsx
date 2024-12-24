import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import PostFilter from "../components/PostFilter";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [listOfPosts, setListOfPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const { authState } = useContext(AuthContext);
  const postFilterRef = useRef(null);

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
        const collectPostIds = response.data.collect?.map((mark) => mark.PostId) || [];
        const posts = response.data.listOfPosts.map((post) => ({
          ...post,
          Liked: likedPostIds.includes(post.id),
          Collect: collectPostIds.includes(post.id),
        }));

        setListOfPosts(posts);
        setFilteredPosts(posts); // Изначально показываем все посты
      } catch (error) {
        alert("Ошибка при загрузке постов");
        console.error(error);
      }
    };

    fetchPosts();
  }, [authState.status]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tagsFromURL = urlParams.get("tags");
    if (tagsFromURL) {
      console.log("dfsdf");
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

  const likeAPost = (postId) => {
    if (authState.status === true) {
      axios
        .post(
          "http://localhost:3001/like",
          { PostId: postId },
          { withCredentials: true }
        )
        .then((response) => {
          setListOfPosts((prevPosts) =>
            prevPosts.map((post) => {
              if (post.id === postId) {
                const liked = response.data.liked;
                return {
                  ...post,
                  Liked: liked,
                  Likes: liked ? [...post.Likes, 0] : post.Likes.slice(0, -1),
                };
              }
              return post;
            })
          );
          setFilteredPosts((prevPosts) =>
            prevPosts.map((post) => {
              if (post.id === postId) {
                const liked = response.data.liked;
                return {
                  ...post,
                  Liked: liked,
                  Likes: liked ? [...post.Likes, 0] : post.Likes.slice(0, -1),
                };
              }
              return post;
            })
          );
        })
        .catch((error) => {
          console.error("Ошибка при лайке поста:", error);
        });
    } else {
      alert("Чтобы ставить лайки нужно авторизоваться");
    }
  };

  const collections = (postId) => {
    if (authState.status === true) {
      axios
        .post(
          "http://localhost:3001/collection",
          { PostId: postId },
          { withCredentials: true }
        )
        .then((response) => {
          setListOfPosts((prevPosts) =>
            prevPosts.map((post) => {
              if (post.id === postId) {
                const collect = response.data.collect;
                return {
                  ...post,
                  Collect: collect,
                };
              }
              return post;
            })
          );
          setFilteredPosts((prevPosts) =>
            prevPosts.map((post) => {
              if (post.id === postId) {
                const collect = response.data.collect;
                return {
                  ...post,
                  Collect: collect,
                };
              }
              return post;
            })
          );
        })
        .catch((error) => {
          console.error("Ошибка при лайке поста:", error);
        });
    } else {
      alert("Чтобы ставить лайки нужно авторизоваться");
    }
  };

  return (
    <div>
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
                onClick={() => {
                  navigate(`/post/${post.id}`);
                }}
                src={post.imagePath}
                alt={post.title}
              />
              <div>{post.title}</div>
              <div>{post.username}</div>
              <div>
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
              {post.Liked ? (
                <button
                  onClick={() => {
                    likeAPost(post.id);
                  }}
                >
                  <svg
                    width="32px"
                    height="32px"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                    enableBackground="new 0 0 48 48"
                  >
                    <path
                      fill="#F44336"
                      d="M34,9c-4.2,0-7.9,2.1-10,5.4C21.9,11.1,18.2,9,14,9C7.4,9,2,14.4,2,21c0,11.9,22,24,22,24s22-12,22-24C46,14.4,40.6,9,34,9z"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => {
                    likeAPost(post.id);
                  }}
                >
                  <svg
                    width="32px"
                    height="32px"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                    enableBackground="new 0 0 48 48"
                  >
                    <path
                      fill="#F5F5DC"
                      d="M34,9c-4.2,0-7.9,2.1-10,5.4C21.9,11.1,18.2,9,14,9C7.4,9,2,14.4,2,21c0,11.9,22,24,22,24s22-12,22-24C46,14.4,40.6,9,34,9z"
                    />
                  </svg>
                </button>
              )}
              <label>{post.Likes.length}</label>
              {post.Collect ? (
                <button
                  onClick={() => {
                    collections(post.id);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32px"
                    viewBox="0 -960 960 960"
                    width="32px"
                    fill="#5084C1"
                  >
                    <path d="M200-120v-665q0-24 18-42t42-18h440q24 0 42 18t18 42v665L480-240 200-120Z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => {
                    collections(post.id);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32px"
                    viewBox="0 -960 960 960"
                    width="32px"
                    fill="#000000"
                  >
                    <path d="M200-120v-665q0-24 18-42t42-18h440q24 0 42 18t18 42v665L480-240 200-120Zm60-91 220-93 220 93v-574H260v574Zm0-574h440-440Z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
