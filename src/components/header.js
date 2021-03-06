import React from 'react';
import { Link } from 'gatsby';
import Navigation from './Navigation';
import '../styles/components/header.scss';

const Header = ({ isRootPath, title }) => {

  /*
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
  */

  return (
    <header className="global-header">
      <Link to="/">
        <h1 className="main-heading">{title}</h1>
      </Link>
      <Navigation />
    </header>
  );
};

export default Header;