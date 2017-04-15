window.onload = function() {
	// Center playground
	canvasContainer.style.top = (window.innerHeight - parseInt(canvasContainer.clientHeight)) / 2 + 20 + "px";
	canvasContainer.style.left = (window.innerWidth - parseInt(canvasContainer.clientWidth)) / 2 + "px";

	overlay.innerHTML = "Loading...";
	overlay.className = "";

	initGame(1);
}

// GENERAL VARIABLES
var ctx = canvas.getContext('2d'),
	player,
	allObjects = [],
	counter = 0,
	time = 0;
	level;

/**
 * Loads level and starts game loop
 */

var initGame = function(num) {
	/*if(localStorage.map) {
		num = 1;
	}*/
	for(var i in Level[num].map) {
		var elem;
		if(Level[num].map[i][0] == 3) {
			elem = new Triangle(Level[num].map[i][1], Level[num].map[i][2], 3);
		}
		else if(Level[num].map[i][0] == 5) {
			elem = new Player(Level[num].map[i][1], Level[num].map[i][2]);
			player = elem;
		}
		else if(Level[num].map[i][0] == 7) {
			elem = new Bomb(Level[num].map[i][1], Level[num].map[i][2], 7);
		}
		else {
			elem = new Object(Level[num].map[i][0], Level[num].map[i][1], Level[num].map[i][2], Level[num].map[i][3], Level[num].map[i][4]);
		}
		allObjects.push(elem);
	}

	overlay.innerHTML = "Level " + num;
	setTimeout(function() {
		overlay.className = "hidden";
		animate();
	}, 1000);
}

// KEYBOARD INPUT

document.onkeydown = function(e) {
	switch(e.keyCode) {
		case 32: // SPACE
			player.jump(true);
			break;
		case 37: // LEFT
			player.moving.left = true;
			break;
		case 40: // DOWN
			player.moving.down = true;
			break;
		case 39: // RIGHT
			player.moving.right = true;
			break;
		case 16: // SHFIT
			player.run(true);
			break;
		case 17: // STRG
			var x = player.shoot(true);
			var bull = new Bullet_Straight(x, player.pos.y + (player.height - 3) / 2, player.lookDir);
			allObjects.push(bull);
			break;
	}
};

document.onkeyup = function(e) {
	switch(e.keyCode) {
		case 32: // SPACE
			player.jump(false);
			break;
		case 37: // LEFT
			player.moving.left = false;
			break;
		case 40: // DOWN
			player.moving.down = false;
			break;
		case 39: // RIGHT
			player.moving.right = false;
			break;
		case 16: // SHFIT
			player.run(false);
			break;
		case 17: // STRG
			player.shoot(false);
			break;
	}
};

var lastRender = Date.now();
var lastFpsCycle = Date.now();

// GAME LOOP

function animate() {
	var delta = (Date.now() - lastRender) / 1000;
	update(delta);
	lastRender = Date.now();
	draw();

	if(Date.now() - lastFpsCycle > 1000) {
		lastFpsCycle = Date.now();
		var fps = Math.round(1/delta);
		kontrolle.innerHTML = "FPS: "+fps;
	}

	if(player.lifes > 0) {
		// Request a new animation frame using Paul Irish's shim
		window.requestAnimFrame(animate);
	}
	else {
		overlay.innerHTML = "Game Over.";
		overlay.className = "";
	}
};


/**
 * Draw all objects
 */

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var offset = player.bgOffset;

	for(var elem of allObjects) {
		elem.draw(ctx, offset);
	}

	// Score
	score.innerHTML = "Score: " + player.score;
};

/**
 * Check for collisions and update position
 */

function update(dt) {
	for(var i = 0; i < allObjects.length; i++) {
		var entity1 = allObjects[i];
		// Collision against canvas
		if(entity1.pos.y + entity1.height >= canvas.height) {
			entity1.collision.bottom = true;
			entity1.pos.y = canvas.height - entity1.height;
		}
		if(entity1.pos.x <= 0) {
			entity1.collision.left = true;
			entity1.pos.x = 0;
		}
		if(entity1.pos.x + entity1.width >= canvas.width) {
			entity1.collision.right = true;
			entity1.pos.x = canvas.width - entity1.width;
		}
		if(entity1.pos.y <= 0) {
			entity1.collision.top = true;
			entity1.pos.y = 0;
		}

		for(var j = 0; j < allObjects.length; j++) {
			var entity2 = allObjects[j];
			var coll = simpleCollision(entity1, entity2);

			if(coll && entity1 != entity2) {
				if(entity1.is("Player") && !entity2.visible) {
					continue;
				}
				// Special collision: Player vs. Enemy
				if(entity1.is("Player") && entity2.is("Enemy")) {
					if(entity1.invincible) {
						entity2.die();
					}
					else if(entity1.falling) {
						entity1.killJump();
						entity2.die();
					}
					else {
						entity1.recover();
					}
				}
				// Special collision: Player vs. Object
				else if(entity1.is("Player") && entity2.is("Object")) {
					// Coin
					if(entity2.type == 2) {
						entity1.getCoin();
						entity2.visible = false;
						entity2.alive = false;
					}
					// Fireball
					else if(entity2.type == 4) {
						entity1.getFireballUpgrade();
						entity2.visible = false;
						entity2.alive = false;
					}
					// Star
					else if(entity2.type == 8) {
						entity1.getInvincible();
						entity2.visible = false;
						entity2.alive = false;
					}
				}

				// General collision
				if(coll.bottom) {
					entity1.collision.bottom = true;
					entity1.pos.y = (!entity1.is("Object")) ? entity2.pos.y - entity1.height : entity1.pos.y;
				}
				if(coll.top) {
					entity1.collision.top = (!(entity1.is("Player") && !entity2.visible)) ? true : false;
					entity1.pos.y = (!entity1.is("Object")) ? entity2.pos.y + entity2.height : entity1.pos.y;
					if(entity1.is("Player") && entity2.type == 0) {
						entity2.destroy();
					}
				}
				if(coll.right) {
					entity1.collision.right = true;
					entity1.pos.x = (!entity1.is("Object")) ? entity2.pos.x - entity1.width : entity1.pos.x;
				}
				if(coll.left) {
					entity1.collision.left = true;
					entity1.pos.x = (!entity1.is("Object")) ? entity2.pos.x + entity2.width : entity1.pos.x;
				}
			}
		}
	}

	// Delete dead elements and update the others
	for(var i = 0; i < allObjects.length; i++) {
		if(!allObjects[i].alive) {
			allObjects.splice(i, 1);
		}
		else if(!allObjects[i].is("Object")) {
			allObjects[i].updatePos(dt);
		}
	}
}