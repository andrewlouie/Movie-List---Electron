import { Movie } from '../types/types';
import GridItem from '../GridItem/GridItem';

import './Grid.css';


interface Props {
  movies: Movie[],
  folder: string,
  size: number,
  favourites: string[],
  addOrRemoveFavourite: Function,
}

function Grid(props: Props) {
  const {
    size,
    movies,
    folder,
    favourites,
    addOrRemoveFavourite,
  } = props;

  return (
    <div id='container' className='row' data-size={size}>
      {movies.map((movie, idx) => <GridItem favourite={favourites.includes(movie.title)} addOrRemoveFavourite={addOrRemoveFavourite} folder={folder} key={`movie${idx}`} movie={movie} />)}
    </div>
  );
}

export default Grid;
