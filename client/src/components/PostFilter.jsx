import { useNavigate } from "react-router-dom";
import React, { forwardRef, useImperativeHandle } from "react";

const PostFilter = forwardRef(({ searchTag, setSearchTag, listOfPosts, setFilteredPosts }, ref) => {
  const navigate = useNavigate();

  // Функция фильтрации постов по тегам
  const filterPostsByTags = (tags) => {
    if (tags.length > 0) {
      const filtered = listOfPosts.filter(post => {
        return tags.every(tag => post.tags && post.tags.includes(tag));
      });
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(listOfPosts);
    }
  };

  // Обработчик изменения в поле поиска
  const handleTagSearchChange = (e) => {
      const input = e.target.value;
      setSearchTag(input);
      const tagsToSearch = input.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      filterPostsByTags(tagsToSearch);

    // Обновление URL с параметрами для фильтрации
    navigate(`?tags=${tagsToSearch.join(',')}`);
  };

  const handleTagClick = (tag) => {
    setSearchTag(tag);
    filterPostsByTags([tag]);
    // Обновление URL с выбранным тегом
    navigate(`?tags=${tag}`);
  };
  useImperativeHandle(ref, () => ({
    handleTagClick,
  }));



  return (
    <div className="search">
      <input
        type="text"
        value={searchTag}
        onChange={handleTagSearchChange}
        placeholder="Поиск по тегам"
      />
    </div>
  );
});

export default PostFilter;