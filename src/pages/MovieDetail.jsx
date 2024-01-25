// MovieDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite'; // Material-UI favorite icon
// import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
let ADD_FAV = "https://api.themoviedb.org/3/list/8288785/add_item"
let REM_FAV = "https://api.themoviedb.org/3/list/8288785/remove_item"
let ITEM_STAT = "https://api.themoviedb.org/3/list/8288785/item_status"
let URL = "https://api.themoviedb.org/3";
const KEY = "8a51da93e6f121859c719ef054a36b9f";
const SESSION_ID = "a3f1a1c8d140f5dea29d242ac2bf59742cadf77c"
const MovieDetail = (params) => {
  const { id } = useParams();
  const [movie, setMovie] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          URL + `/movie/` + id,
          {
            params: {
              api_key: KEY,
              language: 'en-US',
              page: 1,
            },
          }
        );
        // console.log(response.data);
        setMovie(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          ITEM_STAT,
          {
            params: {
              api_key: KEY,
              language: 'en-US',
              movie_id: movie.id? movie.id : id
            },
          }
        );
        // console.log(movie.id);
        // console.log(response.data);
        setIsFavorite(response.data.item_present)
        // setMovie(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  let imageSrc = "http://image.tmdb.org/t/p/w500" + movie.backdrop_path;

  const handleFavoriteToggle = () => {
    // Implement your favorite functionality here
    // You may want to store the favorite status in a database or state management system
    if(!isFavorite)
    {
      //add to favorite
      const fetchData = async () => {
        try {
          const response = await axios.post(
            ADD_FAV,
            {
              media_id: movie.id
            },
            {
              params: {
                api_key: KEY,
                session_id: SESSION_ID
              }
            }
          );
          console.log(response.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }else{
      //remove From favorite
      const fetchData = async () => {
        try {
          const response = await axios.post(
            REM_FAV,
            {
              media_id: movie.id
            },
            {
              params: {
                api_key: KEY,
                session_id: SESSION_ID
              }
            }
          );
          console.log(response.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" mb={2}>
            {movie.title}
          </Typography>
          <IconButton onClick={handleFavoriteToggle} color={isFavorite ? 'default' : 'default'}>
            {isFavorite? <FavoriteIcon />: <FavoriteBorderIcon/>}

          </IconButton>
        </Box>
        <Typography variant="subtitle1">{movie.release_date}</Typography>
        <Typography variant="body1" mb={2}>
          <strong>Tagline:</strong> {movie.tagline}
        </Typography>
        <Typography variant="body1" mb={2}>
          <strong>Overview:</strong> {movie.overview}
        </Typography>
        <Typography variant="body1" mb={2}>
          <a href={'https://www.imdb.com/title/' + movie.imdb_id}><strong>IMDB Website</strong></a>
        </Typography>
        <Box mt={2}>
          <img src={imageSrc} alt={movie.title} style={{ maxWidth: '100%', height: 'auto' }} />
        </Box>
      </Paper>
    </Box>
  );
};

export default MovieDetail;
