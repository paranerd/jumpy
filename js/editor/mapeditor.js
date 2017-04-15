var controls = document.getElementsByClassName('control');

// MAP CANVAS
var ctx = canvas.getContext('2d');

// THUMB CANVAS

var ctrlCanvas = document.getElementById("thumbCanvas");
ctrlCanvas.width = 100;
ctrlCanvas.height = 100;
var ctx2 = ctrlCanvas.getContext('2d');

// SPRITE PREVIEW CANVAS
spriteCanvas.addEventListener('mousedown', function(evt) {Editor.selectSprite(spriteCanvas, evt);}, false);

var ctx3 = spriteCanvas.getContext('2d');
ctx3.fillStyle = 'white';
ctx3.fillRect(0, 0, spriteCanvas.width, spriteCanvas.height);

// MOUSE EVENTS ON CANVAS
canvas.onmousedown = function(event) {
    Editor.mousedown = true;
    Editor.checkDraw(event);
}

canvas.onmouseup = function() {
    Editor.mousedown = false;
}

canvas.onmousemove = function(event) {
	if (Editor.mousedown) {
		Editor.checkDraw(event);
	}
}

window.onload = function() {
	for (var i = 0; i < controls.length; i++) {
		controls.item(i).addEventListener('change', function() {
			var input = this.getElementsByTagName('input')[0];
			Editor.checkInput(input.id, input.value);
		});
	}

	var single = document.getElementById('single');
	single.addEventListener('click', function(e) {
		Editor.toggleDrawMode(true);
	});

	var area = document.getElementById('area');
	area.addEventListener('click', function(e) {
		Editor.toggleDrawMode(false);
	});

	var dom_draw = document.getElementById('draw');
	dom_draw.addEventListener('click', function(e) {
		Editor.toggleEraser(false);
	});

	var dom_erase = document.getElementById('erase');
	dom_erase.addEventListener('click', function(e) {
		Editor.toggleEraser(true);
	});

	var dom_undo = document.getElementById('undo');
	dom_undo.addEventListener('click', function(e) {
		Editor.undo();
	});

	var dom_redo = document.getElementById('redo');
	dom_redo.addEventListener('click', function(e) {
		Editor.redo();
	});

	var dom_reset = document.getElementById('reset');
	dom_reset.addEventListener('click', function(e) {
		Editor.reset();
	});

	var dom_showcode = document.getElementById('showcode');
	dom_showcode.addEventListener('click', function(e) {
		Editor.showcode();
	});

	var dom_startgame = document.getElementById('startgame');
	dom_startgame.addEventListener('click', function(e) {
		Editor.startgame();
	});

	var dom_shield = document.getElementById('shield');
	dom_shield.addEventListener('click', function(e) {
		Editor.hideCode();
	});

	// Center Code-Viewer
	code.style.top = (window.innerHeight - parseInt(code.style.height) - 40) / 2 + "px";
	code.style.left = (window.innerWidth - parseInt(code.style.width) - 40) / 2 + "px";

	Editor.setDefaultValues();
	Editor.drawGrid();
	Editor.loadSpritesheet();
	Editor.setThumb(0);
}

document.onkeydown = function(e) {
	switch(e.keyCode) {
		case 27: // Escape
			hideCode();
			break;
	}
}

// MAP ELEMENT

var Block = function(xStart, xEnd, yStart, yEnd, type) {
	this.xStart = xStart;
	this.xEnd = xEnd;
	this.yStart = yStart;
	this.yEnd = yEnd;
	this.type = type;
	this.visible = true;
}

