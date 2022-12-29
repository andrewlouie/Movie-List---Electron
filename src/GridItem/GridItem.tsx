import { MouseEvent } from 'react';
import LabelIcon from '@mui/icons-material/Label';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';

import { Movie } from '../types/types';

import './GridItem.css';

const path = window.require('path');
const shell = window.require('electron').shell;

interface GridItemProps {
  movie: Movie;
  labels: string[];
  folder: string;
  favourite: boolean;
  showLabelsModal: Function;
  addOrRemoveFavourite: Function;
}

function GridItem(props: GridItemProps) {
  const {
    movie,
    labels = [],
    folder,
    favourite,
    showLabelsModal,
    addOrRemoveFavourite,
  } = props;

  const handleClick = () => {
    shell.openPath(path.join(folder, movie.title));
  };

  const handleFavouriteClick = (evt: MouseEvent) => {
    evt.stopPropagation();
    addOrRemoveFavourite(movie.title);
  };

  const handleLabelsClick = (evt: MouseEvent) => {
    evt.stopPropagation();
    showLabelsModal(movie.title);
  }

  return (
    <div className='tile' onClick={handleClick} role='button' tabIndex={0} onKeyDown={() => {}}>
      <button onClick={handleLabelsClick} className="labels">
        {labels.length ? <LabelIcon /> : <LabelOutlinedIcon />}
      </button>
      <button onClick={handleFavouriteClick} className={`star${favourite ? ' active' : ''}`}>
        {favourite ? <StarOutlinedIcon/> : <StarBorderOutlinedIcon/>}
      </button>
      <img alt='' src={`file:///${path.join(folder, movie.title, 'cover.jpg')}`} />
      <span className='title'>{movie.title}</span>
    </div>
  );
}

export default GridItem;
