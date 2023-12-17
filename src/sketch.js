const cells = 8;

let gameState = null;
let fieldState = null;
let settings = null;

function setup() {
    fieldState = resetField(cells, windowHeight, windowWidth);
    gameState = resetGame(fieldState.cells);
    settings = setSettings(Type.SHEEP, '1');
    createCanvas(fieldState.fieldSize, fieldState.fieldSize);
    setupControls();
}

function setupControls() {
    let startButton = createNewButton('Новая игра', () => { gameState = resetGame(fieldState.cells); });
    let playersCount = createRadioButtons({ '1': 'Один игрок', '2': 'Два игрока' }, '1');
    let role = createRadioButtons({'SHEEP': 'Овца', 'WOLF': 'Волки' }, 'sheep');

    playersCount.mouseClicked(() => {
        settings = setSettings(role.value(), playersCount.value());
        if (playersCount.value() == '1')
            role.show();
        else
            role.hide();
    });

    role.mouseClicked(() => { 
        settings = setSettings(role.value(), playersCount.value());
    });
}

function draw() {
    drawField(gameState, fieldState);
    drawChips(gameState, fieldState);
    
    let winner = getWinner(gameState);
    if (winner === Type.NONE) {
        if (isBotTurn(gameState, settings.role, settings.players)) {
            let bestTurn = getBestMove(gameState);
            gameState = withObjectCopy(gameState, (object) => {
                let chip = gameState.chips.find(c => c.i === bestTurn.chip.i && c.j === bestTurn.chip.j);
                doTurn(object, chip, bestTurn.move.i, bestTurn.move.j);
            });
        }
    } else {
        drawGameResult(fieldState, winner);
    }
}

function resetField(cells, height, width) {
    return {
        cells: cells,
        fieldSize: Math.floor(Math.min(height, width) * 0.9),
        cellSize: Math.floor(Math.min(height, width) * 0.9) / cells,
        selectedChip: null
    }
}

function setSettings(role, players) {
    return {
        role: role,
        players: players
    };
}


//#region hud

function createRadioButtons(options, selected) {
    let radio = createRadio();
    Object.keys(options).forEach(key => radio.option(options[key], key));
    radio.selected(selected);
    return radio;
}

function createNewButton(title, onClicked) {
    let button = createButton(title);
    button.mouseClicked(() => {
        onClicked();
    });
    return button;
}

//#endregion

//#region interaction
function mousePressed() {
    let x = mouseX;
    let y = mouseY;
    let cellIndex = cellByCoordinates(x, y, fieldState.cellSize);

    let newState = tryChangeSelection(gameState, fieldState, cellIndex.i, cellIndex.j);
    fieldState = newState.fieldState;
    gameState = newState.gameState;
}

function tryChangeSelection(gameState, fieldState, i, j) {
    if (fieldState.selectedChip) {
        if (isPossibleMove(gameState.chips, fieldState.selectedChip, fieldState.fieldSize, i, j)) {
            let newGameState = withObjectCopy(gameState, (object) => {
                doTurn(object, fieldState.selectedChip, i, j);
            });
            let newFieldState = withObjectCopy(fieldState, (object) => {
                changeSelection(object, null);
            });
            
            return { fieldState: newFieldState, gameState: newGameState };
        }
    } 

    let chip = getChip(gameState, i, j);
    if(chip && chip.type === gameState.turn) {
        let newFieldState = withObjectCopy(fieldState, (object) => {
            changeSelection(object, chip);
        });
        return { fieldState: newFieldState, gameState: gameState };
    } 
    return { fieldState: fieldState, gameState: gameState }; 
}


function changeSelection(fieldState, newSelection) {
    fieldState.selectedChip = newSelection;
}

//#endregion

//#region help

function cellByCoordinates(x, y, size) {
    return { i: Math.floor(y / size), j: Math.floor(x / size) };
}

function coordinatesByCell(i, j, size) {
    return { x: j * size + size / 2, y: i * size + size / 2 };
}

function withObjectCopy(object, f) {
    let newObject = Object.assign({}, object);
    f(newObject);
    return newObject;
}

function isBotTurn(gameState, playerRole, players) {
    return players === '1' && playerRole != gameState.turn;
}

//#endregion

//#region draw
function drawChip(chip, size, color) {
    let coordinates = coordinatesByCell(chip.i, chip.j, size);
    fill(color);
    circle(coordinates.x, coordinates.y, size * 0.9);
}

function drawChips(gameState, fieldState) {
    gameState.chips.forEach(c => {
        let color = chipColor(c.type, c === fieldState.selectedChip);
        drawChip(c, fieldState.cellSize, color)
    });
}

function drawField(gameState, fieldState) {
    drawFieldBorders(fieldState.fieldSize);
    drawFieldCells(gameState, fieldState);
}

function drawFieldCells(gameState, fieldState) {
    let highlightedCells = fieldState.selectedChip ? chipPossibleMoves(gameState.chips, fieldState.fieldSize, fieldState.selectedChip) : [];
    let otherCells = []
    for (let i = 0; i < fieldState.cells; i++) {
        for (let j = 0; j < fieldState.cells; j++) {
            if (highlightedCells.find(c => c.i == i && c.j == j) == null)
                otherCells.push({ i: i, j: j });
        }
    }
  
    drawCells(highlightedCells, fieldState.cellSize, color(255, 255, 200));
    drawCells(otherCells.filter(c => (c.i + c.j) % 2 == 1), fieldState.cellSize, color(222, 231, 215));
    drawCells(otherCells.filter(c => (c.i + c.j) % 2 == 0), fieldState.cellSize, color(111, 149, 82));
}

function drawCells(cells, size, color) {
    fill(color)
    cells.forEach(c =>  rect(c.j * size, c.i * size, size, size));
}

function drawFieldBorders(fieldSize) {
    line(0, 0, fieldSize, 0);
    line(0, 0, 0, fieldSize);
    line(0, fieldSize, fieldSize, fieldSize);
    line(fieldSize, 0, fieldSize, fieldSize);
}

function chipColor(type, isSelected) {
    if (type == Type.WOLF) {
        if (isSelected)
            return color(125, 116, 93);
        return color(76, 71, 55);
    }
    if (isSelected)
        return color(218, 210, 189);
    return color(213, 202, 172);
}

function drawGameResult(fieldState, winner) {
    drawResultBackground(fieldState);
    fill(0, 0, 0);
    textAlign(CENTER, CENTER); 
    textSize(fieldState.cellSize / 2);
    if (winner === Type.WOLF)
        text('Волки победили', fieldState.fieldSize / 2, fieldState.fieldSize / 2);
    else
        text('Овца победила', fieldState.fieldSize / 2, fieldState.fieldSize / 2);
}


function drawResultBackground(fieldState) {
    fill(255, 255, 255); // рисуем белую табличку 
    rect(0.1 * fieldState.fieldSize, 0.4 * fieldState.fieldSize,
         0.8 * fieldState.fieldSize, 0.2 * fieldState.fieldSize);
}

//#endregion