var Editor = {
	GRIDSIZE: 20, // Map-Grid-Square size
	PREVSIZE: 30, // Spritesheet preview area square size
	mousedown: false,
	singleMode: true, // false: area-mode
	erase: false,
	spriteWidth: 180,
	currentSprite: 0,
	lastPos: {x: null, y: null},
	map: [],
	history2: [],
	historyPos: 0,
	bgColor: "#FFF",
	types: [0, 1, 2, 3, 5, 8, 101],
	playerset: false, // true if player is set to prevent 2 players
	playerSprite: 5, // position of player sprite in spritesheet

	checkInput: function(key, value) {
		switch (key) {
			case 'height':
				canvas.height = value;
				Editor.redrawMap();
				break;

			case 'width':
				canvas.width = value;
				Editor.redrawMap();
				break;

			case 'bgcolor':
				this.bgColor = value;
				Editor.redrawMap();
				break;
		}
	},

	setDefaultValues: function() {
		gravity.value = 10.0;
		jumpheight.value = 2.0;
		walkspeed.value = 1.0;
		runspeed.value = 2.0;
	},

	drawType: function(ctx, x, y, size, type) {
		if(type == 0) {
			// Dotted rectangle
			ctx.strokeStyle = "grey";
			ctx.setLineDash([4]);
			ctx.strokeRect(x, y, size, size);
			ctx.closePath();
			ctx.setLineDash([]);
		}
		else if(type == 1) {
			// Grey rectangle
			ctx.fillStyle = "grey";
			ctx.fillRect(x, y, size, size);
		}
		else if(type == 2) {
			// Coin
			ctx.fillStyle = "orange";
			ctx.beginPath();
			ctx.moveTo(x + size / 2, y + size);
			ctx.lineTo(x, y + size / 2);
			ctx.lineTo(x + size / 2, y);
			ctx.lineTo(x + size, y + size / 2);
			ctx.fill();
		}
		else if(type == 3) {
			// Triangle
			ctx.fillStyle = "grey";
			ctx.beginPath();
			ctx.moveTo(x, y + size);
			ctx.lineTo(x + size / 2, y);
			ctx.lineTo(x + size, y + size);
			ctx.fill();
		}
		else if(type == 5) {
			// Player
			ctx.fillStyle = "purple";
			ctx.beginPath();
			ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI);
			ctx.fill();
		}
		else if(type == 8) {
			// Star
			var rot = Math.PI / 2 * 3;
			var innerRadius = size / 2 - size / 4;
			var outerRadius = size / 2;
			var spikes = 5;
			var step = Math.PI / spikes;

			var cX = x + size / 2; // Center x
			var cY = y + size / 2; // Center y

			ctx.strokeStyle = "red";
			ctx.beginPath();
			ctx.moveTo(cX, cY - outerRadius);

			for(var i = 0; i < spikes; i++) {
				spikeX = cX + Math.cos(rot) * outerRadius;
				spikeY = cY + Math.sin(rot) * outerRadius;
				ctx.lineTo(spikeX, spikeY);
				rot += step;

				spikeX = cX + Math.cos(rot) * innerRadius;
				spikeY = cY + Math.sin(rot) * innerRadius;
				ctx.lineTo(spikeX, spikeY);
				rot += step;
			}
			ctx.lineTo(cX, cY - outerRadius);
			ctx.fillStyle = "red";
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		}
		else if(type == 101) {
			// Blocker
			ctx.fillStyle = "white";
			ctx.fillRect(x, y, size, size);
			ctx.fillStyle = "red";
			ctx.textAlign = "center"
			ctx.font = "20px sans-serif";
			ctx.fillText("B", x + size / 2, y + 20);
		}
	},

	loadSpritesheet: function() {
		var x = 0;
		var y = 0;
		for(var i = 0; i < this.types.length; i++) {
			Editor.drawType(ctx3, x + 5, y + 5, this.PREVSIZE - 10, this.types[i]);

			x += this.PREVSIZE;
			if(i > 0 && i % 4 == 0) {
				x = 0;
				y += this.PREVSIZE;
			}

		}
	},

	drawGrid: function() {
		ctx.fillStyle = this.bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = 0.5;
		ctx.strokeStyle = '#BBB';

		// Vertical lines
		for (var i = 0; i < canvas.width; i += this.GRIDSIZE) {
			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i, canvas.height);
			ctx.stroke();
		}
		// Horizontal lines
		for (var i = 0; i < canvas.height; i += this.GRIDSIZE) {
			ctx.beginPath();
			ctx.moveTo(0, i);
			ctx.lineTo(canvas.width, i);
			ctx.stroke();
		}
	},

	setThumb: function(type) {
		ctx2.clearRect(0, 0, ctrlCanvas.width, ctrlCanvas.height);
		ctx2.fillStyle = "white";
		ctx2.fillRect(0, 0, ctrlCanvas.width, ctrlCanvas.height);
		Editor.drawType(ctx2, 20, 20, ctrlCanvas.height - 40, type);
		this.currentSprite = type;
	},

	toggleDrawMode: function(value) {
		if(!value && !(this.currentSprite == 5)) {
			this.singleMode = value;
			this.lastPos.x = null;
			this.lastPos.y = null;
			single.className = "";
			area.className = "highlight";
		}
		else {
			this.singleMode = value;
			single.className = "highlight";
			area.className = "";
		}
	},

	toggleEraser: function(value) {
		this.erase = value;
		var dom_erase = document.getElementById('erase');
		var dom_draw = document.getElementById('draw');

		if (value) {
			Editor.toggleDrawMode(true);
			dom_erase.className = "highlight";
			dom_draw.className = "";
		}
		else {
			dom_erase.className = "";
			dom_draw.className = "highlight";
		}
	},

	// DRAW SPRITE
	checkDraw: function(event) {
		var cc = document.getElementById("canvasContainer");
		var mouseX = Math.floor((event.pageX - parseInt(cc.style.left) + cc.scrollLeft) / this.GRIDSIZE) * this.GRIDSIZE;
		var mouseY = Math.floor((event.pageY - parseInt(cc.style.top) + cc.scrollTop) / this.GRIDSIZE) * this.GRIDSIZE;

		// Check if a block exists on the clicked position
		for (var i = 0; i < this.map.length; i++) {
			var elem = this.map[i];
			if (elem != null &&
				elem.visible &&
				this.erase &&
				mouseX >= elem.xStart &&
				mouseX <= elem.xEnd &&
				mouseY >= elem.yStart &&
				mouseY <= elem.yEnd)
			{
				this.map[i].visible = false;
				this.history2.push({id: i, visible: false});
				this.historyPos = this.history2.length - 1;
				Editor.redrawMap();
				return;
			}
			else if (elem != null &&
					elem.visible &&
					elem.type == 5 &&
					this.currentSprite == 5)
			{
				kontrolle.innerHTML = "There can only be one!";
				return;
			}
		}
		if (this.erase) {
			return;
		}

		if (this.singleMode || (!this.singleMode && this.lastPos.x == null)) {
			if (this.map.length > 0) {
				this.historyPos++;
			}
			Editor.draw(mouseX, mouseX, mouseY, mouseY);
			this.lastPos.x = mouseX;
			this.lastPos.y = mouseY;
		}
		else if (!this.singleMode && this.lastPos.x != null) {
			Editor.draw(Math.min(this.lastPos.x, mouseX), Math.max(this.lastPos.x, mouseX), Math.min(this.lastPos.y, mouseY), Math.max(this.lastPos.y, mouseY));
			this.lastPos.x = null;
			this.lastPos.y = null;
		}
	},

	draw: function(startX, endX, startY, endY) {
		for (var y = startY; y <= endY; y += this.GRIDSIZE) {
			for (var x = startX; x <= endX; x += this.GRIDSIZE) {
				Editor.drawType(ctx, x, y, this.GRIDSIZE, this.currentSprite);
			}
		}

		if(startX != endX) {
			this.map.pop();
		}

		var block = new Block(startX, endX, startY, endY, this.currentSprite);
		this.map.push(block);

		var elem = {id: this.map.length - 1, visible: true};
		this.history2.push({id: this.map.length - 1, visible: true});
		this.historyPos = this.history2.length - 1;
	},

	selectSprite: function(mycanvas, event) {
		var rect = mycanvas.getBoundingClientRect();
		var mousey = Math.floor((event.clientY - rect.top) / this.PREVSIZE);
		var mousex = Math.floor((event.clientX - rect.left) / this.PREVSIZE);
		var type = mousey * 5 + mousex;

		Editor.setThumb(this.types[type]);
	},

	undo: function() {
		if (this.historyPos >= 0) {
			this.map[this.history2[this.historyPos].id].visible = (this.map[this.history2[this.historyPos].id].visible) ? false : true;
			this.historyPos--;
			Editor.redrawMap();
		}
	},

	redo: function() {
		if(this.historyPos < this.history2.length - 1) {
			this.historyPos++;
			this.map[this.history2[this.historyPos].id].visible = (this.map[this.history2[this.historyPos].id].visible) ? false : true;
			Editor.redrawMap();
		}
	},

	redrawMap: function() {
		Editor.drawGrid();
		for (elem of this.map) {
			if (elem != null && elem.visible) {
				for (var y = elem.yStart; y <= elem.yEnd; y += this.GRIDSIZE) {
					for (var x = elem.xStart; x <= elem.xEnd; x += this.GRIDSIZE) {
						Editor.drawType(ctx, x, y, this.GRIDSIZE, elem.type);
					}
				}
			}
		}
	},

	/**
	 * Deletes history and map, redraws grid and sets historyPos back to 0
	 */

	reset: function() {
		if(confirm("Do you want to reset the Map?")) {
			this.map = [];
			this.historyPos = 0;
			Editor.drawGrid();
			Editor.redrawMap();
			localStorage.clear();
		}
	},

	/**
	 * Displays the code that can be copied and pasted to save it
	 */

	showcode: function() {
		code.innerHTML = "";
		var gameMap = Editor.createMap();
		code.innerHTML += "Level = [";
		for(var i = 0; i < gameMap.length; i++) {
			code.innerHTML += "[" + gameMap[i].toString() + "]";
			if(i < this.map.length - 1) {
				code.innerHTML += ", ";
			}
		}
		code.innerHTML += "];<br>";

		code.innerHTML += "<br>var GRAVITY = " + gravity.value + ";";
		code.innerHTML += "<br>var JUMPHEIGHT = " + jumpheight.value + ";";
		code.innerHTML += "<br>var WALK_SPEED = " + walkspeed.value + ";";
		code.innerHTML += "<br>var RUN_SPEED = " + runspeed.value + ";";
		code.className = "";
		shield.className = "";
	},

	saveValues: function(map) {
		localStorage.setItem("map", JSON.stringify(map));
		localStorage.setItem("gravity", gravity.value);
		localStorage.setItem("jumpheight", jumpheight.value);
		localStorage.setItem("walkspeed", walkspeed.value);
		localStorage.setItem("runspeed", runspeed.value);
	},

	// CREATES GAME-COMPATIBLE MAP

	createMap: function() {
		var gameMap = [];
		for(elem of this.map) {
			if(elem.visible) {
				gameMap.push([elem.type, elem.xStart, elem.yStart, elem.yEnd - elem.yStart + this.GRIDSIZE, elem.xEnd - elem.xStart + this.GRIDSIZE]);
			}
		}
		return gameMap;
	},

	startgame: function() {
		var gameMap = Editor.createMap();
		Editor.saveValues(gameMap);

		if(gameMap.length > 0) {
			window.open('jumpy.html', '_newtab');
		}
		else {
			alert("No map created");
		}
	},

	hideCode: function() {
		code.className = "hidden";
		shield.className = "hidden";
	}
}