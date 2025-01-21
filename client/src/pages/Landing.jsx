import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Photo1 from "../assets/imagesForLanding/1.jpg";
import Photo2 from "../assets/imagesForLanding/2.jpg";
import Photo3 from "../assets/imagesForLanding/3.jpg";
import Photo4 from "../assets/imagesForLanding/4.jpg";
import Photo5 from "../assets/imagesForLanding/5.jpg";
import Photo6 from "../assets/imagesForLanding/6.jpg";
import Photo7 from "../assets/imagesForLanding/7.jpg";
import Photo8 from "../assets/imagesForLanding/8.jpg";
import Photo9 from "../assets/imagesForLanding/9.jpg";
import Photo10 from "../assets/imagesForLanding/10.jpg";
import Photo11 from "../assets/imagesForLanding/11.jpg";
import Photo12 from "../assets/imagesForLanding/12.jpg";
import Photo13 from "../assets/imagesForLanding/13.jpeg";
import Photo1_1 from "../assets/imagesForLanding/1-1.jpg";
import Photo1_2 from "../assets/imagesForLanding/1-2.jpg";
import Photo1_3 from "../assets/imagesForLanding/1-3.jpg";
import Photo1_4 from "../assets/imagesForLanding/1-4.jpg";
import Photo1_5 from "../assets/imagesForLanding/1-5.jpg";
import Photo1_6 from "../assets/imagesForLanding/1-6.jpg";
import Photo1_7 from "../assets/imagesForLanding/1-7.jpg";
import Photo1_8 from "../assets/imagesForLanding/1-8.jpg";
import Photo1_9 from "../assets/imagesForLanding/1-9.jpg";
import Photo1_10 from "../assets/imagesForLanding/1-10.jpg";
import Photo1_11 from "../assets/imagesForLanding/1-11.jpg";
import Photo1_12 from "../assets/imagesForLanding/1-12.jpg";
import Photo1_13 from "../assets/imagesForLanding/1-13.jpg";
import Photo2_1 from "../assets/imagesForLanding/2-1.jpg";
import Photo2_2 from "../assets/imagesForLanding/2-2.jpg";
import Photo2_3 from "../assets/imagesForLanding/2-3.jpg";
import Photo2_4 from "../assets/imagesForLanding/2-4.jpg";
import Photo2_5 from "../assets/imagesForLanding/2-5.jpg";
import Photo2_6 from "../assets/imagesForLanding/2-6.jpg";
import Photo2_7 from "../assets/imagesForLanding/2-7.jpg";
import Photo2_8 from "../assets/imagesForLanding/2-8.jpg";
import Photo2_9 from "../assets/imagesForLanding/2-9.jpg";
import Photo2_10 from "../assets/imagesForLanding/2-10.jpg";
import Photo2_11 from "../assets/imagesForLanding/2-11.jpg";
import Photo2_12 from "../assets/imagesForLanding/2-12.jpg";
import Photo2_13 from "../assets/imagesForLanding/2-13.jpg";

