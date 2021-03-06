const elements = {
    play : {
        screen: document.getElementById("play-screen"),
        playButton: document.getElementById("play-playButton"),
        instructionButton: document.getElementById("play-instructionButton"),
        highscoreButton: document.getElementById("play-highscoreButton"),
    },
    login: {
        screen: document.getElementById("login-screen"),
        loginButton: document.getElementById("login-loginButton"),
        nameInput: document.getElementById("login-nameInput"),
        backButton: document.getElementById("login-backButton"),
    },
    game: {
        screen: document.getElementById("game-screen"),
        playerName: document.getElementById("game-playerName"),
        playerHealth: document.getElementById("game-playerHealth"),
        enemyName: document.getElementById("game-enemyName"),
        enemyHealth: document.getElementById("game-enemyHealth"),
        button1: document.getElementById("game-button1"),
        button2: document.getElementById("game-button2"),
        button3: document.getElementById("game-button3"),
        button4: document.getElementById("game-button4"),
        canvas: document.getElementById("game-canvas"),
        time: document.getElementById("game-time"),
        questionText: document.getElementById("game-questionText"),
        coins: document.getElementById("game-coins")
    },
    instructions: {
        screen: document.getElementById("instructions-screen"),
        backButton: document.getElementById("instructions-backButton")
    },
    highscores: {
        screen: document.getElementById("highscores-screen"),
        restartButton: document.getElementById("highscores-restartButton"),
        scores: document.getElementById("highscores-scores"),
    }
}

const screens = {
    playScreen: elements.play.screen,
    loginScreen: elements.login.screen, 
    gameScreen: elements.game.screen, 
    instructionsScreen: elements.instructions.screen, 
    highscoresScreen: elements.highscores.screen
};

class Question {
    constructor(questionText, answer, possibleAnswers, correctAnswerIndex, maxTime) {
      this.questionText = questionText;
      this.answer = answer;
      this.possibleAnswers = possibleAnswers;
      this.correctAnswerIndex = correctAnswerIndex;
      this.maxTime = maxTime;
    }
}

let difficulty = 1;
var tid;
let timeLeft;
let playerName;
let playerHealth;
let enemyName;
let enemyHealth;
let playerPos;
let enemyPos;
let hasMoved = false;
var ctx = elements.game.canvas.getContext("2d");
var shopImage = new Image();
var playerImage = new Image();
var enemyImage = new Image();
const enemyImagePath = 'assets/images/enemy';
let enemyImageChooser;
var gameMusic = document.createElement("audio");
let timeUpgradeLevel = 1;
let strengthLevel = 1;
let enemyWeakness = 1;
let coin = 0;
let isShop = false;
let played = false;

window.onload = function() {
    gameMusic.src = "assets/sounds/startTheme.mp3"
    gameMusic.loop = true;
    gameMusic.play();
}

elements.play.playButton.addEventListener("click", function(){
    showLogin();
    gameMusic.play();
});
//
elements.play.instructionButton.addEventListener("click", function(){
    showInstructions();
    gameMusic.play();
});

elements.play.highscoreButton.addEventListener("click", function(){
    if (localStorage.getItem("highScoresList") === null) {
        alert("Hark! Ye art the first man to set foot in this land, there stand no records before us. \nShalt thou change this by thine hand?\nPress Play to get started.")
    } else {
        showHighscores(played);
    }
});

elements.login.loginButton.addEventListener("click", function(){
    if (elements.login.nameInput.value === "") {
        alert("Enter thine name, young warrior!");
    } else {
        if (elements.login.nameInput.value.includes(",") || elements.login.nameInput.value.includes(".")) {
            alert("Thine name cannot contain '.' or ','");
        } else {
            showGame();
            playerName = elements.login.nameInput.value;
        }  
    }  
});

elements.login.backButton.addEventListener("click", function(){
    showPlay();
});

elements.instructions.backButton.addEventListener("click", function(){
    showPlay();
});

