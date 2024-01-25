import React from "react";
import "../css/MovieCard.css";
const SeriesItem = ({ movie }) => {
  const { backdrop_path, name, first_air_date } = movie;
  let handleFavClick = () => {
    console.log("Favorite Clicked");
  };
  return (
    <div className="movie-card">
      <img
        src={"http://image.tmdb.org/t/p/w500" + backdrop_path}
        alt={name}
        className="movie-image"
      />
      <div className="movie-details">
        <h2 className="movie-title">{name}</h2>
        <p className="movie-genres">{}</p>
        <p className="movie-release-date">
          Release Date: {first_air_date.substring(0, 4)}
        </p>
        {/* <span onClick={handleFavClick} className="favorite-icon">
          &#10084;
        </span> */}
      </div>
    </div>
  );
};

export default SeriesItem;
