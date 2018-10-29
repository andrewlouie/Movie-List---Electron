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

function checkIfInView() {
  const container = $('.row');
  const offset = $(document.activeElement).offsetTop;
  const height = $(document.activeElement).innerHeight();
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
    div.setAttribute('tabindex', 0);
    div.innerHTML = `<img src="file:///${path.join(folder, movie.title, 'cover.jpg')}" /><span class="title">${movie.title}</span>`;
    div.addEventListener('click', () => {
      shell.openItem(path.join(folder, movie.title));
    });
    cont.appendChild(div);
  });
}

function sortByDateAsc() {
  movies.sort((a, b) => {
    if (a.mdate < b.mdate) return 1;
    else if (b.mdate < a.mdate) return -1;
    return 0;
  });
  reset();
  showMovies();
  document.getElementById('loading').style.display = 'none';
  document.getElementById('container').style.display = 'block';
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
            sortByDateAsc();
            document.getElementById('loading').style.display = 'none';
            document.getElementById('container').style.display = 'block';
            document.getElementById('movieCount').innerHTML = `${b} movies found`;
          }
        });
      }(0));
    }
  });
}

function filterResults() {
  const value = document.getElementById('search').value.toUpperCase();
  $('#insertHere').children().each((idx, elem) => {
    const $elem = $(elem);
    if ($elem.find('.title').text().toUpperCase().includes(value)) {
      $elem.show();
    } else {
      $elem.hide();
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
  checkIfInView();
});

ipc.on('viewList', () => {
  tile = false;
  $('.tile').removeClass('tile').addClass('list');
  $(cont).css('display', 'block');
  checkIfInView();
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

ipc.on('sortByDateAsc', sortByDateAsc);

window.addEventListener('keydown', (e) => {
  if (e.target === document.getElementById('search')) {
    return;
  }
  const selected = document.activeElement;
  switch (e.keyCode) {
    case 39: {
      if (selected === document.body) {
        $('#insertHere').children().first().focus();
        return;
      }
      const next = $(selected).nextAll(':visible');
      if (next.length) {
        $(next)[0].focus();
        checkIfInView();
      }
      break;
    }
    case 37: {
      if (selected === document.body) {
        $('#insertHere').children().first().focus();
        return;
      }
      const prev = $(selected).prevAll(':visible');
      if (prev.length) {
        $(prev)[0].focus();
        checkIfInView();
      }
      break;
    }
    case 38: {
      e.preventDefault();
      if (selected === document.body) {
        $('#insertHere').children().first().focus();
        return;
      }
      const up = $(selected).prevAll(':visible');
      if (up.length) {
        let a = 0;
        while (a < up.length && up[a].offsetLeft !== selected.offsetLeft) {
          a += 1;
        }
        $(up[a]).focus();
        checkIfInView();
      }
      break;
    }
    case 40: {
      e.preventDefault();
      if (selected === document.body) {
        $('#insertHere').children().first().focus();
        return;
      }
      const down = $(selected).nextAll(':visible');
      if (down.length) {
        let b = 0;
        while (b < down.length && down[b].offsetLeft !== selected.offsetLeft) {
          b += 1;
        }
        $(down[b]).focus();
        checkIfInView();
      }
      break;
    }
    case 13: {
      selected.click();
      break;
    }
    case 34: {
      e.preventDefault();
      if (selected === document.body) {
        $('#insertHere').children().first().focus();
        return;
      }
      const down = $(selected).nextAll(':visible');
      if (down.length) {
        let count = 3;
        let c = 0;
        while (c < down.length && (down[c].offsetLeft !== selected.offsetLeft || count)) {
          if (down[c].offsetLeft === selected.offsetLeft) {
            count -= 1;
          }
          c += 1;
        }
        if (down[c]) {
          $(down[c]).focus();
        } else {
          $('#insertHere').children().last().focus();
        }
        checkIfInView();
      }
      break;
    }
    case 33: {
      e.preventDefault();
      if (selected === document.body) {
        $('#insertHere').children().first().focus();
        return;
      }
      const up = $(selected).prevAll(':visible');
      if (up.length) {
        let count = 3;
        let d = 0;
        while (d < up.length && (count || up[d].offsetLeft !== selected.offsetLeft)) {
          if (up[d].offsetLeft === selected.offsetLeft) {
            count -= 1;
          }
          d += 1;
        }
        if (up[d]) {
          $(up[d]).focus();
        } else {
          $('#insertHere').children().first().focus();
        }
        checkIfInView();
      }
      break;
    }
    case 109:
    case 189: {
      const $row = $('#insertHere');
      const size = parseInt($row.attr('data-size'), 10);
      if (size > 0) {
        $row.attr('data-size', size - 1);
      }
      break;
    }
    case 107:
    case 187: {
      const $row = $('#insertHere');
      const size = parseInt($row.attr('data-size'), 10);
      if (size < 15) {
        $row.attr('data-size', size + 1);
      }
      break;
    }
    case 36: {
      $('#insertHere').children().first().focus();
      checkIfInView();
      break;
    }
    case 35: {
      $('#insertHere').children().last().focus();
      checkIfInView();
      break;
    }
    case 70: {
      const search = document.getElementById('search');
      if (document.activeElement !== search) {
        e.preventDefault();
        search.focus();
      }
      break;
    }
    default: break;
  }
});

document.getElementById('search').addEventListener('keyup', filterResults);
document.getElementById('search').addEventListener('search', filterResults);
