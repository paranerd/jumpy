var Bullet = Class.extend({
	init: function(x, y, dir, type) {
		this.height = 3;
		this.width = 3;
		this.dir = dir;
		this.pos = {x: x, y: y};
		this.velocity = {x: 10 * this.dir, y: 0} // (horizontalSpeed, verticalSpeed); vS negative throws ball upwards
		this.bullets = [];
		this.collision = {top: false, left: false, bottom: false, right: false};
		this.type = type;
		this.alive = true;
	},

	getPos: function() {
		return {left: this.pos.x, right: this.pos.x + this.width, top: this.pos.y, bottom: this.pos.y + this.height};
	},
	
	is: function(compare) {
		return (compare == "Bullet");
	},

	draw: function(ctx, offset) {
		ctx.beginPath();
		ctx.arc(this.pos.x + offset, this.pos.y, this.width, 0, 2 * Math.PI);
		ctx.fill();
	}
});

var Bullet_Straight = Bullet.extend({
	init: function(x, y, dir) {
		this._super(x, y, dir, "straight");
	},

	updatePos: function() {
		this.pos.x += this.velocity.x;
		if(this.collision.top || this.collision.bottom || this.collision.left || this.collision.right) {
			this.alive = false;
		}
	}
});

var Bullet_Bounce = Bullet.extend({
	init: function(x, y, dir) {
		this._super(x, y, dir, "straight");
		this.velocity.y = -10;
		this.GRAVITY = 9.81;
		this.FRICTION = 0.85;
		this.world = {
			x1: 0,
			y1: 0,
			x2: 1000,
			y2: 500
		};
	},

	updatePos: function() {
		this.velocity.y += this.GRAVITY * 0.1;

		// Collision detection against world
		if (this.pos.y > this.world.y2) {
			this.velocity.y = -this.velocity.y * this.FRICTION;
		}
		else if (this.y < this.world.y1) {
			this.velocity.y = -this.velocity.y * this.FRICTION;
			this.pos.y = this.world.y1;
		}
		if (this.pos.x < this.world.x1) {
			this.velocity.x = -this.velocity.x * this.FRICTION;
			this.pos.x = this.world.x1;
		}
		else {
			if (this.pos.x > this.world.x2) {
				this.velocity.x = -this.velocity.x * this.FRICTION;
				this.pos.x = this.world.x2;
			}
		}

		// update position
		this.pos.x += this.velocity.x;
		this.pos.y += this.velocity.y;
		
		this.collision = {top: false, left: false, bottom: false, right: false};
	}
});