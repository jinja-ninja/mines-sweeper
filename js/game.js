'use strict'

const MINE = `💥`
const EMPTY = ``
const FLAG = `🏴‍☠️`
const GAME_MODE_NORMAL = '😄'
const GAME_MODE_INTERFERED = '😵'
const GAME_MODE_WIN = '😎'
const HINT = '💡'
const HINT_USED = '❌'

var gBoard
var gIsDark = true
var gScore = localStorage.getItem("score")
var gMines = []
var mementos = []
var gMegaHintEdges = []
var gUserPositionedMines = []

const gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    isHintMode: false,
    isMegaHintMode: false,
    isManualMode: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    safeClicks: 3,
}

var gMineHitInterval
var gSafeClickInterval
var gMinePlacedInterval
var gGameTimerInterval

function onInit() {
    resetGameStats()
    gBoard = createBoard(gLevel.SIZE)
    renderAll()
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
    if (gBoard[i][j].isShown && !gGame.isHintMode && !gGame.isMegaHintMode) return
    if (gBoard[i][j].isMarked && !gGame.isHintMode && !gGame.isMegaHintMode) return

    if (gGame.isManualMode && !gGame.shownCount) {
        gLevel.MINES++
        gMines.push({ i, j })
        gBoard[i][j].isMine = true
        minePlacedIndication(elCell)
        return
    }

    if (!gGame.shownCount) {
        if (gMines.length === 0) {
            const cells = getEmptyCells()
            for (var cell = 0; cell < cells.length; cell++) {
                if (cells[cell].i === i && cells[cell].j === j) cells.splice(cell, 1)
            }
            placeMines(cells)
        }
        setMinesNegsCount(gBoard)
        if (!gGame.secsPassed) startTimer()
    }

    if (gGame.isHintMode) { // Not handeling the case for first click
        flashCells(i, j)  //Should solve with revealNegs and not different function
        setTimeout(flashCells, 1000, i, j)
        gGame.isHintMode = false
        return
    }

    if (gGame.isMegaHintMode) {
        if (gMegaHintEdges.length === 2) {
            return
        }
        if (gMegaHintEdges.length === 1) {
            if (gMegaHintEdges[0].i > i || gMegaHintEdges[0].j > j) return
            else {
                gMegaHintEdges.push({ i, j })
                gGame.isMegaHintMode = false
                const elCells = document.querySelectorAll('.cell')
                for (var i = 0; i < elCells.length; i++) {
                    elCells[i].classList.toggle('cursor-pointer')
                }
                flashMegaHint()
                return
            }
        }
        gMegaHintEdges.push({ i, j })
        return
    }

    if (!gBoard[i][j].isMine) {
        if (gBoard[i][j].minesAroundCount) revealCell(elCell, i, j)
        else {
            revealNegs(elCell, i, j)
        }
        updateScore()
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
        gameOver(false)
    }
}
function revealNegs(elCell, rowIdx, colIdx) {
    // if (gGame.isHintMode) flashCell(elCell,rowIdx,colIdx) // Use this if ever decide to use one function for all
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
        if (gBoard[i][j].minesAroundCount === 0) elCell.innerText = ''
        else elCell.innerText = gBoard[i][j].minesAroundCount
        gGame.shownCount++
    }
}

function flashMegaHint() {

    for (var i = gMegaHintEdges[0].i; i <= gMegaHintEdges[1].i; i++) {
        for (var j = gMegaHintEdges[0].j; j <= gMegaHintEdges[1].j; j++) {
            if (gBoard[i][j].isShown) continue

            const selector = `.cell-${i}-${j}`
            const elCell = document.querySelector(selector)
            flashCell(elCell, i, j)
            setTimeout(flashCell, 1000, elCell, i, j)
        }
    }
}

function flashCells(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (gBoard[i][j].isMarked || gBoard[i][j].isShown) continue

            const nextCellSelector = `.cell-${i}-${j}`
            const elNeighborCell = document.querySelector(nextCellSelector)
            flashCell(elNeighborCell, i, j)
        }
    }
}

function flashCell(elCell, i, j) {

    if (!elCell.innerText || elCell.innerText === FLAG) {
        if (gBoard[i][j].isMine) elCell.innerText = MINE
        else elCell.innerText = gBoard[i][j].minesAroundCount

        // } else if (elCell.innerText === FLAG) { // Bug when FLAG & Mega hint
        //     if (gBoard[i][j].isMine) elCell.innerText = MINE
        //     else elCell.innerText = gBoard[i][j].minesAroundCount
    } else if (gBoard[i][j].isMarked) elCell.innerText = FLAG
    else {
        elCell.innerText = ''
    }
    elCell.classList.toggle('hidden-cell')

}

function placeFlag(elCell, i, j) {
    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        elCell.innerText = FLAG
        renderMinesCount(true)
        checkVictory()
    } else {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
        elCell.innerText = EMPTY
        renderMinesCount(true)
    }
}

function placeMines(cells) {
    for (var i = gLevel.MINES; i > 0; i--) {
        var cellIdx = getRandomInt(0, cells.length)
        const cell = cells[cellIdx]
        cells.splice(cellIdx, 1)

        gBoard[cell.i][cell.j].isMine = true
        gMines.push({ i: cell.i, j: cell.j })
    }
}

function checkVictory() {
    if ((gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) && gGame.markedCount === gLevel.MINES) {
        renderGameIndicator(GAME_MODE_WIN)
        gameOver(true)
    }
}

