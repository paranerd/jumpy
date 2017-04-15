Object = Class.extend({
	init: function(type, x, y, height, width) {
		this.visible = true;
		this.sound = new SoundManager();
		this.type = type;
		this.visible = true;
		this.height = height;
		this.width = width;
		this.pos = {x: x, y: y};
		this.alive = true;
		this.collision = {top: false, bottom: false, left: false, right: false};
		if(this.type > 100)
		    this.visible = false; // für Effekt-Blöcke
	},

	getPos: function() {
		return {left: this.pos.x, right: this.pos.x + this.width, top: this.pos.y, bottom: this.pos.y + this.height};
	},

	destroy: function() {
		this.visible = false;
		this.alive = false;
		this.sound.playSound("break");
	},

	is: function(compare) {
		return (compare == "Object");
	},
	
	draw: function(ctx, offset) {
		if(this.type == 0) {
			// Dotted rectangle - breakable
			ctx.beginPath();
			ctx.setLineDash([4]);
			ctx.strokeRect(this.pos.x + offset, this.pos.y, this.width, this.height);
			ctx.closePath();
			ctx.setLineDash([]);
		}
		else if(this.type == 1) {
			// Grey rectangle
			ctx.fillStyle = "grey";
			ctx.fillRect(this.pos.x + offset, this.pos.y, this.width, this.height);
		}
		else if(this.type == 2) {
			// Coin
			ctx.fillStyle = "orange";
			ctx.beginPath();
			ctx.moveTo(this.pos.x + offset + this.width / 2, this.pos.y + this.width);
			ctx.lineTo(this.pos.x + offset, this.pos.y + this.width / 2);
			ctx.lineTo(this.pos.x + offset + this.width / 2, this.pos.y);
			ctx.lineTo(this.pos.x + offset + this.width, this.pos.y + this.width / 2);
			ctx.fill();
		}
		else if(this.type == 8) {
			var rot = Math.PI / 2 * 3;
			var innerRadius = this.width / 2 - this.width / 4;
			var outerRadius = this.width / 2;
			var spikes = 5;
			var step = Math.PI / spikes;
			
			var cX = this.pos.x + offset + this.width / 2; // Center x
			var cY = this.pos.y + this.width / 2; // Center y
			
			ctx.strokeStyle = "red";
			ctx.beginPath();
			ctx.moveTo(cX, cY - outerRadius);
			
			for(var i = 0; i < spikes; i++) {
				x = cX + Math.cos(rot) * outerRadius;
				y = cY + Math.sin(rot) * outerRadius;
				ctx.lineTo(x, y);
				rot += step;
				
				x = cX + Math.cos(rot) * innerRadius;
				y = cY + Math.sin(rot) * innerRadius;
				ctx.lineTo(x, y);
				rot += step;
			}
			ctx.lineTo(cX, cY - outerRadius);
			ctx.fillStyle = "red";
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		}
		else if(this.type >= 100) {
			// Don't draw
		}
		else {
			ctx.fillStyle = "grey";
			ctx.fillRect (this.pos.x + offset, this.pos.y, this.width, this.height);
		}
	}
});
