import React, {useEffect, useState} from 'react'
import axios from "axios"


function Home() {
  const [listOfPosts, setListOfPosts] = useState([])
  useEffect(() => {
    axios.get("http://localhost:3001/other").then((response) => {
      console.log(response.data.listOfPosts)
      setListOfPosts(response.data.listOfPosts)
    })
  }, [])

  return (
    <div>
      {listOfPosts.map(post => (
        <div key={post.id}>
          <div>{post.title}</div>
          {post.image && <img src={post.image} alt='qwerty' />}
        </div>
      ))}
    </div>
  )
}

export default Home
