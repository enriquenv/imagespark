import React from 'react';

function ImageGrid({ photos, favorites, toggleFavorite, lastImageRef }) {
 
  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div className="image-grid">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="image-container"
          ref={index === photos.length - 1 ? lastImageRef : null}
        >
          <img src={photo.urls.small} alt={photo.alt_description} />
          <div className="image-overlay">
            <div className="overlay-content">
              <h2>{photo.alt_description}</h2>
              <hr className="separator" />
              <p>{photo.user.name}</p>
              <div className="overlay-icons"> 
                <button
                  className="icon-button"
                  onClick={() => openImageInNewTab(photo.urls.full)} 
                >
                  <i className="fas fa-up-right-from-square"></i>
                </button>
                <button
                  className={`favorite-button ${favorites.some(favPhoto => favPhoto.id === photo.id) ? 'favorited' : ''}`}
                  onClick={() => toggleFavorite(photo)}
                >
                  <i className={favorites.some(favPhoto => favPhoto.id === photo.id) ? 'fas fa-star' : 'far fa-star'}></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ImageGrid;