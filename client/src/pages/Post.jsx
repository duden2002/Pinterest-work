import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import SubscriptionButton from "../components/SubscriptionButton";


function Post() {
  const navigate = useNavigate();
  let { id } = useParams();
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [postObject, setPostObject] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [checkComment, setCheckComment] = useState(false);
  const { authState } = useContext(AuthContext);
  const [username, setUsername] = useState({});
  const [subUser, setSubUser] = useState({})
  const [checkSubscribe, setCheckSubscribe] = useState(false);
  const [userPhoto, setUserPhoto] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3001/posts/byId/${id}`).then((response) => {
      try {
        setPostObject(response.data);
        setUsername(response.data.UserId);
      } catch {
        (error) => console.log("Ошибка при получении поста", error);
      }
    });

    axios
      .get(`http://localhost:3001/comment/${id}`)
      .then((response) => setComments(response.data))
      .catch((error) =>
        console.error("Ошибка при получении комментариев", error)
      );

    if (authState.token) {
      axios
        .get(`http://localhost:3001/auth/subscriptions/status/${username}`, {
          withCredentials: true,
        })
        .then((response) => {
          setCheckSubscribe(response.data.isSubscribed);
          setSubUser(response.data.subscribed)
          console.log(checkSubscribe);
        })
        .catch((error) => {
          console.error("Ошибка проверки статуса подписки", error);
        });
    }

    // Загрузка рекомендаций
    axios
      .get(`http://localhost:3001/posts/recommendations/${id}`)
      .then((response) => {
        setRecommendations(response.data.recommendations); // Устанавливаем полученные рекомендации
      })
      .catch((error) =>
        console.error("Ошибка при получении рекомендаций:", error)
      );
    window.scrollTo(0, 0);
  }, [id, checkComment]);

  axios
    .get(`http://localhost:3001/auth/basicinfo/${username}`)
    .then((response) => {
      setUserPhoto(response.data.userPhoto);
    });

  const deleteComment = (commentId) => {
    axios
      .delete(`http://localhost:3001/comment/${commentId}`, {
        withCredentials: true,
      })
      .then(() => {
        setComments((prevComments) =>
          prevComments.filter((val) => val.id !== commentId)
        );
      })
      .catch((error) => {
        console.error("Ошибка при удалении комментария", error);
      });
  };

  const deletePost = (id) => {
    axios
      .delete(`http://localhost:3001/posts/${id}`, { withCredentials: true })
      .then(() => {
        navigate("/");
      });
  };

  const showModal = () => {
    setShowEditModal(true);
  };

  const formData = new FormData();
  formData.append("image", image);
  formData.append("PostId", id);
  formData.append("commentBody", newComment);

  const addComment = () => {
    if (newComment.trim() === "" && image === null) {
      setError("Комментарий пустой");
      return;
    }

    axios
      .post("http://localhost:3001/comment", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        if (response.data.error) {
          alert(response.data.error);
          setNewComment("");
          setImage(null);
        } else {
          const commentToAdd = {
            commentBody: newComment,
            username: response.data.username,
            imagePath: image,
          };
          setComments([...comments, commentToAdd]);
          setNewComment("");
          setImage(null);
          setError(""); // сброс ошибки после успешного добавления
          setCheckComment((prev) => !prev);
        }
      });
  };

  const editPost = () => {
    if (newTitle.trim() === "" && !newPostImage) {
      setError("Нужно указать заголовок или выбрать новое изображение");
      return;
    }

    const formDataForPost = new FormData();
    if (newTitle.trim() !== "") formDataForPost.append("title", newTitle);
    if (newPostImage) formDataForPost.append("image", newPostImage);
    formDataForPost.append("id", id);

    axios
      .put("http://localhost:3001/posts/changePost", formDataForPost, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        setPostObject((prev) => ({
          ...prev,
          title: newTitle || prev.title,
          imagePath: newPostImage
            ? URL.createObjectURL(newPostImage)
            : prev.imagePath,
        }));
        setShowEditModal(false);
        setNewTitle("");
        setNewPostImage(null);
        setError("");
      })
      .catch((error) => {
        console.error("Ошибка при обновлении поста:", error);
        setError("Ошибка при обновлении поста");
      });
  };

  return (
    <div className="posts">
      <div className="post">
        <div className="post-img">
          <img src={postObject.imagePath} alt="" />
        </div>
        <div className="post-description">
          <div className="title-username">
            <h1>{postObject.title}</h1>
            <div>
              {postObject.tags &&
                postObject.tags.split(",").map((tag, index) => (
                  <span
                    key={index}
                    className="tag"
                    onClick={() => navigate(`/?tags=${tag.trim()}`)}
                  >
                    {tag.trim()}
                  </span>
                ))}
            </div>
            <span>
              <Link
                className="user_in_post"
                to={`/profile/${postObject.UserId}`}
              >
                {userPhoto ? (
                  <img className="little_avatar" src={userPhoto} />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#000000"
                  >
                    <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
                  </svg>
                )}
                {postObject.username}
              </Link>
            </span>
            <SubscriptionButton
              userId={username}
              isSubscribed={checkSubscribe}
              onSubscribe={() => setCheckSubscribe(true)}
              onUnsubscribe={() => setCheckSubscribe(false)}
              subUser={subUser}
              
            />
            <div className="change-block">
              {authState.username === postObject.username && (
                <button
                  className="delete-btn"
                  onClick={() => {
                    deletePost(id);
                  }}
                >
                  Delete Post
                </button>
              )}
              {authState.username === postObject.username && (
                <button
                  className="edit-btn"
                  onClick={() => {
                    showModal();
                  }}
                >
                  Change Post
                </button>
              )}
              {showEditModal && (
                <div className="modal" onClick={() => setShowEditModal(false)}>
                  <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="close-button"
                      onClick={() => setShowEditModal(false)}
                    >
                      &times;
                    </button>
                    <form onSubmit={(e) => e.preventDefault()}>
                      <input
                        type="text"
                        value={newTitle}
                        placeholder="Введите новый заголовок"
                        onChange={(e) => {
                          setNewTitle(e.target.value);
                          if (e.target.value.trim() === "") {
                            setError("Заголовок не может быть пустым");
                          } else {
                            setError("");
                          }
                        }}
                      />
                      <input
                        type="file"
                        onChange={(e) => setNewPostImage(e.target.files[0])}
                      />
                      <button
                        disabled={!newTitle.trim() && !newPostImage}
                        type="button"
                        onClick={editPost}
                      >
                        Отправить
                      </button>
                      {error && <div style={{ color: "red" }}>{error}</div>}
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="comment-block">
            <div className="addCommentContainer">
              <input
                className="text-comment"
                type="text"
                placeholder="Comment..."
                autoComplete="off"
                value={newComment}
                onChange={(event) => {
                  setNewComment(event.target.value);
                }}
              />
              <label>
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  style={{ display: "none" }}
                />
                <span className="clip">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32px"
                    viewBox="0 -960 960 960"
                    width="32px"
                    fill="#000000"
                  >
                    <path d="M725.33-327.33q0 103.33-72.45 175.33-72.45 72-175.66 72Q374-80 301.33-152q-72.66-72-72.66-175.33V-704q0-73.33 51.83-124.67Q332.33-880 405.33-880t124.84 51.33Q582-777.33 582-704v356.67q0 43.33-30.67 74-30.66 30.66-74.33 30.66t-74.33-30.45Q372-303.56 372-347.33v-370h66.67v370q0 15.66 11.16 26.83 11.17 11.17 27.6 11.17 16.42 0 27.16-11.17 10.74-11.17 10.74-26.83V-704q-.33-46-32.16-77.67-31.84-31.66-77.98-31.66t-78 31.7q-31.86 31.71-31.86 77.63v376.67q-.33 75.66 52.98 128.16 53.32 52.5 129.02 52.5 75.28 0 127.98-52.5 52.69-52.5 53.36-128.16v-390h66.66v390Z" />
                  </svg>
                </span>
              </label>
              <button className="send-button" onClick={addComment}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#000000"
                >
                  <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
                </svg>
              </button>
              {error && <div style={{ color: "red" }}>{error}</div>}
              {/* Сообщение об ошибке */}
            </div>
            <div className="listOfComments">
              {comments.map((comment, key) => {
                return (
                  <div key={key} className="comment">
                    <div className="username-commentBody">
                      <label>{comment.username}</label>
                      {comment.commentBody}
                    </div>
                    <div className="comment-img">
                      {comment.imagePath && (
                        <img src={comment.imagePath} alt="" />
                      )}
                    </div>
                    {authState.username === comment.username && (
                      <button
                        className="deleteComment-btn"
                        onClick={() => {
                          deleteComment(comment.id);
                        }}
                      >
                        Удалить комментарий
                      </button>
                    )}
                    {/*Передаем id комментария через функцию*/}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="recommendations">
        <h2>Похожие посты</h2>
        {console.log(recommendations)}
        {recommendations.length > 0 ? (
          <div className="recommendation-list">
            {recommendations.map((rec) => (
              <div key={rec.id} className="recommendation-item">
                {rec.imagePath && (
                  <img
                    onClick={() => navigate(`/post/${rec.id}`)}
                    src={rec.imagePath}
                    alt={rec.title}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                )}
                <h3 onClick={() => navigate(`/post/${rec.id}`)}>{rec.title}</h3>
                <h3>{rec.username}</h3>
              </div>
            ))}
          </div>
        ) : (
          <p>Рекомендаций нет</p>
        )}
      </div>
    </div>
  );
}

export default Post;
