const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const undoBtn = document.querySelector('[title="Undo"]').closest("button");
const redoBtn = document.querySelector('[title="Redo"]').closest("button");
const restartBtn = document.getElementById("restartBtn");

let count = 1;
let filled = 0;
let editMode = true;
let history = [];
let future = [];

// Initialize the grid
for (let i = 0; i < 25; i++) {
    const cell = document.createElement("div");
    cell.addEventListener("click", () => handleCellClick(cell, i));
    grid.appendChild(cell);
}

function handleCellClick(cell, index) {
    // Prevent clicks on locked cells or a disabled grid
    if (grid.classList.contains("disabled") || cell.classList.contains("locked")) return;

    // --- GAMEPLAY MODE ---
    if (!editMode && cell.textContent) {
        cell.classList.toggle("strike");
        checkBingo();
        return;
    }

    // --- SETUP MODE ---
    if (editMode && !cell.textContent) {
        cell.textContent = count++;
        filled++;
        history.push({ index: index, value: cell.textContent }); // Store value for redo
        future = []; // Clear redo history on new action

        if (filled === 25) {
            startBtn.classList.remove("d-none"); // FIX: Use d-none
        }
    }
}

function undo() {
    if (!history.length) return;

    const lastAction = history.pop();
    const cell = grid.children[lastAction.index];
    cell.textContent = "";
    cell.classList.remove("strike"); // Also remove strike on undo
    
    filled--;
    count--; // Decrement the main counter
    future.push(lastAction);

    // FIX: Only hide start button if the board is no longer full
    if (filled < 25) {
        startBtn.classList.add("d-none");
    }
}

function redo() {
    if (!future.length) return;

    const nextAction = future.pop();
    const cell = grid.children[nextAction.index];
    cell.textContent = nextAction.value; // Restore original value
    
    filled++;
    count++; // Increment counter on redo
    history.push(nextAction);

    if (filled === 25) {
        startBtn.classList.remove("d-none"); // FIX: Use d-none
    }
}

function clearGrid() {
    for (const cell of grid.children) {
        cell.textContent = "";
        cell.classList.remove("strike", "locked", "remaining");
    }

    count = 1;
    filled = 0;
    history = [];
    future = [];
    editMode = true;

    startBtn.classList.add("d-none"); // FIX: Use d-none
    startBtn.disabled = false; // Re-enable the button for the next game
    grid.classList.remove("disabled");

    for (const letter of ["B", "I", "N", "G", "O"]) {
        document.getElementById(letter).classList.remove("active");
    }

    // Restore visibility of undo/redo buttons for the new setup phase
    undoBtn.style.display = "inline-block";
    redoBtn.style.display = "inline-block";
}

function startGame() {
    editMode = false;
    startBtn.disabled = true;
    
    // Hide undo/redo buttons during gameplay
    undoBtn.style.display = "none";
    redoBtn.style.display = "none";
}

function checkBingo() {
    const lines = [
        // Rows
        [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
        // Columns
        [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
        // Diagonals
        [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];

    let bingoCount = 0;
    const letters = ["B", "I", "N", "G", "O"];

    for (const line of lines) {
        if (line.every(i => grid.children[i].classList.contains("strike"))) {
            if (bingoCount < 5) { // Ensure we don't go past O
                line.forEach(i => grid.children[i].classList.add("locked"));
            }
            bingoCount++;
        }
    }

    // Update BINGO letters
    letters.forEach((letter, index) => {
        document.getElementById(letter).classList.toggle("active", index < bingoCount);
    });

    // If 5 lines are complete (BINGO), end the game
    if (bingoCount >= 5) {
        for (const cell of grid.children) {
            if (!cell.classList.contains("strike")) {
                cell.classList.add("remaining");
            }
        }
        grid.classList.add("disabled"); // Prevent all future clicks
    }
}

// --- Event Listeners ---
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", clearGrid); // IMPROVEMENT: Use clearGrid for a smooth reset
