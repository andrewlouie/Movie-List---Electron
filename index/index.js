// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const path = require('path');
const shell = require('electron').shell;

const cont = document.getElementById('insertHere');
let folder = '.';
const movies = [];
let tile = true;

function checkIfInView(element) {
  const container = $('.row');
  const offset = element[0].offsetTop;
  const height = element.innerHeight();
  const scrollPosition = container.scrollTop();
  const diff = (height + offset) - (scrollPosition + container.innerHeight());
  if ((height + offset) > (scrollPosition + container.innerHeight())) {
    $('.row').stop().animate({ scrollTop: scrollPosition + diff + 20 }, 500);
    return false;
  } else if (offset < scrollPosition) {
    $('.row').stop().animate({ scrollTop: offset }, 500);
    return false;
  }
  return true;
}

function reset() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('container').style.display = 'none';
  cont.innerHTML = '';
}

function showMovies() {
  const view = (tile ? 'tile' : 'list');
  if (view === 'list') {
    $(cont).css('display', 'block');
  }
  movies.forEach((movie, b) => {
    const div = document.createElement('div');
    if (b === 0) div.className = `${view} active`;
    else div.className = view;
    div.innerHTML = `<img src="file:///${path.join(folder, movie.title, 'cover.jpg')}" /><span class="title">${movie.title}</span>`;
    div.addEventListener('click', () => {
      shell.openItem(path.join(folder, movie.title));
    });
    div.addEventListener('mousedown', () => {
      $('.active').removeClass('active');
      $(div).addClass('active');
    });
    cont.appendChild(div);
  });
}

function loadFolder() {
  reset();
  movies.length = 0;
  fs.readdir(folder, (err, results) => {
    if (err) { console.log(err); return; }
    if (results.length > 0) {
      const currentpct = 0;
      let b = 0;
      (function asyncloop(a) {
        const pct = Math.floor((a / (results.length - 1)) * 100);
        if (pct !== currentpct) {
          document.getElementById('pct').className = `c100 p${pct}`;
          document.getElementById('pct-num').innerHTML = `${pct}%`;
        }
        fs.stat(path.join(folder, results[a], 'cover.jpg'), (error, stat) => {
          if (!error) {
            movies.push({ title: results[a], mdate: stat.mtime });
            b += 1;
          } else console.log(`${results[a]} not added`);
          if (a < results.length - 1) asyncloop(a + 1);
          else {
            showMovies();
            document.getElementById('loading').style.display = 'none';
            document.getElementById('container').style.display = 'block';
            document.getElementById('movieCount').innerHTML = `${b} movies found`;
          }
        });
      }(0));
    }
  });
}

folder = remote.getGlobal('folder');
loadFolder();

ipc.on('changeFolder', () => {
  folder = remote.getGlobal('folder');
  loadFolder();
});

ipc.on('viewTile', () => {
  tile = true;
  $('.list').removeClass('list').addClass('tile');
  $(cont).css('display', 'grid');
  checkIfInView($('.active'));
});

ipc.on('viewList', () => {
  tile = false;
  $('.tile').removeClass('tile').addClass('list');
  $(cont).css('display', 'block');
  checkIfInView($('.active'));
});

ipc.on('sortByTitleAsc', () => {
  movies.sort((a, b) => {
    if (a.title > b.title) return 1;
    else if (b.title > a.title) return -1;
    return 0;
  });
  reset();
  showMovies();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('container').style.display = 'block';
});

ipc.on('sortByTitleDec', () => {
  movies.sort((a, b) => {
    if (a.title < b.title) return 1;
    else if (b.title < a.title) return -1;
    return 0;
  });
  reset();
  showMovies();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('container').style.display = 'block';
});

ipc.on('sortByDateDec', () => {
  movies.sort((a, b) => {
    if (a.mdate > b.mdate) return 1;
    else if (b.mdate > a.mdate) return -1;
    return 0;
  });
  reset();
  showMovies();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('container').style.display = 'block';
});

ipc.on('sortByDateAsc', () => {
  movies.sort((a, b) => {
    if (a.mdate < b.mdate) return 1;
    else if (b.mdate < a.mdate) return -1;
    return 0;
  });
  reset();
  showMovies();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('container').style.display = 'block';
});

window.addEventListener('keydown', (e) => {
  const selected = document.getElementsByClassName('active')[0];
  switch (e.keyCode) {
    case 39: {
      const next = selected.nextElementSibling;
      if (next !== null) {
        $(next).addClass('active');
        $(selected).removeClass('active');
        checkIfInView($(next));
      }
      break;
    }
    case 37: {
      const prev = selected.previousElementSibling;
      if (prev !== null) {
        $(prev).addClass('active');
        $(selected).removeClass('active');
        checkIfInView($(prev));
      }
      break;
    }
    case 38: {
      e.preventDefault();
      let up = selected.previousElementSibling;
      if (up !== null) {
        while (up.offsetLeft !== selected.offsetLeft && up.previousElementSibling !== null) {
          up = up.previousElementSibling;
        }
        $(up).addClass('active');
        $(selected).removeClass('active');
        checkIfInView($(up));
      }
      break;
    }
    case 40: {
      e.preventDefault();
      let down = selected.nextElementSibling;
      if (down !== null) {
        while (down.offsetLeft !== selected.offsetLeft && down.nextElementSibling !== null) {
          down = down.nextElementSibling;
        }
        $(down).addClass('active');
        $(selected).removeClass('active');
        checkIfInView($(down));
      }
      break;
    }
    case 13: {
      selected.click();
      break;
    }
    default: break;
  }
});
