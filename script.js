const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const undoBtn = document.querySelector('[title="Undo"]').closest("button");
const redoBtn = document.querySelector('[title="Redo"]').closest("button");

let count = 1;
let filled = 0;
let editMode = true;
let history = [];
let future = [];

for (let i = 0; i < 25; i++) {
    const cell = document.createElement("div");
    cell.addEventListener("click", () => handleCellClick(cell, i));
    grid.appendChild(cell);
}

function handleCellClick(cell, index) {
    if (grid.classList.contains("disabled")) return;

    if (!editMode && cell.textContent) {
        cell.classList.toggle("strike");
        checkBingo();
        return;
    }

    if (editMode && !cell.textContent) {
        cell.textContent = count++;
        filled++;
        history.push(index);
        future = [];
        if (filled === 25) startBtn.classList.remove("hide");
    }
}

function undo() {
    if (!history.length) return;
    const lastIndex = history.pop();
    const cell = grid.children[lastIndex];
    cell.textContent = "";
    cell.classList.remove("strike");
    count--;
    filled--;
    future.push(lastIndex);
    startBtn.classList.add("hide");
}

function redo() {
    if (!future.length) return;
    const nextIndex = future.pop();
    const cell = grid.children[nextIndex];
    cell.textContent = count++;
    filled++;
    history.push(nextIndex);
    if (filled === 25) startBtn.classList.remove("hide");
}

function clearGrid() {
    for (let cell of grid.children) {
        cell.textContent = "";
        cell.classList.remove("strike");
    }
    count = 1;
    filled = 0;
    history = [];
    future = [];
    editMode = true;
    startBtn.classList.add("hide");
    grid.classList.remove("disabled");
    for (let letter of ["B", "I", "N", "G", "O"]) {
        document.getElementById(letter).classList.remove("strike", "active");
    }
    undoBtn.style.display = "inline-block";
    redoBtn.style.display = "inline-block";
}

startBtn.addEventListener("click", () => {
    editMode = false;
    startBtn.disabled = true;
    undoBtn.style.display = "none";
    redoBtn.style.display = "none";
});

function checkBingo() {
    const lines = [];
    for (let i = 0; i < 5; i++) {
        lines.push([i * 5, i * 5 + 1, i * 5 + 2, i * 5 + 3, i * 5 + 4]); // Rows
        lines.push([i, i + 5, i + 10, i + 15, i + 20]); // Columns
    }
    lines.push([0, 6, 12, 18, 24]); // Diagonal
    lines.push([4, 8, 12, 16, 20]); // Anti-diagonal

    let bingoCount = 0;
    let completedLines = [];

    for (let line of lines) {
        if (line.every(i => grid.children[i].classList.contains("strike"))) {
            bingoCount++;
            completedLines.push(line);
        }
    }

    // Lock completed lines
    completedLines.forEach(line => {
        line.forEach(i => {
            const cell = grid.children[i];
            if (!cell.classList.contains("locked")) {
                cell.classList.add("locked");
            }
        });
    });

    // Update BINGO letters
    const letters = ["B", "I", "N", "G", "O"];
    for (let i = 0; i < letters.length; i++) {
        const span = document.getElementById(letters[i]);
        span.classList.toggle("active", i < bingoCount);
    }

    // If 5 lines complete, circle remaining cells and lock the game
    if (bingoCount === 5) {
        for (let cell of grid.children) {
            if (!cell.classList.contains("strike")) {
                cell.classList.add("remaining");
            }
        }
        grid.classList.add("disabled"); // Prevent all future clicks
    }
}

document.getElementById("restartBtn").addEventListener("click", () => {
    location.reload();
});
