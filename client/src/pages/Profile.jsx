import { useEffect, useState, useRef, useContext } from "react";
import FollowersList from "../components/FollowersList";
import FollowingList from "../components/FollowingList";
import { useNavigate, useParams } from "react-router-dom";
import Cropper from "react-easy-crop";
import axios from "axios";
import Notifications from '../components/Notifications';
import SubscriptionButton from '../components/SubscriptionButton';
import { AuthContext } from '../helpers/AuthContext'

function Profile() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();
  let { id } = useParams();
  let postRef = useRef(null)
  const [listOfPosts, setListOfPosts] = useState([]);
  const [userPhoto, setuserPhoto] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [checkUserPick, setCheckUserPick] = useState(false);
  const [userInfo, setUserInfo] = useState();
  const [likedPosts, setLikedPosts] = useState([]);
  const [collectPosts, setCollectPosts] = useState([]);
  const [changeContent, setChangeContent] = useState("posts");
  const [groupName, setGroupName] = useState(""); // для имени новой группы
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [addPostId, setAddPostId] = useState([]);
  const [groupPosts, setGroupPosts] = useState([]);
  const [filterPosts, setFilterPosts] = useState([]);
  const [clickCollection, setClickCollection] = useState(false);
  const [checkGroup, setCheckGroup] = useState([]);
  const [defaultCollectPosts, setDefaultCollectPosts] = useState([]);
  const [selectFolder, setSelectFolder] = useState("");
  const [collect, setCollect] = useState([]);
  const [clickViewCollect, setClickViewCollect] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [focus, setFocus] = useState(false);
  const [newNameFolder, setNewNameFolder] = useState("");
  const [updateContent, setUpdateContent] = useState(false)
  const [hideInfo, setHideInfo] = useState(false)

  useEffect(() => {
    axios.get(`http://localhost:3001/auth/basicinfo/${id}`).then((response) => {
      setuserPhoto(response.data.userPhoto);
      setUserInfo(response.data.username);
    });

    axios
      .get("http://localhost:3001/posts", { withCredentials: true })
      .then((response) => {
        setGroupPosts(response.data.filteredGroupArr);
        setCheckGroup(response.data.listOfPosts);
        setCollect(response.data.collect);
      });

    axios.get(`http://localhost:3001/posts/byuserid/${id}`).then((response) => {
      setListOfPosts(response.data.listOfPosts);

      setLikedPosts(response.data.formattedLikedPosts);
      setCollectPosts(response.data.formattedCollectPosts);
      setDefaultCollectPosts(response.data.defaultCollectPosts);
    });
    console.log(authState.id === Number(id))
  }, [id, changeContent, addPostId, showEditFolder, updateContent]);

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setuserPhoto(reader.result); // Сохраняем image в base64 для отображения
      };
      reader.readAsDataURL(file); // Чтение файла в base64
    }
  };

  const getCroppedImg = (imageSrc, croppedAreaPixels) => {
    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const { x, y, width, height } = croppedAreaPixels;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

        try {
          canvas.toBlob((blob) => {
            resolve(blob); // Возвращаем изображение как Blob
          }, "image/jpeg"); // Или "image/png", в зависимости от формата
          if (confirm("Хотите перезагрузить страницу?")) {
            location.reload();
          }
        } catch {
          alert("Фото не было изменено");
          setCheckUserPick(false);
        }
      };
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (croppedArea && userPhoto) {
      const croppedImage = await getCroppedImg(userPhoto, croppedArea);

      const formData = new FormData();
      formData.append("avatar", croppedImage, "avatar.jpg");

      try {
        const response = await axios.post(
          "http://localhost:3001/auth/avatar",
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("Avatar updated successfully!", response);
      } catch (error) {
        console.error("There was an error uploading the file!", error);
      }
    }

    // Закрываем Cropper независимо от результата
    setCheckUserPick(false);
  };

  const clickOnImg = () => {
    document.getElementById("fileInput").click();
    setCheckUserPick(true);
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
        setUpdateContent(!updateContent)
      } else {
      }
      setGroupName("");
      setShowAddGroup(false);
    } catch (error) {
      console.error("Ошибка при добавлении группы в коллекцию:", error);
    }
  };

  const updateChangeContent = (newData) => {
    setChangeContent(newData);
  }

  const showGroup = () => {
    setShowAddGroup((prev) => !prev);
    if (showAddGroup === false) {
      setAddPostId("");
    }
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
    console.log("Имя группы",selectFolder)
    console.log("Имя инпута",newNameFolder)
    if(addPostId.length === 0) {
      postRef.current.notifyError("Выберите посты")
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
            console.log(response.data);
            setGroupPosts(response.data.filteredGroupArr);
            setShowEditFolder(false);
            setFocus(false)
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
        setUpdateContent(!updateContent)
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
    setShowEditFolder(false)
    setFocus(false)
    
  }

  return (
    <div className="profile">
      <Notifications ref={postRef} />
      <div className="basic-info">
        <div>
          <form onSubmit={onSubmit} className="userImage">
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="fileInput"
            />
          </form>
          <div className="userPhotoContainer" onClick={() => clickOnImg()}>
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="User Avatar"
                className="avatar"
                accept="image/*"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="154px"
                viewBox="0 -960 960 960"
                width="154px"
                fill="#000000"
              >
                <path d="M222-255q63-44 125-67.5T480-346q71 0 133.5 23.5T739-255q44-54 62.5-109T820-480q0-145-97.5-242.5T480-820q-145 0-242.5 97.5T140-480q0 61 19 116t63 109Zm257.81-195q-57.81 0-97.31-39.69-39.5-39.68-39.5-97.5 0-57.81 39.69-97.31 39.68-39.5 97.5-39.5 57.81 0 97.31 39.69 39.5 39.68 39.5 97.5 0 57.81-39.69 97.31-39.68 39.5-97.5 39.5Zm.66 370Q398-80 325-111.5t-127.5-86q-54.5-54.5-86-127.27Q80-397.53 80-480.27 80-563 111.5-635.5q31.5-72.5 86-127t127.27-86q72.76-31.5 155.5-31.5 82.73 0 155.23 31.5 72.5 31.5 127 86t86 127.03q31.5 72.53 31.5 155T848.5-325q-31.5 73-86 127.5t-127.03 86Q562.94-80 480.47-80Zm-.47-60q55 0 107.5-16T691-212q-51-36-104-55t-107-19q-54 0-107 19t-104 55q51 40 103.5 56T480-140Zm0-370q34 0 55.5-21.5T557-587q0-34-21.5-55.5T480-664q-34 0-55.5 21.5T403-587q0 34 21.5 55.5T480-510Zm0-77Zm0 374Z" />
              </svg>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="80px"
              viewBox="0 -960 960 960"
              width="80px"
              fill="#FFFFFF"
              className="userpick"
            >
              <path d="M453-280h60v-166h167v-60H513v-174h-60v174H280v60h173v166Zm27.27 200q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.23-60Q622-140 721-239.5t99-241Q820-622 721.19-721T480-820q-141 0-240.5 98.81T140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z" />
            </svg>
            <div className="backCircle"></div>
          </div>
        </div>
        <>
          {checkUserPick && (
            <form onSubmit={onSubmit} className="cropper">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <div style={{ position: "relative", width: 300, height: 300 }}>
                <Cropper
                  image={userPhoto}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <button type="submit" disabled={!userPhoto}>
                Сохранить фото
              </button>
            </form>
          )}
        </>
        <h1>{userInfo}</h1>

          <SubscriptionButton userId={id} visible={true} username={userInfo}/>

        <div className="profileNavigation">
          <button onClick={() => setChangeContent("posts")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="48px"
              viewBox="0 -960 960 960"
              width="48px"
              style={{
                fill: changeContent == "posts" ? "#000000" : "#A9A9A9",
                borderBottom:
                  changeContent === "posts" ? "2px solid black" : "transparent",
                transition: "border-bottom 0.3s ease",
              }}
            >
              <path d="M120-120v-720h720v720H120Zm640-143H200v78h560v-78Zm-560-41h560v-78H200v78Zm0-129h560v-327H200v327Zm0 170v78-78Zm0-41v-78 78Zm0-129v-327 327Zm0 51v-51 51Zm0 119v-41 41Z" />
            </svg>
          </button>
          <button onClick={() => setChangeContent("marks")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="48px"
              viewBox="0 -960 960 960"
              width="48px"
              style={{
                fill: changeContent == "marks" ? "#000000" : "#A9A9A9",
                borderBottom:
                  changeContent === "marks" ? "2px solid black" : "transparent",
                transition: "border-bottom 0.3s ease",
              }}
            >
              <path d="M160-80v-581q0-24.75 17.63-42.38Q195.25-721 220-721h360q24.75 0 42.38 17.62Q640-685.75 640-661v581L400-199 160-80Zm60-97 180-89 180 89v-484H220v484Zm520-62v-582H284v-60h456q24.75 0 42.38 17.62Q800-845.75 800-821v582h-60ZM220-661h360-360Z" />
            </svg>
          </button>
          <button onClick={() => setChangeContent("subscribers")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="48px"
              viewBox="0 -960 960 960"
              width="48px"
              style={{
                fill: changeContent == "subscribers" ? "#000000" : "#A9A9A9",
                borderBottom:
                  changeContent === "subscribers"
                    ? "2px solid black"
                    : "transparent",
                transition: "border-bottom 0.3s ease",
              }}
            >
              <path d="M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM358-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42Zm360-150q0 66-42 108t-108 42q-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108ZM98-220h520v-34q0-16-9.5-31T585-306q-72-32-121-43t-106-11q-57 0-106.5 11T130-306q-14 6-23 21t-9 31v34Zm260-321q39 0 64.5-25.5T448-631q0-39-25.5-64.5T358-721q-39 0-64.5 25.5T268-631q0 39 25.5 64.5T358-541Zm0 321Zm0-411Z" />
            </svg>
          </button>
          <button onClick={() => setChangeContent("subscriptions")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="48px"
              viewBox="0 -960 960 960"
              width="48px"
              style={{
                fill: changeContent == "subscriptions" ? "#000000" : "#A9A9A9",
                borderBottom:
                  changeContent === "subscriptions"
                    ? "2px solid black"
                    : "transparent",
                transition: "border-bottom 0.3s ease",
              }}
            >
              <path d="M51-404q-26-43-38.5-86.5T0-576q0-110 77-187t187-77q63 0 119.5 26t96.5 71q40-45 96.5-71T696-840q110 0 187 77t77 187q0 42-12.5 85T909-405q-10-12-22.5-20.5T860-440q20-35 30-69t10-67q0-85-59.5-144.5T696-780q-55 0-108.5 32.5T480-649q-54-66-107.5-98.5T264-780q-85 0-144.5 59.5T60-576q0 33 10 67t30 69q-14 6-26.5 15T51-404ZM0-80v-53q0-39 42-63t108-24q13 0 24 .5t22 2.5q-8 17-12 34.5t-4 37.5v65H0Zm240 0v-65q0-65 66.5-105T480-290q108 0 174 40t66 105v65H240Zm540 0v-65q0-20-3.5-37.5T765-217q11-2 22-2.5t23-.5q67 0 108.5 24t41.5 63v53H780ZM480-230q-80 0-130 24t-50 61v5h360v-6q0-36-49.5-60T480-230Zm-330-20q-29 0-49.5-20.5T80-320q0-29 20.5-49.5T150-390q29 0 49.5 20.5T220-320q0 29-20.5 49.5T150-250Zm660 0q-29 0-49.5-20.5T740-320q0-29 20.5-49.5T810-390q29 0 49.5 20.5T880-320q0 29-20.5 49.5T810-250Zm-330-70q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-440q0 50-34.5 85T480-320Zm0-180q-25 0-42.5 17T420-440q0 25 17.5 42.5T480-380q26 0 43-17.5t17-42.5q0-26-17-43t-43-17Zm0 60Zm0 300Z" />
            </svg>
          </button>
          <button onClick={() => setChangeContent("likes")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="48px"
              viewBox="0 -960 960 960"
              width="48px"
              style={{
                fill: changeContent == "likes" ? "#000000" : "#A9A9A9",
                borderBottom:
                  changeContent === "likes" ? "2px solid black" : "transparent",
                transition: "border-bottom 0.3s ease",
              }}
            >
              <path d="m480-121-41-37q-105.77-97.12-174.88-167.56Q195-396 154-451.5T96.5-552Q80-597 80-643q0-90.15 60.5-150.58Q201-854 290-854q57 0 105.5 27t84.5 78q42-54 89-79.5T670-854q89 0 149.5 60.42Q880-733.15 880-643q0 46-16.5 91T806-451.5Q765-396 695.88-325.56 626.77-255.12 521-158l-41 37Zm0-79q101.24-93 166.62-159.5Q712-426 750.5-476t54-89.14q15.5-39.13 15.5-77.72 0-66.14-42-108.64T670.22-794q-51.52 0-95.37 31.5T504-674h-49q-26-56-69.85-88-43.85-32-95.37-32Q224-794 182-751.5t-42 108.82q0 38.68 15.5 78.18 15.5 39.5 54 90T314-358q66 66 166 158Zm0-297Z" />
            </svg>
          </button>
          <div className="underline"></div>
        </div>
        {changeContent == "subscribers" && <FollowersList userId={id} content={updateChangeContent} />}
        {changeContent == "subscriptions" && <FollowingList userId={id} content={updateChangeContent} />}
      </div>
      {changeContent == "posts" && (
        <>
          <h1 className="postsInfo">Посты созданные пользователем {userInfo}</h1>
          <div className="main-cards">
            {listOfPosts.map((post) => (
              <div className="cards" key={post.id}>
                <div
                  className="card"
                  onClick={() => {
                    navigate(`/post/${post.id}`);
                  }}
                >
                  <img src={post.imagePath} alt="Пост" />
                  <div>{post.title}</div>
                  <div>{post.username}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {changeContent == "likes" && (
        <div className="users_likes">
          <h2>Понравившееся посты</h2>
          <div className="main-cards">
            {likedPosts.map((post) => (
              <div className="cards" key={post.id}>
                <div
                  className="card"
                  onClick={() => {
                    navigate(`/post/${post.id}`);
                  }}
                >
                  <img src={post.imagePath} alt="Пост" />
                  <div>{post.title}</div>
                  <div>{post.username}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {changeContent == "marks" && (
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
                      <div className="imgConatainer">
                        <img src={post.imagePath} alt="Пост" />
                        {addPostId.includes(post.id) && (
                          <svg
                            className="plus"
                            xmlns="http://www.w3.org/2000/svg"
                            height="80px"
                            viewBox="0 -960 960 960"
                            width="80px"
                            fill="#ffffff"
                          >
                            <path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z" />
                          </svg>
                        )}
                      </div>
                      <div>{post.title}</div>
                      <div>{post.username}</div>
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
                              <h3 className="nameFolderEdit">Редактирование папки <span>{group}</span></h3>
                              <input
                                className="editInput"
                                onFocus={() => setFocus(true)}
                                type="text"
                                placeholder="Введите новое название папки"
                                onChange={(e) =>
                                  setNewNameFolder(e.target.value)
                                }
                              />
                              <div id="comment_bubble" style={{display: focus ? "none" : "block"}}>Если не ввести новое название тогда сохраниться прежнее</div>
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
                                      <div className="imgConatainer">
                                        <img src={post.imagePath} alt="Пост" />

                                        {addPostId.includes(post.id) && (
                                          <svg
                                            className="plus"
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="80px"
                                            viewBox="0 -960 960 960"
                                            width="80px"
                                            fill="#ffffff"
                                          >
                                            <path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z" />
                                          </svg>
                                        )}
                                      </div>
                                      <div>{post.title}</div>
                                      <div>{post.username}</div>
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
                          <img src={post.imagePath} alt="Пост" />
                          <div>{post.title}</div>
                          <div>{post.username}</div>
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
                        <div
                          className="card"
                          onClick={() => {
                            navigate(`/post/${post.id}`);
                          }}
                        >
                          {clickViewCollect && (
                            <p className="nameGroup">
                              {collect.map((col) =>
                                post.id === col.PostId ? col.groupName : ""
                              )}
                            </p>
                          )}
                          <img src={post.imagePath} alt="Пост" />
                          <div>{post.title}</div>
                          <div>{post.username}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
