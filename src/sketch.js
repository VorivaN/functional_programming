const cells = 8;
let canvasSize;
let size;
let playersCount;
let role;
let startButton;
let sheep;
let chips = [];
let selectedChip = null;
let turn = 'endGame';
let gameProcessing = false;
let gameResult = null;

function setup() {
    canvasSize = Math.floor(Math.min(windowHeight, windowWidth) * 0.9); 
    size = canvasSize / cells;                   
    createCanvas(canvasSize, canvasSize);        

    startButton = createButton("Новая игра"); 
    startButton.mouseClicked(() => {                                  
        restartGame();                 
    });

    playersCount = createRadio(); 
    playersCount.option('1 игрок', '1');
    playersCount.option('2 игрок', '2');
    playersCount.selected('1');
    playersCount.mouseClicked(() => {
        if(playersCount.value() == '1')
            role.show();
        else 
            role.hide();
    });

    role = createRadio();
    role.option('Овца','sheep');
    role.option('Волки', 'wolf');
    role.selected('sheep');
}
  
function restartGame(){ // размещаем фишки
    chips = [];

    let sheep = new Chip(7, 3, size, false); //создаем овцу
    chips.push(sheep);

    for(let i=0; i < 4; i++){
        let wolf = new Chip(0, 2 * i, size, true) //создаем волков
        chips.push(wolf);
    }

    turn = 'sheep';
    gameProcessing = true;
}

function draw() { //главный метод, который рисует поле
    showField(); //вызываем функцию создания поля
    for(let f of chips)
        f.show();

    if(gameProcessing){ //проверяем окончена ли игра 
        gameResult = endGame(); //записываем результат игры
        if(gameResult){
            turn = 'endGame';
            gameProcessing = false;
        } else {
            if(playersCount.value() == '1' && role.value() != turn){
                let bot = new Bot(chips, turn);
                bot.doTurn();
                switchTurn();
            }
        } 
        
    }  
    showGameResult(gameResult);
}

function showGameResult(winner) {// выводим результат игры 
    if(!winner)
        return;

    push();
    fill(255, 255, 255); // рисуем белую табличку 
    rect(0.1 * width, 0.4 * height, 0.8 * width, 0.2 * height);
    pop();
    
    textAlign(CENTER, CENTER); // выводим надпись с итогами
    textSize(size / 2);
    if(winner == 'wolf')
        text('🐺 Волки победили 🐺', canvasSize/2, canvasSize/2);
    else
        text('🐑 Овца победила 🐑', canvasSize/2, canvasSize/2);
}

function mousePressed() { //переставляем фишки тут
    let x = mouseX;
    let y = mouseY;

    let cellIndex = cellByCoordinates (x, y);
    console.log(cellIndex);

    if(selectedChip){ //выбираем фишку
        
        if(selectedChip.possibleTurn(chips, cellIndex.i, cellIndex.j)) { //переставляем фишку 
            selectedChip.j = cellIndex.j;
            selectedChip.i = cellIndex.i;

            switchTurn();
        }
        selectedChip.selected = false; // после перестановки сбрасываем выбор с фишки      
        selectedChip = null;
        
    } else {
        for(let f of chips) {
            if(f.inside(x, y)) {
                if(f.isWolf && turn != 'wolf' || !f.isWolf && turn != 'sheep')
                    return;
                selectedChip = f;
                selectedChip.selected = true;
                break;
            }
        }
    }
}

function switchTurn(){
    if(turn == 'wolf')// меняем очередь хода
        turn = 'sheep';
    else if(turn == 'sheep')
        turn = 'wolf';
}

function cellByCoordinates(x, y){ // превращает координату в индекс
    return {i: Math.floor(y / size),j: Math.floor(x / size)};
}

function endGame(){ // определяем результат игры  
    let sheep = chips.find(c => !c.isWolf);

    if(sheep.i == 0) 
        return 'sheep';
    if(!sheep.possibleTurn(chips, sheep.i + 1, sheep.j + 1) && 
    !sheep.possibleTurn(chips, sheep.i + 1, sheep.j - 1) &&
    !sheep.possibleTurn(chips, sheep.i - 1, sheep.j + 1) &&
    !sheep.possibleTurn(chips, sheep.i - 1, sheep.j - 1))
        return 'wolf';

    return null;
}
function showField() { //рисуем поле 
    line(0, 0, width, 0);
    line(0, 0, 0, height);
    line(0, height, width, height);
    line(height, 0, height, height);
    
    for(let i = 0; i < cells; i++){ //бежим по уголкам(целым числам) и рисуем клетки поля
        for(let j = 0; j < cells; j++){
            if((j + i) % 2 == 0) // определяем какого цвета клетка
                if(selectedChip && selectedChip.possibleTurn(chips, i, j)) //подсвечиваем возможные ходы
                    fill(255, 255, 200);
                else 
                    fill(111, 149, 82)
            else
                fill(222, 231, 215);
            rect(j * size, i * size, size, size);
        }
    }
}