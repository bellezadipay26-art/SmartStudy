import bird from "./itech logo.png";

import "./Logo.css";

const Logo = () => {
  return (
    <div className="logo-container">
     <div className="logo-circle">
        <img src={bird} alt="ITECH Logo" className="logo-img" />
      </div>
    </div>
  );
};

export default Logo;
