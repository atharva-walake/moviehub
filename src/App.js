// import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navvbar from "./commons/Navbar";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";

// import Button from 'react-bootstrap/Button';
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MovieList from "./pages/MovieList";
import MovieDetail from "./pages/MovieDetail";
import SeriesList from "./pages/SeriesList";
import Favorite from "./pages/Favorite";
const theme = createTheme();

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
          <Navvbar />
        
          <Routes>
            <Route path="/" element={<Home></Home>} />
            <Route path="/movies" element={<MovieList></MovieList>} />
            <Route path="/series" element={<SeriesList></SeriesList>} />
            <Route path="/movies/:id" element={<MovieDetail></MovieDetail>} />
            <Route path="/favorite" element={<Favorite></Favorite>} />
          </Routes>
        
      </ThemeProvider>
    </>
  );
}

export default App;
