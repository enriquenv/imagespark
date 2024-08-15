import React, { useState, useEffect, useRef } from 'react';
import ImageGrid from './ImageGrid';
import './App.css';

function App() {
  const [photos, setPhotos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = sessionStorage.getItem('favorites');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });
  const [showNavbar, setShowNavbar] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);

  const loadedPhotoIds = useRef(new Set());
  const lastImageRef = useRef(null);
  const searchInputRef = useRef(null);

  const fetchData = async (url) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      let fetchUrl;
      
      if (searchTerm === '') {
        fetchUrl = `https://api.unsplash.com/photos?page=${pageNumber}&client_id=${process.env.REACT_APP_CLIENT_ID}`;
        setPageNumber(pageNumber + 1);
      } else {
        
        fetchUrl = url || `https://api.unsplash.com/search/photos?query=${searchTerm}&per_page=15&client_id=${process.env.REACT_APP_CLIENT_ID}`;
      }

      const response = await fetch(fetchUrl);
      const data = await response.json();

      setNextPageUrl(getNextPageLink(response.headers.get('Link')));

      
      const photosArray = data.results || data;

      const newPhotos = photosArray.filter(
        (photo) => !loadedPhotoIds.current.has(photo.id)
      );
      setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
      newPhotos.forEach((photo) => loadedPhotoIds.current.add(photo.id));
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextPageLink = (linkHeader) => {
    if (!linkHeader) return null;
    const links = linkHeader.split(',');
    const nextLink = links.find((link) => link.includes('rel="next"'));
    return nextLink ? nextLink.trim().split(';')[0].slice(1, -1) : null;
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadedPhotoIds.current.clear();
    setPhotos([]);
    setPageNumber(1);
    setShowAllPhotos(true);
    fetchData();
    setShowNavbar(true);
  };

  useEffect(() => {
    if (showNavbar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showNavbar]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          entries[0].target === lastImageRef.current &&
          nextPageUrl &&
          !isLoading
        ) {
          fetchData(nextPageUrl);
        }
      },
      { threshold: 1.0 }
    );

    if (lastImageRef.current) {
      observer.observe(lastImageRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, nextPageUrl]);

  useEffect(() => {
    sessionStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (photo) => {
    setFavorites((prevFavorites) => {
      const isFavorite = prevFavorites.some(
        (favPhoto) => favPhoto.id === photo.id
      );
      if (isFavorite) {
        return prevFavorites.filter((favPhoto) => favPhoto.id !== photo.id);
      } else {
        return [...prevFavorites, photo];
      }
    });
  };

  const handleShowFavorites = () => {
    setShowAllPhotos(false);
    setPhotos(favorites); 
  };

  const handleLogoClick = () => {
    setSearchTerm('');
    setPhotos([]);
    setShowAllPhotos(true);
    setShowNavbar(false);
    loadedPhotoIds.current.clear();
    setPageNumber(1);
    searchInputRef.current.focus();
  };

  return (
    <div className="App">
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
      <ImageGrid
        photos={showAllPhotos ? photos : favorites}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        lastImageRef={lastImageRef}
      />
    </div>
  );
}

export default App;