elements.highscores.restartButton.addEventListener("click", function(){
    if (played) {
        window.location.reload();
    } else {
        showPlay();
    }
});

function hideScreens() {
    Object.values(screens).forEach(screen => {
        screen.style.display = "none";
    });
}

function showScreen(screen) {
    hideScreens();
    screen.style.display = "block";
}

function showPlay() {
    showScreen(elements.play.screen);
}

function showLogin() {
    showScreen(elements.login.screen);
}

function showInstructions() {
    showScreen(elements.instructions.screen);
}


function drawBackground() {
    ctx.fillStyle = "deepskyblue";
    ctx.beginPath();
    ctx.rect(0, 0, elements.game.canvas.width, elements.game.canvas.height * (3 / 8));
    ctx.fill();
    ctx.fillStyle = "#5b8930";
    ctx.beginPath();
    ctx.rect(0, elements.game.canvas.height * (3 / 8), elements.game.canvas.width, elements.game.canvas.height * (5 / 8));
    ctx.fill();
}

function showGame() {
    gameMusic.src = "assets/sounds/gameTheme.mp3";
    gameMusic.play();
    enemyName = randomNameGen();
    playerHealth = 100;
    enemyHealth = 100;
    elements.game.playerName.innerText = "Thine Name: " + playerName;
    elements.game.playerHealth.innerText = "Thine Vitality: " + playerHealth;
    elements.game.enemyName.innerText = "Name of thine adversary: " + enemyName;
    elements.game.enemyHealth.innerText = "Vitality of thine adversary: " + enemyHealth;
    elements.game.coins.innerText = "Coin in thine coffers: " + coin;
    elements.game.canvas.width = window.screen.width / 4;
    elements.game.canvas.height = window.screen.height / 4;
    enemyPos = elements.game.canvas.width * (5 / 8);
    playerPos = elements.game.canvas.width / 8;
    drawBackground();
    enemyImageChooser = Math.floor(Math.random() * 6) + 1;
    playerImage.src = 'assets/images/player_1.png';
    enemyImage.src = enemyImagePath + enemyImageChooser + ".png";
    shopImage.src = 'assets/images/shop.png';
    playerImage.onload = () => {
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2)
    }
    enemyImage.onload = () => {
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2)
    }
    showScreen(elements.game.screen);
    newQuestion();
}

function btn1Click() {
    if (isShop) {
        purchase(0);
    } else {
        handleInput(x, 0, false);
    }
}

function btn2Click() {
    if (isShop) {
        purchase(1);
    } else {
        handleInput(x, 1, false);
    }
}

function btn3Click() {
    if (isShop) {
        purchase(2);
    } else {
        handleInput(x, 2, false);
    }
}

function btn4Click() {
    if (isShop) {
        purchase(3);
    } else {
        handleInput(x, 3, false);
    }
}

function newQuestion() {
    chooseQuestion(difficulty);
    timeLeft = x.maxTime;
    tid = setTimeout(timer, 1000);
    setTimeout(updateUI, 500);
}

function shop() {
    isShop = true;
    elements.game.playerName.innerText = "";
    elements.game.playerHealth.innerText = "";
    elements.game.enemyName.innerText = "";
    elements.game.enemyHealth.innerText = "";
    elements.game.time.innerText = "";
    elements.game.coins.innerText = "Thine coin: " + coin;
    elements.game.button1.innerText = "Accelerate thine mind! Cost: " + timeUpgradeLevel; 
    elements.game.button2.innerText = "Increase thine strength! cost: " + strengthLevel;
    elements.game.button3.innerText = "Hinder thine enemies! cost: " + enemyWeakness;
    elements.game.button4.innerText = "Exit Shop";
    elements.game.questionText.innerText = "Welcome to the market, spend thine coin";
    ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
    drawBackground();
    ctx.drawImage(shopImage, (elements.game.canvas.width / 2) - (elements.game.canvas.height / 2), 0, elements.game.canvas.height, elements.game.canvas.height);
    elements.game.button1.disabled = false;
    elements.game.button2.disabled = false;
    elements.game.button3.disabled = false;
    elements.game.button4.disabled = false;
}

