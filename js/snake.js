// Налаштування 'холста'
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// Отримуємо ширину та висоту елемента canvas
let width = canvas.width;
let height = canvas.height;

// Вираховуємо ширину та висоту в клітинках
let blockSize = 25;
let appleSize = 28;
let widthInBlocks = width / blockSize;
let heightInBlocks = height / blockSize;

// Встановлюємо початковий рахунок
let score = 0;

// Малюємо рамку
let drawBorder = function () {
    ctx.fillStyle = 'Black';
    ctx.fillRect(0, 0, width,  blockSize * 0.5);
    ctx.fillRect(0, height - blockSize * 0.5, width, blockSize * 0.5);
    ctx.fillRect(0, 0, blockSize * 0.5, height);
    ctx.fillRect(width - blockSize * 0.5, 0, blockSize * 0.5, height);
};

// Виводимо рахунок гри у верхньому лівому куті
let drawScore = function () {
    ctx.font = "20px Courier";
    ctx.fillStyle = "Black";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Рахунок: " + score, blockSize, blockSize);
};

// Скасовуємо дію setInterval і виводимо повідомлення «Кінець гри»
let gameOver = function () {
    clearInterval(intervalId);
    ctx.font = "60px Courier";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Кінець гри", width / 2, height / 2);
};

// Малюємо коло
let circle = function (x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
};

// Конструктор Block (клітинка)
let Block = function (col, row) {
    this.col = col;
    this.row = row;
};

// Малюємо квадрат у позиції клітинки
Block.prototype.drawSquare = function (color) {
    let x = this.col * blockSize;
    let y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
};

// Малюємо коло у позиції клітинки
Block.prototype.drawCircle = function (color) {
    let centerX = this.col * blockSize + blockSize / 2;
    let centerY = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
};

// Перевіряємо, чи знаходиться ця клітинка у тій же позиції, що й клітинка otherBlock
Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
};

// Конструктор Snake (змійка)
let Snake = function () {
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5)
    ];

    this.direction = "right";
    this.nextDirection = "right";
        // Зберігаємо проміжні позиції для плавного руху
    this.interpolationFactor = 0.1;
    this.prevSegments = this.segments.map(seg => Object.assign({}, seg));

};

// Малюємо квадратик для кожного сегмента тіла змійки
Snake.prototype.draw = function () {
    for (let i = 0; i < this.segments.length; i++) {
        let segment = this.segments[i];
        let x = segment.col * blockSize;
        let y = segment.row * blockSize;

        // Створюємо градієнт для сегмента
        let gradient = ctx.createLinearGradient(x, y, x + blockSize, y + blockSize);
        gradient.addColorStop(0, "#4a773c");  // Основний зелений
        gradient.addColorStop(0.5, "#2e6a42"); // Темніший зелений
        gradient.addColorStop(1, "#4a773c");  // Основний зелений

        // Додаємо ще один градієнт для створення ефекту об'ємності
        let shadowGradient = ctx.createLinearGradient(x, y, x, y + blockSize);
        shadowGradient.addColorStop(0, "rgba(0,0,0,0.2)"); // Легкий тіньовий ефект
        shadowGradient.addColorStop(1, "rgba(0,0,0,0)");   // Прозорість

        // Малюємо тінь для об'єму
        ctx.fillStyle = shadowGradient;
        ctx.fillRect(x, y, blockSize, blockSize);

        // Малюємо основний сегмент з градієнтом
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, blockSize, blockSize);

        // Малюємо чорний контур
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, blockSize, blockSize);
    }
};

// Створюємо нову голову і додаємо її до початку змійки
Snake.prototype.move = function () {
    let head = this.segments[0];
    let newHead;

    this.direction = this.nextDirection;

    if (this.direction === "right") {
        newHead = new Block(head.col + 1, head.row);
    } else if (this.direction === "down") {
        newHead = new Block(head.col, head.row + 1);
    } else if (this.direction === "left") {
        newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === "up") {
        newHead = new Block(head.col, head.row - 1);
    }

    if (this.checkCollision(newHead)) {
        gameOver();
        return;
    }

    this.prevSegments = this.segments.map(seg => Object.assign({}, seg));
    this.segments.unshift(newHead);
    if (newHead.equal(apple.position)) {
        score++;
        apple.move();
    } else {
        this.segments.pop();
    }
};

// Перевіряємо, чи не зіткнулася змійка зі стіною або власним тілом
Snake.prototype.checkCollision = function (head) {
    // Перевірка на зіткнення зі стіною
    let leftCollision = (head.col < 0);
    let topCollision = (head.row < 0);
    let rightCollision = (head.col >= widthInBlocks);
    let bottomCollision = (head.row >= heightInBlocks);

    let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

    // Перевірка на зіткнення з власним тілом
    let selfCollision = false;
    for (let i = 1; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true;
            break;
        }
    }

    return wallCollision || selfCollision;
};

// Задаємо наступний напрямок руху змійки на основі натиснутої клавіші
Snake.prototype.setDirection = function (newDirection) {
    if (this.direction === "up" && newDirection === "down" ||
        this.direction === "right" && newDirection === "left" ||
        this.direction === "down" && newDirection === "up" ||
        this.direction === "left" && newDirection === "right") {
        return;
    }

    this.nextDirection = newDirection;
};



// Конструктор Apple (яблуко)
let Apple = function () {
    this.images = [
        "img/apple.png",
        "img/bananas.png",
        "img/cherry.png",
        "img/pear.png",
        "img/pineapple.png"
    ];
    this.currentImage = this.images[Math.floor(Math.random() * this.images.length)];
    this.position = new Block(10, 10);
    this.image = new Image();
    this.image.src = this.currentImage;
};

// Малюємо фрукт у позиції
Apple.prototype.draw = function () {
    ctx.drawImage(this.image, this.position.col * blockSize, this.position.row * blockSize, blockSize, blockSize);
};

// Переміщуємо фрукт у випадкову позицію і вибираємо нове зображення
Apple.prototype.move = function () {
    let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
    this.position = new Block(randomCol, randomRow);
    this.currentImage = this.images[Math.floor(Math.random() * this.images.length)];
    this.image.src = this.currentImage;
};

// Створюємо обʼєкт-змійку та обʼєкт-яблуко
let snake = new Snake();
let apple = new Apple();

// Запускаємо функцію анімації через setInterval
let intervalId = setInterval(function () {
    ctx.clearRect(0, 0, width, height);
    drawScore();
    snake.move();
    snake.draw();
    apple.draw();
    drawBorder();
}, 100);

// Переведемо коди клавіщ в направлення
let directions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};

// Обробник подій keydown (клавіші-стрілки)
document.addEventListener('keydown', function(event) {
    let newDirection = directions[event.keyCode];
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
});