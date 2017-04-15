var Enemy = Class.extend({
	init: function(x, y, type) {
		this.type = type;
		this.visible = true;
		this.height = 20;
		this.width = 20;
		this.direction = 1; // 1: nach rechts, -1: nach links
		this.pos = {x: x, y: y};
		this.collision = {top: false, left: false, bottom: false, right: false};
		this.moving = true;
		this.alive = true;
		this.speed = 0;
	},

	updatePos: function(dt) {
		if(!this.moving) {
			return;
		}
		
		if(this.collision.left || this.collision.right) {
			this.direction *= -1;
		}
		this.pos.x += Math.floor(this.speed * dt) * this.direction;

		if(this.collision.bottom == false) {
			this.pos.y += Math.floor(this.speed * dt);
		}
		this.collision = {top: false, left: false, bottom: false, right: false};
	},

	getPos: function() {
		return {left: this.pos.x, right: this.pos.x + this.width, top: this.pos.y, bottom: this.pos.y + this.height};
	},

	is: function(compare) {
		return (compare == "Enemy");
	}
});

var Triangle = Enemy.extend({
	init: function(x, y, type) {
		this._super(x, y, type);
		this.speed = 150;
		this.dir = 1;
		this.falling = false;
	},

	die: function() {
		this.moving = false;
		this.falling = true;
	},

	fall: function(bottom) {
		this.pos.y += 1;
		if(this.pos.y > bottom) {
			this.alive = false;
		}
	},

	draw: function(ctx, offset) {
		ctx.fillStyle = "grey";
		ctx.beginPath();
		ctx.moveTo(this.pos.x + offset, this.pos.y + this.height);
		ctx.lineTo(this.pos.x + offset+ this.width / 2, this.pos.y);
		ctx.lineTo(this.pos.x + offset + this.width, this.pos.y + this.height);
		ctx.fill();
	}
});

var Bomb = Enemy.extend({
	init: function(x, y, type) {
		this._super(x, y, type);
		this.countdown = 3;
		this.speed = 100;
		this.dir = 1;
		this.exploding = null;
	},

	die: function() {
		this.moving = false;
		this.exploding = Date.now();
	},

	explode: function() {
		this.alive = false;
		alert("Explosion");
	},

	draw: function(ctx, offset) {
		ctx.fillStyle = "black";
		ctx.beginPath();
		ctx.moveTo(this.pos.x, this.pos.y + this.height);
		ctx.lineTo(this.pos.x + this.width / 2, this.pos.y);
		ctx.lineTo(this.pos.x + this.width, this.pos.y + this.height);
		ctx.fill();
	}
});