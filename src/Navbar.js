import React from 'react';

const Navbar = ({
  showNavbar,
  handleLogoClick,
  handleSearchSubmit,
  searchInputRef,
  searchTerm,
  handleSearchChange,
  handleShowFavorites
}) => {
  return (
    <>
      {showNavbar && (
        <nav className="navbar">
          <div className="navbar-left">
            <img
              src="/imagespark-logo.png"
              alt="ImageSpark Logo"
              className="logo"
              onClick={handleLogoClick}
            />
            {window.innerWidth > 780 && (
              <span className="site-title" onClick={handleLogoClick}>
                ImageSpark
              </span>
            )}
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                ref={searchInputRef}
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search images..."
              />
              <button type="submit">Search</button>
            </form>
          </div>
          <div className="favorites-link" onClick={handleShowFavorites}>
            {window.innerWidth > 780 && <span>See Favorites</span>}
            <i className="fas fa-star"></i>{' '}
          </div>
        </nav>
      )}
      {!showNavbar && (
        <div className="initial-search">
          <img src="/imagespark-logo.png" alt="ImageSpark Logo" className="logo-initial" />
          <h1 className="site-title">ImageSpark</h1>
          <h2 className="slogan">Ignite Your Imagination</h2>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              ref={searchInputRef}
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search images..."
            />
            <button type="submit">Search</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Navbar;