function gameOver(isWin) {
    gGame.isOn = false
    if (!isWin) {
        gGame.lives = 0
        renderLives()
    }
    clearInterval(gGameTimerInterval)
}

function resetGameStats() {
    gGame = {
        isOn: true,
        isHintMode: false,
        isMegaHintMode: false,
        isManualMode: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        safeClicks: 3
    }
    gMines = []
    gMegaHintEdges = []

    clearInterval(gGameTimerInterval)
}

function onToggleManualMode() {
    if (gGame.shownCount) return
    gGame.isManualMode = gGame.isManualMode ? false : true
    if (gGame.isManualMode) gLevel.MINES = 0
    renderMinesCount()
    console.log('gGame.isManualMode:', gGame.isManualMode)
}

function onChooseLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    onInit()
}

function onHintClicked(elHint) {
    // if (!gGame.shownCount) return
    if (!gGame.isOn) return
    if (elHint.style.cursor === 'not allowed') return
    if (gGame.isHintMode) return
    gGame.isHintMode = true
    elHint.innerText = HINT_USED
    elHint.style.cursor = 'not-allowed'
}

function onMegaHintClicked() {
    if (!gGame.isOn) return
    if (!gGame.isMegaHintMode && gMegaHintEdges.length === 2) return

    const elCells = document.querySelectorAll('.cell')
    for (var i = 0; i < elCells.length; i++) {
        elCells[i].classList.toggle('cursor-pointer')
    }
    gGame.isMegaHintMode = true
}

function onShowSafeClicks() {
    if (!gGame.isOn) return
    if (!gGame.safeClicks) return
    const cells = getEmptyCells()
    const cell = cells[getRandomInt(0, cells.length)]
    const selector = '.cell-' + cell.i + '-' + cell.j
    const elCell = document.querySelector(selector)

    gSafeClickInterval = setInterval(changeCellColor, 100, elCell, true)
    setTimeout(clearInterval, 600, gSafeClickInterval)
    gGame.safeClicks--
    renderSafeClicksCount()
}

function onExterminatorClick() { // It should be noted that after conversation with Tal - we decided that the best way is to only update the cells that changed and not the whole board
    if (!gGame.shownCount) return
    var count = 0
    while ((gMines.length > 0) && (count < 3)) {
        var cellIdx = getRandomInt(0, gMines.length)
        var cell = gMines[cellIdx]
        gBoard[cell.i][cell.j].isMine = false
        gMines.splice(cellIdx, 1)
        gLevel.MINES--
        setMinesNegsCount(gBoard)
        count++
    }
}

function onToggleDarkMode() {
    const elVars = document.querySelector(':root')
    if (gIsDark) {
        elVars.style.setProperty('--main-color', 'white')
        elVars.style.setProperty('--secondary-color', 'black')
    } else {
        elVars.style.setProperty('--main-color', 'black')
        elVars.style.setProperty('--secondary-color', 'white')
    }
    gIsDark = !gIsDark
}

function renderHints() {
    const elHints = document.querySelectorAll('.hints')
    for (var i = 0; i < elHints.length; i++) {
        elHints[i].innerText = HINT
        elHints[i].style.cursor = 'pointer'
    }
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

function renderSafeClicksCount() {
    document.querySelector('.safe-click span').innerText = gGame.safeClicks
}

function mineHitIndication(elCell) {
    gMineHitInterval = setInterval(changeCellColor, 100, elCell, false)
    setTimeout(clearInterval, 600, gMineHitInterval)
}

function minePlacedIndication(elCell) {
    gMinePlacedInterval = setInterval(() => {
        elCell.innerText = (elCell.innerText === EMPTY) ? FLAG : EMPTY
    }, 100)
    setTimeout(clearInterval, 600, gMinePlacedInterval)
}

function changeCellColor(elCell, isHint) {
    if (isHint) elCell.classList.toggle('hint-flicker')
    else elCell.classList.toggle('hit-mine')
}

function renderScore() {
    document.querySelector('.score').innerText = localStorage.getItem("score")
}

function renderAll() {
    renderHints()
    renderSafeClicksCount()
    renderLives()
    renderScore()
    renderGameIndicator(GAME_MODE_NORMAL)
    renderBoard(gBoard, '.board-container')
    renderMinesCount()
    resetGameTimer()
}

function updateScore() {
    if (gGame.shownCount > +localStorage.getItem("score")) {
        localStorage.setItem("score", gGame.shownCount)
    }
    renderScore()
}

function renderMinesCount(isFlagPlacement) {
    const elMines = document.querySelector('.mines-count')
    if (isFlagPlacement) elMines.innerText = (gLevel.MINES - gGame.markedCount)
    else elMines.innerText = gLevel.MINES
}

function startTimer() {
    const startTime = Date.now()

    gGameTimerInterval = setInterval(() => {
        gGame.secsPassed = (Date.now() - startTime) / 1000
        document.querySelector('.timer').innerText = gGame.secsPassed.toFixed(3)
    }, 1)
}

function resetGameTimer() {
    gGame.secsPassed = 0
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = '0.000'
}

function saveMemento(item) {
    console.log(`'Hi - I have mementos but i'm not working :(`)
    mementos.push(item)
}

function undo() {
    const lastMemento = mementos.pop()
    renderAll() // input: items?
}