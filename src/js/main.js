class Game {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.baseHeight = 720;
        this.ratio = this.height / this.baseHeight;
        this.background = new Background(this);
        this.sound = new AudioControl();
        this.player = new Player(this);
        this.restart = document.getElementById("restart");
        this.obstacles = [];
        this.numberOfObstacles = 2;
        this.eventTimer = 0;
        this.eventInterval = 150;
        this.eventUpdate = false;
        this.swipeDistance = 50;
        this.debug = false;

        this.resize(window.innerWidth, window.innerHeight);

        this.restart.addEventListener('click', e => {
            this.restartGame();
        })

        window.addEventListener('resize', e => {
            this.resize(e.currentTarget.innerWidth, e.currentTarget.innerHeight);
        });

        window.addEventListener('mousedown', e => {
            this.player.flap();
        })

        window.addEventListener('mouseup', e => {
            setTimeout(() => {
                this.player.wingsUp();
            }, 50);
        })

        window.addEventListener('keydown', e => {
            if (e.key === ' ' || e.key === 'Enter') this.player.flap();
            if (e.key === 'Shift' || e.key.toLowerCase() === 'c') this.player.startCharge();
            if (e.key.toLowerCase() === 'r') {
                this.restartGame();
            }
            if (e.key.toLowerCase() === 'd') this.debug = !this.debug;
        });

        // window.addEventListener('keyup', e => {
        //     if (e.key === 'Shift' || e.key.toLowerCase() === 'c') this.player.stopCharge();
        // })


        window.addEventListener('touchstart', e => {
            this.player.flap();
            this.touchStartX = e.changedTouches[0].pageX;
        });

        window.addEventListener('touchmove', e => {
            e.preventDefault();
        });

        window.addEventListener('touchend', e => {
            if (e.changedTouches[0].pageX - this.touchStartX > this.swipeDistance) {
                this.player.startCharge();
            } else {
                this.player.flap();
            }
        })
    }

    restartGame() {
        this.resize(window.innerWidth, window.innerHeight);
        this.numberOfObstacles++;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.textAlign = 'right';
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'white';
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ratio = this.height / this.baseHeight;

        this.bottomMargin = Math.floor(50 * this.ratio);
        this.smallFont = Math.ceil(20 * this.ratio);
        this.largeFont = Math.ceil(45 * this.ratio);
        this.ctx.font = this.smallFont + 'px Bungee';
        this.gravity = 0.15 * this.ratio;
        this.speed = 2 * this.ratio;
        this.minSpeed = this.speed;
        this.maxSpeed = this.speed * 5;
        this.background.resize();
        this.player.resize();
        this.createObstacles();
        this.obstacles.forEach(obstacle => {
            obstacle.resize();
        });
        this.score = 0;
        this.gameOver = false;
        this.timer = 0;
        this.buttonPadding = 10 * this.ratio;
    }

    render(deltaTime) {
        if (!this.gameOver) this.timer += deltaTime;
        this.handlePeriodicEvent(deltaTime);
        this.background.update();
        this.background.draw();
        this.drawStatusText();
        this.player.update();
        this.player.draw();
        this.obstacles.forEach(obstacle => {
            obstacle.update();
            obstacle.draw();
        });
        this.restart.style.padding = this.buttonPadding + "px";
    }

    createObstacles() {
        this.obstacles = [];
        const fistX = this.baseHeight * this.ratio;
        const obstaclesSpacing = 600 * this.ratio;
        for (let i = 0; i < this.numberOfObstacles; i++) {
            this.obstacles.push(new Obstacle(this, fistX + i * obstaclesSpacing));
        }
    }

    checkCollision(a, b) {
        const dx = a.collisionX - b.collisionX;
        const dy = a.collisionY - b.collisionY;
        const distance = Math.hypot(dx, dy);
        const sumOfRadii = a.collisionRadius + b.collisionRadius;
        return distance <= sumOfRadii;
    }

    handlePeriodicEvent(deltaTime) {
        if (this.eventTimer < this.eventInterval) {
            this.eventTimer += deltaTime;
            this.eventUpdate = false;
        } else {
            this.eventTimer = this.eventTimer % this.eventInterval;
            this.eventUpdate = true;
        }
    }

    formatTimer() {
        return (this.timer * 0.001).toFixed(1);
    }

    triggerGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            if (this.obstacles.length <= 0) {
                this.sound.play(this.sound.win);
                this.message1 = "Nailed it!";
                this.message2 = "Can you do it faster than " + this.formatTimer() + " seconds!";
            } else {
                this.numberOfObstacles = 2;
                this.sound.play(this.sound.lose);
                this.message1 = "Getting rusty?";
                this.message2 = "collision time " + this.formatTimer() + " seconds!";
            }
        }
    }

    drawStatusText() {
        this.ctx.save();
        this.ctx.fillText('Score: ' + this.score, this.width - this.smallFont, this.largeFont);
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Timer: ' + this.formatTimer(), this.smallFont, this.largeFont);
        if (this.gameOver) {
            this.ctx.textAlign = 'center';
            this.ctx.font = this.largeFont + 'px Bungee';
            this.ctx.fillText(this.message1, this.width * 0.5, this.height * 0.5 - this.largeFont, this.width);
            this.ctx.font = this.smallFont + 'px Bungee';
            this.ctx.fillText(this.message2, this.width * 0.5, this.height * 0.5 - this.smallFont, this.width);
            this.ctx.fillText("Press 'R' to try again", this.width * 0.5, this.height * 0.5);
        }
        if (this.player.energy <= this.player.minEnergy) {
            this.ctx.fillStyle = 'red';
        } else if (this.player.energy >= this.player.maxEnergy) {
            this.ctx.fillStyle = 'green';
        }
        for (let i = 0; i < this.player.energy; i++) {
            this.ctx.fillRect(10, this.height - 10 - this.player.barsize * i, this.player.barsize * 5, this.player.barsize)
        }
        this.ctx.restore();
    }
}

window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 720;
    canvas.height = 720;

    const game = new Game(canvas, ctx);

    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.render(deltaTime);
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
});