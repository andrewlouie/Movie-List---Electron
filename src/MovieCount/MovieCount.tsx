import './MovieCount.css';

interface Props {
  count: number,
}

function MovieCount(props: Props) {
  const {
    count,
  } = props;

  return (
    <div id='movieCount'>
      {count} movies found
    </div>
  );
}

export default MovieCount;
