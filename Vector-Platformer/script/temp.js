/**********************
*****  ULILITIES  *****
**********************/
var RectangleExtensions = {
	GetIntersectionDepth: function (rectA, rectB) {
		var halfWidthA, halfWidthB, halfHeightA, halfHeightB, centerA, centerB, distanceX, distanceY, minDistanceX, minDistanceY, depthX, depthY;
		// Calculate Half sizes
		halfWidthA		= rectA.width / 2.0;
		halfWidthB		= rectB.width / 2.0;
		halfHeightA		= rectA.height / 2.0;
		halfHeightB		= rectB.height / 2.0;

		// Calculate centers
		centerA			= new Vector2(rectA.left + halfWidthA, rectA.top + halfHeightA);
		centerB			= new Vector2(rectB.left + halfWidthB, rectB.top + halfHeightB);

		distanceX		= centerA.x - centerB.x;
		distanceY		= centerA.y - centerB.y;
		minDistanceX	= halfWidthA + halfWidthB;
		minDistanceY	= halfHeightA + halfHeightB;

		// If we are not intersecting, return (0, 0)
		if (Math.abs(distanceX) >= minDistanceX || Math.abs(distanceY) >= minDistanceY)
			return new Vector2(0, 0);

		// Calculate and return intersection depths
		depthX			= distanceX > 0 ? minDistanceX - distanceX : -minDistanceX - distanceX;
		depthY			= distanceY > 0 ? minDistanceY - distanceY : -minDistanceY - distanceY;

		return new Vector2(depthX, depthY);
	}
};

