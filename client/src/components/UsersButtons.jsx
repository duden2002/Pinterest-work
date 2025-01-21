import React, { useRef } from "react";
import axios from "axios";
import Notifications from "./Notifications";

const UsersButtons = ({ post, focusImage, focusBtn, setFocusBtn, authState, setListOfPosts, listOfPosts, setFilteredPosts, filteredPosts }) => {
    const notiRef = useRef(null)
    
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
                    //   Likes: liked ? [...post.Likes, 0] : post.Likes.slice(0, -1),
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
                    //   Likes: liked ? [...post.Likes, 0] : post.Likes.slice(0, -1),
                    };
                  }
                  return post;
                })
              );
            })
            .catch((error) => {
              notiRef.current.notifyError("Ошибка при лайке поста")
              console.error("Ошибка при лайке поста:", error);
            });
        } else {
          notiRef.current.notifyError("Авторизуйтесь чтобы поставить лайк посту");
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
              notiRef.current.notifyError("Ошибка при сохранении поста")
              console.error("Ошибка при сохранении поста:", error);
            });
        } else {
          notiRef.current.notifyError("Авторизуйтесь для сохранения поста")
        }
      };

  return (
    
    (focusImage === post.id || focusBtn === post.id) && (
      <div
        className="postButtons"
        onMouseEnter={() => {
          setFocusBtn(post.id);
        }}
        onMouseLeave={() => {
          setFocusBtn(null);
        }}
      >
        <Notifications ref={notiRef} />
        <div className="likeBtn">
          {post.Liked ? (
            <button
              onClick={() => {
                likeAPost(post.id);
              }}
            >
              <svg
                width="60px"
                height="60px"
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
                width="60px"
                height="60px"
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
        </div>
        <div className="collectBtn">
          {post.Collect ? (
            <button
              className="savedBtn"
              onClick={() => {
                collections(post.id);
              }}
            >
              Сохранено
            </button>
          ) : (
            <button
              className="saveBtn"
              onClick={() => {
                collections(post.id);
              }}
            >
              Сохранить
            </button>
          )}
        </div>
      </div>
    )
  );
};

export default UsersButtons;