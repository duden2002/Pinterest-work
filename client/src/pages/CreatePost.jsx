import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreatePost() {
  let navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const [tags, setTags] = useState([]); // State to store tags
  const [tagInput, setTagInput] = useState(''); // State to manage the tag input field

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setFileName(file.name); // Set the selected file name
    } else {
      setFileName(''); // Clear the name if no file is selected
    }
  };

  const handleTagChange = (e) => {
    setTagInput(e.target.value); // Update the tag input
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim().toLowerCase()]); // Add the tag if it's not empty and doesn't already exist
      setTagInput(''); // Clear the input field after adding
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove)); // Remove tag from the list
  };

  const onSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', image);
    formData.append('tags', tags); // Convert tags array to a JSON string

    axios.post("http://localhost:3001/posts", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then((response) => {
      console.log("Post created successfully!", response);
      navigate("/")
    })
    .catch(error => console.error("There was an error uploading the file!", error));
  };

  return (
    <div className="create">
      <form className='createForm' onSubmit={onSubmit}>
        <label className='createForm-label-title'>Title</label>
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
          />
          <span>Выберите изображение</span>
        </label>
        {fileName && <p className="file-name">{fileName}</p>} {/* Display file name */}

        <label className='createForm-label-tags'>Tags</label>
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
            disabled={!tagInput.trim()} // Disable button if input is empty
          >
            Add Tag
          </button>
        </div>
        <div className="tags-list">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag} 
              <button type="button" onClick={() => removeTag(tag)}>X</button>
            </span>
          ))}
        </div>

        <button className='btn-create' type="submit" disabled={!image}>Create</button>
      </form>
    </div>
  );
}

export default CreatePost;