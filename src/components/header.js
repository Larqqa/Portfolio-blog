import React from 'react';
import Navigation from './Navigation';

const Header = ({ isRootPath, title }) => {
  
  const RootPath = () => {
    if (isRootPath) {
      return (
        <h1 className="main-heading">
          {title}
        </h1>
      );
    } else {
      return false;
    }
  };

  return (
    <header className="global-header">
      <RootPath />
      <Navigation />
    </header>
  );
};

export default Header;