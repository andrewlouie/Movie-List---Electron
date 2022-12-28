import { Stats } from 'fs';

import { useEffect, useState } from 'react';

import TextField from '@mui/material/TextField';

import './App.css';

import Grid from './Grid/Grid';
import { SORT_ORDERS, Movie } from './types/types';
import MovieCount from './MovieCount/MovieCount';
import CircularProgressWithLabel from './CircularProgressWithLabel/CircularProgressWithLabel';

const fs = window.require('fs');
const ipc = window.require('electron').ipcRenderer;
const path = window.require('path');
const Store = window.require('electron-store');

const store = new Store();

function App() {
  const [folder, setFolder] = useState<string>(store.get('folder'));
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [percent, setPercent] = useState<number>(0);
  const [movieCount, setMovieCount] = useState<number>(0);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [showFavourites, setShowFavourites] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');

  const [sortOrder, setSortOrder] = useState(SORT_ORDERS.DATE_DESC);
  const [size, setSize] = useState<number>(6);

  useEffect(() => {
    ipc.on('changeFolder', () => {
      setFolder(store.get('folder'));
    });

    ipc.on('sortByTitleAsc', () => {
      setSortOrder(SORT_ORDERS.TITLE_ASC);
    });

    ipc.on('sortByTitleDec', () => {
      setSortOrder(SORT_ORDERS.TITLE_DESC);
    });

    ipc.on('sortByDateDec', () => {
      setSortOrder(SORT_ORDERS.DATE_DESC);
    });

    ipc.on('sortByDateAsc', () => {
      setSortOrder(SORT_ORDERS.DATE_ASC);
    });

    ipc.on('viewFavourites', () => {
      setShowFavourites(true);
    });

    ipc.on('viewAll', () => {
      setShowFavourites(false);
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const newMovies:Movie[] = [];
    newMovies.length = 0;
    fs.readFile(path.join(folder, 'favourites.txt'), (err, data) => {
      if (!err) {
        let json;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = [];
        }
        setFavourites(json);
      }
    });
    fs.readdir(folder, (err: Error, results: string[]) => {
      if (err) {
        console.log(err);
        return;
      }
      if (results.length > 0) {
        const currentpct = 0;
        let b = 0;
        const notAdded: string[] = [];
        (function asyncloop(a) {
          const pct = Math.floor((a / (results.length - 1)) * 100);
          if (pct !== currentpct) {
            setPercent(pct);
          }
          fs.stat(path.join(folder, results[a], 'cover.jpg'), (err2: Error, stat: Stats) => {
            if (!err2) {
              newMovies.push({ title: results[a], mdate: stat.mtime });
              b += 1;
            } else {
              notAdded.push(results[a]);
            }
            if (a < results.length - 1) {
              asyncloop(a + 1);
            } else {
              setMovieCount(b);
              setIsLoading(false);
              setMovies(newMovies);
              console.log('Not added', notAdded);
            }
          });
        })(0);
      }
    });
  }, [folder]);


  function saveFavourites() {
    fs.writeFile(path.join(folder, 'favourites.txt'), JSON.stringify(favourites, null, 2), (err: Error) => {
      if (err) {
        console.error('Error writing favourites', err);
      }
    });
  }

  const addOrRemoveFavourite = (movieTitle: string) => {
    let newFavourites = [...favourites];
    if (newFavourites.includes(movieTitle)) {
      newFavourites = newFavourites.filter((title) => title !== movieTitle);
    } else {
      newFavourites.push(movieTitle);
    }
    setFavourites(newFavourites);
    saveFavourites();
  };

  const sortMovies: (a: Movie, b: Movie) => number = (a, b) => {
    /* eslint-disable curly */
    switch (sortOrder) {
      case SORT_ORDERS.TITLE_ASC:
        if (a.title < b.title) return -1;
        else if (b.title < a.title) return 1;
        return 0;
      case SORT_ORDERS.TITLE_DESC:
        if (a.title < b.title) return 1;
        else if (b.title < a.title) return -1;
        return 0;
      case SORT_ORDERS.DATE_ASC:
        if (a.mdate < b.mdate) return -1;
        else if (b.mdate < a.mdate) return 1;
        return 0;
      case SORT_ORDERS.DATE_DESC:
        if (a.mdate < b.mdate) return 1;
        else if (b.mdate < a.mdate) return -1;
        return 0;
    }
    return 0;
  };

  const handleKeyDown = (evt) => {
    switch (evt.keyCode) {
      case 109:
      case 189: {
        if (size > 0) {
          setSize(size - 1);
        }
        break;
      }
      case 107:
      case 187: {
        if (size < 13) {
          setSize(size + 1);
        }
        break;
      }
    }
  };

  let sortedMovies = movies.sort(sortMovies);
  if (showFavourites) {
    sortedMovies = sortedMovies.filter((movie) => favourites.includes(movie.title));
  }
  sortedMovies = sortedMovies.filter((movie) => movie.title.toLowerCase().includes(searchInput.toLowerCase()));

  return (
    <div className='App' onKeyDown={handleKeyDown} role='menu' tabIndex={0}>
      {isLoading && <div style={{ marginTop: '15px' }}><CircularProgressWithLabel value={percent} /></div>}
      {!isLoading && <>
        <MovieCount count={movieCount} />
        <TextField
          size='small'
          label='Search'
          type='search'
          value={searchInput}
          onChange={(evt) => setSearchInput(evt.target.value)} />
        <Grid size={size} favourites={favourites} addOrRemoveFavourite={addOrRemoveFavourite} folder={folder} movies={sortedMovies} />
      </>}
    </div>
  );
}

export default App;
