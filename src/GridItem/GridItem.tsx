import { MouseEvent } from 'react';

import { Movie } from '../types/types';

import './GridItem.css';

const path = window.require('path');
const shell = window.require('electron').shell;

interface Props {
  movie: Movie,
  folder: string,
  favourite: boolean,
  addOrRemoveFavourite: Function,
}

function Grid(props: Props) {
  const {
    movie,
    folder,
    favourite,
    addOrRemoveFavourite,
  } = props;

  const handleClick = () => {
    console.log(path.join(folder, movie.title));
    shell.openPath(path.join(folder, movie.title));
  };

  const handleFavouriteClick = (evt: MouseEvent) => {
    evt.stopPropagation();
    addOrRemoveFavourite(movie.title);
  };

  return (
    <div className='tile' onClick={handleClick} role='button' tabIndex={0} onKeyDown={() => {}}>
      <button onClick={handleFavouriteClick} className={`star${favourite ? ' active' : ''}`}>
        {favourite ? '★' : '☆'}
      </button>
      <img alt='' src={`file:///${path.join(folder, movie.title, 'cover.jpg')}`} />
      <span className='title'>{movie.title}</span>
    </div>
  );
}

export default Grid;
