import './App.css'
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom"
import Registration from "./pages/Registation"
import Login from "./pages/Login"
import Home from "./pages/Home"
import axios from 'axios'
import { useState, useEffect } from 'react'
import { AuthContext } from './helpers/AuthContext'
import logo from "../src/assets/logo.png"
import Other from '../src/pages/Other'
import CreatePost from '../src/pages/CreatePost'
import Post from '../src/pages/Post'
import Profile from './pages/Profile'
import DropdownMenu from './components/DropdownMenu'

function App() {
  const [authState, setAuthState] = useState({ username: "", id: "", status: false })
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegistModal, setShowRegistModal] = useState(false)

  useEffect(() => {
    axios.get("http://localhost:3001/auth/auth", { withCredentials: true }).then((response) => {
      if (response.data.error) {
        setAuthState({ ...authState, status: false })
      } else {
        setAuthState({ username: response.data.username, id: response.data.id, status: true })
      }
    })
  }, [])

  const logout = () => {
    axios.post("http://localhost:3001/auth/logout", {}, { withCredentials: true }).then(() => {
      setAuthState({ username: "", id: 0, status: false })
    })
  }

  return (
    <div>
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <Router>
          <header>
            <div className='links'>
              <Link to={"/"}>
                <div className='logo'>
                  <img src={logo} alt="logo" />
                  Pinterest
                </div>
              </Link>
              {!authState.status ? (
                <>
                  <div className="link-box">
                    <button className='login' onClick={() => setShowLoginModal(true)}>
                      Войти
                    </button>
                  </div>
                  <div className='link-box'>
                    <button className='registration' onClick={() => setShowRegistModal(true)}>
                      Регистрация
                    </button>
                  </div>
                  
                </>
              ) : (
                <>
                  <DropdownMenu className={'DropDown-menu'}></DropdownMenu>
                </>
              )}
            </div>
          </header>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/other" element={<Other />} />
            <Route path="/createPost" element={<CreatePost />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
        </Router>
        {showLoginModal && (
          <div className="modal" onClick={() => setShowLoginModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={() => setShowLoginModal(false)}>
                &times;
              </button>
              <Login closeModal={() => setShowLoginModal(false)} />
            </div>
          </div>
        )}
        {showRegistModal && (
          <div className="modal" onClick={() => setShowRegistModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className='close-button' onClick={() => setShowRegistModal(false)}>
                &times;
              </button>
              <Registration closeModal={() => setShowRegistModal(false)} />
            </div>
          </div>
        )}
      </AuthContext.Provider>
    </div>
  )
}

export default App