import React from 'react';
import './SocialLinks.css';

const SocialLinks: React.FC = () => {
  return (
    <div className="social-links">
      <h4>Find Me Here: </h4>
      <ul>
        <li>
          <a href="https://www.linkedin.com/in/rohanbalkondekar/" target="_blank" rel="noopener noreferrer">
            linkedin.com/in/rohanbalkondekar
          </a>
        </li>
        <li>
          <a href="https://github.com/rohanbalkondekar" target="_blank" rel="noopener noreferrer">
            github.com/rohanbalkondekar
          </a>
        </li>
        <li>
          <a href="http://hf.co/rohanbalkondekar" target="_blank" rel="noopener noreferrer">
            hf.co/rohanbalkondekar
          </a>
        </li>
        <li>
          <a href="https://x.com/rohanbalkonde" target="_blank" rel="noopener noreferrer">
            x.com/rohanbalkonde
          </a>
        </li>
        <li>
          <a href="https://medium.com/@rohanbalkondekar" target="_blank" rel="noopener noreferrer">
            medium.com/@rohanbalkondekar
          </a>
        </li>
        <li>
          <a href="https://www.instagram.com/rohanbalkondekar/" target="_blank" rel="noopener noreferrer">
            instagram.com/rohanbalkondekar
          </a>
        </li>
      </ul>
      <h4>Contact:</h4>
      <p>Email: <a href="mailto:rohan.balkondekar@gmail.com">rohan.balkondekar@gmail.com</a></p>
      <p>Ph: <a href="tel:+919604295874">+91 9604295874</a></p>
    </div>
  );
};

export default SocialLinks;