function purchase(choice) {
    if (choice === 0) {
        if (coin >= timeUpgradeLevel) {
            coin -= timeUpgradeLevel;
            timeUpgradeLevel += 1;
            elements.game.coins.innerText = coin;
            elements.game.button1.innerText = "Praise thine business";
            elements.game.button1.disabled = true; 
        } else {
            alert("Thine coin is too measly to acquire such a skill");
        }
    } else if (choice === 1) {
        if (coin >= strengthLevel) {
            coin -= strengthLevel;
            strengthLevel += 1;
            elements.game.coins.innerText = coin;
            elements.game.button2.innerText = "Praise thine business";
            elements.game.button2.disabled = true; 
        } else {
            alert("Thine coin is too measly to acquire such a skill");
        }
    } else if (choice === 2) {
        if (coin >= enemyWeakness) {
            coin -= enemyWeakness;
            enemyWeakness += 1;
            elements.game.coins.innerText = coin;
            elements.game.button3.innerText = "Praise thine business";
            elements.game.button3.disabled = true; 
        } else {
            alert("Thine coin is too measly to acquire such a skill");
        }
    } else if (choice === 3) {
        isShop = false;
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        drawBackground();
        playerPos = elements.game.canvas.width / 8;
        enemyPos = elements.game.canvas.width * (5 / 8);
        enemyHealth = 100;
        enemyName = randomNameGen();
        enemyImageChooser = Math.floor(Math.random() * 7) + 1;
        enemyImage.src = enemyImagePath + enemyImageChooser + ".png";
        if (strengthLevel > 1) {
            playerImage.src = 'assets/images/player_0.png';
        }
        difficulty += 1;
        playerHealth += Math.floor(playerHealth / 3);
        newQuestion();
    }
}

function chooseQuestion(difficulty) {
    if (difficulty === 1) {
        x = createAdditionQuestion(difficulty);
    } else if (difficulty === 2) {
        var rand = Math.floor(Math.random() * 2 + 1);
        if (rand === 1) {
            x = createSubtractionQuestion(difficulty);
        } else {
            x = createAdditionQuestion(difficulty);
        }
    } else {
        var rand = Math.floor(Math.random() * 3 + 1);
        if (rand === 1) {
            x = createSubtractionQuestion(difficulty);
        } else if (rand === 2) {
            x = createAdditionQuestion(difficulty);
        } else {
            x = createMultiplicationQuestion(difficulty);
        }
    }
}

function createAdditionQuestion(difficulty) {
    const maxNum = (10 ** difficulty);
    const num1 = Math.floor(Math.random() * maxNum);
    const num2 = Math.floor(Math.random() * maxNum);
    const text = String(num1) + " + " + String(num2);
    const answer = num1 + num2;
    const possibleAnswers = [];
    const correctAnswerIndex = Math.floor(Math.random() * 4)
    while (possibleAnswers.length < 5) {
        const possibleAnswer = Math.floor(Math.random() * (maxNum * 2));
        if (possibleAnswer !== answer && !possibleAnswers.includes(possibleAnswer)) {
            possibleAnswers.push(possibleAnswer);
        }
    }
    possibleAnswers[correctAnswerIndex] = answer;
    let maxtime = (3 + (difficulty - 1) * 2);
    maxtime += (maxtime / 2) * (timeUpgradeLevel - 1);
    return new Question(text, answer, possibleAnswers, correctAnswerIndex, maxtime);
}