function Landing() {
    const [frame, setFrame] = useState("newYear");
    const [exitFrame, setExitFrame] = useState("");
    const navigate = useNavigate();

  const clickLandingBtn = (text) => {
    setExitFrame(frame);

    setFrame(text);
  };

  const checkClass = (text) => {
    if (text === frame) {
        return "viewCollections enter";
    } 
    if (text === exitFrame) {
        return "viewCollections exit";
    } else {
        return "noneClass"
    }
  };


  console.log(exitFrame)
  return (
    <div className="landing">
      <section className="firstSection">
        <div className="section">
          <h1>Найдите свежие идеи:</h1>
          {frame === "newYear" && (
            <h2
              className="frameInfo"
              style={{ animation: "visible 2s ease-in-out forwards" }}
            >
              идея Нового Года
            </h2>
          )}
          {exitFrame === "newYear" && (
            <h2
              className="frameInfo"
              style={{ animation: "visibleExit 2s ease-in-out forwards" }}
            >
              идея Нового Года
            </h2>
          )}

          {frame === "home" && (
            <h2
              className="frameInfo homeFrame"
              style={{
                animation: "visible 2s ease-in-out forwards",
                color: "#63a685",
              }}
            >
              идея домашнего декора
            </h2>
          )}
          {exitFrame === "home" && (
            <h2
              className="frameInfo homeFrame"
              style={{
                animation: "visibleExit 2s ease-in-out forwards",
                color: "#63a685",
              }}
            >
              идея домашнего декора
            </h2>
          )}
          {frame === "style" && (
            <h2
              className="frameInfo styleFrame"
              style={{
                animation: "visible 2s ease-in-out forwards",
                color: "#3d7ad6",
              }}
            >
              идея стильного образа
            </h2>
          )}
          {exitFrame === "style" && (
            <h2
              className="frameInfo styleFrame"
              style={{
                animation: "visibleExit 2s ease-in-out forwards",
                color: "#3d7ad6",
              }}
            >
              идея стильного образа
            </h2>
          )}

          <div className="landingNavButtons">
            <div
              className="landingBtn"
              onClick={() => clickLandingBtn("newYear")}
              style={{
                backgroundColor: frame === "newYear" ? "green" : "#bfbfbf",
              }}
            ></div>
            <div
              className="landingBtn"
              onClick={() => clickLandingBtn("home")}
              style={{
                backgroundColor: frame === "home" ? "#63a685" : "#bfbfbf",
              }}
            ></div>
            <div
              className="landingBtn"
              onClick={() => clickLandingBtn("style")}
              style={{
                backgroundColor: frame === "style" ? "#3d7ad6" : "#bfbfbf",
              }}
            ></div>
          </div>
          <div
            className={checkClass("newYear")}
            
          >
            <div className="first-Collection styleCollections">
              <img src={Photo10} alt="" />
              <img src={Photo11} alt="" />
            </div>
            <div className="firstCollection styleCollections">
              <img src={Photo1} alt="" />
              <img src={Photo2} alt="" />
            </div>
            <div className="secondCollection styleCollections">
              <img src={Photo3} alt="" />
              <img src={Photo4} alt="" />
            </div>
            <div className="thirdCollection styleCollections">
              <img src={Photo5} alt="" />
            </div>
            <div className="fourthCollection styleCollections">
              <img src={Photo6} alt="" />
              <img src={Photo7} alt="" />
            </div>
            <div className="fifthCollection styleCollections">
              <img src={Photo8} alt="" />
              <img src={Photo9} alt="" />
            </div>
            <div className="sixthCollection styleCollections">
              <img src={Photo12} alt="" />
              <img src={Photo13} alt="" />
            </div>
          </div>
          <div
            className={checkClass("home")}
           
          >
            <div className="first-Collection styleCollections">
              <img src={Photo1_1} alt="" />
              <img src={Photo1_2} alt="" />
            </div>
            <div className="firstCollection styleCollections">
              <img src={Photo1_3} alt="" />
              <img src={Photo1_4} alt="" />
            </div>
            <div className="secondCollection styleCollections">
              <img src={Photo1_5} alt="" />
              <img src={Photo1_6} alt="" />
            </div>
            <div className="thirdCollection styleCollections">
              <img src={Photo1_7} alt="" />
            </div>
            <div className="fourthCollection styleCollections">
              <img src={Photo1_8} alt="" />
              <img src={Photo1_9} alt="" />
            </div>
            <div className="fifthCollection styleCollections">
              <img src={Photo1_10} alt="" />
              <img src={Photo1_11} alt="" />
            </div>
            <div className="sixthCollection styleCollections">
              <img src={Photo1_12} alt="" />
              <img src={Photo1_13} alt="" />
            </div>
          </div>
          <div
            className={checkClass("style")}
          >
            <div className="first-Collection styleCollections">
              <img src={Photo2_1} alt="" />
              <img src={Photo2_2} alt="" />
            </div>
            <div className="firstCollection styleCollections">
              <img src={Photo2_3} alt="" />
              <img src={Photo2_4} alt="" />
            </div>
            <div className="secondCollection styleCollections">
              <img src={Photo2_5} alt="" />
              <img src={Photo2_6} alt="" />
            </div>
            <div className="thirdCollection styleCollections">
              <img src={Photo2_7} alt="" />
            </div>
            <div className="fourthCollection styleCollections">
              <img src={Photo2_8} alt="" />
              <img src={Photo2_9} alt="" />
            </div>
            <div className="fifthCollection styleCollections">
              <img src={Photo2_10} alt="" />
              <img src={Photo2_11} alt="" />
            </div>
            <div className="sixthCollection styleCollections">
              <img src={Photo2_12} alt="" />
              <img src={Photo2_13} alt="" />
            </div>
          </div>
        </div>
      </section>
      <section className="secondSection">
        <div className="section">
          <div className="imagesArea" onClick={() => navigate(`/posts/?tags=${'стиль'}`)}>
            <img className="backImage" src={Photo2_12} alt="" />
            <img className="backImage" src={Photo2_11} alt="" />
            <img className="backImage" src={Photo2_9} alt="" />
            <img className="centerImage" src={Photo2_7} alt="" />
            <div className="pageLink">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="40px"
                viewBox="0 -960 960 960"
                width="40px"
                fill="#000000"
              >
                <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
              </svg>
              <h1>Стильные образы для мужчин</h1>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
