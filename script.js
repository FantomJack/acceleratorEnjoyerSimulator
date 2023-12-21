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

let doodler = {
    img : null,
    RightImg : null,
    LeftImg : null,
    x : doodlerX,
    y : doodlerY,
    velocityLeft : 0,
    velocityRight : 0,
    velocityY : 0,
    jumpV : -8,
    width : doodlerWidth,
    height : doodlerHeight,
}

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;


// GAME STATES
let gameOver = false;
let menu = false;
let mobile = false;
let hits = false;

// FPS
let now;
let then;
let elapsed;
let fpsInterval;
let fps = 60;

function setGameOver(){
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText("Game Over: Press 'Space' to Restart", boardWidth/7, boardHeight*12/13);
}



window.onload = function() {

    loadImages();

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board
    placePlatforms();


    doodler.img = doodler.RightImg;
    doodler.velocityY = doodler.jumpV;
    doodler.RightImg.onload = function() {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }

    fpsInterval = 1000 / fps;
    then = Date.now();
    requestAnimationFrame(frame);
    document.addEventListener("keydown", buttonDown);
    document.addEventListener("keyup", buttonUp);
}

function frame(){


    requestAnimationFrame(frame);

    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        requestAnimationFrame(update);
    }
}

function update() {

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
        newPlatform(-platformHeight); //replace with new platform on top
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
        setGameOver();
    }
}

function buttonUp(e){
    if (e.code === "ArrowLeft" || e.code === "KeyA")
        doodler.velocityLeft = 0;
    if (e.code === "ArrowRight" || e.code === "KeyD")
        doodler.velocityRight = 0;
}

function buttonDown(e) {

    if (e.code === "ArrowRight" || e.code === "KeyD") { //move right
        doodler.velocityRight = 4;
        doodler.img = doodler.RightImg;
    }
    else if (e.code === "ArrowLeft" || e.code === "KeyA") { //move left
        doodler.velocityLeft = -4;
        doodler.img = doodler.LeftImg;
    }
    else if (e.code === "Space" && gameOver) {
        reset()
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
        newPlatform(boardHeight - 75*i - 150);
    }
}

function newPlatform(height) {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
    let platform = {
        img : platformImg,
        x : randomX,
        y : height,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);
}

function reset(){
    doodler.x = doodlerX;
    doodler.y = doodlerY;

    gameOver = false;
    placePlatforms();
}
function detectCollision(doodler, platform) {
    return doodler.x < platform.x + platform.width &&   //a's top left corner doesn't reach b's top right corner
        doodler.x + doodler.width > platform.x &&   //a's top right corner passes b's top left corner
        doodler.y + doodler.height < platform.y + platform.height &&  //a's top left corner doesn't reach b's bottom left corner
        doodler.y + doodler.height > platform.y;    //a's bottom left corner passes b's top left corner
}
function loadImages() {
    // load images
    doodler.RightImg = new Image();
    doodler.RightImg.src = "./assets/doodler-right.png";

    doodler.LeftImg = new Image();
    doodler.LeftImg.src = "./assets/doodler-left.png";

    platformImg = new Image();
    platformImg.src = "./assets/platform.png";
}

