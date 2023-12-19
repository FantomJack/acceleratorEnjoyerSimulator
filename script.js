//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//physics
let gravity = 0.3;

//doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth/2 - doodlerWidth/2;
let doodlerY = boardHeight*7/8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img : null,
    x : doodlerX,
    y : doodlerY,
    velocityLeft : 0,
    velocityRight : 0,
    velocityY : 0,
    jumpV : -8,
    width : doodlerWidth,
    height : doodlerHeight
}

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let gameOver = false;

window.onload = function() {

    loadImages();

    board = document.getElementById("board");
    console.log(board)
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board
    placePlatforms();


    doodler.img = doodlerRightImg;
    doodler.velocityY = doodler.jumpV;
    doodlerRightImg.onload = function() {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }


    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
    document.addEventListener("keyup", (e) => {
        if (e.code === "ArrowLeft" || e.code === "KeyA")
            doodler.velocityLeft = 0;
        if (e.code === "ArrowRight" || e.code === "KeyD")
            doodler.velocityRight = 0;
    });
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);



    //platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (doodler.velocityY < 0 && doodler.y < boardHeight*3/4) {
            platform.y -= doodler.jumpV; //slide platform down
        }
        if (detectCollision(doodler, platform) && doodler.velocityY >= 0) {
            doodler.velocityY = doodler.jumpV;
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); //removes first element from the array
        newPlatform(); //replace with new platform on top
    }


    //doodler
    doodler.x += doodler.velocityLeft;
    doodler.x += doodler.velocityRight;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    }
    else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    doodler.velocityY += gravity;
    doodler.y += doodler.velocityY;
    if (doodler.y > board.height) {
        gameOver = true;
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);



    if (gameOver) {
        context.fillStyle = "black";
        context.font = "16px sans-serif";
        context.fillText("Game Over: Press 'Space' to Restart", boardWidth/7, boardHeight*12/13);
    }
}

function moveDoodler(e) {
    if (e.code === "ArrowRight" || e.code === "KeyD") { //move right
        doodler.velocityRight = 4;
        doodler.img = doodlerRightImg;
    }
    else if (e.code === "ArrowLeft" || e.code === "KeyA") { //move left
        doodler.velocityLeft = -4;
        doodler.img = doodlerLeftImg;
    }
    else if (e.code === "Space" && gameOver) {
        //reset
        doodler = {
            img : doodlerRightImg,
            x : doodlerX,
            y : doodlerY,
            velocityLeft : 0,
            velocityRight : 0,
            velocityY : doodler.jumpV,
            jumpV : -8,
            width : doodlerWidth,
            height : doodlerHeight
        }

        gameOver = false;
        placePlatforms();
    }
}

function placePlatforms() {
    platformArray = [];

    //starting platforms
    let platform = {
        img : platformImg,
        x : boardWidth/2,
        y : boardHeight - 50,
        width : platformWidth,
        height : platformHeight
    }
    platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth*3/4);
        let platform = {
            img : platformImg,
            x : randomX,
            y : boardHeight - 75*i - 150,
            width : platformWidth,
            height : platformHeight
        }

        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
    let platform = {
        img : platformImg,
        x : randomX,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);
}

function detectCollision(doodler, platform) {
    return doodler.x < platform.x + platform.width &&   //a's top left corner doesn't reach b's top right corner
        doodler.x + doodler.width > platform.x &&   //a's top right corner passes b's top left corner
        doodler.y + doodler.height < platform.y + platform.height &&  //a's top left corner doesn't reach b's bottom left corner
        doodler.y + doodler.height > platform.y;    //a's bottom left corner passes b's top left corner
}

function loadImages() {
    // load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = "./doodler-right.png";

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./doodler-left.png";

    platformImg = new Image();
    platformImg.src = "./platform.png";
}
