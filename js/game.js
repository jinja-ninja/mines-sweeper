'use strict'

const MINE = `💥`
const EMPTY = ``
const FLAG = `🏴‍☠️`

var gBoard
var gMines = []
const gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

function onInit() {
    resetGameStats()
    gGame.isOn = true

    gBoard = createBoard(gLevel.SIZE)
    // gBoard[1][2].isMine = gBoard[2][3].isMine = true
    placeMines()
    setMinesNegsCount(gBoard)

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

    // if (!gGame.shownCount) {
    //     placeMines()
    //     setMinesNegsCount(gBoard)
    // }

    if (!gBoard[i][j].isMine) {
        if (gBoard[i][j].minesAroundCount) revealCell(elCell, i, j)
        else {
            revealNegs(elCell, i, j)
        }
        console.log('HI')
        checkVictory()
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
            if (gBoard[i][j].isMarked) continue

            const nextCellSelector = `.cell-${i}-${j}`
            const elNeighborCell = document.querySelector(nextCellSelector)
            // if (!gBoard[i][j].minesAroundCount) revealNegs(elNeighborCell, i, j) // Trying Recursion
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

function placeMines() {
    const cells = getEmptyCells()
    for (var i = gLevel.MINES; i > 0; i--) {
        const cell = cells[getRandomInt(0, cells.length)]
        cells.pop(cell) // Why am I still getting one on each other sometimes?
        gBoard[cell.i][cell.j].isMine = true
        gMines.push({ i: cell.i, j: cell.j })
    }
}

function checkVictory() {
    console.log('gGame.markedCount:', gGame.markedCount)
    console.log('gGame.shownCount:', gGame.shownCount)
    console.log('gLevel.SIZE:', gLevel.SIZE)
    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
        document.querySelector('.modal h2 span').innerText = 'Victory!'
        gameOver()
    }
}

function gameOver() {
    document.querySelector('.modal').classList.remove('hidden')
    gGame.isOn = false
}

function chooseLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
}

function resetGameStats() {
    document.querySelector('.modal').classList.add('hidden')
    document.querySelector('.modal h2 span').innerText = 'Game Over!'
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
    }
    gMines = []
}