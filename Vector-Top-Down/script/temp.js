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
	getCurrentGameTime: function () {
		return new Date().getTime() / 1000;
	},
	update: function () {
		var curTime;
		curTime					= GameTime.getCurrentGameTime();
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
	// this.img				= $('<img />').attr({'src': path});
	// this.img				= this.img[0];
	this.img 				= document.createElement('img');
	this.img.setAttribute('src', path);
	this.frameSize			= frameSize;
	this.sheetWidth			= sheetWidth;
	this.pos				= pos;
	this.dir				= dir;
	this.clip				= {'left': 0, 'top': (animationSeq * this.frameSize), 'right': this.frameSize, 'bottom': this.frameSize};
	this.frameCount			= 0;
	this.totalFrames		= this.sheetWidth / this.frameSize;
	this.previousFrameTime	= 0;
	this.speed				= speed;
}

Animation.prototype.update = function (pos, animationSeq, speed) {
	this.pos 		= pos;
	this.clip.top	= animationSeq * this.frameSize;
	this.speed		= speed;
};

Animation.prototype.animate = function (frameTime) {

	// Set the previous frame time to the current time (frameTime) if this is the first go around
	this.previousFrameTime = (this.previousFrameTime === 0) ? frameTime : this.previousFrameTime;
	// Every 0.5 seconds, switch frames
	if ((frameTime - this.previousFrameTime) >= this.speed) {
		
		this.clip.left 	= this.frameSize * this.frameCount;
		this.clip.right	= (this.frameSize * this.frameCount) + this.frameSize;
		// Advance a frame
		this.frameCount = (this.frameCount === (this.totalFrames - 1)) ? 0 : this.frameCount + 1;
		// Set the new previous frame time
		this.previousFrameTime = frameTime;
	}

};

Animation.prototype.draw = function () {
	var d, frameTime;
	// Get a snap shot of the time in seconds
	d = new Date();
	frameTime = d.getTime() / 1000;
	this.animate(frameTime);

	// Image, BG Start X, BG Start Y, BG End X, BG End Y, Pos X, Pos Y, Stretch X, Stretch Y
	main.context.drawImage(this.img, this.clip.left, this.clip.top, this.frameSize, this.clip.bottom, this.pos.x, this.pos.y, this.frameSize, this.frameSize);

};

/*******************************************
**************  CAMERA CLASS  **************
*******************************************/
function Camera () {
	this.distance 		= 0.0;
	this.lookat 		= [0, 0];
	this.fieldOfView	= Math.PI / 4.0;
	this.viewport 		= {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		width: 0,
		height: 0,
		scale: [1.0, 1.0]
	};
	this.updateViewport();
}

Camera.prototype = {
	begin: function () {
		main.context.save();
		this.applyScale();
		this.applyTranslation();
	},
	end: function () {
		main.context.restore();
	},
	applyScale: function () {
		main.context.scale(this.viewport.scale[0],this.viewport.scale[1]);
	},
	applyTranslation: function () {
		main.context.translate(-this.viewport.left, -this.viewport.top);
	},
	updateViewport: function () {
		this.aspectRatio		= main.CANVAS_WIDTH / main.CANVAS_HEIGHT;
		this.viewport.width 	= this.distance * Math.tan(this.fieldOfView);
		this.viewport.height 	= this.viewport.width / this.aspectRatio;
		this.viewport.left 		= this.lookat[0] - (this.viewport.width / 2.0);
		this.viewport.top 		= this.lookat[1] - (this.viewport.height / 2.0);
		this.viewport.right 	= this.viewport.left + this.viewport.width;
		this.viewport.bottom 	= this.viewport.top + this.viewport.height;
		this.viewport.scale[0]	= main.CANVAS_WIDTH / this.viewport.width;
		this.viewport.scale[1]	= main.CANVAS_HEIGHT / this.viewport.height;
	},
	zoomTo: function (z) {
		this.distance = z;
		this.updateViewport();
	},
	moveTo: function (x, y) {
		this.lookat[0] = x;
		this.lookat[1] = y;
		this.updateViewport();
	},
	screenToWorld: function (x, y, obj) {
		obj = obj || {};
		obj.x = (x / this.viewport.scale[0]) + this.viewport.left;
		obj.y = (y / this.viewport.scale[1]) + this.viewport.top;
		return obj;
	},
	worldToScreen: function (x, y, obj) {
		obj = obj || {};
		obj.x = (x - this.viewport.left) * (this.viewport.scale[0]);
     	obj.y = (y - this.viewport.top) * (this.viewport.scale[1]);
		return obj;
	}
};

