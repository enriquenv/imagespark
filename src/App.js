import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ImageGrid from './components/ImageGrid';
import './App.css';

function App() {
  // States
  const [photos, setPhotos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = localStorage.getItem('favorites');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });
  const [showNavbar, setShowNavbar] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);

  //Refs
  const loadedPhotoIds = useRef(new Set());
  const lastImageRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetching from Unsplash API
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

  // Extracting "next" page URL from Link header
  const getNextPageLink = (linkHeader) => {
    if (!linkHeader) return null;
    const links = linkHeader.split(',');
    const nextLink = links.find((link) => link.includes('rel="next"'));
    return nextLink ? nextLink.trim().split(';')[0].slice(1, -1) : null;
  };

  // Update search term
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Show new search results
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadedPhotoIds.current.clear();
    setPhotos([]);
    setPageNumber(1);
    setShowAllPhotos(true);
    fetchData();
    setShowNavbar(true);
  };

  // Search input automatic focus
  useEffect(() => {
    if (showNavbar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showNavbar]);

  // Intersection Observer for infinite scrolling
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

  // Save favorites to session storage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite status
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

  // Show favorite photos
  const handleShowFavorites = () => {
    setShowAllPhotos(false);
    setPhotos(favorites); 
  };

  // Logo click to homepage
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
      <Navbar
        showNavbar={showNavbar}
        handleLogoClick={handleLogoClick}
        handleSearchSubmit={handleSearchSubmit}
        searchInputRef={searchInputRef}
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        handleShowFavorites={handleShowFavorites}
      />
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