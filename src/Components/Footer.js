import React from "react";
import { BsTwitter } from "react-icons/bs";
import { SiLinkedin } from "react-icons/si";
import { BsYoutube } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="footer-wrapper">
      <div className="footer-section-one">
        <div className="footer-logo-container">
        </div>
        <div className="footer-icons">
          <BsTwitter />
          <SiLinkedin />
          <BsYoutube />
          < FaGithub />
        </div>
      </div>
      <div className="footer-section-two">
        <div className="footer-section-columns">
          <span>команда 3/5</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;