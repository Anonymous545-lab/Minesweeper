document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const resetButton = document.getElementById('reset-button');
    const restartButton = document.getElementById('restart-button');
    const timerDisplay = document.getElementById('timer');
    const flagCountDisplay = document.getElementById('flag-count');
    const gameOverScreen = document.getElementById('game-over');

    const clickSound = document.getElementById('click-sound');
    const flagSound = document.getElementById('flag-sound');
    const mineSound = document.getElementById('mine-sound');
    const gameOverSong = document.getElementById('game-over-song');

    const width = 10;
    const height = 10;
    const numMines = 20;
    let flags = 0;
    let time = 0;
    let timer;

    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        document.getElementById('desktop-controls').style.display = 'none';
    } else {
        document.getElementById('mobile-controls').style.display = 'none';
    }

    function createBoard() {
        const gridWidth = Math.min(window.innerWidth - 20, 400); // Adjust width based on screen size, with padding
        const cellSize = gridWidth / width; // Calculate cell size

        const minesArray = Array(numMines).fill('mine');
        const emptyArray = Array(width * height - numMines).fill('empty');
        const gameArray = emptyArray.concat(minesArray);
        const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

        grid.style.gridTemplateColumns = `repeat(${width}, ${cellSize}px)`;
        
        for (let i = 0; i < width * height; i++) {
            const cell = document.createElement('div');
            cell.setAttribute('id', i);
            cell.classList.add('cell');
            cell.classList.add(shuffledArray[i]);
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            grid.appendChild(cell);

            if (isMobile) {
                cell.addEventListener('touchstart', handleTouchStart);
                cell.addEventListener('touchend', handleTouchEnd);
            } else {
                cell.addEventListener('click', () => clickCell(cell));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    flagCell(cell);
                });
            }
        }
    }

    function handleTouchStart(event) {
        event.preventDefault();
        const cell = event.target;
        cell.touchTimer = setTimeout(() => {
            flagCell(cell);
        }, 500);
    }

    function handleTouchEnd(event) {
        event.preventDefault();
        const cell = event.target;
        if (cell.touchTimer) {
            clearTimeout(cell.touchTimer);
            clickCell(cell);
        }
    }

    function clickCell(cell) {
        if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

        clickSound.play();

        if (cell.classList.contains('mine')) {
            mineSound.play();
            revealMines();
            clearInterval(timer);
            gameOverScreen.style.display = 'block';
            gameOverSong.play();
            return;
        }

        cell.classList.add('revealed');
        const surroundingMines = countSurroundingMines(cell);
        if (surroundingMines) {
            cell.textContent = surroundingMines;
        } else {
            revealAdjacentCells(cell);
        }

        checkWin();
    }

    function flagCell(cell) {
        if (cell.classList.contains('revealed')) return;

        if (!cell.classList.contains('flagged')) {
            cell.classList.add('flagged');
            flags++;
            flagSound.play();
        } else {
            cell.classList.remove('flagged');
            flags--;
        }

        flagCountDisplay.textContent = flags;
    }

    function countSurroundingMines(cell) {
        const id = parseInt(cell.id);
        const surroundingCells = getSurroundingCells(id);
        return surroundingCells.filter(c => c.classList.contains('mine')).length;
    }

    function revealAdjacentCells(cell) {
        const id = parseInt(cell.id);
        const surroundingCells = getSurroundingCells(id);
        surroundingCells.forEach(c => clickCell(c));
    }

    function getSurroundingCells(id) {
        const cells = [];
        const row = Math.floor(id / width);
        const col = id % width;

        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (r === 0 && c === 0) continue;
                const newRow = row + r;
                const newCol = col + c;
                if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
                    cells.push(document.getElementById((newRow * width + newCol).toString()));
                }
            }
        }

        return cells;
    }

    function revealMines() {
        document.querySelectorAll('.mine').forEach(cell => {
            cell.classList.add('revealed');
            cell.style.backgroundColor = '#ff0000';
        });
    }

    function checkWin() {
        const revealedCells = document.querySelectorAll('.revealed').length;
        if (revealedCells + numMines === width * height) {
            clearInterval(timer);
            alert('Congratulations! You won!');
        }
    }

    function startTimer() {
        timer = setInterval(() => {
            time++;
            timerDisplay.textContent = time;
        }, 1000);
    }

    function resetGame() {
        clearInterval(timer);
        gameOverScreen.style.display = 'none';
        grid.innerHTML = '';
        flags = 0;
        time = 0;
        flagCountDisplay.textContent = flags;
        timerDisplay.textContent = time;
        gameOverSong.pause();
        gameOverSong.currentTime = 0;
        createBoard();
        startTimer();
    }

    resetButton.addEventListener('click', resetGame);
    restartButton.addEventListener('click', resetGame);

    createBoard();
    startTimer();
});
