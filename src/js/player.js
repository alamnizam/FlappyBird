class Player {
    constructor(game) {
        this.game = game;
        this.x = 20;
        this.y = 0;
        this.spriteWidth = 200;
        this.spriteHeight = 200;
        this.speedY = 0;
        this.flapSpeed = 0;
        this.energy = 30;
        this.maxEnergy = this.energy * 2;
        this.minEnergy = 15;
        this.image = document.getElementById("player_fish");
    }

    draw() {
        this.game.ctx.drawImage(this.image, 0, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        if(this.game.debug){
            this.game.ctx.beginPath();
            this.game.ctx.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
            this.game.ctx.stroke();
        }
    }

    update() {
        this.handleEnergy();
        if(this.speedY >= 0) this.wingsUp();
        this.y += this.speedY;
        this.collisionY = this.y + this.height * 0.5;
        if (!this.isTouchingBottom() && !this.charhing) {
            this.speedY += this.game.gravity;
        } else {
            this.speedY = 0;
        }

        if (this.isTouchingBottom()) {
            this.y = this.game.height - this.height - this.game.bottomMargin;
            this.wingsIdle();
        }
    }

    resize() {
        this.width = this.spriteWidth * this.game.ratio;
        this.height = this.spriteHeight * this.game.ratio;
        this.y = this.game.height * 0.5 - this.height * 0.5;
        this.speedY = -8 * this.game.ratio;
        this.flapSpeed = 5 * this.game.ratio;
        this.collisionRadius = 40 * this.game.ratio;
        this.collisionX = this.x + this.collisionRadius * 0.9;
        this.collided = false;
        this.barsize = Math.floor(5 * this.game.ratio);
        this.frameY = 0;
        this.charhing = false;
    }

    startCharge() {
        if(this.energy >= this.minEnergy && !this.charhing){
            this.charhing = true;
            this.game.speed = this.game.maxSpeed;
            this.wingsCharge();
            this.game.sound.play(this.game.sound.charge);
        }
    }

    stopCharge() {
        this.charhing = false;
        this.game.speed = this.game.minSpeed;
        this.wingsIdle();
    }

    wingsIdle(){
        if(!this.charhing) this.frameY = 0;
    }

    wingsDown(){
        if(!this.charhing) this.frameY = 1;
    }

    wingsUp(){
        if(!this.charhing) this.frameY = 2;
    }

    wingsCharge(){
        this.frameY = 3;
    }

    isTouchingTop() {
        return this.y <= 0;
    }

    isTouchingBottom() {
        return this.y >= this.game.height - this.height - this.game.bottomMargin;
    }

    handleEnergy() {
        if (this.game.eventUpdate) {
            if (this.energy < this.maxEnergy) {
                this.energy += 1;
            }

            if (this.charhing) {
                this.energy -= 4;
                if (this.energy <= 0) {
                    this.energy = 0;
                    this.stopCharge();
                }
            }
        }
    }

    flap() {
        this.stopCharge();
        this.game.sound.play(this.game.sound.flapSounds[Math.floor(Math.random() * 5)]);
        if (!this.isTouchingTop()) {
            this.speedY = -this.flapSpeed;
            this.wingsDown();
        }
    }
}