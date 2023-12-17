function getBestMove(gameState) {
    let gameStateDeepCopy = JSON.parse(JSON.stringify(gameState))
    let minMax = runMiniMax(gameStateDeepCopy, gameStateDeepCopy.turn, 0, -500, 500);
    return minMax;
}

function runMiniMax(gameStateCopy, turn, recursiveLevel, alpha, beta) {
    if (recursiveLevel >= 7)
        return { val: this.getHeuristicEvaluation(gameStateCopy), chip: null, move: null };

    let bestMove = null;
    let bestChip = null;
    let MinMax = turn == Type.WOLF ? 0 : 255;

    let chips = gameStateCopy.chips.filter(c => c.type == turn);
    for (let chip of chips) {
        let curPos = { i: chip.i, j: chip.j };
        for(let move of chipPossibleMoves(gameStateCopy.chips, gameStateCopy.fieldSize, chip)) {
            chip.i = move.i;
            chip.j = move.j;
            let test = this.runMiniMax(gameStateCopy, nextTurn(turn), recursiveLevel + 1, alpha, beta);
            chip.i = curPos.i;
            chip.j = curPos.j;

            if(turn === Type.SHEEP) {
                if (test.val <= MinMax || bestMove == null) {
                    MinMax = test.val;
                    bestMove = move;
                    bestChip = chip;
                }
                beta = Math.min(beta, test.val);
            } else {
                if (test.val > MinMax || bestMove == null) {
                    MinMax = test.val;
                    bestMove = move;
                    bestChip = chip;
                }
                alpha = Math.max(alpha, test.val);
            }

            if (beta < alpha)
                    break;
        }
        if (beta < alpha)
            break;
    }

    if (!bestMove) {
        return { val: this.getHeuristicEvaluation(gameStateCopy), chip: bestChip, move: bestMove };
    }

    return { val: MinMax, chip: bestChip, move: bestMove };
}

function getHeuristicEvaluation(gameStateCopy) {
    let sheep = gameStateCopy.chips.find(c => c.type === Type.SHEEP);
    if (sheep.i == 0)
        return 0;

    let map = create2DArray(gameStateCopy.fieldSize, gameStateCopy.fieldSize, 100);
    map[sheep.i][sheep.j] = 0;

    let searchWay = [];
    searchWay.push({ i: sheep.i, j: sheep.j });

    while (searchWay.length > 0)
    {
        let position = searchWay.pop();
        position.type = Type.SHEEP;
        for (let move of chipPossibleMoves(gameStateCopy.chips, gameStateCopy.fieldSize, position)) {
            if (map[move.i][move.j] === 100) {
                map[move.i][move.j] = map[position.i][position.j] + 1;
                searchWay.push(move);
            }
        }
    }
    
    let min = 255;
    for (let i = 0; i < gameStateCopy.fieldSize / 2; i++)
        if (map[0][i * 2] != 100 && map[0][i * 2] < min) 
            min = map[0][i * 2];

    return min - 1;
}


function create2DArray(n, m, val) {
    let arr = [];
    for (let i = 0; i < n; ++i) {
        let arr1 = [];
        for (let j = 0; j < m; ++j)
            arr1.push(val);
        arr.push(arr1);
    }
    return arr;
}