var Vector2 = function(x, y) {
    this.x = x;
    this.y = y;
};

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function SecondsToTime (s) {
	var h, m, s;
	s = Number(s);
	h = Math.floor(s / 3600);
	m = Math.floor(s % 3600 / 60);
	s = Math.floor(s % 3600 % 60);
	return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

var fps = {
	startTime : 0,
	frameNumber : 0,
	getFPS : function () {
		var d, currentTime, result;
		this.frameNumber++;
		d 			= new Date().getTime();
		currentTime = (d - this.startTime) / 1000;
		//result 		= Math.floor(this.frameNumber / currentTime);
		result			= (this.frameNumber / currentTime).toFixed(2);

		if (currentTime > 1) {
			this.startTime 		= new Date().getTime();
			this.frameNumber 	= 0;
		}

		return result;
	}
};

function GameTime () {
	this.startTime		= new Date().getTime() / 1000;
	this.elapsed		= 0;	// Time elapsed since last update (in seconds)
	this.lastUpdate 	= 0;	// Snapshot of the time on last update
	this.totalGameTime 	= 0;	// Total time elapsed since start of GameTime
};

GameTime.prototype.update = function () {
	var curTime;
	curTime				= new Date().getTime() / 1000;
	this.elapsed		= curTime - this.lastUpdate;
	this.totalGameTime	= curTime - this.startTime;
	this.lastUpdate		= curTime;
};

/*******************************************
**************  INPUT OBJECT  **************
*******************************************/
var Input = {
	Keys: {
		_isPressed: {},
		W: 87,
		A: 65,
		S: 83,
		D: 68,
		SPACE: 32,
		R: 82,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		SHIFT: 16,
		GetKey: function (keyCode) {
			return Input.Keys._isPressed[keyCode];
		},
		onKeyDown: function (e) {
			Input.Keys._isPressed[e.keyCode] = true;
		},
		onKeyUp: function (e) {
			delete Input.Keys._isPressed[e.keyCode];
		}
	},
	Mouse: {
		_isPressed: {},
		pos: new Vector2(0, 0),
		LEFT: 0,
		MIDDLE: 1,
		RIGHT: 2,
		GetButton: function (button) {
			return Input.Mouse._isPressed[button];
		},
		GetPosition: function () {
			return Input.Mouse.pos;
		},
		OnMouseDown: function (e) {
			Input.Mouse.pos.x = e.offsetX;
			Input.Mouse.pos.y = e.offsetY;
			Input.Mouse._isPressed[e.button] = true;
		},
		OnMouseUp: function (e) {
			delete Input.Mouse._isPressed[e.button];
		},
		OnMouseMove: {
			pos: new Vector2(0, 0),
			GetPosition: function () { return Input.Mouse.OnMouseMove.pos; },
			SetPosition: function (e) {
				Input.Mouse.OnMouseMove.pos.x = e.offsetX;
				Input.Mouse.OnMouseMove.pos.y = e.offsetY;
			}
		}
	}
};

/****************************
*****  RECTANGLE CLASS  *****
****************************/
function Rectangle (x, y, width, height) {
	this.x		= x;
	this.y		= y;
	this.width	= width;
	this.height	= height;
	this.left	= this.x;
	this.top	= this.y;
	this.right	= this.x + this.width;
	this.bottom	= this.y + this.height;
	this.center	= new Vector2((this.x + (this.width/2)), (this.y + (this.height/2)));
}

/***********************
*****  LINE CLASS  *****
***********************/
function Line (startPos, endPos, color, collision, normal, sound) {
	this.startPos	= startPos;
	this.endPos		= endPos;
	this.color		= color;
	this.collision	= collision;
	this.normal		= normal;

	sound			= 'GRASS';
	if (typeof sound !== 'undefiend' && sound !== 'NONE') {
		this.sound	= sound;
		this.fx		= undefined;
		this.LoadSound();
	}
};

Line.prototype.LoadSound = function () {
	var path, isLooping, vol;
	switch (this.sound) {
		case 'GRASS':
			path		= 'sounds/SFX_Walking_Grass.mp3';
			isLooping	= true;
			vol			= 0.5;
			break;
		case 'WOOD':
			path		= 'sounds/SFX_Walking_Wood.mp3';
			isLooping	= true;
			vol			= 0.5;
			break;
	}

	this.fx = new Sound(path, isLooping, true, false, vol);	//path, isLooping, preloaded, hasControls, vol
};

Line.prototype.draw = function () {
	game.context.save();
	game.context.lineWidth = 1;
	game.context.strokeStyle = (typeof this.color === 'undefined') ? '#00FF88' : this.color;
	game.context.beginPath();
	game.context.moveTo(this.startPos.x, this.startPos.y);
	game.context.lineTo(this.endPos.x, this.endPos.y);
	game.context.stroke();
	game.context.closePath();
	game.context.restore();
};

/*************************
*****  CIRCLE CLASS  *****
*************************/
function Circle (center, radius, lineColor) {
	this.center 	= center;
	this.radius 	= radius;
	this.lineColor 	= lineColor;
}

Circle.prototype.update = function (center) {
	this.center = center;
};

Circle.prototype.draw = function () {
	game.context.save();
	game.context.beginPath();
	game.context.lineWidth = 1;
	game.context.strokeStyle = this.lineColor;
	game.context.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
	game.context.fillStyle = 'red';
	game.context.fill();
	game.context.stroke();
	game.context.restore();
};

/**************************
*****  TEXTURE CLASS  *****
**************************/
function Texture (pos, size, fillColor, lineWidth, lineColor)  {
	this.pos		= pos;
	this.size		= size;
	this.fillColor	= fillColor;
	this.lineColor	= lineColor;
}

Texture.prototype.update = function (pos) {
	this.pos = pos;
};

Texture.prototype.draw = function () {
	game.context.save();
	game.context.beginPath();
	game.context.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
	game.context.fillStyle = this.fillColor;
	game.context.fill();
	game.context.lineWidth = this.lineWidth;
	game.context.strokeStyle = this.lineColor;
	game.context.stroke();
	game.context.closePath();
	game.context.restore();
};

/*************************
*****  SPRITE CLASS  *****
*************************/
function Sprite (path, pos, size) {
	this.pos	= pos;
	this.size	= size;
	this.img	= document.createElement('img');
	this.img.setAttribute('src', path);
}

Sprite.prototype.SetImage = function (path) {
	this.img.setAttribute('src', path);
};

Sprite.prototype.update = function (pos) {
	this.pos	= pos;
};

Sprite.prototype.draw = function () {
	game.context.drawImage(this.img, this.pos.x, this.pos.y);
};

/************************
*****  SOUND CLASS  *****
************************/
function Sound (path, isLooping, preloaded, hasControls, vol) {
	this.vol			= vol;
	this.audEl			= document.createElement('audio');
	this.audEl.volume 	= this.vol;
	this.audEl.setAttribute('src', path);
	this.audEl.setAttribute('preload', preloaded);
	this.audEl.setAttribute('controls', hasControls);
	if (isLooping) this.audEl.setAttribute('loop', true);
}

Sound.prototype.Play = function () {
	this.audEl.play();
};

Sound.prototype.Stop = function () {
	this.audEl.pause();
};

Sound.prototype.SetVolume = function (vol) {
	this.audEl.volume = vol;
};

Sound.prototype.IsPlaying = function () {
	return !this.audEl.paused;
};

/*******************************************
**************  PLAYER CLASS  **************
*******************************************/
function Player (level) {
	this.level					= level;
	this.radius					= 10;
	this.pos					= new Vector2(20, 300);
	this.size					= new Vector2(this.radius * 2, this.radius * 2);
	this.velocity				= new Vector2(0, 0);
	// Horizontal Movement
	this.movement				= 0;
	this.movementX				= 0;
	this.movementY				= 0;
	this.acceleration			= 0.8;
	this.walkSpeed				= 2;
	this.runSpeed				= 4;
	this.groundDrag				= 0.8;
	this.airDrag				= 1;
	// Vertical Movement
	this.fallSpeed				= 20;
	this.gravity				= 0.38;
	// Jumping
	this.isJumping				= false;
	this.isOnGround				= false;
	this.jumpPower				= 15;
	// WATER
	this.isSwimming				= false;
	this.waterSplash			= new Sound('sounds/SFX_Water_Splash.mp3', false, true, false, 0.7);
	this.waterSwim				= new Sound('sounds/SFX_Water_Swim.mp3', false, true, false, 0.4);

	this.texture				= new Circle(this.center, this.radius, 'red');
}

Player.prototype.Clamp = function (value, min, max) {
	return (value < min) ? min : ((value > max) ? max : value);
};

Player.prototype.SetPos = function (pos) {
	this.pos = pos;
};

Player.prototype.GetInput = function () {

	// Horizontal Movement
	if (Input.Keys.GetKey(Input.Keys.A) || Input.Keys.GetKey(Input.Keys.LEFT)) {
		this.movement 	= -1.0;
		this.movementX	= -1.0;
	} else if (Input.Keys.GetKey(Input.Keys.D) || Input.Keys.GetKey(Input.Keys.RIGHT)) {
		this.movement 	= 1.0;
		this.movementX	= 1.0;
	}

	if (Input.Keys.GetKey(Input.Keys.W) || Input.Keys.GetKey(Input.Keys.UP)) {
			this.movementY 	= -1.0;
	} else if (Input.Keys.GetKey(Input.Keys.S) || Input.Keys.GetKey(Input.Keys.DOWN)) {
			this.movementY 	= 1.0;
	}

	this.isJumping = (Input.Keys.GetKey(Input.Keys.SPACE));

};

Player.prototype.HandleCollision = function () {
	var i, line, b, slope, y, xDiff, water;

	water			= (typeof this.level.waterRect !== 'undefined') ? this.level.waterRect : '';
	this.isOnGround = false;

	// Lines
	for (i = 0; i < this.level.lines.length; i++) {

		line = this.level.lines[i];

		if ((line.collision == 'FLOOR' || line.collision == 'CEILING') && this.pos.x >= line.startPos.x && this.pos.x <= line.endPos.x) {

			slope 	= (line.endPos.y - line.startPos.y) / (line.endPos.x - line.startPos.x);
			b		= line.startPos.y - (slope * line.startPos.x);
			y		= (slope * this.pos.x) + b;

			if (Math.abs(y - this.pos.y) <= this.radius) {
				this.pos.y 		= (line.normal < 0) ? y - this.radius : y + this.radius;
				this.velocity.y = 0;
				if (line.collision == 'FLOOR') {
					this.isOnGround = true;
				} else {
					this.velocity.y = this.gravity;
				}
			}

		} else if (line.collision == 'WALL' && this.pos.y > line.startPos.y && this.pos.y < line.endPos.y) {

			xDiff = Math.abs(this.pos.x - line.startPos.x);

			if (xDiff <= this.radius) {

				this.pos.x 		= (line.normal < 0) ? line.startPos.x - this.radius : line.startPos.x + this.radius;
				this.velocity.x = 0;

			}

		}

		if (!line.fx.IsPlaying() && this.isOnGround && !this.isSwimming && Math.round(this.velocity.x) !== 0) {
			line.fx.Play();
		} else if(line.fx.IsPlaying()) {
			line.fx.Stop();
		}

	}

	if (this.pos.x > water.left && this.pos.x < water.right && this.pos.y > water.top && this.pos.y < water.bottom) {
		// WE'RE SWIMMING!
		if (!this.isSwimming) {
			this.velocity.y = 0.5;
			this.isSwimming = true;
			this.waterSplash.Play();
		}
		this.gravity	= 0.1;
		this.groundDrag	= 0.5;
		this.airDrag	= 0.8;
		this.fallSpeed	= 1;
		if ((this.pos.y - water.top - 10) <= 0) {
			this.jumpPower	= 8;
		} else {
			this.jumpPower	= 4;
		}
	} else {
		this.groundDrag	= 0.8;
		this.airDrag	= 1;
		this.fallSpeed	= 20;
		this.gravity	= 0.38;
		this.jumpPower	= 10;
		this.isSwimming	= false;
	}

};

Player.prototype.Jump = function (velY) {

	if (this.isJumping && (this.isOnGround || this.isSwimming)) {

		this.isOnGround = false;
		if (this.isSwimming) this.waterSwim.Play();
		return -this.jumpPower;

	} else {
		return velY;
	}

};

Player.prototype.ApplyPhysics = function (gameTime) {
	/*this.velocity.x += this.movementX * this.acceleration;
	this.velocity.y += this.movementY * this.acceleration;

	this.velocity.x *= this.friction;
	this.velocity.y *= this.friction;

	this.velocity.x = this.Clamp(this.velocity.x, -this.moveSpeed, this.moveSpeed);
	this.velocity.y = this.Clamp(this.velocity.y, -this.moveSpeed, this.moveSpeed);

	this.pos.x += this.velocity.x;
	this.pos.y += this.velocity.y;
	this.pos	= new Vector2(Math.round(this.pos.x), Math.round(this.pos.y));

	this.HandleCollision();*/

	var moveSpeed;
	moveSpeed = (Input.Keys.GetKey(Input.Keys.SHIFT)) ? this.runSpeed : this.walkSpeed;

	this.velocity.x += this.movement * this.acceleration;
	this.velocity.y = this.Clamp(this.velocity.y + this.gravity, -this.fallSpeed, this.fallSpeed);

	this.velocity.x *= (this.isOnGround) ? this.groundDrag : this.airDrag;
	this.velocity.x = this.Clamp(this.velocity.x, -moveSpeed, moveSpeed);

	this.velocity.y = this.Jump(this.velocity.y);

	this.pos.x += this.velocity.x;
	this.pos.y += this.velocity.y;
	this.pos	= new Vector2(Math.round(this.pos.x), Math.round(this.pos.y));

	this.HandleCollision();

};

Player.prototype.update = function (gameTime) {

	this.GetInput();
	this.ApplyPhysics(gameTime);

	// Update the player
	this.texture.update(this.pos);

	this.movement	= 0;
	this.movementX	= 0;
	this.movementY	= 0;

};

Player.prototype.draw = function () {
	// Draw player texture
	this.texture.draw();
};

/******************
*****  LEVEL  *****
******************/
function Level () {
	this.levelBG			= new Sprite('images/LEVEL_6.jpg', new Vector2(0, 0), new Vector2(game.CANVAS_WIDTH, game.CANVAS_HEIGHT));
	//this.levelFG			= new Sprite('images/Foreground.png', new Vector2(0, 0), new Vector2(game.CANVAS_WIDTH, game.CANVAS_HEIGHT));
	this.lines				= [];
	this.grid				= [];
	//this.waterRect			= new Texture(new Vector2(0, 500), new Vector2(1280, 287), 'transparent', 1, 'blue');	//pos, size, fillColor, lineWidth, lineColor
	this.waterRect			= new Rectangle(0, 431, 1280, 289);
	this.player				= new Player(this);
	this.gameTime			= new GameTime();
	this.fps				= 0;

	this.LoadLines();
	//this.LoadGrid();
}

Level.prototype.LoadLines = function () {

	// WORLD BORDERS
	this.lines.push(new Line(new Vector2(0, 0), new Vector2(game.CANVAS_WIDTH, 0), '#999999', 'CEILING', 1));	//TOP
	this.lines.push(new Line(new Vector2(game.CANVAS_WIDTH, 0), new Vector2(game.CANVAS_WIDTH, game.CANVAS_HEIGHT), '#999999', 'WALL', -1));	// RIGHT
	this.lines.push(new Line(new Vector2(0, game.CANVAS_HEIGHT), new Vector2(game.CANVAS_WIDTH, game.CANVAS_HEIGHT), '#999999', 'FLOOR', -1)); // BOTTOM
	this.lines.push(new Line(new Vector2(0, 0), new Vector2(0, game.CANVAS_HEIGHT), '#999999', 'WALL', 1));		// LEFT

	// GROUND/WALL/CEILING
	this.lines.push(new Line(new Vector2(1, 347), new Vector2(49, 364), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(49, 364), new Vector2(79, 367), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(79, 367), new Vector2(98, 374), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(98, 374), new Vector2(121, 394), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(121, 394), new Vector2(245, 417), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(245, 417), new Vector2(264, 417), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(264, 417), new Vector2(264, 453), "#02AA30", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(243, 452), new Vector2(264, 453), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(172, 429), new Vector2(243, 452), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(125, 436), new Vector2(172, 429), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(125, 436), new Vector2(125, 530), "#02AA30", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(124, 528), new Vector2(162, 543), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(161, 541), new Vector2(161, 629), "#02AA30", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(105, 632), new Vector2(161, 629), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(68, 575), new Vector2(105, 632), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(46, 573), new Vector2(68, 575), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(22, 530), new Vector2(46, 573), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(2, 529), new Vector2(22, 530), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(0, 627), new Vector2(21, 651), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(20, 667), new Vector2(21, 651), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(20, 667), new Vector2(44, 682), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(44, 682), new Vector2(68, 719), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(524, 421), new Vector2(579, 407), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(579, 407), new Vector2(603, 405), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(603, 405), new Vector2(635, 403), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(635, 403), new Vector2(671, 406), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(671, 406), new Vector2(708, 416), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(708, 416), new Vector2(765, 428), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(765, 428), new Vector2(898, 381), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(898, 381), new Vector2(916, 377), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(916, 377), new Vector2(934, 371), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(934, 371), new Vector2(945, 366), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(945, 366), new Vector2(963, 359), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(963, 359), new Vector2(990, 355), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(990, 355), new Vector2(1009, 345), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(1009, 345), new Vector2(1027, 340), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(1027, 340), new Vector2(1027, 356), "#02AA30", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1027, 356), new Vector2(1074, 356), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1074, 356), new Vector2(1098, 356), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1098, 356), new Vector2(1125, 363), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1125, 363), new Vector2(1152, 368), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1152, 368), new Vector2(1183, 377), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1183, 377), new Vector2(1190, 374), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1190, 374), new Vector2(1212, 360), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1212, 360), new Vector2(1239, 359), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1239, 270), new Vector2(1239, 359), "#02AA30", "WALL", -1, "NONE"));
	this.lines.push(new Line(new Vector2(1202, 278), new Vector2(1239, 270), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1167, 268), new Vector2(1202, 278), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1134, 260), new Vector2(1167, 268), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1134, 162), new Vector2(1134, 260), "#02AA30", "WALL", -1, "NONE"));
	this.lines.push(new Line(new Vector2(1134, 162), new Vector2(1146, 145), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1146, 145), new Vector2(1188, 125), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1188, 125), new Vector2(1278, 91), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(524, 419), new Vector2(524, 486), "#02AA30", "WALL", -1, "NONE"));
	this.lines.push(new Line(new Vector2(523, 493), new Vector2(582, 557), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(582, 557), new Vector2(667, 559), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(667, 514), new Vector2(667, 559), "#02AA30", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(667, 514), new Vector2(735, 520), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(735, 520), new Vector2(770, 521), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(770, 521), new Vector2(814, 500), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(814, 500), new Vector2(845, 463), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(845, 440), new Vector2(845, 459), "#02AA30", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(845, 440), new Vector2(974, 401), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(974, 401), new Vector2(1019, 401), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1019, 401), new Vector2(1083, 415), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1064, 429), new Vector2(1083, 415), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1040, 426), new Vector2(1064, 429), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1012, 463), new Vector2(1040, 426), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1012, 463), new Vector2(1012, 558), "#02AA30", "WALL", -1, "NONE"));
	this.lines.push(new Line(new Vector2(573, 672), new Vector2(618, 618), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(618, 618), new Vector2(633, 624), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(633, 624), new Vector2(688, 617), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(688, 617), new Vector2(726, 611), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(726, 611), new Vector2(759, 591), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(759, 591), new Vector2(783, 592), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(783, 592), new Vector2(819, 596), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(819, 596), new Vector2(853, 577), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(853, 577), new Vector2(885, 567), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(885, 567), new Vector2(912, 574), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(912, 574), new Vector2(941, 578), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(941, 578), new Vector2(969, 565), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(969, 565), new Vector2(979, 557), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(979, 557), new Vector2(995, 554), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(995, 554), new Vector2(1012, 558), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(576, 668), new Vector2(576, 718), "#02AA30", "WALL", -1, "NONE"));

};

