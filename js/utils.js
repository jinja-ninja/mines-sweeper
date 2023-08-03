"use strict"

/////////////////////////////////////////////////////////
//-------------------Boards and Mats------------------//
///////////////////////////////////////////////////////
function createMat(rowIdx, colIdx) {
  const mat = [];
  for (var i = 0; i < rowIdx; i++) {
    const row = [];
    for (var j = 0; j < colIdx; j++) {
      row.push("♻️");
    }
    mat.push(row);
  }
  return mat;
}

function createBoard(size) {
  const board = [];
  for (var i = 0; i < size; i++) {
    board[i] = [];
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
      }
    }
  }
  return board
}

function countNeighbors(board, rowIdx, colIdx) {
  var count = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue;
      if (j < 0 || j >= board[0].length) continue;
      var currCell = board[i][j];
      if (currCell.isMine) {
        count++;
      }
    }
  }
  return count;
}


////////////////////////////////////////////
//-----------------Rendering-------------//
//////////////////////////////////////////

// --> Renders into an already made board in the HTML

function renderBoard(mat, selector) {

  var strHTML = '<table border="0"><tbody>'
  for (var i = 0; i < mat.length; i++) {

    strHTML += '<tr>'
    for (var j = 0; j < mat[0].length; j++) {

      const cell = mat[i][j]
      const className = 'cell cell-' + i + '-' + j + ' hidden-cell'
      strHTML += `<td class="${className}" 
      onclick="onCellClicked(this, ${i}, ${j})" 
      oncontextmenu="placeFlag(this, ${i}, ${j}); return false;">` // Please Verify that's the right way
      strHTML += `</td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>'

  const elContainer = document.querySelector(selector)
  elContainer.innerHTML = strHTML
}

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  // Select the elCell and set the value
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

/////////////////////////////////////////
//-----------------Randoms-------------//
////////////////////////////////////////

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
  // The maximum is exclusive and the minimum is inclusive
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/////////////////////////////////////////////////////
//--------------extra shit and sheet--------------//
////////////////////////////////////////////////////
function makeId(length = 6) {
  var txt = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return txt;
}

function handleModal() {
  gElModal.classList.toggle("hidden");
  /* <div class='modal hidden'>modal</div> */
}

function playSound() {
  const audio = new Audio("filename.type");
  audio.play();
}

function onHandleKey(event) {
  const i = gGamerPos.i;
  const j = gGamerPos.j;
  switch (event.key) {
    case "ArrowLeft":
    case "a":
      moveTo(i, j - 1);
      break;
    case "ArrowRight":
    case "d":
      moveTo(i, j + 1);
      break;
    case "ArrowUp":
    case "w":
      moveTo(i - 1, j);
      break;
    case "ArrowDown":
    case "s":
      moveTo(i + 1, j);
      break;
  }
}

function getEmptyCells() {
  var res = []

  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) res.push({ i, j })
    }
  }
  return res
}

// function updateEmptyCell(item) {
//   if (item === 'BALL') {
//     gBallCount++
//   }
//   const cells = getEmptyCells()
//   const cell = cells[getRandomInt(0, cells.length)]
//   gBoard[cell.i][cell.j].gameElement = item
//   if (item === BALL) renderCell(cell, BALL_IMG)
//   else if (item === GLUE) {
//     renderCell(cell, GLUE_IMG)
//     setTimeout(renderCell, 3000, cell, '') // If the player ate the GLUE it disappears. How to fix it?
//   }
//   else {
//     gGamerPos.i = cell.i
//     gGamerPos.j = cell.j
//     renderCell(cell, GAMER_IMG)
//   }
//   countNeighbors()
// }

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function createRandomArray(size) {
  var nums = []
  for (var i = 0; i < size; i++) {
    nums.push(i + 1)
  }
  nums = shuffle(nums)
  return nums
}