import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Registration from "./pages/Registation";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import axios from "axios";
import { useState, useEffect } from "react";
import { AuthContext } from "./helpers/AuthContext";
import logo from "../src/assets/logo.png";
import Other from "../src/pages/Other";
import CreatePost from "../src/pages/CreatePost";
import Post from "../src/pages/Post";
import Profile from "./pages/Profile";
import DropdownMenu from "./components/DropdownMenu";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [authState, setAuthState] = useState({
    username: "",
    id: "",
    status: false,
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistModal, setShowRegistModal] = useState(false);
  const [viewPostsButton, setViewPostsButton] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3001/auth/auth", { withCredentials: true })
      .then((response) => {
        if (response.data.error) {
          setAuthState({ ...authState, status: false });
        } else {
          setAuthState({
            username: response.data.username,
            id: response.data.id,
            status: true,
          });
        }
      });
  }, []);

  const logout = () => {
    axios
      .post("http://localhost:3001/auth/logout", {}, { withCredentials: true })
      .then(() => {
        setAuthState({ username: "", id: 0, status: false });
      });
  };

  return (
    <div>
      <ToastContainer />
      <AuthContext.Provider
        value={{ authState, setAuthState, setShowRegistModal, showRegistModal, setViewPostsButton, viewPostsButton }}
      >
        <Router>
          <header>
            <div className="links">
              <div className="warningMessage">Этот сайт не является Pinterest или его зеркалом. Данный сайт является проектом разработанный исключительно в целях обучения разработчика.</div>
              <Link to={"/"}>
                <div className="logo" onClick={() => setViewPostsButton(false)}>
                  <img src={logo} alt="logo" />
                  Pinterest
                </div>
              </Link>
              <Link to={"/posts"}>
                <div>
                  <button
                    className="lookAtPosts"
                    onClick={() => setViewPostsButton(!viewPostsButton)}
                    style={{
                      backgroundColor: viewPostsButton
                        ? "black"
                        : "transparent",
                    }}
                    disabled={viewPostsButton}
                    
                  >
                    <strong
                      style={{ color: viewPostsButton ? "white" : "black" }}
                    >
                      Просмотреть
                    </strong>
                  </button>
                </div>
              </Link>
              {!authState.status ? (
                <>
                  <div className="link-box">
                    <button
                      className="login"
                      onClick={() => setShowLoginModal(true)}
                    >
                      <strong>Войти</strong>
                    </button>
                  </div>
                  <div className="link-box">
                    <button
                      className="registration"
                      onClick={() => setShowRegistModal(true)}
                    >
                      <strong>Регистрация</strong>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <DropdownMenu className={"DropDown-menu"}></DropdownMenu>
                </>
              )}
            </div>
          </header>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/posts" element={<Home />} />
            <Route path="/other" element={<Other />} />
            <Route path="/createPost" element={<CreatePost />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
          {showLoginModal && (
            <div className="modal" onClick={() => setShowLoginModal(false)}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="close-button"
                  onClick={() => setShowLoginModal(false)}
                >
                  &times;
                </button>
                <Login
                  closeModal={() => setShowLoginModal(false)}
                  openRegistration={() => {
                    setShowLoginModal(false);
                    setShowRegistModal(true);
                  }}
                />
              </div>
            </div>
          )}
          {showRegistModal && (
            <div className="modal" onClick={() => setShowRegistModal(false)}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="close-button"
                  onClick={() => setShowRegistModal(false)}
                >
                  &times;
                </button>
                <Registration
                  closeModal={() => setShowRegistModal(false)}
                  openLogin={() => {
                    setShowRegistModal(false);
                    setShowLoginModal(true);
                  }}
                />
              </div>
            </div>
          )}
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
