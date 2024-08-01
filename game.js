const SNAKE_DEFAUT_SIZE = 3

export default class SnakeGame {
    canvas;
    pointConf = {
        width: 0,
        height: 0
    }
    gameCordMap;
    movingDirection = 1 // have 4 direction 1 =>left -1 =>right 2 => bottom -2 => top; 
    snakePos = [0, 0]; // 1 row, 2 colummn

    baitCords = [];
    baitEaten = false;
    perkBait  =false;

    snakeSize = SNAKE_DEFAUT_SIZE;
    movementTracker= [];
    score = 0;
    constructor(canvas, size = 50) {
        this.pixelRange = size;
        this.gameCordMap = Array(size).fill(0).map(() => Array(size).fill(0));
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.calculatePointSize();;
    }
    calculatePointSize() {
        this.pointConf.width = this.canvas.width / this.gameCordMap[0].length;
        this.pointConf.height = this.canvas.height / this.gameCordMap.length;
    }
    getRandomCordWithInTheRange() {
        return Math.floor(Math.random() * this.pixelRange);
    }

    placeBait() {
        let [row, column ] = this.baitCords;
        if(this.baitEaten || this.baitCords.length == 0) {
            row = this.getRandomCordWithInTheRange();
            column = this.getRandomCordWithInTheRange();
            if(this.getRandomCordWithInTheRange() % 9 == 0) {
                this.perkBait = true;
            } 
            this.baitEaten = false;
        } 
         
        this.context.beginPath();
        if(this.perkBait == true) {
            this.context.fillStyle = "yellow";
        } else{
            this.context.fillStyle = "green";
        }
      
        this.context.roundRect( this.pointConf.width * column , this.pointConf.height * row, this.pointConf.width, this.pointConf.height, 25);
        this.context.stroke();  
        this.context.fill();
        this.context.closePath();
        this.baitCords = [row, column];        
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.stroke();
        let starX = 0;
        let startY = 0;
        this.gameCordMap.forEach(row => {
            starX = 0;
            row.forEach(cord => {
                if (cord) {
                    this.context.fillStyle = "red";
                    this.context.strokeStyle= "black"
                    this.context.beginPath();
                    this.context.roundRect(starX, startY, this.pointConf.width, this.pointConf.height, 8);
                    this.context.fill();
                    this.context.stroke();
                    this.context.closePath();
                }
                starX += this.pointConf.width;
            })
            startY += this.pointConf.height;
        });

         this.placeBait()
  
    }
    start() {
        this.draw();
        this.initMove();
        this.bindActions();
        this.placeBait();
        this.showScore();
    }
    showScore() {
        this.context.beginPath();
        this.context.fillStyle = "black";
        this.context.font = "30px Arial";
        this.context.fillText(`${this.score}`, this.canvas.width - 50, 25);
        this.context.closePath();
    }
    bindActions() {
        document.addEventListener("keydown", (ev) => {
           // console.log(ev);
            if (ev.code == "ArrowLeft" && this.movingDirection != 1) {
                this.movingDirection = -1;
            } else if (ev.code == "ArrowRight" && this.movingDirection != -1) {
                this.movingDirection = 1;
            } else if (ev.code == "ArrowDown" && this.movingDirection != -2) {
                this.movingDirection = 2;
            } else if (ev.code == "ArrowUp" && this.movingDirection != 2) {
                this.movingDirection = -2;
            }
        })
    }
    initMove() {
        setInterval(() => {
            this.clearAllMovements();
            this.repositionSnake();
        }, 100)
    }
    clearAllMovements(){
        if(this.movementTracker.length <= 0) {
                return true;
        }
        while(this.movementTracker.length > this.snakeSize) {
            let [row, column] = this.movementTracker.shift();
            this.gameCordMap[row][column] = 0;
        }

    }
    baitEatenBySnake() {
        let [ srow, scolumn ] = this.snakePos;
        let [ brow, bcolumn ] = this.baitCords;
        if(srow == brow && scolumn == bcolumn) {
            this.baitEaten = true;
            if(this.perkBait == true) {
               // this.snakeSize = SNAKE_DEFAUT_SIZE;
               this.score += 3
                this.perkBait = false;
            } else{
                //this.snakeSize += 1;
                this.score += 1
            }
            this.snakeSize += 1;
         
        }
    }
    repositionSnake() {
        let [snakePosRow, snakePosColumn] = this.snakePos;

        switch (this.movingDirection) {
            case 1:
                if (snakePosColumn == (this.gameCordMap[snakePosRow].length - 1)) {
                    snakePosColumn = 0;
                } else {
                    snakePosColumn += 1;
                }
                break;
            case -1:
                if (snakePosColumn == 0) {
                    snakePosColumn = this.gameCordMap[snakePosRow].length - 1;
                } else {
                    snakePosColumn -= 1;
                }
                break;

            case 2:
                 if (snakePosRow == this.gameCordMap.length - 1) {
                    snakePosRow = 0;
                } else {
                    snakePosRow += 1;
                }
                break;

            case -2:
                if (snakePosRow == 0) {
                    snakePosRow = this.gameCordMap.length - 1;
                } else {
                    snakePosRow -= 1;
                }
                break;

        }
        
        
        this.snakePos = [snakePosRow, snakePosColumn];
        if(!this.restartIfSnakeCollided()) {
            this.gameCordMap[snakePosRow][snakePosColumn] = 1;
            this.movementTracker.push([snakePosRow, snakePosColumn]);
        }
        this.baitEatenBySnake();
        this.draw();
        this.showScore();
     }

     restartIfSnakeCollided(){
        let isCollided = this.movementTracker.filter(item => item.join('-') == this.snakePos.join('-'));
        if(isCollided.length > 0) {
            this.score = 0;
            this.movementTracker.forEach(([row, column]) => {
                this.gameCordMap[row][column] = 0;
            })
            this.movementTracker = [];
            this.snakeSize = SNAKE_DEFAUT_SIZE;
            this.snakePos = [0, 0];
            return true;
        }
        return false;
     }
}