/*******************************************
**************  PLAYER CLASS  **************
*******************************************/
function Player (level) {
	this.level					= level;
	this.pos 					= new Vector2(20, 20);
	this.size 					= new Vector2(27, 50);
	this.velocity				= new Vector2(0, 0);
	// Movement
	this.movementX				= 0;
	this.movementY				= 0;
	this.acceleration			= 5;
	this.friction				= 0.9;
	this.moveSpeed				= 2.5
	
	this.sprite					= new Texture(this.pos, this.size, 'rgba(0, 0, 0, 0.4)', 1, 'black');
}

Player.prototype.Clamp = function (value, min, max) {
	return (value < min) ? min : ((value > max) ? max : value);
};

Player.prototype.SetPos = function (pos) {
	this.pos = pos;
};

Player.prototype.GetInput = function () {

	// Horizontal Movement
	if (Input.Keys.GetKey(Input.Keys.A)) {
		this.movementX	= -1.0;
	} else if (Input.Keys.GetKey(Input.Keys.D)) {
		this.movementX	= 1.0;
	}

	if (Input.Keys.GetKey(Input.Keys.W)) {
			this.movementY 	= -1.0;
	} else if (Input.Keys.GetKey(Input.Keys.S)) {
			this.movementY 	= 1.0;
	}

	this.isJumping = (Input.Keys.GetKey(Input.Keys.SPACE));

};

Player.prototype.HandleCollision = function () {
	var bounds, i, line, b, slope, y, xDiff, water, shouldPlayWalkSound, waterIntersect;

	bounds				= new Rectangle(this.pos.x, this.pos.y, this.size.x, this.size.y);

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

};

Player.prototype.ApplyPhysics = function (gameTime) {
	this.velocity.x += this.movementX * this.acceleration;
	this.velocity.y += this.movementY * this.acceleration;

	this.velocity.x *= this.friction;
	this.velocity.y *= this.friction;

	this.velocity.x = this.Clamp(this.velocity.x, -this.moveSpeed, this.moveSpeed);
	this.velocity.y = this.Clamp(this.velocity.y, -this.moveSpeed, this.moveSpeed);

	this.pos.x += this.velocity.x;
	this.pos.y += this.velocity.y;	
	this.pos	= new Vector2(Math.round(this.pos.x), Math.round(this.pos.y));

	this.HandleCollision();
};

Player.prototype.update = function (gameTime) {
	var runSpeed;

	this.GetInput();
	this.ApplyPhysics(gameTime);

	// Update the player
	this.sprite.update(this.pos);
	
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
	this.levelBG 			= new Texture(new Vector2(0, 0), new Vector2(main.WORLD_WIDTH, main.WORLD_HEIGHT), '#221B25', 0, '');
	this.lines				= [];
	this.player				= {};
	this.escapeLocked		= false;
	this.camera 			= new Camera();
	this.cameraPos			= new Vector2(0, 0);
}

Level.prototype.Initialize = function () {
	this.player		= new Player(this);
	this.camera.moveTo(this.player.x, this.player.y);
	this.LoadLines();
};

Level.prototype.Dispose = function () {
	this.lines				= [];
	this.player				= {};
};

