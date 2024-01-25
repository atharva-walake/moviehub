import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieItem from '../components/MovieItem';
import {Link} from 'react-router-dom'
let URL = "https://api.themoviedb.org/3/list/8288785";

const KEY =  "8a51da93e6f121859c719ef054a36b9f";
const SESSION_ID = "a3f1a1c8d140f5dea29d242ac2bf59742cadf77c"
const Favorite = () => {
  const [movies, setMovies] = useState([]);
  // console.log(URL);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          URL,
          {
            params: {
              api_key: KEY,
              session_id: SESSION_ID
            },
          }
        );
        console.log(response.data);
        setMovies(response.data.items);
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
      <h1 className="mt-4 mb-4">My Movie App</h1>
      <div className="row">
        {movies.map((movie) => (
          <div key={movie.id} className="col-md-3 mb-4">
            <Link to={`/movies/${movie.id}`} style={{ textDecoration: 'none' }}>
                <MovieItem movie={movie} />
            </Link>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Favorite;
