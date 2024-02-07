import "./App.css";
import About from "./Components/About";
import Work from "./Components/Work";
import Contact from "./Components/Contact";
import Footer from "./Components/Footer";
import React from "react";
import BannerBackground from "./Assets/home-banner-background.png";
import { FiArrowRight } from "react-icons/fi";
import { Container, Nav } from "react-bootstrap";
import { Link } from "react-scroll";

function App() {

  const sectionEls = Array.from(document.querySelectorAll('.section'));
  const navLinkEls = Array.from(document.querySelectorAll('.nav-link'));
  
  let currentSection = null;
  
  window.addEventListener('scroll', () => {
    if (sectionEls) {
      sectionEls.forEach((sectionEl) => {
        if (window.scrollY >= sectionEl.offsetTop) {
          currentSection = sectionEl.id;
        }
      });
    }
  
    if (navLinkEls) {
      navLinkEls.forEach((navLinkEl) => {
        if (currentSection && navLinkEl.href.includes(currentSection)) {
          const activeElement = document.querySelector('.active');
          if (activeElement) {
            activeElement.classList.remove('active');
          }
          navLinkEl.classList.add('active');
        }
      });
    }
  });


  return (
    <div className="App">
      <div className="home-container">


      <header>
      <Container>
        <Nav className="nav-it" >
          <Link className="nav-link" to="about" spy={true} smooth={true} offset={-100} duration={500} href='/#about'>
              О проекте
          </Link>
          <Link className="nav-link" to="research" spy={true} smooth={true} offset={-100} duration={500} href='/#research'>
              Исследование
          </Link>
          <Link className="nav-link" to="blabla" spy={true} smooth={true} offset={-100} duration={500} href='/#blabla'>
              Блабла
          </Link>
          <Link className="nav-link" to="blabala" spy={true} smooth={true} offset={-100} duration={500} href='/#blabala'>
              Блабала
          </Link>
        </Nav>
      </Container>
    </header>


      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img src={BannerBackground} alt="" />
        </div>
        <div className="home-text-section">
          <h1 className="primary-heading">
            Проект хакатон писька писька
          </h1>
          <p className="primary-text">
            Healthy switcher chefs do all the prep work, like peeding, chopping
            & marinating, so you can cook a fresh food.
          </p>
          <button className="secondary-button">
            Order Now <FiArrowRight />{" "}
          </button>
        </div>
      </div>
    </div>


      <div id='about' className='section'><About /></div>
      <div id='research' className='section'><Work /></div>
      <div id='blabla' className='section'><Contact /></div>
      <div id='blabala' className='section'><Footer /></div>
    </div>
  );
}

export default App;