Level.prototype.LoadLines = function () {

	// WORLD BORDERS
	this.lines.push(new Line(new Vector2(0, 0), new Vector2(main.WORLD_WIDTH, 0), '#999999', 'CEILING', 1));	//TOP
	this.lines.push(new Line(new Vector2(main.WORLD_WIDTH, 0), new Vector2(main.WORLD_WIDTH, main.WORLD_HEIGHT), '#999999', 'WALL', -1));	// RIGHT
	this.lines.push(new Line(new Vector2(0, main.WORLD_HEIGHT), new Vector2(main.WORLD_WIDTH, main.WORLD_HEIGHT), '#999999', 'FLOOR', -1)); // BOTTOM
	this.lines.push(new Line(new Vector2(0, 0), new Vector2(0, main.WORLD_HEIGHT), '#999999', 'WALL', 1));		// LEFT

	this.lines.push(new Line(new Vector2(500, 30), new Vector2(600, 30), "#9F0313", "FLOOR", -1, "NONE"));
	this.lines.push(new Line(new Vector2(600, 30), new Vector2(600, 130), "#9F0313", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(500, 130), new Vector2(600, 130), "#9F0313", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(500, 30), new Vector2(500, 130), "#9F0313", "WALL", -1, "NONE"));

	this.lines.push(new Line(new Vector2(500, 200), new Vector2(600, 200), "#9F0313", "FLOOR", -1, "NONE"));
	this.lines.push(new Line(new Vector2(600, 200), new Vector2(600, 300), "#9F0313", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(500, 300), new Vector2(600, 300), "#9F0313", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(500, 200), new Vector2(500, 300), "#9F0313", "WALL", -1, "NONE"));

	this.lines.push(new Line(new Vector2(500, 500), new Vector2(600, 500), "#9F0313", "FLOOR", -1, "NONE"));
	this.lines.push(new Line(new Vector2(600, 500), new Vector2(600, 600), "#9F0313", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(500, 600), new Vector2(600, 600), "#9F0313", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(500, 500), new Vector2(500, 600), "#9F0313", "WALL", -1, "NONE"));

	this.lines.push(new Line(new Vector2(500, 1000), new Vector2(800, 1000), "#9F0313", "FLOOR", -1, "NONE"));
	this.lines.push(new Line(new Vector2(800, 1000), new Vector2(800, 1100), "#9F0313", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(500, 1100), new Vector2(800, 1100), "#9F0313", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(500, 1000), new Vector2(500, 1100), "#9F0313", "WALL", -1, "NONE"));

	this.lines.push(new Line(new Vector2(500, 2000), new Vector2(800, 2000), "#9F0313", "FLOOR", -1, "NONE"));
	this.lines.push(new Line(new Vector2(800, 2000), new Vector2(800, 2100), "#9F0313", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(500, 2100), new Vector2(800, 2100), "#9F0313", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(500, 2000), new Vector2(500, 2100), "#9F0313", "WALL", -1, "NONE"));

	this.lines.push(new Line(new Vector2(1000, 200), new Vector2(2000, 200), "#9F0313", "FLOOR", -1, "NONE"));
	this.lines.push(new Line(new Vector2(2000, 200), new Vector2(2000, 300), "#9F0313", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1000, 300), new Vector2(2000, 300), "#9F0313", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1000, 200), new Vector2(1000, 300), "#9F0313", "WALL", -1, "NONE"));

	this.lines.push(new Line(new Vector2(1000, 750), new Vector2(2000, 750), "#9F0313", "FLOOR", -1, "NONE"));
	this.lines.push(new Line(new Vector2(2000, 750), new Vector2(2000, 1050), "#9F0313", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1000, 1050), new Vector2(2000, 1050), "#9F0313", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1000, 750), new Vector2(1000, 1050), "#9F0313", "WALL", -1, "NONE"));

	this.lines.push(new Line(new Vector2(1000, 1750), new Vector2(2000, 1750), "#9F0313", "FLOOR", -1, "NONE"));
	this.lines.push(new Line(new Vector2(2000, 1750), new Vector2(2000, 2000), "#9F0313", "WALL", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1000, 2000), new Vector2(2000, 2000), "#9F0313", "CEILING", 1, "NONE"));
	this.lines.push(new Line(new Vector2(1000, 1750), new Vector2(1000, 2000), "#9F0313", "WALL", -1, "NONE"));

};

Level.prototype.update = function () {
	var cameraPosX, cameraPosY;

	this.player.update();

	cameraPosX = this.player.pos.x - (main.CANVAS_WIDTH / 2);
	cameraPosY = this.player.pos.y - (main.CANVAS_HEIGHT / 2);

	if (cameraPosX < 0) {
		cameraPosX = 0;
	} else if (cameraPosX > (main.WORLD_WIDTH - main.CANVAS_WIDTH)) {
		cameraPosX = main.WORLD_WIDTH - main.CANVAS_WIDTH;
	}

	if (cameraPosY < 0) {
		cameraPosY = 0;
	} else if (cameraPosY > (main.WORLD_HEIGHT - main.CANVAS_HEIGHT)) {
		cameraPosY = main.WORLD_HEIGHT - main.CANVAS_HEIGHT;
	}

	this.camera.moveTo(cameraPosX, cameraPosY);

};

Level.prototype.draw = function () {
	var l;

	this.camera.begin();

	this.levelBG.draw();

	// Draw Collision Map
	for (l = 0; l < this.lines.length; l++) {
		this.lines[l].draw();
	}
	
	this.player.draw();

	this.camera.end();

};

/***********************
*****  GAME CLASS  *****
***********************/
function Game () {
	this.isRunning				= true;
	this.fps					= 0;
	this.level					= new Level();

	// Initialize
	GameTime.update();
	this.level.Initialize();
}

Game.prototype.update = function () {
	this.fps = fps.getFPS();
	this.level.update();
};

Game.prototype.draw = function () {
	main.context.clearRect(0, 0, main.CANVAS_WIDTH, main.CANVAS_HEIGHT);	
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
		this.CANVAS_WIDTH			= 1080;
		this.CANVAS_HEIGHT			= 720;
		this.WORLD_WIDTH 			= 4320;
		this.WORLD_HEIGHT 			= 2160;
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