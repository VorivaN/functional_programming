class Chip {

    constructor(i, j, size, isWolf) {
        this.j = j;
        this.i = i;
        this.isWolf = isWolf;
        this.r = size * 0.9 / 2;
        this.size = size;
        this.selected = false;
    }

    show () {
        let smile = null; // определяем цвет фишки
        if(this.isWolf) {
            fill(76, 71, 55);
            smile = '🐺';
            if(this.selected)
                fill(125, 116, 93);
        } else {
            fill(213, 202, 172);
            smile = '🐑';
            if(this.selected)
                fill(218, 210, 189);
        }

        circle(this.j * this.size + this.size / 2, this.i * this.size + this.size / 2, 2 * this.r);

        push();
        let chipX = this.j * this.size + this.size / 2;
        let chipY = this.i * this.size + this.size / 2;
        textAlign(CENTER, CENTER); // определяем центр по дигонали и горизонтали, шрифт
        textSize(size / 2);
        text(smile, chipX, chipY);
        pop();
    }

    inside(x, y) { // смотрим попадаем внутрь или мимо
        let chipX = this.j * this.size + this.size / 2;
        let chipY = this.i * this.size + this.size / 2;

        let distance = Math.sqrt((x - chipX) * (x - chipX) + (y - chipY) * (y - chipY));
        return this.r >= distance;
    }

    possibleTurn(chip, i, j){ //проверяем можно ли сделать ход
        if(i < 0 || j < 0 || j > 7 || i > 7) 
            return false;

        for(let f of chips){
            if(f.i == i && f.j == j){
                return false;
            }
           
        } 
        if(this.isWolf){
            if(i <= this.i || i > this.i + 1 || Math.abs(j - this.j) != 1)
                return false;
        } else {
            if(Math.abs(j - this.j) != 1 || Math.abs(i - this.i) != 1)
                return false;
        }
    
        return true;
    }
}