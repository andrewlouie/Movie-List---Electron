import { Stats } from 'fs';

import { useEffect, useState } from 'react';

import TextField from '@mui/material/TextField';

import './App.css';

import Grid from './Grid/Grid';
import { SORT_ORDERS, Movie, Labels } from './types/types';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MovieCount from './MovieCount/MovieCount';
import CircularProgressWithLabel from './CircularProgressWithLabel/CircularProgressWithLabel';
import LabelsModal from './LabelsModal/LabelsModal';
import LabelSearch from './LabelSearch/LabelSearch';
import { useDarkMode } from './useDarkMode';

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
  const [labels, setLabels] = useState<Labels>({});
  const [showFavourites, setShowFavourites] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [notAdded, setNotAdded] = useState<string[]>([]);
  const [labelSearchValue, setLabelSearchValue] = useState<string[]>([]);

  const [sortOrder, setSortOrder] = useState(SORT_ORDERS.DATE_DESC);
  const [size, setSize] = useState<number>(6);

  const isDarkMode = useDarkMode();

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
    fs.readFile(path.join(folder, 'labels.txt'), (err, data) => {
      if (!err) {
        let json;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = [];
        }
        setLabels(json);
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
              setNotAdded(notAdded);
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

  const showLabelsModal = (title: string) => {
    setIsModalOpen(true);
    setSelectedMovie(title);
  }

  const saveLabels = () => {
    // Don't write empty arrays
    const labelsToWrite = Object.fromEntries(Object.entries(labels).filter(([_, val]) => val.length));
    fs.writeFile(path.join(folder, 'labels.txt'), JSON.stringify(labelsToWrite, null, 2), (err: Error) => {
      if (err) {
        console.error('Error writing labels', err);
      }
    });
  };

  const updateLabels = (newLabelsForSelection: string[]) => {
    setLabels({ ...labels, [selectedMovie]: newLabelsForSelection })
  };


  // Sort
  let sortedMovies = movies.sort(sortMovies);

  // Select favourites
  if (showFavourites) {
    sortedMovies = sortedMovies.filter((movie) => favourites.includes(movie.title));
  }

  // Select search matches
  sortedMovies = sortedMovies.filter((movie) => movie.title.toLowerCase().includes(searchInput.toLowerCase()));

  //Select label matches
  sortedMovies = sortedMovies.filter((movie) => {
    const labelsForMovie = labels[movie.title] || [];
    if (!labelSearchValue.length) {
      return true;
    }
    return labelsForMovie.some((v: string) => labelSearchValue.includes(v));
  });


  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div className='App' onKeyDown={handleKeyDown} role='menu' tabIndex={0}>
        {isLoading && <div className="App__spinner"><CircularProgressWithLabel value={percent} /></div>}
        {!isLoading && <>
          <MovieCount count={movieCount} notAdded={notAdded} />
          <div className="App__search">
            <TextField
              variant="standard"
              label='Search'
              sx={{ width: "250px" }}
              type='search'
              value={searchInput}
              onChange={(evt) => setSearchInput(evt.target.value)} />
            <LabelSearch
              labels={labels}
              labelSearchValue={labelSearchValue}
              setLabelSearchValue={setLabelSearchValue}/>
          </div>
          <Grid
            size={size}
            labels={labels}
            folder={folder}
            movies={sortedMovies}
            favourites={favourites}
            showLabelsModal={showLabelsModal}
            addOrRemoveFavourite={addOrRemoveFavourite}
            />
        </>}
        <LabelsModal
          open={isModalOpen}
          labels={labels}
          updateLabels={updateLabels}
          handleClose={() => {
            saveLabels();
            setIsModalOpen(false);
          }}
          currentTitle={selectedMovie}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
