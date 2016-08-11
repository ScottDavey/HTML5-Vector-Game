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

Vector2.prototype.Add = function (vector) {
	return new Vector2(this.x + vector, this.y + vector);
};

Vector2.prototype.Subtract = function (vector) {
	return new Vector2(this.x - vector, this.y - vector);
};

Vector2.prototype.Multiply = function (vector) {
	return new Vector2(this.x * vector, this.y * vector);
};

Vector2.prototype.Multiply = function (vector) {
	return new Vector2(this.x * vector, this.y * vector);
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

var GameTime = {
	startTime: 		new Date().getTime() / 1000,
	elapsed: 		0,
	lastUpdate: 	0,
	totalGameTime: 	0,
	getElapsed: function () {
		return GameTime.elapsed;
	},
	getLastUpdate: function () {
		return GameTime.lastUpdate;
	},
	getTotalGameTime: function () {
		return GameTime.totalGameTime;
	},
	update: function () {
		var curTime;
		curTime					= new Date().getTime() / 1000;
		GameTime.elapsed		= curTime - GameTime.lastUpdate;
		GameTime.totalGameTime	= curTime - GameTime.startTime;
		GameTime.lastUpdate		= curTime;
	}
};

var DrawText = function (string, x, y, font, color) {
	main.context.save();
	main.context.font = font;
	main.context.fillStyle = color;
	main.context.fillText(string, x, y);
	main.context.restore();
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
		ESCAPE: 27,
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
	this.x			= x;
	this.y			= y;
	this.width		= width;
	this.height		= height;
	this.left		= this.x;
	this.top		= this.y;
	this.right		= this.x + this.width;
	this.bottom		= this.y + this.height;
	this.center		= new Vector2((this.x + (this.width/2)), (this.y + (this.height/2)));
	this.halfSize 	= new Vector2((this.width / 2), (this.height / 2));
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
	main.context.save();
	main.context.lineWidth = 1;
	main.context.strokeStyle = (typeof this.color === 'undefined') ? '#00FF88' : this.color;
	main.context.beginPath();
	main.context.moveTo(this.startPos.x, this.startPos.y);
	main.context.lineTo(this.endPos.x, this.endPos.y);
	main.context.stroke();
	main.context.closePath();
	main.context.restore();
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
	main.context.save();
	main.context.beginPath();
	main.context.lineWidth = 1;
	main.context.strokeStyle = this.lineColor;
	main.context.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
	main.context.fillStyle = 'red';
	main.context.fill();
	main.context.stroke();
	main.context.restore();
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
	main.context.save();
	main.context.beginPath();
	main.context.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
	main.context.fillStyle = this.fillColor;
	main.context.fill();
	main.context.lineWidth = this.lineWidth;
	main.context.strokeStyle = this.lineColor;
	main.context.stroke();
	main.context.closePath();
	main.context.restore();
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
	main.context.drawImage(this.img, this.pos.x, this.pos.y);
};

/****************************
*****  ANIMATION CLASS  *****
****************************/
function Animation (path, pos, frameSize, sheetWidth, animationSeq, speed, dir) {
	this.img 				= document.createElement('img');
	this.path 				= path;
	this.pos 				= pos;
	this.frameSize			= frameSize;
	this.sheetWidth			= sheetWidth;
	this.animationSeq		= animationSeq;
	this.speed 				= speed;
	this.dir 				= dir;
	this.clip 				= new Rectangle(0, (this.animationSeq * this.frameSize), this.frameSize, this.frameSize);
	this.frameCount 		= 0;
	this.totalFrames 		= this.sheetWidth / this.frameSize;
	this.previousFrameTime	= 0;
	this.img.setAttribute('src', this.path);
}

Animation.prototype.update = function (pos, animationSeq, speed) {
	this.pos 				= pos;
	this.clip		 		= new Rectangle(0, (animationSeq * this.frameSize), this.frameSize, this.frameSize);
	this.speed 				= speed;
};

Animation.prototype.animate = function (frameTime) {
	//this.previousFrameTime = 0;
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
	this.pos 					= new Vector2(20, 275);
	this.size 					= new Vector2(27, 50);
	this.velocity				= new Vector2(0, 0);
	// Horizontal Movement
	this.movement				= 0;
	this.movementX				= 0;
	this.movementY				= 0;
	this.MoveAcceleration		= 20000.0;
	this.MaxMoveSpeed			= 2000.0;
	this.GroundDragFactor		= 0.58;
	this.AirDragFactor			= 0.65;
	// Vertical Movement
	this.MaxJumpTime			= 0.35;
	this.JumpLaunchVelocity		= -3000.0;
	this.GravityAcceleration	= 2000.0;
	this.MaxFallSpeed			= 900.0;
	this.JumpControlPower		= 0.14;
	// States
	this.isOnGround				= false;
	this.isJumping				= false;
	this.wasJumping				= false;
	this.jumpTime 				= 0;
	// WATER
	this.isSwimming				= false;
	this.walkingSound_Grass		= new Sound('sounds/SFX_Walking_Grass.mp3', true, true, false, 0.8);
	this.walkingSound_Wood		= new Sound('sounds/SFX_Walking_Wood.mp3', true, true, false, 0.8);
	this.waterSplash			= new Sound('sounds/SFX_Water_Splash.mp3', false, true, false, 0.7);
	this.waterSwim				= new Sound('sounds/SFX_Water_Swim.mp3', false, true, false, 0.5);

	// this.texture				= new Circle(this.pos, this.radius, 'red');
	//this.texture 				= new Texture(this.pos, this.size, 'rgba(197, 27, 32, 0.7)', 1, 'rgb(197, 27, 32)');
	this.sprite					= new Sprite('images/player/small/Idle__000.png', this.pos, this.size);
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
	var bounds, i, line, b, slope, y, xDiff, water, shouldPlayWalkSound, waterIntersect;

	bounds				= new Rectangle(this.pos.x, this.pos.y, this.size.x, this.size.y);
	water				= (typeof this.level.waterRect !== 'undefined') ? this.level.waterRect : '';
	this.isOnGround 	= false;
	shouldPlayWalkSound = false;

	// Lines
	for (i = 0; i < this.level.lines.length; i++) {

		line = this.level.lines[i];

		if ((line.collision == 'FLOOR' || line.collision == 'CEILING') && bounds.center.x >= line.startPos.x && bounds.center.x <= line.endPos.x) {

			slope 	= (line.endPos.y - line.startPos.y) / (line.endPos.x - line.startPos.x);
			b		= line.startPos.y - (slope * line.startPos.x);
			y		= (slope * bounds.center.x) + b;

			if (Math.abs(y - bounds.center.y) <= bounds.halfSize.y) {
				this.pos.y 		= (line.normal < 0) ? y - bounds.height : y;
				this.velocity.y = 0;
				if (line.collision === 'FLOOR') {
					this.isOnGround = true;
					this.groundType	= line.sound;
				}
			}

		} else if (line.collision == 'WALL' && bounds.center.y > line.startPos.y && bounds.center.y < line.endPos.y) {

			xDiff = Math.abs(bounds.center.x - line.startPos.x);

			if (xDiff <= bounds.halfSize.x) {

				this.pos.x 		= (line.normal < 0) ? line.startPos.x - bounds.width : line.startPos.x;
				this.velocity.x = 0;

			}

		}

	}

	waterIntersect = RectangleExtensions.GetIntersectionDepth(bounds, water);

	if (waterIntersect.x != 0 && waterIntersect.y != 0) {
		// WE'RE SWIMMING!
		if (!this.isSwimming) {
			this.velocity.y = 0.5;
			this.isSwimming = true;
			this.waterSplash.Play();
		}
		this.GroundDragFactor		= 0.1;
		this.AirDragFactor			= 0.2;
		this.GravityAcceleration	= 250.0;
		this.MaxFallSpeed			= 100.0;
		this.JumpControlPower		= 0.13;

		if ((this.pos.y - water.top - 10) <= 0) {
			this.JumpLaunchVelocity	= -750.0;
		} else {
			this.JumpLaunchVelocity	= -500.0;
		}
	} else if (this.isSwimming) {
		this.GroundDragFactor		= 0.58;
		this.AirDragFactor			= 0.65;
		this.JumpLaunchVelocity		= -3000.0;
		this.GravityAcceleration	= 2000.0;
		this.MaxFallSpeed			= 900.0;
		this.JumpControlPower		= 0.14;
		this.isSwimming				= false;
	}

};

Player.prototype.Jump = function (velY) {

	if (this.isJumping) {

		if (!this.isSwimming) {
			if ((!this.wasJumping && this.isOnGround) || this.jumpTime > 0) {

				if (this.jumpTime == 0 && this.isSwimming)
					this.waterSwim.Play();

				this.jumpTime += GameTime.getElapsed();

			}

			if (0 < this.jumpTime && this.jumpTime <= this.MaxJumpTime) {
				velY = this.JumpLaunchVelocity * (1 - Math.pow(this.jumpTime / this.MaxJumpTime, this.JumpControlPower));
			} else {
				this.jumpTime = 0;
			}
		} else {
			velY = this.JumpLaunchVelocity * (1 - Math.pow(this.jumpTime / this.MaxJumpTime, this.JumpControlPower));
		}

	} else {
		this.jumpTime = 0;
	}

	this.wasJumping = this.isJumping;

	return velY;

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

	var moveSpeed, elapsed;
	moveSpeed 	= (Input.Keys.GetKey(Input.Keys.SHIFT)) ? this.runSpeed : this.walkSpeed;
	elapsed 	= GameTime.getElapsed();

	this.velocity.x 	= this.movement * this.MoveAcceleration * elapsed;
	this.velocity.y 	= this.Clamp(this.velocity.y + this.GravityAcceleration * elapsed, -this.MaxFallSpeed, this.MaxFallSpeed);
	this.velocity.y 	= this.Jump(this.velocity.y);

	if (this.isOnGround)
		this.velocity.x *= this.GroundDragFactor;
	else
		this.velocity.x *= this.AirDragFactor;

	this.velocity.x 	= this.Clamp(this.velocity.x, -this.MaxMoveSpeed, this.MaxMoveSpeed);

	this.pos.x 			+= this.velocity.x * elapsed;
	this.pos.y 			+= this.velocity.y * elapsed;
	this.pos 			= new Vector2(Math.round(this.pos.x), Math.round(this.pos.y));

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
	this.sprite.update(this.pos);

	this.movement	= 0;
	this.movementX	= 0;
	this.movementY	= 0;

};

Player.prototype.draw = function () {
	// Draw player texture
	this.sprite.draw();
};

/******************
*****  LEVEL  *****
******************/
function Level (game) {
	this.game 				= game;
	this.levelBG			= {};
	this.lines				= [];
	this.waterRect			= {};
	this.player				= {};
	this.music				= {};
	this.escapeLocked		= false;
}

Level.prototype.Initialize = function () {
	this.levelBG	= new Sprite('images/LEVEL_4_Sized.jpg', new Vector2(0, 0), new Vector2(main.CANVAS_WIDTH, main.CANVAS_HEIGHT));
	this.waterRect	= new Rectangle(0, 374, 1280, 346);	// LEVEL 4
	this.player		= new Player(this);
	this.music		= new Sound('sounds/MUSIC_The-Forgotten_Forest.mp3', true, true, false, 0.2);
	this.LoadLines();
	this.music.Play();
};

Level.prototype.Dispose = function () {
	this.music.Stop();
	this.levelBG			= {};
	this.lines				= [];
	this.waterRect			= {};	// LEVEL 4
	this.player				= {};
	this.music				= {};
};

Level.prototype.LoadLines = function () {

	// WORLD BORDERS
	this.lines.push(new Line(new Vector2(0, 0), new Vector2(main.CANVAS_WIDTH, 0), '#999999', 'CEILING', 1));	//TOP
	this.lines.push(new Line(new Vector2(main.CANVAS_WIDTH, 0), new Vector2(main.CANVAS_WIDTH, main.CANVAS_HEIGHT), '#999999', 'WALL', -1));	// RIGHT
	this.lines.push(new Line(new Vector2(0, main.CANVAS_HEIGHT), new Vector2(main.CANVAS_WIDTH, main.CANVAS_HEIGHT), '#999999', 'FLOOR', -1)); // BOTTOM
	this.lines.push(new Line(new Vector2(0, 0), new Vector2(0, main.CANVAS_HEIGHT), '#999999', 'WALL', 1));		// LEFT

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
	main.context.save();
	main.context.font = font;
	main.context.fillStyle = color;
	main.context.fillText(string, x, y);
	main.context.restore();
};

Level.prototype.update = function () {

	this.player.update();

	if (!this.isEscapeLocked && Input.Keys.GetKey(Input.Keys.ESCAPE)) {
		this.isEscapeLocked = true;
		this.game.ChangeState('MAIN MENU');
	}
};

Level.prototype.draw = function () {
	var l, g;

	// Draw Level BG
	this.levelBG.draw();

	// Draw Collision Map
	// for (l = 0; l < this.lines.length; l++) {
	// 	this.lines[l].draw();
	// }

	this.player.draw();

};

function MainMenu (game) {
	this.game 				= game;
	this.menuBG 			= new Texture(new Vector2(0, 0), new Vector2(main.CANVAS_WIDTH, main.CANVAS_HEIGHT), '#000000', 1, '#000000');
	// this.centerLine			= new Line(new Vector2(main.CANVAS_WIDTH / 2, 0), new Vector2(main.CANVAS_WIDTH / 2, main.CANVAS_HEIGHT), '#222222', 'NONE', 0, 'NONE'); //startPos, endPos, color, collision, normal, sound
	this.playColor			= '#FFFFFF';
	this.playRect 			= new Rectangle(main.CANVAS_WIDTH / 2 - 35, main.CANVAS_HEIGHT - 125, 71, 30);
	this.playRectTxt		= new Texture(new Vector2(this.playRect.left, this.playRect.top), new Vector2(this.playRect.right-this.playRect.left, this.playRect.bottom-this.playRect.top), 'transparent', 1, '#222222');
	this.isLeftClickLocked	= false;
	this.menuMusic			= new Sound('sounds/MUSIC_Ori-and-the-Blind_Forest_Inspiriting.mp3', true, true, false, 0.5);
}

MainMenu.prototype.Initialize = function () {
	this.menuMusic.Play();
};

MainMenu.prototype.Dispose = function () {
	this.menuMusic.Stop();
};

MainMenu.prototype.update = function () {
	var mouseMovePos, mouseMoveX, mouseMoveY;
	mouseMovePos 	= Input.Mouse.OnMouseMove.GetPosition();
	mouseMoveX 		= mouseMovePos.x;
	mouseMoveY		= mouseMovePos.y;

	if (mouseMoveX > this.playRect.left && mouseMoveX < this.playRect.right && mouseMoveY > this.playRect.top && mouseMoveY < this.playRect.bottom) {
		this.playColor = '#F11B2B';
		if (!this.isLeftClickLocked && Input.Mouse.GetButton(Input.Mouse.LEFT)) {
			this.isLeftClickLocked = true;
			this.game.ChangeState('GAME');
		}
	} else {
		this.playColor = '#FFFFFF';
	}

};

MainMenu.prototype.draw = function () {
	this.menuBG.draw();

	DrawText('HTMl5 VECTOR PLATFORMER', (main.CANVAS_WIDTH / 2 - 375), 150, 'normal 44pt Trebuchet MS, Verdana', '#C51B20');
	DrawText('A Platforming Game', (main.CANVAS_WIDTH / 2 - 150), 190, 'normal 22pt Century Gothic, Verdana', '#FFFFFF');
	DrawText('PLAY', (main.CANVAS_WIDTH / 2 - 35), (main.CANVAS_HEIGHT - 100), 'bold 18pt Verdana', this.playColor);
};

/***********************
*****  GAME CLASS  *****
***********************/
function Game () {
	this.isRunning				= true;
	this.fps					= 0;
	this.state 					= 'MAIN MENU';
	this.mainMenu				= undefined;
	this.level					= undefined;

	// Initialize GameTime
	GameTime.update();

	// Game Loop
	this.ChangeState('MAIN MENU');
}

Game.prototype.ChangeState = function (state) {
	if (state === 'MAIN MENU') {
		if (typeof this.level !== 'undefined') {
			this.level.Dispose();
			this.level = undefined;
		}
		this.mainMenu = new MainMenu(this);
		this.mainMenu.Initialize();
	} else if (state === 'GAME') {
		if (typeof this.mainMenu !== 'undefined') {
			this.mainMenu.Dispose();
			this.mainMenu = undefined;
		}
		this.level = new Level(this);
		this.level.Initialize();
	}

	this.state = state;
};

Game.prototype.update = function () {
	this.fps = fps.getFPS();

	if (this.state === 'MAIN MENU')
		this.mainMenu.update();
	else 
		this.level.update();
};

Game.prototype.draw = function () {
	main.context.clearRect(0, 0, main.CANVAS_WIDTH, main.CANVAS_HEIGHT);
	if (this.state === 'MAIN MENU')
		this.mainMenu.draw();
	else 
		this.level.draw();

	DrawText('FPS: ' + this.fps, (main.CANVAS_WIDTH / 2 - 50), 20, 'normal 14pt Consolas, Trebuchet MS, Verdana', '#FFFFFF');
};

/*****************
*****  MAIN  *****
*****************/
var main = {
	init: function () {
		var wrapper;
		this.isRunning 				= true;
		this.CANVAS_WIDTH			= 1280;
		this.CANVAS_HEIGHT			= 720;
		this.canvas					= document.getElementById('viewport');
		this.canvas.width			= this.CANVAS_WIDTH;
		this.canvas.height			= this.CANVAS_HEIGHT;
		this.context				= this.canvas.getContext('2d');
		this.game 					= new Game();

		// Adjust webpage styles
		wrapper = document.getElementById('wrapper');
		wrapper.style.width			= this.CANVAS_WIDTH + 'px';
		wrapper.style.height		= this.CANVAS_HEIGHT + 'px';

		// Create event listeners
		window.addEventListener('keyup', function (e) { Input.Keys.onKeyUp(e); }, false);
		window.addEventListener('keydown', function (e) { Input.Keys.onKeyDown(e); }, false);
		this.canvas.addEventListener('mousemove', function (e) { Input.Mouse.OnMouseMove.SetPosition(e); }, false);
		this.canvas.addEventListener('mousedown', function (e) { Input.Mouse.OnMouseDown(e); }, false);
		this.canvas.addEventListener('mouseup', function (e) { Input.Mouse.OnMouseUp(e); }, false);

		main.run();
	},
	run: function () {
		if (main.isRunning) {
			GameTime.update();
			main.game.update();
			main.game.draw();
		}
		requestAnimationFrame(main.run);
	}
};