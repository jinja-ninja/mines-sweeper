'use strict'

const MINE = `💥`
const EMPTY = ``
const FLAG = `🏴‍☠️`
const GAME_MODE_NORMAL = '😄'
const GAME_MODE_INTERFERED = '😵'
const GAME_MODE_WIN = '😎'

var gBoard
var gMines = []
const gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    isHintMode: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3
}

var gMineHitInterval

function onInit() {
    resetGameStats()
    gGame.isOn = true

    gBoard = createBoard(gLevel.SIZE)

    renderLives()
    // renderHints()
    renderGameIndicator(GAME_MODE_NORMAL)
    renderBoard(gBoard, '.board-container')

    console.table(gBoard)
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            gBoard[i][j].minesAroundCount = countNeighbors(board, i, j)
        }
    }
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) return

    if (!gGame.shownCount) {
        const cells = getEmptyCells()
        for (var cell = 0; cell < cells.length; cell++) {
            if (cells[cell].i === i && cells[cell].j === j) cells.splice(cell, 1)
        }
        placeMines(cells)
        setMinesNegsCount(gBoard)
    }

    if (!gBoard[i][j].isMine) {
        if (gBoard[i][j].minesAroundCount) revealCell(elCell, i, j)
        else {
            revealNegs(elCell, i, j)
        }
        checkVictory()
    }
    else if (gGame.lives > 1) {
        mineHitIndication(elCell)
        gGame.lives--
        renderLives()
        renderGameIndicator(GAME_MODE_INTERFERED)
    }
    else {
        revealAllMines()
        gameOver()
    }
}
function revealNegs(elCell, rowIdx, colIdx) {
    revealCell(elCell, rowIdx, colIdx)

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            if (gBoard[i][j].isMarked || gBoard[i][j].isShown) continue

            const nextCellSelector = `.cell-${i}-${j}`
            const elNeighborCell = document.querySelector(nextCellSelector)
            if (!gBoard[i][j].minesAroundCount) revealNegs(elNeighborCell, i, j)

            revealCell(elNeighborCell, i, j)
        }
    }
}

function revealAllMines() {
    for (var i = 0; i < gMines.length; i++) {
        const currMine = gMines[i]
        gBoard[currMine.i][currMine.j].isShown = true
        const currCell = `.cell-${currMine.i}-${currMine.j}`
        const elCell = document.querySelector(currCell)

        elCell.innerText = MINE
        elCell.classList.remove('hidden-cell')
    }
}

function revealCell(elCell, i, j) {
    if (gBoard[i][j].isShown) return
    gBoard[i][j].isShown = true
    elCell.classList.remove('hidden-cell')
    if (!gBoard[i][j].isMine) {
        elCell.innerText = gBoard[i][j].minesAroundCount
        gGame.shownCount++
    }
}

function placeFlag(elCell, i, j) {
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        elCell.innerText = FLAG
        checkVictory()
    } else {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
        elCell.innerText = EMPTY
    }
}

function placeMines(cells) {
    for (var i = gLevel.MINES; i > 0; i--) {
        const cell = cells[getRandomInt(0, cells.length)]
        cells.pop(cell)
        gBoard[cell.i][cell.j].isMine = true
        gMines.push({ i: cell.i, j: cell.j })
    }
}

function checkVictory() {
    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) { // Not Good winning indicator
        renderGameIndicator(GAME_MODE_WIN)
        gameOver()
    }
}

function gameOver() {
    gGame.isOn = false
}

function chooseLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
}

function resetGameStats() {
    gGame = {
        isOn: false,
        isHintMode: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }
    gMines = []
}

function handleHints(elHint) {
    // To Be Completed
    gGame.isHintMode = true
    elHint.innerText = '❌'
    elHint.style.cursor = 'not-allowed'
}

function renderLives() {
    var strHTML = gGame.lives
    const elContainer = document.querySelector('.lives')
    elContainer.innerHTML = strHTML
}

function renderGameIndicator(gameMode) {
    var strHTML = gameMode
    const elContainer = document.querySelector('.game-indicator')
    elContainer.innerHTML = strHTML
}

function mineHitIndication(elCell) {
    gMineHitInterval = setInterval(changeCellColor, 100, elCell)
    setTimeout(clearInterval, 600, gMineHitInterval)
}

function changeCellColor(elCell) {
    elCell.classList.toggle('hit-mine')
}