import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../helpers/AuthContext";
import FollowersList from "../components/FollowersList";
import FollowingList from "../components/FollowingList";
import { useNavigate, useParams } from "react-router-dom";
import Cropper from "react-easy-crop";
import axios from "axios";

function Profile() {
  let navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  let { id } = useParams();
  const [listOfPosts, setListOfPosts] = useState([]);
  const [userPhoto, setuserPhoto] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [checkUserPick, setCheckUserPick] = useState(false);
  const [userInfo, setUserInfo] = useState();
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3001/auth/basicinfo/${id}`).then((response) => {
      setuserPhoto(response.data.userPhoto);
      setUserInfo(response.data.username);
    });

    axios.get(`http://localhost:3001/posts/byuserid/${id}`).then((response) => {
      setListOfPosts(response.data.listOfPosts);
      setLikedPosts(response.data.formattedLikedPosts)
    });

  }, [id]);

  

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

        canvas.toBlob((blob) => {
          resolve(blob); // Возвращаем изображение как Blob
        }, "image/jpeg"); // Или "image/png", в зависимости от формата
      };
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (croppedArea) {
      const croppedImage = await getCroppedImg(userPhoto, croppedArea);

      const formData = new FormData();
      formData.append("avatar", croppedImage, "avatar.jpg"); // Используем Blob для отправки файла

      axios
        .post("http://localhost:3001/auth/avatar", formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          console.log("Avatar updated successfully!", response);
          setCheckUserPick(false);
        })
        .catch((error) =>
          console.error("There was an error uploading the file!", error)
        );
    }
  };

  return (
    <div className="profile">
      <div className="basic-info">
        {userPhoto ? (
          <img src={userPhoto} alt="User Avatar" className="avatar" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="48px"
            viewBox="0 -960 960 960"
            width="48px"
            fill="#000000"
          >
            <path d="M222-255q63-44 125-67.5T480-346q71 0 133.5 23.5T739-255q44-54 62.5-109T820-480q0-145-97.5-242.5T480-820q-145 0-242.5 97.5T140-480q0 61 19 116t63 109Zm257.81-195q-57.81 0-97.31-39.69-39.5-39.68-39.5-97.5 0-57.81 39.69-97.31 39.68-39.5 97.5-39.5 57.81 0 97.31 39.69 39.5 39.68 39.5 97.5 0 57.81-39.69 97.31-39.68 39.5-97.5 39.5Zm.66 370Q398-80 325-111.5t-127.5-86q-54.5-54.5-86-127.27Q80-397.53 80-480.27 80-563 111.5-635.5q31.5-72.5 86-127t127.27-86q72.76-31.5 155.5-31.5 82.73 0 155.23 31.5 72.5 31.5 127 86t86 127.03q31.5 72.53 31.5 155T848.5-325q-31.5 73-86 127.5t-127.03 86Q562.94-80 480.47-80Zm-.47-60q55 0 107.5-16T691-212q-51-36-104-55t-107-19q-54 0-107 19t-104 55q51 40 103.5 56T480-140Zm0-370q34 0 55.5-21.5T557-587q0-34-21.5-55.5T480-664q-34 0-55.5 21.5T403-587q0 34 21.5 55.5T480-510Zm0-77Zm0 374Z" />
          </svg>
        )}

        <button
          onClick={() => {
            setCheckUserPick(true);
          }}
        >
          Изменить фото
        </button>
        <>
          {checkUserPick && (
            <form onSubmit={onSubmit}>
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
        <FollowersList userId={id} />
        <FollowingList userId={id} />
      </div>
      <h1>Посты созданные пользователем {userInfo}</h1>
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
    </div>
  );
}

export default Profile;
