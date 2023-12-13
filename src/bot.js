  class Bot {
    constructor(chips, turn){
        this.chips = chips;
        this.turn = turn;
    }
    
    doTurn(){ 
        this.runMiniMax(this.turn, 0, -500, 500);
    }
    runMiniMax(turn, recursiveLevel, alpha, beta) { //определяем наилучший ход

        let test = null;

        if (recursiveLevel >= 7) //если глубина > 7 выбираем наилучший ход 
        {
            return this.getHeuristicEvaluation();
        }

        let bestMove = null;
        let bestChip = null;
        let MinMax = turn == 'wolf' ? 0 : 255; // ?

        if(turn == 'sheep') { 
            let sheep = this.chips.find(c => !c.isWolf);

            let curPos = { i: sheep.i, j: sheep.j };//запоминаем начальную координату
            let moves = [
                {i: sheep.i + 1, j: sheep.j + 1},
                {i: sheep.i + 1, j: sheep.j - 1},
                {i: sheep.i - 1, j: sheep.j + 1},
                {i: sheep.i - 1, j: sheep.j - 1}
            ];

            for(let move of moves) {
                if(sheep.possibleTurn(this.chips, move.i, move.j)){//проверяем возможен ли ход
                    
                    //сделали ход овцой
                    sheep.i = move.i;
                    sheep.j = move.j;

                    //проверили насколько этот ход хорош
                    test = this.runMiniMax('wolf', recursiveLevel + 1, alpha, beta);

                    //сходили обратно
                    sheep.i = curPos.i;
                    sheep.j = curPos.j;

                    if(test <= MinMax || bestMove == null) {//если тестовый ход вернул значение минимакса меньше, обнавляем данные 
                        MinMax = test;
                        bestMove = move;
                        bestChip = sheep;
                    }
                    
                    beta = Math.min(beta, test);
                    if (beta < alpha)
                        break;
                }
            }
        } else {
            let wolfs = this.chips.filter(c => c.isWolf);

            for(let wolf of wolfs) {
                let curPos = { i: wolf.i, j: wolf.j };//запоминаем координату волка
                let moves = [
                    {i: wolf.i + 1, j: wolf.j + 1},
                    {i: wolf.i + 1, j: wolf.j - 1}
                ];
                
                for(let move of moves) {
                    if(wolf.possibleTurn(this.chips, move.i, move.j)){
                        //сделали ход волком
                        wolf.i = move.i;
                        wolf.j = move.j;

                        //проверили насколько этот ход хорош
                        test = this.runMiniMax('sheep', recursiveLevel + 1, alpha, beta);

                        //сходили обратно
                        wolf.i = curPos.i;
                        wolf.j = curPos.j;

                        if(test > MinMax || bestMove == null){
                            MinMax = test;
                            bestMove = move;
                            bestChip = wolf;
                        }

                        alpha = Math.max(alpha, test);
                        if (beta < alpha)
                            break;
                    }
                }
                if (beta < alpha)
                    break;
            }
        }

        if(bestMove == null) {
            return this.getHeuristicEvaluation();
        }

        if (recursiveLevel == 0 && bestMove != null && bestChip != null)
        {
           bestChip.i = bestMove.i;
           bestChip.j = bestMove.j;
        }
        
        return MinMax;
    }

    getHeuristicEvaluation() {
        let sheep = this.chips.find(c => !c.isWolf);
        if (sheep.i == 0)
            return 0;

        let searchWay = []; //создаем массив ходов?
        let map = []; // создаем массив поля и заполняем его
        for(let i = 0; i < 8; ++i)
            map.push([100,100,100,100,100,100,100,100]);
        map[sheep.i][sheep.j] = 0;

        searchWay.push({i: sheep.i, j: sheep.j}); //запоминаем координату овцы

        while (searchWay.length > 0)//пока есть возможные ходы
        {
            let position = searchWay.pop(); //берем позицию 
            let moves = [
                {i: position.i + 1, j: position.j + 1},
                {i: position.i + 1, j: position.j - 1},
                {i: position.i - 1, j: position.j + 1},
                {i: position.i - 1, j: position.j - 1}
            ];

            for(let move of moves) { //смотрим возможные ходы
                if (this.cellEmpty(move.i, move.j) && map[move.i][move.j] == 100) {//клетка пуста и значение в ней 100
                    map[move.i][move.j] = map[position.i][position.j] + 1;//? + 1
                    searchWay.push(move);//добавляем в массив ходов 
                }
            }
        }

        let min = 255;
        for (let i = 0; i < 4; i++)
            if (map[0][i * 2] != 100 && map[0][i * 2] < min)//проверяем клетки сверху 
                min = map[0][i * 2];

        return min - 1;
    }

    cellEmpty(i, j) {
        if(i < 0 || j < 0 || j > 7 || i > 7) 
            return false;

        for(let f of this.chips){ //проверяем стоит ли на клетке фишка
            if(f.i == i && f.j == j){
                return false;
            }
        } 
        return true; //тогда ходим
    }
}