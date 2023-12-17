function resetGame(cells) {
    let chips = [ new Chip(cells - 1, Math.floor((cells - 1) / 2), Type.SHEEP)];
    [...Array(Math.floor(cells / 2)).keys()].forEach(c => chips.push(new Chip(0, 2 * c, Type.WOLF)));
    return {
        chips: chips,
        turn: Type.SHEEP,
        fieldSize: cells
    };
}

function nextTurn(currentTurn) {
    if(currentTurn === Type.WOLF) return Type.SHEEP;
    if (currentTurn === Type.SHEEP) return Type.WOLF;
    return Type.NONE;
}

function isCellInField(fieldSize, i, j){
    return i >= 0 && j >= 0 && j < fieldSize && i < fieldSize;
}

function hasChipInCell(chips, i, j) {
    return chips.find(c => c.i == i && c.j == j) != null;
}

function chipPossibleMoves(chips, fieldSize, chip) {
    let moves = [
        {i: chip.i + 1, j: chip.j + 1},
        {i: chip.i + 1, j: chip.j - 1},
    ];
    if(chip.type === Type.SHEEP) {
        moves.push({i: chip.i - 1, j: chip.j + 1});
        moves.push({i: chip.i - 1, j: chip.j - 1});
    }
    return moves.filter(c => isCellInField(fieldSize, c.i, c.j) && !hasChipInCell(chips, c.i, c.j));
}

function isPossibleMove(chips, chip, fieldSize, i, j){
    let possibleTurns = chipPossibleMoves(chips, fieldSize, chip);
    return possibleTurns.find(c => c.i === i && c.j === j) != null;
}

function getWinner(gameState) {
    let sheep = gameState.chips.find(c => c.type === Type.SHEEP);
    let wolfs = gameState.chips.filter(c => c.type === Type.WOLF);
    if(sheep.i == 0) return Type.SHEEP;
    if(chipPossibleMoves(gameState.chips, gameState.fieldSize, sheep).length == 0) return Type.WOLF;
    if(wolfs.every(w => chipPossibleMoves(gameState.chips, gameState.fieldSize, w).length == 0)) return Type.SHEEP;
    return Type.NONE
}

function getChip(gameState, i, j){
    return gameState.chips.find(c => c.i === i && c.j === j);
}

function doTurn(gameState, chip, i, j) {
    let index = gameState.chips.indexOf(chip);
    gameState.chips[index] = new Chip(i, j, chip.type);
    gameState.turn = nextTurn(gameState.turn);
}