function createSubtractionQuestion(difficulty) {
    const maxNum = 10 ** (difficulty - 1);
    const num1 = Math.floor(Math.random() * maxNum);
    const num2 = Math.floor(Math.random() * maxNum);
    const text = String(num1) + " - " + String(num2);
    const answer = num1 - num2;
    const possibleAnswers = [];
    const correctAnswerIndex = Math.floor(Math.random() * 4)
    while (possibleAnswers.length < 5) {
        const possibleAnswer = Math.floor(Math.random() * ((maxNum + 1) - (-maxNum)) - maxNum);
        if (possibleAnswer != answer && possibleAnswers.includes(possibleAnswer) === false) {
            possibleAnswers.push(possibleAnswer);
        }
    }
    possibleAnswers[correctAnswerIndex] = answer;
    let maxtime = 5 + (difficulty - 1) * 2;
    maxtime += (maxtime / 2) * (timeUpgradeLevel - 1);
    return new Question(text, answer, possibleAnswers, correctAnswerIndex, maxtime);
}

function createMultiplicationQuestion(difficulty) {
    const maxNum = 10 ** (difficulty - 2);
    const num1 = Math.floor(Math.random() * maxNum);
    const num2 = Math.floor(Math.random() * maxNum);
    const text = String(num1) + " X " + String(num2);
    const answer = num1 * num2;
    const possibleAnswers = [];
    const correctAnswerIndex = Math.floor(Math.random() * 4)
    while (possibleAnswers.length < 5) {
        const possibleAnswer = Math.floor(Math.random() * (maxNum ** 2));
        if (possibleAnswer != answer && possibleAnswers.includes(possibleAnswer) === false) {
            possibleAnswers.push(possibleAnswer);
        }
    }
    possibleAnswers[correctAnswerIndex] = answer;
    let maxtime = 5 + (difficulty - 1) * 2;
    maxtime += (maxtime / 2) * (timeUpgradeLevel - 1);
    return new Question(text, answer, possibleAnswers, correctAnswerIndex, maxtime);
}

function timer() {
    if (timeLeft % 1 == 0) {
        elements.game.time.innerText = "Time remaining for thee: " + timeLeft;
    }
    if (timeLeft === 0) {
        handleInput(5, x, true);
    } else {
        timeLeft -= 0.5;
        tid = setTimeout(timer, 500);
    }
}
function abortTimer() { 
    clearTimeout(tid);
}

function updateUI() {
    elements.game.playerName.innerText = "Thine Name: " + playerName;
    elements.game.playerHealth.innerText = "Thine Vitality: " + playerHealth;
    elements.game.enemyName.innerText = "Name of thine adversary: " + enemyName;
    elements.game.enemyHealth.innerText = "Vitality of thine adversary: " + enemyHealth;
    elements.game.coins.innerText = "Coin in thine coffers: " + coin;
    ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
    drawBackground();
    ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
    ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2);
    elements.game.button1.innerText = x.possibleAnswers[0];
    elements.game.button2.innerText = x.possibleAnswers[1];
    elements.game.button3.innerText = x.possibleAnswers[2];
    elements.game.button4.innerText = x.possibleAnswers[3];
    elements.game.questionText.innerText = x.questionText;
    elements.game.button1.disabled = false;
    elements.game.button2.disabled = false;
    elements.game.button3.disabled = false;
    elements.game.button4.disabled = false;
}

function handleInput(question, num, timeOut) {
    abortTimer();
    elements.game.button1.disabled = true;
    elements.game.button2.disabled = true;
    elements.game.button3.disabled = true;
    elements.game.button4.disabled = true;
    let damageToPlayer = Math.floor(Math.random() * 21);
    damageToPlayer += damageToPlayer * (difficulty / 3);
    damageToPlayer = Math.floor((damageToPlayer) / enemyWeakness);
    if (! timeOut) {
        if (question.possibleAnswers[num] === question.answer) {
            playerPos = elements.game.canvas.width / 8;
            movePlayer();
            let damageToEnemy = Math.floor((25 - (25 / (timeLeft + 1.5))));
            damageToEnemy += (damageToEnemy / 2) * (strengthLevel - 1);
            enemyHealth -= damageToEnemy;
            damageToPlayer -= (damageToPlayer + 1) / 2;
        } else {
            moveEnemy();
        }
    } else {
        moveEnemy();
    }
    playerHealth -= damageToPlayer; 
}