Level.prototype.LoadGrid = function () {
	var recSize = new Vector2(256, 295);
	//pos, size, fillColor, lineWidth, lineColor //256x295
	this.grid.push(new Texture(new Vector2(0, 0), recSize, 'transparent', 1, 'black'));
	this.grid.push(new Texture(new Vector2(256, 0), recSize, 'transparent', 1, 'black'));
	this.grid.push(new Texture(new Vector2(512, 0), recSize, 'transparent', 1, 'black'));
	this.grid.push(new Texture(new Vector2(768, 0), recSize, 'transparent', 1, 'black'));

	this.grid.push(new Texture(new Vector2(0, 295), recSize, 'transparent', 1, 'black'));
	this.grid.push(new Texture(new Vector2(256, 295), recSize, 'transparent', 1, 'black'));
	this.grid.push(new Texture(new Vector2(512, 295), recSize, 'transparent', 1, 'black'));
	this.grid.push(new Texture(new Vector2(768, 295), recSize, 'transparent', 1, 'black'));
};

Level.prototype.DrawText = function (string, x, y, font, color) {
	game.context.save();
	game.context.font = font;
	game.context.fillStyle = color;
	game.context.fillText(string, x, y);
	game.context.restore();
};

Level.prototype.update = function () {
	this.gameTime.update();
	this.fps = fps.getFPS();

	// Update the player
	this.player.update(this.gameTime);
};

