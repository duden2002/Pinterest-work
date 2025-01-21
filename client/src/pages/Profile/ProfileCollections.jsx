import React from 'react'
import UsersButtons from '../../components/UsersButtons';
import axios from 'axios';
import { useState } from 'react';

function ProfileCollections({
    focusImage,
    setFocusImage,
    focusBtn,
    setFocusBtn,
    authState,
    setLikedPosts,
    likedPosts,
    setAddCollectPosts,
    addCollectPosts,
    userInfo,
    addPostId,
    setAddPostId,
    groupPosts,
    setGroupPosts,
    filterPosts,
    setFilterPosts,
    clickCollection,
    setClickCollection,
    checkGroup,
    defaultCollectPosts,
    selectFolder,
    setSelectFolder,
    collect,
    setCollect,
    clickViewCollect,
    setClickViewCollect,
    showEditFolder,
    setShowEditFolder,
    focus,
    setFocus,
    newNameFolder,
    setNewNameFolder,
    updateContent,
    setUpdateContent,
    id,
    showAddGroup,
    setShowAddGroup,
    setCollectPosts,
    collectPosts,
    navigate,
  }) {
      const [groupName, setGroupName] = useState(""); // для имени новой группы

    const filteredPosts = (group) => {
        if (groupPosts.length === 0) {
          setFilterPosts(checkGroup);
          return;
        }
    
        const filtered = defaultCollectPosts
          .filter((post) => group.includes(post.groupName))
          .map((post) => ({ PostId: post.PostId }));
        const filteredWithPostDetails = checkGroup.filter((post) =>
          filtered.some((item) => item.PostId === post.id)
        );
    
        setFilterPosts(filteredWithPostDetails);
        setClickCollection(!clickCollection);
        setSelectFolder(group);
      };
    
      const editFolder = (folderName) => {
        const newFolderName = !newNameFolder ? selectFolder : newNameFolder;
        console.log("Имя группы", selectFolder);
        console.log("Имя инпута", newNameFolder);
        if (addPostId.length === 0) {
          postRef.current.notifyError("Выберите посты");
        } else {
          if (newFolderName) {
            axios
              .put(
                `http://localhost:3001/collection/editcollection/${folderName}`,
                {
                  newGroupName: newFolderName,
                  PostId: addPostId,
                },
                {
                  withCredentials: true,
                }
              )
              .then((response) => {
                setGroupPosts(response.data.filteredGroupArr);
                setShowEditFolder(false);
                setFocus(false);
              })
              .catch((error) => {
                console.error(error);
              });
          }
          // Удалить groupName у постов, которые были удалены из папки
          const postsToRemove = defaultCollectPosts.filter((post) => {
            return !addPostId.includes(post.PostId);
          });
    
          if (postsToRemove.length > 0) {
            axios
              .put(
                `http://localhost:3001/collection/editcollection/${folderName}`,
                {
                  newGroupName: null,
                  PostId: postsToRemove.map((post) => post.PostId),
                },
                {
                  withCredentials: true,
                }
              )
              .then((response) => {
                console.log(response.data);
              })
              .catch((error) => {
                console.error(error);
              });
          }
        }
      };
    
      const deleteFolder = (folderName) => {
        axios
          .delete(
            `http://localhost:3001/collection/deletecollection/${folderName}`,
            {
              withCredentials: true,
            }
          )
          .then((response) => {
            console.log(response.data);
            setGroupPosts(response.data.filteredGroupArr);
            setUpdateContent(!updateContent);
          })
          .catch((error) => {
            console.error(error);
          });
      };
    
      const handleEditFolder = () => {
        setAddPostId(filterPosts.map((post) => post.id));
        setShowEditFolder(true);
      };
    
      const closeModal = () => {
        setShowEditFolder(false);
        setFocus(false);
      };

      const addPost = (postId) => {
        setAddPostId((prev) => {
          // Если showEditFolder активен, добавляем все посты из filterPosts
          // Если showEditFolder выключен или уже были данные
          return prev.includes(postId)
            ? prev.filter((id) => id !== postId) // Удаляем пост
            : [...prev, postId]; // Добавляем пост
        });
    
        // Лог для проверки
        console.log("Посты: ", addPostId);
      };

      const showGroup = () => {
        setShowAddGroup((prev) => !prev);
        if (showAddGroup === false) {
          setAddPostId("");
        }
      };

      const addGroupToCollection = async (collectionId) => {
        try {
          await axios.put(
            "http://localhost:3001/collection/addcollection",
            {
              PostId: addPostId, // Тело запроса
              groupName: groupName,
            },
            {
              withCredentials: true, // Включаем отправку cookie
              headers: {
                "Content-Type": "application/json", // Указываем тип контента
              },
            }
          );
          // Обновляем коллекции в UI
          if (clickCollection === false) {
            setCollectPosts(
              collectPosts.map((collection) =>
                collection.id === collectionId
                  ? { ...collection, groupName }
                  : collection
              )
            );
            setUpdateContent(!updateContent);
          } else {
          }
          setGroupName("");
          setShowAddGroup(false);
        } catch (error) {
          console.error("Ошибка при добавлении группы в коллекцию:", error);
        }
      };
      
  return (
    <div>
      <div className="users_likes">
          <h2>Коллекции</h2>
          {authState.id === Number(id) && (
            <button
              className="addCollectionBtn"
              onClick={() => {
                showGroup();
              }}
            >
              {showAddGroup ? "Закрыть" : "Добавить коллекцию"}
            </button>
          )}

          {/*Добавление новой папки коллекций*/}
          {showAddGroup === true ? (
            <div className="inCollection">
              <h3>Добавление новой папки коллекций</h3>
              <input
                className="inputAddGroup"
                type="text"
                placeholder="Введите имя группы"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <button
                className="addGroupBtn"
                onClick={() => addGroupToCollection(collectPosts.id)}
              >
                Добавить группу
              </button>
              <div className="collectionsNotify">
                <h3>Выберите посты из списка ниже и назовите свою коллекцию</h3>
              </div>
              <div className="main-cards">
                {collectPosts.map((post) => (
                  <div className="cards" key={post.id}>
                    <div
                      className="card"
                      onClick={() => {
                        addPost(post.id);
                      }}
                    >
                      <img
                        className="postImg"
                        src={post.imagePath}
                        alt="Пост"
                      />
                      {addPostId.includes(post.id) && (
                        <svg
                          className="plus"
                          xmlns="http://www.w3.org/2000/svg"
                          height="120px"
                          viewBox="0 -960 960 960"
                          width="120px"
                          fill="#2eb83d"
                        >
                          <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                        </svg>
                      )}

                      <div>
                        <b>{post.title}</b>
                      </div>
                      <div className="userInProfilePages">
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
                          <img
                            className="userAvatarInProfilePages"
                            src={post.userPhoto}
                            alt="User"
                          />
                        )}
                        {post.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {authState.id === Number(id) && (
                <div>
                  <h2>Папки:</h2>
                  <div className="folder">
                    {groupPosts && groupPosts.length > 0 ? (
                      groupPosts.map((group, index) => (
                        <div
                          className="folders"
                          style={{
                            boxShadow:
                              selectFolder == group && clickCollection == true
                                ? "0px 0px 12px rgba(0, 0, 0, 0.4)"
                                : "",
                          }}
                          onClick={() => {
                            filteredPosts(group);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="200px"
                            viewBox="0 -960 960 960"
                            width="200px"
                            fill="#0052ff"
                          >
                            <path d="M146.67-160q-27 0-46.84-20.17Q80-200.33 80-226.67v-506.66q0-26.34 19.83-46.5Q119.67-800 146.67-800H414l66.67 66.67h332.66q26.34 0 46.5 20.16Q880-693 880-666.67v440q0 26.34-20.17 46.5Q839.67-160 813.33-160H146.67Zm0-66.67h666.66v-440H453l-66.67-66.66H146.67v506.66Zm0 0v-506.66V-226.67Z" />
                          </svg>
                          <p key={index}>{group}</p>
                          {selectFolder == group && clickCollection && (
                            <div className="folder_buttons">
                              <div className="line"></div>
                              <button
                                className="edit-folder folder_btn"
                                onClick={handleEditFolder}
                              >
                                Редактировать
                              </button>
                              <button
                                className="delete-folder folder_btn"
                                onClick={() => deleteFolder(group)}
                              >
                                Удалить
                              </button>
                            </div>
                          )}

                          {/*МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ПАПКИ КОЛЛЕКЦИЙ*/}
                          {showEditFolder && (
                            <div
                              className="editFolder"
                              onClick={() => closeModal()}
                            >
                              <div
                                className="editFolderWindow"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <h3 className="nameFolderEdit">
                                  Редактирование папки <span>{group}</span>
                                </h3>
                                <input
                                  className="editInput"
                                  onFocus={() => setFocus(true)}
                                  type="text"
                                  placeholder="Введите новое название папки"
                                  onChange={(e) =>
                                    setNewNameFolder(e.target.value)
                                  }
                                />
                                <div
                                  id="comment_bubble"
                                  style={{ display: focus ? "none" : "block" }}
                                >
                                  Если не ввести новое название тогда
                                  сохраниться прежнее
                                </div>
                                <button
                                  className="editFolderSaveBtn"
                                  type="button"
                                  onClick={() => {
                                    editFolder(group);
                                  }}
                                >
                                  Сохранить изменения
                                </button>
                                <div className="main-cards">
                                  {collectPosts.map((post) => (
                                    <div className="cards" key={post.id}>
                                      <div
                                        className="card"
                                        onClick={() => {
                                          addPost(post.id);
                                        }}
                                      >
                                        <img
                                          className="postImg"
                                          src={post.imagePath}
                                          alt="Пост"
                                        />

                                        {addPostId.includes(post.id) && (
                                          <svg
                                            className="plus"
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="120px"
                                            viewBox="0 -960 960 960"
                                            width="120px"
                                            fill="#2eb83d"
                                          >
                                            <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                                          </svg>
                                        )}

                                        <div>
                                          <b>{post.title}</b>
                                        </div>
                                        <div className="userInProfilePages">
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
                                            <img
                                              className="userAvatarInProfilePages"
                                              src={post.userPhoto}
                                              alt="User"
                                            />
                                          )}
                                          {post.username}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>Папки не найдены.</p>
                    )}
                  </div>
                </div>
              )}
              {clickCollection && (
                <div className="collection">
                  <h2>Выбранная папка: {selectFolder}</h2>
                  <div className="main-cards">
                    {filterPosts.map((post) => (
                      <div className="cards" key={post.id}>
                        <div
                          className="card"
                          onClick={() => {
                            navigate(`/post/${post.id}`);
                          }}
                        >
                          <img
                            className="postImg"
                            src={post.imagePath}
                            alt="Пост"
                          />
                          <div>
                            <b>{post.title}</b>
                          </div>
                          <div className="userInProfilePages">
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
                              <img
                                className="userAvatarInProfilePages"
                                src={post.userPhoto}
                                alt="User"
                              />
                            )}
                            {post.username}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!clickCollection && (
                <>
                  <button
                    className="showGroupName"
                    onClick={() => setClickViewCollect(!clickViewCollect)}
                  >
                    Показать имена групп
                  </button>
                  <div className="main-cards">
                    {collectPosts.map((post) => (
                      <div className="cards" key={post.id}>
                        <div className="card">
                          {clickViewCollect && (
                            <p className="nameGroup">
                              {collect.map((col) =>
                                post.id === col.PostId ? col.groupName : ""
                              )}
                            </p>
                          )}
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
                            src={post.imagePath}
                            alt="Пост"
                          />
                          <UsersButtons
                            post={post}
                            focusImage={focusImage}
                            focusBtn={focusBtn}
                            setFocusBtn={setFocusBtn}
                            authState={authState}
                            setListOfPosts={setCollectPosts}
                            listOfPosts={collectPosts}
                            setFilteredPosts={setAddCollectPosts}
                            filteredPosts={addCollectPosts}
                          />
                          <div>
                            <b>{post.title}</b>
                          </div>
                          <div className="userInProfilePages">
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
                              <img
                                className="userAvatarInProfilePages"
                                src={post.userPhoto}
                                alt="User"
                              />
                            )}
                            {post.username}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
    </div>
  )
}

export default ProfileCollections
