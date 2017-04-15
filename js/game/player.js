var Player = Class.extend({
	init: function(x, y) {
		this.sound = new SoundManager();
		this.pos = {x: x, y: y};
		this.width = 20;
		this.height = 20;
		this.gravity = 16; // (localStorage.gravity) ? parseFloat(localStorage.gravity) : 1;
		this.falling = false;
		this.jumpAvailable = false;
		this.jumpCount = 0;
		this.canJump = true; // true when jump-button released (so no double-jumps by holding jump)
		this.JUMP_MAX = 7; //(localStorage.jumpheight) ? parseFloat(localStorage.jumpheight) : 2;
		this.WALK = 200; //(localStorage.walkspeed) ? parseFloat(localStorage.walkspeed) : 1;
		this.RUN = 300; //(localStorage.runspeed) ? parseFloat(localStorage.runspeed) : 2;
		this.velocity = {x: this.WALK, y: 4.5};
		this.killjumping = false;
		this.KILL_JUMP_MAX = 1;
		this.lookDir = 1; // 1 == right, -1 == left
		this.buttonPressed = false;
		this.boost = false;
		this.coins = 0;
		this.score = 0;
		this.lifes = 3;
		this.invincible = false;
		this.invincibleDur = 1;
		this.shooting = false;
		this.canShoot = true;
		this.bgOffset = 0;
		this.fireball = true;
		this.recovering = false; // true if player is hit
		this.recoverTime = 3; // seconds of recovery time
		this.moving = {up: false, left: false, down: false, right: false};
		this.collision = {top: false, left: false, bottom: false, right: false};
		this.alive = true;
	},

	getCoin: function() {
		this.coins++;
		this.score += 100;
		this.sound.playSound("coin");
	},

	updatePos: function (dt) {
		// Move player
		if(this.moving.left && !this.collision.left) {
			this.lookDir = -1;
			this.pos.x -= Math.floor(this.velocity.x * dt);
			if(this.pos.x >= 200 && this.pos.x < 640 - 200) {
				this.bgOffset += Math.floor(this.velocity.x * dt);
			}
			if(this.bgOffset > 0 || this.pos.x <= 200) {
				this.bgOffset = 0;
			}
		}

		if(this.moving.down && !this.collision.bottom) {
			this.pos.y += Math.floor(this.velocity.y * dt);
		}

		if(this.moving.right && !this.collision.right) {
			this.lookDir = 1;
			this.pos.x += Math.floor(this.velocity.x * dt);
			if(this.pos.x > 200 && this.pos.x <= 640 - 200) {
				this.bgOffset -= Math.floor(this.velocity.x * dt);
			}
		}

		if(this.collision.bottom) {
			this.falling = false;
			if(!this.buttonPressed) {
				this.jumpAvailable = true;
			}
		}

		if(this.collision.top) {
			this.moving.up = false;
		}

		// Jump
		if((this.moving.up || this.killjumping) && !this.collision.top) {
			this.pos.y -= this.velocity.y;
			this.velocity.y -= this.gravity * dt;
			if (this.velocity.y <= 0) {
				this.velocity.y = 0;
				this.moving.up = false;
				this.killjumping = false;
			}
			if(this.killjumping || this.jumpCount > 1) {
				this.jumpAvailable = false;
				this.jumpCount = 0;
			}
		}
		else if (!this.collision.bottom) {
			this.pos.y += this.velocity.y;
			this.velocity.y += (this.buttonPressed) ? (this.gravity / 3) * dt * 2 : this.gravity * dt * 2;
		}

		this.collision = {top: false, left: false, bottom: false, right: false};
	},

	jump: function(value) {
		this.buttonPressed = value;
		if(value && this.jumpAvailable && this.canJump) {
			this.jumpCount++;
			this.moving.up = true;
			this.velocity.y = this.JUMP_MAX;
			this.sound.playSound("jump");
			this.canJump = false;
		}
		else if (!value) {
			this.moving.up = false;
			this.falling = true;
			this.velocity.y = 0;
			this.canJump = true;
		}
	},

	killJump: function() {
		this.jumpAvailable = true;
		if(!this.collision.top) {
			this.velocity.y = this.KILL_JUMP_MAX;
			this.killjumping = true;
		}
	},

	getFireballUpgrade: function() {
		this.fireball = true;
		this.sound.playSound("upgrade");
	},

	getInvincible: function() {
		this.invincible = true;
		this.sound.playSound("star");
		var player = this;
		setTimeout(function() { player.stopInvincible(); }, this.invincibleDur * 1000);
	},

	stopInvincible: function() {
		this.invincible = false;
		this.sound.stopSound("star");
	},

	recover: function() {
		this.lifes--;
		this.recovering = true;
		setTimeout(function() { this.recovering = false; }, this.recoverTime * 1000)
	},

	getPos: function() {
		return {left: this.pos.x, right: this.pos.x + this.width, top: this.pos.y, bottom: this.pos.y + this.height};
	},

	is: function(compare) {
		return (compare == "Player");
	},

	draw: function(ctx, offset) {
		ctx.fillStyle = "red";
		ctx.beginPath();
		ctx.arc(this.pos.x + this.width / 2 + offset, this.pos.y + this.width / 2, this.width / 2, 0, 2 * Math.PI);
		ctx.fill();
	},

	shoot: function(start) {
		if(start && this.canShoot && this.fireball) {
			this.sound.playSound("fireball");
			this.canShoot = false;
			return (this.lookDir == 1) ? this.pos.x + this.width + 1 : this.pos.x - 1 - 3;
		}
		this.canShoot = true;
	},

	run: function(value) {
		this.velocity.x = (value) ? this.RUN : this.WALK;
	}
});