function randomNameGen() {
    const vowels = ["a", "e", "i", "o", "u"];
    const consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"];
    let name = "";
    const nameLength = Math.floor(Math.random() * 15) + 1;
    let i = 0;
    while (i < nameLength) {
        const vowelNum =  Math.floor(Math.random() * vowels.length);
        const consonantNum =  Math.floor(Math.random() * consonants.length);
        name = name + consonants[consonantNum] + vowels[vowelNum];
        i += 1;
    }
    return name;
}

function movePlayer() {
    if (playerPos >= elements.game.canvas.width * (5 / 8)) {
        hasMoved = true;
    }
    if (hasMoved) {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        playerPos = playerPos - 8;
        drawBackground();
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2);
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
    } else {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        playerPos = playerPos + 8;
        drawBackground();
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2);
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
    }
    if (playerPos < elements.game.canvas.width / 8) {
        hasMoved = false;
        enemyPos = elements.game.canvas.width * (5 / 8);
        if (enemyHealth <= 0) {
            coin += 1;
            alert("Huzzah! Thou hast defeated the fearsome " + enemyName + ", gather thine senses, for another enemy approaches! \nThou vitality hast been partially restored.");
            if ((coin >= enemyWeakness) || (coin >= strengthLevel) || (coin >= timeUpgradeLevel)) {
                shop();
            } else {
                purchase(3);
            }
        } else {
            moveEnemy();
        }
    } else {
        requestAnimationFrame(movePlayer);
    }
    
}

function moveEnemy() {
    if (enemyPos <= elements.game.canvas.width * (1 / 4)) {
        hasMoved = true;
    }
    if (hasMoved) {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        enemyPos = enemyPos + 8;
        drawBackground();
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2);
    } else {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        enemyPos = enemyPos - 8;
        drawBackground();
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2);
    }
    if (enemyPos > elements.game.canvas.width * (5 / 8)) {
        hasMoved = false;
        if (playerHealth > 0) {
            newQuestion();
        } else {
            played = true;
            playerHealth = 0;
            updateUI();
            gameMusic.pause();
            gameMusic.src = "assets/sounds/deathTheme.mp3"
            gameMusic.load();
            showHighscores(played);
        }
    } else {
        requestAnimationFrame(moveEnemy);
    }
    
}

function showHighscores(played) {
    let scores;
    if ((localStorage.getItem("highScoresList") === null) && (played)) {
        localStorage.setItem("highScoresList", playerName + "." + difficulty + ",");
        scores = localStorage.getItem("highScoresList");
    } else {
        scores = localStorage.getItem("highScoresList");
        if (played) {
            scores = scores + playerName + "." + difficulty + ",";
            localStorage.setItem("highScoresList", scores);
        }
    }
    scores = scores.split(",");
    const sortedScores = sortHighscores(scores);
    elements.highscores.scores.innerText = sortedScores.toString().replace(/,/g, " Foe(s) \n").replace(/[.]/g, " Hast Encountered ") + " Foe(s)";
    gameMusic.play();
    showScreen(elements.highscores.screen);
}

function sortHighscores(highscores) {
    let len = highscores.length;
    for (let i = 0; i < len; i++) {
        let max = i;
        for (let j = i + 1; j < len; j++) {
            if (Number(highscores[max].split(".")[1]) < Number(highscores[j].split(".")[1])) {
                max = j;
            }
        }
        if (max !== i) {
            let tmp = highscores[i];
            highscores[i] = highscores[max];
            highscores[max] = tmp;
        }
    }
    if (len > 10) {
        highscores.length = 10;
    }
    return highscores;
}

function main() {
    showPlay();
}
main();
