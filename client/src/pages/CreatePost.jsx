import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Notifications from '../components/Notifications';

function CreatePost() {
  let navigate = useNavigate();
  let postRef = useRef(null)
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [visible, setVisible] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file.type.startsWith('image/')) {
      setImage(file);
      setFileName(file.name);
    } else {
      setFileName('');
      postRef.current.notifyError("Выберите картинку формата JPG, JPEG или PNG")
    }
  };

  const handleTagChange = (e) => {
    setTagInput(e.target.value);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
      setVisible(true)
      setTimeout(() => {
        setVisible(false);
      }, 3000);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', image);
    formData.append('tags', tags);

    axios.post("http://localhost:3001/posts", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then((response) => {
      console.log("Пост создан успешно!", response);
      navigate("/posts")
      postRef.current.notifySuccess("Пост создан успешно!");
    })
    .catch(error => postRef.current.notifyError("Ошибка при создании поста: ", error));
  };

  return (
    <div className="create">
      <Notifications ref={postRef} />
      <form className='createForm' onSubmit={onSubmit}>
        <label className='createForm-label-title'>Название</label>
        <input 
          className='createForm-input-title'
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <label className='createForm-label-image'>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".jpg, .jpeg, .png"
          />
          <span>Выберите изображение</span>
        </label>
        {fileName && <p className="file-name">{fileName}</p>}

        <label className='createForm-label-tags'>Тэги</label>
        <div className="tags-container">
          <input
            type="text"
            value={tagInput}
            onChange={handleTagChange}
            placeholder="Add tags"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!tagInput.trim()}
            className='addTags'
          >
            Добавить тэг
          </button>
        </div>
        <div className="tags-list" style={{ alignItems: 'center', width: 520 }}>
          <div className={visible ? "tooltip" : "tool-exit"}>Нажмите на тэг чтобы удалить</div>
          {tags.map((tag, index) => (
              <span key={index} className="tag" onClick={() => removeTag(tag)}>
                {tag}
              </span>
          ))}
        </div>

        <button className='btn-create' type="submit" disabled={!image} >Создать</button>
      </form>
    </div>
  );
}

export default CreatePost;