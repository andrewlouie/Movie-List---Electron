import { Labels, Movie } from '../types/types';
import GridItem from '../GridItem/GridItem';

import './Grid.css';

interface GridProps {
  size: number;
  movies: Movie[];
  labels: Labels;
  folder: string;
  favourites: string[];
  addOrRemoveFavourite: Function;
  showLabelsModal: Function;
}

function Grid(props: GridProps) {
  const {
    size,
    movies,
    folder,
    labels,
    favourites,
    showLabelsModal,
    addOrRemoveFavourite,
  } = props;

  return (
    <div id='container' className='row' data-size={size}>
      {movies.map((movie, idx) => (
        <GridItem
          movie={movie}
          labels={labels[movie.title]}
          folder={folder} key={`movie${idx}`}
          favourite={favourites.includes(movie.title)}
          showLabelsModal={showLabelsModal}
          addOrRemoveFavourite={addOrRemoveFavourite}
        />))}
    </div>
  );
}

export default Grid;
