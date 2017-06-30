/**********************
*****  ULILITIES  *****
**********************/

var Vector2 = function(x, y) {
    this.x = x;
    this.y = y;
};

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function SecondsToTime (sec) {
	var h, m, s;
	s = Number(sec);
	h = Math.floor(s / 3600);
	m = Math.floor(s % 3600 / 60);
	s = Math.floor(s % 3600 % 60);
	return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

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
	this.halfSize = new Vector2((this.width / 2), (this.height / 2));
}

/***********************
*****  LINE CLASS  *****
***********************/
function Line (startPos, endPos, color, collision, normal, sound, region) {
	this.startPos = startPos;
	this.endPos = endPos;
	this.color = color;
	this.collision = collision;
	this.normal = normal;
	this.sound = sound;
	this.region = region;
}

Line.prototype.draw = function () {
	main.context.save();
	main.context.lineWidth = 2;
	main.context.strokeStyle = (typeof this.color === 'undefined') ? '#00FF88' : this.color;
	main.context.beginPath();
	main.context.moveTo(this.startPos.x, this.startPos.y);
	main.context.lineTo(this.endPos.x, this.endPos.y);
	main.context.stroke();
	main.context.closePath();
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

/*******************************************
**************  CAMERA CLASS  **************
*******************************************/
function Camera () {
	this.distance	= 0.0;
	this.lookat	= [0, 0];
	this.fieldOfView = Math.PI / 4.0;
	this.viewport = {
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
		this.aspectRatio = main.CANVAS_WIDTH / main.CANVAS_HEIGHT;
		this.viewport.width = this.distance * Math.tan(this.fieldOfView);
		this.viewport.height = this.viewport.width / this.aspectRatio;
		this.viewport.left = this.lookat[0] - (this.viewport.width / 2.0);
		this.viewport.top = this.lookat[1] - (this.viewport.height / 2.0);
		this.viewport.right = this.viewport.left + this.viewport.width;
		this.viewport.bottom = this.viewport.top + this.viewport.height;
		this.viewport.scale[0] = main.CANVAS_WIDTH / this.viewport.width;
		this.viewport.scale[1] = main.CANVAS_HEIGHT / this.viewport.height;
	},
	zoomTo: function (z) {
		this.distance = z;
		this.updateViewport();
	},
	moveTo: function (x, y) {
		this.lookat[0] = x;
		this.lookat[1] = y;
		this.updateViewport();
		main.draw();
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

// Usable images
var images = [
	['LEVEL_1.png', 1024, 590],
	['LEVEL_3.jpg', 839, 393],
	['LEVEL_4.jpg', 1920, 1080],
	['LEVEL_4_Sized.jpg', 1280, 720],
	['LEVEL_5.jpg', 1200, 675],
	['LEVEL_6.jpg', 1280, 720],
	['halloween_by_unidcolor-d5h7jmg4.jpg', 3600, 1050],
	['Proxima.png', 3840, 1080]
];

/*****************
*****  MAIN  *****
*****************/
var main = {
	init: function () {
		this.CANVAS_WIDTH = 1280;
		this.CANVAS_HEIGHT = 720;
		this.WORLD_WIDTH = 1280;
		this.WORLD_HEIGHT = 720;
		this.canvas = document.getElementById('canvas');
		this.jCanvas = $('#canvas');
		this.canvas.width = this.CANVAS_WIDTH;
		this.canvas.height = this.CANVAS_HEIGHT;
		this.context = this.canvas.getContext('2d');
		this.camera = new Camera();
		this.cameraPos = new Vector2(0, 0);
		this.showBackground = true;
		this.showGrid = false;
		this.allowSnapping = true;
		this.showLines = true;
		this.background = undefined;
		this.grid = [];
		this.gridSize = 500;
		this.lines = [];
		this.lineType = 'FLOOR';
		this.lineNormal = -1;

		this.selected_tool = 'normal';
		this.isMouseDown = false;
		this.isSpaceDown = false;
		this.isCtrlDown = false;
		this.previousMousePos = new Vector2(0, 0);

		this.canvasSizeInfo = $('#canvasSize');
		this.wrapper = $('#wrapper');
		this.content = $('#content');

		// this.wrapper.css('width', this.CANVAS_WIDTH);
		this.content.css({'width': this.CANVAS_WIDTH, 'height': this.CANVAS_HEIGHT});
		this.canvasSizeInfo.text(this.WORLD_WIDTH + 'x, ' + this.WORLD_HEIGHT + 'y');

		// Event Handlers
		this.canvas.addEventListener('mousedown', function (e) { main.input.onMouseDown(e); }, false);
		this.canvas.addEventListener('mouseup', function (e) { main.input.onMouseUp(e); }, false);
		this.canvas.addEventListener('mousemove', function (e) { main.input.onMouseMove(e); }, false);
		document.addEventListener('keydown', function (e) { main.input.onKeyDown(e); }, false);
		document.addEventListener('keyup', function (e) { main.input.onKeyUp(e); }, false);
		$('#background #img').on('change', main.bg.onImgChange);
		$('#properties .checkboxes').on('change', main.toolBox.properties.onChange);
		$('#collision .lineType').on('click', main.toolBox.collision.onLineTypeChange);
		$('#loadBtn').on('click', main.toolBox.load.init);
		$('#exportBtn').on('click', main.toolBox.export.output);
		$('#resetBtn').on('click', main.toolBox.reset);

		// Initialize
		main.LoadGrid();
		main.bg.LoadImageOptions();
		this.camera.moveTo(this.cameraPos.x, this.cameraPos.y);
		setTimeout(function () { main.draw(); }, 1000);	// Hack to get around the fact that the image isn't loaded right away.
	},
	LoadGrid: function () {
		var x, y;

		this.grid = [];

		for (y = 0; y < Math.ceil(main.CANVAS_HEIGHT / main.gridSize); y++) {
			for (x = 0; x < Math.ceil(main.CANVAS_WIDTH / main.gridSize); x++) {
				this.grid.push(new Texture(new Vector2(x * main.gridSize, y * main.gridSize), new Vector2(main.gridSize, main.gridSize), 'transparent', 1, '#222222'));
			}
		}
	},
	bg: {
		LoadImageOptions: function () {
			var imgSelect, i, filename;
			imgSelect = $('#background #img');
			for (i = 0; i < images.length; i++) {
				filename = images[i][0].split('.');
				filename = filename[0];
				imgSelect.append(
					$('<option />')
						.data({width: images[i][1], height: images[i][2]})
						.val(images[i][0])
						.html(filename)
				);
			}

			// trigger a change event
			imgSelect.trigger('change');
		},
		onImgChange: function () {
			var that, selected, val, width, height, docWidth, docHeight;
			that = $(this);
			selected = that.find('option:selected');
			val = that.val();
			// Trigger a blur on the select box
			that.trigger('blur');

			// If this is the first time, create the background sprite.
			// Else, set the background image of our sprite
			if (typeof main.background === 'undefined') {
				main.background = new Sprite('images/' + val, new Vector2(0, 0));
			} else {
				main.background.SetImage('images/' + val);
			}

			// Reset some variables
			main.lines = [];
			this.grid = [];

			width = selected.data('width');
			height = selected.data('height');
			docWidth = $(document).width() - 301;
			docHeight = $(document).height() - 5;
			
			// Reset Dimensions
			main.WORLD_WIDTH = width;
			main.WORLD_HEIGHT = height;
			main.CANVAS_WIDTH = (main.WORLD_WIDTH > docWidth) ? docWidth : main.WORLD_WIDTH;
			main.CANVAS_HEIGHT = (main.WORLD_HEIGHT > docHeight) ? docHeight : main.WORLD_HEIGHT;
			// Apply dimensions
			main.canvas.width = main.CANVAS_WIDTH;
			main.canvas.height = main.CANVAS_HEIGHT;
			main.canvasSizeInfo.text(width + 'x, ' + height + 'y');
			main.camera.updateViewport();
			setTimeout(function () { main.draw(); }, 1000);
			main.LoadGrid();
		}
	},
	input: {
		currentLine: undefined,
		lastEndPos: undefined,
		keys: [],
		onMouseDown: function (e) {
			var x, y;
			x = e.offsetX;
			y = e.offsetY;
			// Correct the mouse positioning if the canvas has been panned
			x = (x + main.cameraPos.x);
			y = (y + main.cameraPos.y);

			main.isMouseDown = true;

			// Only proceed if the space bar isn't down
			if (!main.isSpaceDown) {

				// If Control key is down, we're erasing lines
				// Else, we're adding lines
				if (main.isCtrlDown) {
					main.line.erase.line(x, y);
				} else {
					main.line.add(x, y);
				}

			}
		},
		onMouseUp: function () {
			main.isMouseDown = false;
		},
		onMouseMove: function (e) {
			var x, y, xPanned, yPanned;
			x = e.offsetX;
			y = e.offsetY;
			xPanned = x + main.cameraPos.x;
			yPanned = y + main.cameraPos.y;

			// Update info with mouse coordinates (taking camera pannging into account)
			$('#mouseX').text(xPanned);
			$('#mouseY').text(yPanned);

			// If space bar is pressed and left mouse button is being clicked, pan the canvas
			// else if left mouse button is pressed, update lines
			if (main.isSpaceDown && main.isMouseDown) {
				main.fnCamera.pan(x, y, xPanned, yPanned);
			}

			// Set the current coordinates to our previous variable
			main.previousMousePos = new Vector2(x, y);

			// If we've started a line, update the end position so we can see it real-time
			if (typeof main.input.currentLine !== 'undefined') {
				main.line.showEnd(xPanned, yPanned);
			}
		},
		onKeyDown: function (e) {
			var key;
			key = e.key;

			main.input.keys[key] = true;

			// Undo the last line
			if (main.input.keys['Control'] && main.input.keys['z']) {
				main.line.erase.lastLine();
				main.draw();
			} else if (main.input.keys['Control']) {
				main.isCtrlDown = true;
				main.jCanvas.addClass('erase');
			} else if (main.input.keys[' ']) {
				main.isSpaceDown = true;
				main.jCanvas.addClass('move');
			}

		},
		onKeyUp: function (e) {
			var key;
			key = e.key;
			main.input.keys[key] = false;

			if (key === 'Control') {
				main.isCtrlDown = false;
				main.jCanvas.removeClass('erase');
			} else if (key === ' ') {
				main.isSpaceDown = false;
				main.jCanvas.removeClass('move');
			}

		}
	},
	fnCamera: {
		pan: function (x, y, xPanned, yPanned) {
			var mouseXDiff, mouseYDiff;
			// Get the difference between current mouse position and previous
			mouseXDiff = x - main.previousMousePos.x;
			mouseYDiff = y - main.previousMousePos.y;
			// apply the difference to the camera position variable
			main.cameraPos.x -= mouseXDiff;
			main.cameraPos.y -= mouseYDiff;
			
			// Ensure camera panning doesn't go past world bounds
			if (main.cameraPos.x <= 0)
				main.cameraPos.x = 0;
			else if ((main.cameraPos.x + main.CANVAS_WIDTH) > main.WORLD_WIDTH)
				main.cameraPos.x = main.WORLD_WIDTH - main.CANVAS_WIDTH;

			if (main.cameraPos.y <= 0)
				main.cameraPos.y = 0;
			else if ((main.cameraPos.y + main.CANVAS_HEIGHT) > main.WORLD_HEIGHT)
				main.cameraPos.y = main.WORLD_HEIGHT - main.CANVAS_HEIGHT;

			// update the camera (the Camera.moveTo function calls Camera.updateViewport where main.draw() is called)
			main.camera.moveTo(main.cameraPos.x, main.cameraPos.y);
		}
	},
	line: {
		add: function (x, y) {
			var lineType, lineNormal, lineSound, lineColor, dX, dY, coordDiff, regionX, regionY, region, startPos, endPos;

			lineType = $('.lineType.active').text();
			lineSound = $('#lineSound').val();

			if (typeof main.input.currentLine === 'undefined') {
				// Begin creating our new line
				lineNormal = $('#lineNormal').val();
				lineColor = (lineType === 'FLOOR') ? '#9F0313' : (lineType === 'CEILING' ? '#0E72D5' : '#02AA30');
				coordDiff = 6;
				// If we're allowing snapping and our click was within 5 pixels of our last line's endPos, snap it.
				if (main.allowSnapping && typeof main.input.lastEndPos !== 'undefined') {
					dX = (main.input.lastEndPos.x - x);
					dY = (main.input.lastEndPos.y - y);
					coordDiff = Math.sqrt(dX*dX + dY*dY);
				}
				// If the difference is less than specified, snap it.
				if (coordDiff <= 5) {
					startPos = new Vector2(main.input.lastEndPos.x, main.input.lastEndPos.y);
				} else {
					startPos = new Vector2(x, y);
				}

				main.input.currentLine = new Line(startPos, new Vector2(x, y), lineColor, lineType, lineNormal, lineSound);
			} else {
				// Our walls need to be completely vertical.
				if (lineType === 'WALL') {
					endPos = new Vector2(main.input.currentLine.startPos.x, y);
				} else {
					endPos = new Vector2(x, y);
				}

				// We need to make sure the lines are going in the proper direction.
				// If the start position (x,y) is greater than the end position, switch them
				if (main.input.currentLine.startPos.x > endPos.x || (lineType === 'WALL' && main.input.currentLine.startPos.y > endPos.y)) {
					main.input.currentLine.endPos = main.input.currentLine.startPos;
					main.input.currentLine.startPos = endPos;
				} else {
					main.input.currentLine.endPos = endPos;
				}

				// Based on the line's start position, calculate what region it's in
				regionX = Math.floor(main.input.currentLine.startPos.x / main.gridSize); 
				regionY = Math.floor(main.input.currentLine.startPos.y / main.gridSize)
				region = new Vector2(regionX, regionY);
				main.input.currentLine.region = region;

				// Push our new line to the lines array, then reset our currentLine variable
				main.lines.push(main.input.currentLine);
				main.input.currentLine = undefined;
				main.input.lastEndPos = endPos;
				main.draw();
			}

			// UPDATE INFO
			$('#lastPointX').text(x);
			$('#lastPointY').text(y);
		},
		showEnd: function (xPanned, yPanned) {
			if (main.input.currentLine.collision === 'WALL') xPanned = main.input.currentLine.startPos.x;	// Walls can only be perfectly vertical
			main.input.currentLine.endPos = new Vector2(xPanned, yPanned);
			main.draw();
		},
		erase: {
			line: function (x, y) {
				var l, line, slope, b, yc, bounds, eraseLine;

				bounds = new Rectangle(x-5, y-5, 10, 10);	// give a 10 pixel buffer and offset it so the click point is the center
				eraseLine = false;

				// Loop through lines and figure out whether or not we're intersecting
				for (l = 0; l < main.lines.length; l++) {

					line = main.lines[l];

					if ((line.collision == 'FLOOR' || line.collision == 'CEILING') && bounds.center.x >= line.startPos.x && bounds.center.x <= line.endPos.x) {

						slope = (line.endPos.y - line.startPos.y) / (line.endPos.x - line.startPos.x);
						b = line.startPos.y - (slope * line.startPos.x);
						yc = (slope * bounds.center.x) + b;

						if (Math.abs(yc - bounds.center.y) <= bounds.halfSize.y) {
							eraseLine = true;
						}

					} else if (line.collision == 'WALL' && bounds.center.y > line.startPos.y && bounds.center.y < line.endPos.y) {

						xDiff = Math.abs(bounds.center.x - line.startPos.x);

						if (xDiff <= bounds.halfSize.x) {
							eraseLine = true;
						}

					}

					// If we clicked on a line, remove it from the array and re-draw
					if (eraseLine) {
						main.lines.splice(l, 1);
						main.draw();
						break; // no sense in continuing loop
					}

				}

			},
			lastLine: function () {
				// If we've just completed a line, delete the last node of the main lines array. Else, cancel the current line in progress.
				if (typeof main.input.currentLine === 'undefined' && main.lines.length > 0) {
					main.lines.pop();
				} else {
					main.input.currentLine = undefined;
				}
			}
		}
	},
	toolBox: {
		properties: {
			onChange: function () {
				var that, val, isChecked;
				that = $(this);
				val = that.val();
				isChecked = (that.is(':checked'));

				if (val === 'background') {
					main.showBackground = isChecked;
				} else if (val === 'grid') {
					main.showGrid = isChecked;
				} else if (val === 'snap') {
					main.allowSnapping = isChecked;
				} else if (val === 'lines') {
					main.showLines = isChecked;
				}

				main.draw();

			}
		},
		collision: {
			onLineTypeChange: function () {
				var that, val, lineNormal, lineSound;
				that = $(this);
				val = that.text();
				lineNormal = $('#lineNormal');
				lineSound = $('#lineSound');

				$('#collision .lineType.active').removeClass('active');
				that.addClass('active');

				if (val === 'FLOOR') {
					lineNormal.attr({'readonly': true, 'disabled': true});
					lineNormal.val(-1);
					lineSound.attr({'readonly': false, 'disabled': false});
					lineSound.val('WOOD');
				} else if (val === 'CEILING') {
					lineNormal.attr({'readonly': true, 'disabled': true});
					lineNormal.val(1);
					lineSound.attr({'readonly': true, 'disabled': true});
					lineSound.val('');
				} else {
					lineNormal.attr({'readonly': false, 'disabled': false});
					lineNormal.val(1);
					lineSound.attr({'readonly': true, 'disabled': true});
					lineSound.val('');
				}
			}
		},
		dialog: {
			show: function (data) {
				var dialog, headerArea, contentArea, saveBtn, cancelBtn, overlay, title, content, showSaveBtn, mainColor;

				title = (typeof data.title === 'undefined') ? 'DIALOG' : data.title;
				content = (typeof data.content === 'undefined') ? '' : data.content;
				showSave = (typeof data.showSave === 'undefined') ? false : data.showSave;
				mainColor = (title === 'LOAD') ? '#C68A0D' : (title === 'EXPORT' ? '#11BE41' : '#F11B2B');

				dialog = $('#dialog');
				headerArea = $('#dialogHeader');
				headerArea.css('background-color', mainColor);
				contentArea = $('#dialogTextarea');
				saveBtn = $('#dialogSaveBtn');
				saveBtn.css('background-color', mainColor);
				closeBtn = $('#dialogCloseBtn');
				overlay = $('#dialogOverlay');

				if (showSave) {
					saveBtn.on('click', main.toolBox.load.save);
					saveBtn.show();
				} else {
					saveBtn.hide();
				}

				headerArea.text(title);
				contentArea.val(content);

				closeBtn.on('click', main.toolBox.dialog.close);
				dialog.fadeIn(200);
				overlay.fadeIn(200);

			},
			close: function () {
				$('#dialog').fadeOut(200);
				$('#dialogOverlay').fadeOut(200);
			}
		},
		load: {
			init: function () {
				main.toolBox.dialog.show({title: 'LOAD', showSave: true});
			},
			save: function () {
				var content, val, newarr, l;
				content = $('#dialogTextarea');
				val = content.val();

				if (val.length === 0) {
					content.css('background-color', '#FF9999');
				} else {

					newarr = JSON.parse(val);

					main.lines = [];	// reset
					for (l = 0; l < newarr.length; l++) {
						main.lines.push(new Line(new Vector2(newarr[l].sx , newarr[l].sy), new Vector2(newarr[l].ex , newarr[l].ey), newarr[l].h, newarr[l].c, newarr[l].n, newarr[l].s, new Vector2(newarr[l].rx, newarr[l].ry)));	//startPos, endPos, color, collision, normal, sound, region
					}

				}

				main.toolBox.dialog.close();
				main.draw();

			}
		},
		export : {
			output: function () {
				var l, line, newarr = [], stringified = '';

				if (main.lines.length > 0) {

					for (l = 0; l < main.lines.length; l++) {
						line = main.lines[l];

						newarr.push({
							sx: line.startPos.x,
							sy: line.startPos.y,
							ex: line.endPos.x,
							ey: line.endPos.y,
							c: line.collision,
							n: line.normal,
							s: line.sound,
							h: line.color,
							rx: line.region.x,
							ry: line.region.y
						});
					}

					stringified = JSON.stringify(newarr);

					main.toolBox.dialog.show({title: 'EXPORT', content: stringified, showSave: false});

				}
			}
		},
		reset: function () {
			main.lines = [];
			main.input.currentLine = undefined;
			$('#dialogTextarea').val('');
			$('#lastPointX').text(0);
			$('#lastPointY').text(0);
			main.draw();
		}
	},
	draw: function () {
		var g, l;
		main.context.clearRect(0, 0, main.CANVAS_WIDTH, main.CANVAS_HEIGHT);

		main.camera.begin();
		
		if (typeof main.background !== 'undefined' && main.showBackground) main.background.draw();
		if (main.showGrid) {
			for (g = 0; g < main.grid.length; g++) {
				main.grid[g].draw();
			}
		}
		if (main.showLines) {
			for (l = 0; l < main.lines.length; l++) {
				main.lines[l].draw();
			}

			if (typeof main.input.currentLine !== 'undefined') {
				main.input.currentLine.draw();
			}
		}

		main.camera.end();
	}
};