import Tooltip from '@mui/material/Tooltip';
import './MovieCount.css';

interface MovieCountProps {
  count: number;
  notAdded: string[];
}

function MovieCount(props: MovieCountProps) {
  const {
    count,
    notAdded,
  } = props;

  return (
    <Tooltip title={<div style={{ whiteSpace: 'pre-line' }}>{["Skipped: \n", ...notAdded].join("\n")}</div>}>
      <div id='movieCount'>
        {count} movies found
      </div>
    </Tooltip>
  );
}

export default MovieCount;
