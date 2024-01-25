import React from 'react';
import "../css/MovieCard.css"
const MovieItem = ({ movie }) => {
    const {backdrop_path,title,release_date} = movie;

  return (
    <div className="movie-card">
      <img src={"http://image.tmdb.org/t/p/w500"+backdrop_path} alt={title} className="movie-image" />
      <div className="movie-details">
        <h2 className="movie-title">{title}</h2>
        <p className="movie-genres">{}</p>
        <p className="movie-release-date">Release Date: {release_date.substring(0,4)}</p>
      </div>
    </div>
  );
};

export default MovieItem;
