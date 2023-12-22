import {
    BreakingPlatform,
    DeadlyPlatform,
    HighJumpPlatform,
    LowJumpPlatform,
    MovingPlatform,
    Platform
} from "./platform.js";
import {Doodler} from "./assets/doodler.js";

//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//doodler
let doodler;

//platforms
let platformArray = [];

//physics
let gravity = 0.3;


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

window.onload = function() {

    doodler = new Doodler(46, 46 , boardWidth, boardHeight);

    loadImages();

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    placePlatforms();

    doodler.img = doodler.RightImg;
    doodler.jump();
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
        let platform = platformArray[i]

        // sliding platforms
        if (doodler.velocityY < 0 && doodler.y < boardHeight*3/4) {
            platform.y -= doodler.velocityY; //slide platform down
        }

        if (platform.detectCollision(doodler)) {
            if (platform.constructor.name === "DeadlyPlatform"){
                killedByPlatform(i)
                return;
            }
            platform.onCollision(doodler);
        }

        platform.update(boardWidth);
        context.drawImage(platform.img, platform.x, platform.y, Platform.width, Platform.height);
    }

    // clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); //removes first element from the array
        addPlatform(-Platform.height); //replace with new platform on top
    }

    //doodler
    doodler.update(boardWidth, gravity);
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    if (doodler.y > board.height) {
        gameOver = true;
    }

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
        doodler.moveRight();
    }
    else if (e.code === "ArrowLeft" || e.code === "KeyA") { //move left
        doodler.moveLeft();
    }
    else if (e.code === "Space" && gameOver) {
        reset()
    }
}
function placePlatforms() {
    platformArray = [];

    let platform = new Platform(boardWidth/2, boardHeight - 50)
    platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        addPlatform(boardHeight - 75*i - 150);
    }
}
function addPlatform(height) {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
    let platform = randomPlatformType(randomX, height);
    platformArray.push(platform);
}
function reset(){

    doodler.reset(boardWidth, boardHeight)
    gameOver = false;
    placePlatforms();
}
function loadImages() {
    // load images
    doodler.RightImg = new Image();
    doodler.RightImg.src = "./assets/doodler-right.png";

    doodler.LeftImg = new Image();
    doodler.LeftImg.src = "./assets/doodler-left.png";

    Platform.img = new Image();
    Platform.img.src = "./assets/platform.png";

    BreakingPlatform.img = new Image();
    BreakingPlatform.img.src = "./assets/platform-broken.png";

    MovingPlatform.img = new Image();
    MovingPlatform.img.src = "./assets/platform-moving.png";

    HighJumpPlatform.img = new Image();
    HighJumpPlatform.img.src = "./assets/high-jump.png";

    LowJumpPlatform.img = new Image();
    LowJumpPlatform.img.src = "./assets/low-jump.png";

    DeadlyPlatform.img = new Image();
    DeadlyPlatform.img.src = "./assets/platform-deadly.png";
}
function setGameOver(){
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText("Game Over: Press 'Space' to Restart", boardWidth/7, boardHeight*12/13);
}

function randomPlatformType(x, y){
    let random = Math.floor(Math.random() * (10));

    switch (random) {
        case 0:
            return new MovingPlatform(x, y);
        case 1:
            return new HighJumpPlatform(x, y);
        case 2:
            return new LowJumpPlatform(x, y);
        case 3:
            return new DeadlyPlatform(x, y);
        case 4:
            return new BreakingPlatform(x,y);
        default:
            return new Platform(x, y);
    }
}

function killedByPlatform(i){
    gameOver = true;
    for (i; i < platformArray.length; i++){
        let platform = platformArray[i];
        platform.update(boardWidth);
        context.drawImage(platform.img, platform.x, platform.y, Platform.width, Platform.height);
    }
    doodler.update(boardWidth, gravity);
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    setGameOver();
}