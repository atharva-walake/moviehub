import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import MovieItem from '../components/MovieItem';
import {Link} from 'react-router-dom'
import SeriesItem from '../components/SeriesItem';
let URL = "https://api.themoviedb.org/3";
const KEY =  "8a51da93e6f121859c719ef054a36b9f";

const SeriesList = () => {
  const [movies, setMovies] = useState([]);
  // console.log(URL);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          URL+"/tv/popular",
          {
            params: {
              api_key: KEY,
              language: 'en-US',
              page: 1,
            },
          }
        );
        console.log(response.data);
        setMovies(response.data.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {/* <div>
      {movies.map((movie) => (
        <MovieItem key={movie.id} movie={movie} />
        ))}
      </div> */}
      <div className="container">
      {/* <h2>Popular Movies</h2> */}
      <h1 className="mt-4 mb-4">My Series App</h1>
      <div className="row">
        {movies.map((movie) => (
          <div key={movie.id} className="col-md-3 mb-4">
            <Link to={`/movies/${movie.id}`} style={{ textDecoration: 'none' }}>
                <SeriesItem movie={movie} />
            </Link>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default SeriesList;
