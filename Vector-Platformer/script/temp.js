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
	this.sound		= sound;
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
	this.walkingSound_Grass		= new Sound('sounds/SFX_Walking_Grass.mp3', true, true, false, 0.8);
	this.walkingSound_Wood		= new Sound('sounds/SFX_Walking_Wood.mp3', true, true, false, 0.8);
	this.waterSplash			= new Sound('sounds/SFX_Water_Splash.mp3', false, true, false, 0.7);
	this.waterSwim				= new Sound('sounds/SFX_Water_Swim.mp3', false, true, false, 0.5);

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
	var i, line, b, slope, y, xDiff, water, shouldPlayWalkSound;

	water				= (typeof this.level.waterRect !== 'undefined') ? this.level.waterRect : '';
	this.isOnGround 	= false;
	shouldPlayWalkSound = false;

	// Lines
	for (i = 0; i < this.level.lines.length; i++) {

		line 				= this.level.lines[i];

		if ((line.collision == 'FLOOR' || line.collision == 'CEILING') && this.pos.x >= line.startPos.x && this.pos.x <= line.endPos.x) {

			slope 	= (line.endPos.y - line.startPos.y) / (line.endPos.x - line.startPos.x);
			b		= line.startPos.y - (slope * line.startPos.x);
			y		= (slope * this.pos.x) + b;

			if (Math.abs(y - this.pos.y) <= this.radius) {
				this.pos.y 		= (line.normal < 0) ? y - this.radius : y + this.radius;
				this.velocity.y = 0;
				if (line.collision === 'FLOOR') {
					this.isOnGround = true;
					this.groundType	= line.sound;
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

	// Play waling sounds
	if (this.isOnGround && Math.round(this.velocity.x) !== 0 && !this.isSwimming) {
		if (this.groundType === 'GRASS' && !this.walkingSound_Grass.IsPlaying()) {
			this.walkingSound_Grass.Play();
		} else if (this.groundType === 'WOOD') {
			this.walkingSound_Wood.Play();
		}
	} else {
		this.walkingSound_Grass.Stop();
		this.walkingSound_Wood.Stop();
	}

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
	this.levelBG			= new Sprite('images/LEVEL_4_Sized.jpg', new Vector2(0, 0), new Vector2(game.CANVAS_WIDTH, game.CANVAS_HEIGHT));
	//this.levelFG			= new Sprite('images/Foreground.png', new Vector2(0, 0), new Vector2(game.CANVAS_WIDTH, game.CANVAS_HEIGHT));
	this.lines				= [];
	this.grid				= [];
	//this.waterRect			= new Texture(new Vector2(0, 500), new Vector2(1280, 287), 'transparent', 1, 'blue');	//pos, size, fillColor, lineWidth, lineColor
	// this.waterRect			= new Rectangle(0, 431, 1280, 289);	// LEVEL 6
	this.waterRect			= new Rectangle(0, 374, 1280, 346);	// LEVEL 4
	this.player				= new Player(this);
	this.gameTime			= new GameTime();
	this.fps				= 0;

	this.music				= new Sound('sounds/MUSIC_The-Forgotten_Forest.mp3', true, true, false, 0.2);

	this.LoadLines();
	//this.LoadGrid();

	this.music.Play();
}

Level.prototype.LoadLines = function () {

	// WORLD BORDERS
	this.lines.push(new Line(new Vector2(0, 0), new Vector2(game.CANVAS_WIDTH, 0), '#999999', 'CEILING', 1));	//TOP
	this.lines.push(new Line(new Vector2(game.CANVAS_WIDTH, 0), new Vector2(game.CANVAS_WIDTH, game.CANVAS_HEIGHT), '#999999', 'WALL', -1));	// RIGHT
	this.lines.push(new Line(new Vector2(0, game.CANVAS_HEIGHT), new Vector2(game.CANVAS_WIDTH, game.CANVAS_HEIGHT), '#999999', 'FLOOR', -1)); // BOTTOM
	this.lines.push(new Line(new Vector2(0, 0), new Vector2(0, game.CANVAS_HEIGHT), '#999999', 'WALL', 1));		// LEFT

	// GROUND/WALL/CEILING
	this.lines.push(new Line(new Vector2(0, 326), new Vector2(6, 328), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(6, 328), new Vector2(16, 324), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(16, 324), new Vector2(39, 326), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(39, 326), new Vector2(61, 325), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(61, 325), new Vector2(80, 322), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(80, 322), new Vector2(146, 328), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(146, 328), new Vector2(154, 326), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(154, 326), new Vector2(186, 336), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(186, 336), new Vector2(215, 333), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(214, 333), new Vector2(225, 337), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(225, 337), new Vector2(239, 337), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(239, 337), new Vector2(245, 337), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(245, 337), new Vector2(255, 343), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(254, 342), new Vector2(261, 343), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(261, 343), new Vector2(273, 351), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(273, 351), new Vector2(281, 347), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(281, 347), new Vector2(302, 352), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(302, 352), new Vector2(314, 363), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(308, 388), new Vector2(314, 363), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(308, 388), new Vector2(308, 429), "#02AA30", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(290, 444), new Vector2(308, 429), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(290, 444), new Vector2(307, 457), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(307, 457), new Vector2(312, 475), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(312, 475), new Vector2(326, 492), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(326, 492), new Vector2(350, 546), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(350, 546), new Vector2(360, 538), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(360, 538), new Vector2(383, 535), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(383, 535), new Vector2(406, 539), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(406, 539), new Vector2(425, 549), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(425, 549), new Vector2(443, 565), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(443, 565), new Vector2(454, 578), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(454, 578), new Vector2(467, 584), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(467, 584), new Vector2(480, 582), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(480, 582), new Vector2(494, 575), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(494, 575), new Vector2(506, 574), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(506, 574), new Vector2(522, 576), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(522, 576), new Vector2(552, 588), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(552, 588), new Vector2(581, 583), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(581, 583), new Vector2(592, 569), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(592, 569), new Vector2(605, 561), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(605, 561), new Vector2(622, 558), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(622, 558), new Vector2(638, 561), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(638, 561), new Vector2(645, 569), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(645, 569), new Vector2(665, 574), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(665, 574), new Vector2(673, 562), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(673, 562), new Vector2(699, 557), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(699, 557), new Vector2(703, 564), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(703, 564), new Vector2(724, 577), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(724, 577), new Vector2(728, 585), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(728, 585), new Vector2(787, 588), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(787, 588), new Vector2(791, 578), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(791, 578), new Vector2(811, 567), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(811, 567), new Vector2(820, 577), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(820, 577), new Vector2(853, 583), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(853, 583), new Vector2(855, 588), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(855, 588), new Vector2(870, 589), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(870, 589), new Vector2(883, 577), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(882, 577), new Vector2(893, 577), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(893, 577), new Vector2(903, 583), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(903, 583), new Vector2(935, 566), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(935, 566), new Vector2(953, 555), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(953, 555), new Vector2(972, 538), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(972, 538), new Vector2(973, 525), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(973, 525), new Vector2(984, 511), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(984, 511), new Vector2(1000, 507), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1000, 368), new Vector2(1000, 507), "#02AA30", "WALL", -1, "NONE"));
	this.lines.push(new Line(new Vector2(968, 365), new Vector2(1000, 368), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(919, 356), new Vector2(968, 365), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(896, 354), new Vector2(919, 356), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(860, 361), new Vector2(896, 354), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(828, 403), new Vector2(860, 361), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(790, 475), new Vector2(828, 403), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(729, 463), new Vector2(790, 475), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(671, 487), new Vector2(727, 462), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(638, 487), new Vector2(671, 487), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(619, 479), new Vector2(638, 487), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(609, 473), new Vector2(619, 479), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(584, 475), new Vector2(609, 473), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(566, 466), new Vector2(584, 475), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(564, 455), new Vector2(566, 466), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(545, 463), new Vector2(564, 455), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(504, 467), new Vector2(545, 463), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(504, 455), new Vector2(504, 467), "#02AA30", "WALL", -1, "NONE"));
	this.lines.push(new Line(new Vector2(504, 455), new Vector2(531, 449), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(531, 388), new Vector2(531, 449), "#02AA30", "WALL", -1, "NONE"));
	this.lines.push(new Line(new Vector2(522, 379), new Vector2(531, 388), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(522, 339), new Vector2(522, 379), "#02AA30", "WALL", -1, "NONE"));
	this.lines.push(new Line(new Vector2(522, 339), new Vector2(535, 336), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(535, 336), new Vector2(546, 325), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(546, 325), new Vector2(562, 321), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(562, 321), new Vector2(587, 323), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(587, 323), new Vector2(650, 323), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(650, 323), new Vector2(683, 320), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(683, 320), new Vector2(711, 314), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(711, 314), new Vector2(737, 314), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(737, 314), new Vector2(764, 322), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(764, 322), new Vector2(822, 326), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(822, 326), new Vector2(867, 296), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(867, 296), new Vector2(915, 272), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(915, 272), new Vector2(941, 262), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(941, 262), new Vector2(1008, 250), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(1008, 157), new Vector2(1008, 250), "#02AA30", "WALL", -1, "NONE"));
	this.lines.push(new Line(new Vector2(1008, 157), new Vector2(1020, 146), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(1020, 146), new Vector2(1054, 135), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(1054, 135), new Vector2(1066, 138), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(1066, 138), new Vector2(1075, 134), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(1075, 134), new Vector2(1095, 132), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(1095, 132), new Vector2(1127, 132), "#9F0313", "FLOOR", -1, "WOOD"));
	this.lines.push(new Line(new Vector2(1127, 132), new Vector2(1127, 160), "#02AA30", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1127, 160), new Vector2(1171, 161), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1171, 161), new Vector2(1195, 167), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1195, 167), new Vector2(1227, 173), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1227, 173), new Vector2(1241, 176), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1241, 176), new Vector2(1270, 171), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1270, 171), new Vector2(1279, 170), "#9F0313", "FLOOR", -1, "GRASS"));
	this.lines.push(new Line(new Vector2(1008, 0), new Vector2(1008, 50), "#02AA30", "WALL", -1, "NONE"));
	this.lines.push(new Line(new Vector2(1008, 50), new Vector2(1041, 62), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1041, 62), new Vector2(1052, 63), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1052, 63), new Vector2(1067, 53), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1067, 53), new Vector2(1079, 63), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1079, 63), new Vector2(1111, 63), "#0E72D5", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1111, 1), new Vector2(1111, 63), "#02AA30", "WALL", 1, "NONE"));

	// this.lines.push(new Line(new Vector2(-1, 348), new Vector2(50, 363), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(50, 363), new Vector2(76, 367), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(76, 367), new Vector2(94, 374), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(94, 374), new Vector2(119, 392), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(119, 392), new Vector2(247, 417), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(247, 417), new Vector2(274, 418), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(254, 452), new Vector2(274, 418), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(175, 429), new Vector2(254, 452), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(165, 439), new Vector2(175, 429), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(113, 438), new Vector2(165, 439), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(113, 438), new Vector2(113, 519), "#02AA30", "WALL", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(113, 519), new Vector2(161, 539), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(161, 539), new Vector2(161, 622), "#02AA30", "WALL", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(106, 627), new Vector2(161, 622), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(74, 610), new Vector2(106, 627), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(61, 576), new Vector2(74, 610), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(51, 573), new Vector2(61, 576), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(21, 531), new Vector2(51, 573), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(2, 528), new Vector2(21, 531), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(0, 632), new Vector2(21, 650), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(21, 650), new Vector2(24, 667), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(24, 667), new Vector2(48, 684), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(48, 684), new Vector2(66, 719), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(522, 422), new Vector2(571, 409), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(571, 409), new Vector2(602, 406), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(602, 406), new Vector2(644, 407), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(644, 407), new Vector2(695, 412), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(695, 412), new Vector2(730, 420), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(730, 420), new Vector2(767, 426), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(767, 426), new Vector2(812, 410), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(812, 410), new Vector2(836, 403), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(836, 403), new Vector2(899, 382), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(899, 382), new Vector2(916, 377), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(916, 377), new Vector2(934, 372), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(934, 372), new Vector2(941, 367), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(941, 367), new Vector2(966, 359), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(966, 359), new Vector2(995, 356), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(995, 356), new Vector2(1003, 348), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(1003, 348), new Vector2(1021, 341), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(1021, 341), new Vector2(1031, 339), "#9F0313", "FLOOR", -1, "WOOD"));
	// this.lines.push(new Line(new Vector2(1031, 339), new Vector2(1031, 356), "#02AA30", "WALL", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(1031, 356), new Vector2(1067, 357), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1067, 357), new Vector2(1097, 358), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1097, 358), new Vector2(1121, 363), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1121, 363), new Vector2(1143, 367), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1143, 367), new Vector2(1171, 374), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1171, 374), new Vector2(1183, 376), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1183, 376), new Vector2(1211, 360), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1211, 360), new Vector2(1263, 360), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1247, 267), new Vector2(1247, 360), "#02AA30", "WALL", -1, "NONE"));
	// this.lines.push(new Line(new Vector2(1218, 274), new Vector2(1247, 267), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(1179, 278), new Vector2(1218, 274), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(1165, 263), new Vector2(1179, 278), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(1131, 258), new Vector2(1165, 263), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(1131, 166), new Vector2(1131, 258), "#02AA30", "WALL", -1, "NONE"));
	// this.lines.push(new Line(new Vector2(1131, 166), new Vector2(1153, 142), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1153, 142), new Vector2(1183, 124), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1183, 124), new Vector2(1227, 117), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(523, 422), new Vector2(523, 484), "#02AA30", "WALL", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(523, 484), new Vector2(570, 555), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(570, 555), new Vector2(593, 562), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(593, 562), new Vector2(665, 560), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(665, 560), new Vector2(680, 513), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(680, 513), new Vector2(699, 511), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(699, 511), new Vector2(717, 520), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(717, 520), new Vector2(771, 521), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(771, 521), new Vector2(813, 501), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(813, 501), new Vector2(842, 467), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(842, 467), new Vector2(851, 442), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(851, 442), new Vector2(871, 428), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(871, 428), new Vector2(941, 410), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(941, 410), new Vector2(975, 400), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(975, 400), new Vector2(1001, 402), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(1001, 402), new Vector2(1032, 402), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(1032, 402), new Vector2(1071, 408), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(1070, 408), new Vector2(1085, 416), "#0E72D5", "CEILING", 1, "NONE"));
	// this.lines.push(new Line(new Vector2(1074, 422), new Vector2(1085, 416), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1068, 429), new Vector2(1074, 422), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1029, 428), new Vector2(1068, 429), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1013, 463), new Vector2(1029, 428), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(1013, 463), new Vector2(1013, 555), "#02AA30", "WALL", -1, "NONE"));
	// this.lines.push(new Line(new Vector2(587, 651), new Vector2(615, 622), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(615, 622), new Vector2(623, 625), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(623, 625), new Vector2(653, 626), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(653, 626), new Vector2(731, 608), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(731, 608), new Vector2(751, 598), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(751, 598), new Vector2(759, 592), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(759, 592), new Vector2(789, 597), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(789, 597), new Vector2(839, 580), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(837, 580), new Vector2(881, 558), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(881, 558), new Vector2(915, 575), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(915, 575), new Vector2(931, 574), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(931, 574), new Vector2(953, 566), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(953, 566), new Vector2(985, 557), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(985, 557), new Vector2(1014, 555), "#9F0313", "FLOOR", -1, "GRASS"));
	// this.lines.push(new Line(new Vector2(586, 650), new Vector2(586, 718), "#02AA30", "WALL", -1, "NONE"));

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

	// Draw Collision Map
	// for (l = 0; l < this.lines.length; l++) {
	// 	this.lines[l].draw();
	// }

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