Level.prototype.draw = function () {
	var l, g;

	// Draw Level BG
	this.levelBG.draw();

	/*for (l = 0; l < this.lines.length; l++) {
		this.lines[l].draw();
	}*/

	/*for (g = 0; g < this.grid.length; g++) {
		this.grid[g].draw();
	}*/

	this.player.draw();

	//this.levelFG.draw();

	this.DrawText('FPS: ' + this.fps, (game.CANVAS_WIDTH / 2 - 50), 20, 'normal 14pt Century Gothic', '#FFFFFF');

};


/*****************
*****  MAIN  *****
*****************/
var game = {
	init: function () {
		var wrapper;
		this.isRunning				= true;
		this.FPS					= 60;
		this.CANVAS_WIDTH			= 1280;
		this.CANVAS_HEIGHT			= 720;
		this.canvas					= document.getElementById('viewport');
		this.canvas.width			= game.CANVAS_WIDTH;
		this.canvas.height			= game.CANVAS_HEIGHT;
		this.context				= this.canvas.getContext('2d');
		this.level					= new Level();

		// Adjust webpage styles
		wrapper = document.getElementById('wrapper');
		wrapper.style.width			= game.CANVAS_WIDTH + 'px';
		wrapper.style.height		= game.CANVAS_HEIGHT + 'px';

		// Create event listeners
		window.addEventListener('keyup', function (e) { Input.Keys.onKeyUp(e); }, false);
		window.addEventListener('keydown', function (e) { Input.Keys.onKeyDown(e); }, false);

		// Game Loop
		game.run();
	},
	run: function () {
		if (game.isRunning) {
			game.update();
			game.draw();
		}
		requestAnimationFrame(game.run);
	},
	update: function () {
		game.level.update();
	},
	draw: function () {
		game.context.clearRect(0, 0, game.CANVAS_WIDTH, game.CANVAS_HEIGHT);
		game.level.draw();
	}
};