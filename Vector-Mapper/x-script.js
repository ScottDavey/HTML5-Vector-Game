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

// Usable images
var images = [
	['LEVEL_1.png', 1024, 590],
	['LEVEL_3.jpg', 839, 393],
	['LEVEL_4.jpg', 1920, 1080],
	['LEVEL_4_Sized.jpg', 1280, 720],
	['LEVEL_5.jpg', 1200, 675],
	['LEVEL_6.jpg', 1280, 720]
];

/*****************
*****  MAIN  *****
*****************/
var main = {
	init: function () {
		var wrapper, header, content, canvasSize;
		this.CANVAS_WIDTH = 1280;
		this.CANVAS_HEIGHT = 720;
		this.canvas = document.getElementById('canvas');
		this.canvas.width = this.CANVAS_WIDTH;
		this.canvas.height = this.CANVAS_HEIGHT;
		this.context = this.canvas.getContext('2d');
		this.showBackground = true;
		this.showGrid = false;
		this.allowSnapping = true;
		this.showLines = true;
		this.background = new Sprite('images/LEVEL_4_Sized.jpg', new Vector2(0, 0), new Vector2(main.CANVAS_WIDTH, main.CANVAS_HEIGHT));
		this.grid = [];
		this.lines = [];
		this.lineType = 'FLOOR';
		this.lineNormal = -1;

		// Adjust sizes
		wrapper = $('#wrapper');
		header = $('#header');
		content = $('#content');
		canvasSize = $('#canvasSize');

		wrapper.css('width', this.CANVAS_WIDTH + 300);
		header.css('width', this.CANVAS_WIDTH + 300);
		content.css({'width': this.CANVAS_WIDTH, 'height': this.CANVAS_HEIGHT, 'margin-top': (800 - this.CANVAS_HEIGHT) / 2});
		canvasSize.text(this.CANVAS_WIDTH + 'x, ' + this.CANVAS_HEIGHT + 'y');

		// Event Handlers
		this.canvas.addEventListener('mousedown', function (e) { main.input.onMouseClick(e); }, false);
		this.canvas.addEventListener('mousemove', function (e) { main.input.onMouseMove(e); }, false);
		document.addEventListener('keydown', function (e) { main.input.onKeyDown(e); }, false);
		document.addEventListener('keyup', function (e) { main.input.onKeyUp(e); }, false);
		$('#visibility .checkboxes').on('change', main.visibility.onChange);
		$('#properties .lineType').on('click', main.properties.onLineTypeChange);
		$('#properties .lineSound').on('click', main.properties.onLineSoundChange);
		$('#loadBtn').on('click', main.load.init);
		$('#exportBtn').on('click', main.export.output);
		$('#resetBtn').on('click', main.reset);
		$('#instructionsBtn').on('click', main.instructions.init);

		// Initialize
		main.LoadGrid();
		setTimeout(function () { main.draw(); }, 500);	// Hack to get around the fact that the image isn't loaded right away.
	},
	LoadGrid: function () {
		var x, y, square;
		square = 20;

		for (y = 0; y < Math.ceil(main.CANVAS_HEIGHT / square); y++) {
			for (x = 0; x < Math.ceil(main.CANVAS_WIDTH / square); x++) {
				this.grid.push(new Texture(new Vector2(x * square, y * square), new Vector2(square, square), 'transparent', 1, '#222222'));
			}
		}
	},
	input: {
		currentLine: undefined,
		lastEndPos: undefined,
		keys: [],
		onMouseClick: function (e) {
			var x, y, lineType, lineNormal, lineSound, lineColor, dX, dY, coordDiff, startPos, endPos;
			x = e.offsetX;
			y = e.offsetY;
			lineType = $('.lineType.active').text();
			lineSound = (lineType === 'FLOOR') ? $('.lineSound.active').text() : 'NONE';

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

				main.lines.push(main.input.currentLine);
				main.input.currentLine = undefined;
				main.input.lastEndPos = endPos;
				main.draw();
			}

			// UPDATE INFO
			$('#lastPointX').text(x);
			$('#lastPointY').text(y);
		},
		onMouseMove: function (e) {
			var x, y;
			x = e.offsetX;
			y = e.offsetY;

			// Update info with mouse coordinates
			$('#mouseX').text(x);
			$('#mouseY').text(y);

			// If we've started a line, update the end position so we can see it real-time
			if (typeof main.input.currentLine !== 'undefined') {
				if (main.input.currentLine.collision === 'WALL') x = main.input.currentLine.startPos.x;	// Walls can only be perfectly vertical
				main.input.currentLine.endPos = new Vector2(x, y);
				main.draw();
			}
		},
		onKeyDown: function (e) {
			var key;
			key = e.key;

			main.input.keys[key] = true;

			// Undo the last line
			if (main.input.keys['Control'] && main.input.keys['z']) {
				// If we've just completed a line, delete the last node of the main lines array. Else, cancel the current line in progress.
				if (typeof main.input.currentLine === 'undefined' && main.lines.length > 0) {
					main.lines.pop();
				} else {
					main.input.currentLine = undefined;
				}

				main.draw();
			}

		},
		onKeyUp: function (e) {
			var key;
			key = e.key;
			main.input.keys[key] = false;
		}
	},
	visibility: {
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
	properties: {
		onLineTypeChange: function () {
			var that, val, lineNormal, lineSounds, isLineSoundInactive;
			that = $(this);
			val = that.text();
			lineNormal = $('#lineNormal');
			lineSounds = $('#properties .lineSound');
			isLineSoundInactive	= lineSounds.is('.inactive');

			$('#properties .lineType.active').removeClass('active');
			that.addClass('active');

			if (val === 'FLOOR') {
				lineNormal.attr({'readonly': true, 'disabled': true});
				lineNormal.val(-1);
			} else if (val === 'CEILING') {
				lineNormal.attr({'readonly': true, 'disabled': true});
				lineNormal.val(1);
			} else {
				lineNormal.attr({'readonly': false, 'disabled': false});
				lineNormal.val(1);
			}

			// Set Line Sound buttons to active or inactive (active if it's on floor line type)
			if (val === 'FLOOR' && isLineSoundInactive) {
				lineSounds.removeClass('inactive');
			} else if (val !== 'FLOOR' && !isLineSoundInactive) {
				lineSounds.addClass('inactive');
			}

		},
		onLineSoundChange: function () {
			var that, val, isInactive;
			that = $(this);
			val = that.text();
			isInactive = that.hasClass('inactive');

			if (!isInactive) {
				$('#properties .lineSound.active').removeClass('active');
				that.addClass('active');
			}
		}
	},
	dialog: {
		show: function (data) {
			var dialog, headerArea, contentArea, saveBtn, cancelBtn, overlay, title, content, showSaveBtn;

			dialog = $('#dialog');
			headerArea = $('#dialogHeader');
			contentArea = $('#dialogTextarea');
			saveBtn = $('#dialogSaveBtn');
			closeBtn = $('#dialogCloseBtn');
			overlay = $('#dialogOverlay');
			title = (typeof data.title === 'undefined') ? 'DIALOG' : data.title;
			content = (typeof data.content === 'undefined') ? '' : data.content;
			showSave = (typeof data.showSave === 'undefined') ? false : data.showSave;

			if (showSave) {
				saveBtn.on('click', main.load.save);
				saveBtn.show();
			} else {
				saveBtn.hide();
			}

			headerArea.text(title);
			contentArea.val(content);

			closeBtn.on('click', main.dialog.close);
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
			main.dialog.show({'title': 'LOAD', 'showSave': true});
		},
		save: function () {
			var content, contentSplit, tempo, tempoSplit, j;

			content = $('#dialogTextarea').val();
			contentSplit = content.split(';');

			main.reset();

			$(contentSplit).each(function (i, val) {
				tempo = val.replace('this.lines.push', '');
				tempo = val.replace('new Line', '');
				tempo = val.replace(/new Vector2/g, '');
				tempo = tempo.replace(/\#/g, '');
				tempo = tempo.replace(/\"/g, '');
				tempo = tempo.replace(/\(/g, '');
				tempo = tempo.replace(/\)/g, '');
				tempo = tempo.replace(/\;/g, '');
				tempo = tempo.replace('this.lines.pushnew Line', '');
				tempo = tempo.replace(/ /g, '');
				tempoSplit = tempo.split(',');

				main.lines.push(new Line(new Vector2(tempoSplit[0], tempoSplit[1]), new Vector2(tempoSplit[2], tempoSplit[3]), '#' + tempoSplit[4], tempoSplit[5], tempoSplit[6]));
			});

			main.dialog.close();
			main.draw();

		}
	},
	export : {
		output: function () {
			var l, line, startPos, endPos, output;

			output = '';

			for (l = 0; l < main.lines.length; l++) {
				line = main.lines[l];
				startPos	= 'new Vector2(' + line.startPos.x + ', ' + line.startPos.y + ')';
				endPos		= 'new Vector2(' + line.endPos.x + ', ' + line.endPos.y + ')';
				output += 'this.lines.push(new Line(' + startPos + ', ' + endPos + ', "' + line.color + '", "' + line.collision + '", ' + line.normal + ', "' + line.sound + '"));';
				output += '\n';
			}

			main.dialog.show({title: 'EXPORT', 'content': output, 'showSave': false});
		}
	},
	reset: function () {
		main.lines = [];
		main.input.currentLine = undefined;
		$('#dialogTextarea').val('');
		$('#lastPointX').text(0);
		$('#lastPointY').text(0);
		main.draw();
	},
	instructions: {
		init: function () {
			var instructionsDialog, overlay, closeBtn;

			instructionsDialog = $('#instructionsDialog');
			overlay = $('#dialogOverlay');
			closeBtn = $('#instructionsClose');
			
			closeBtn.on('click', main.instructions.close);

			instructionsDialog.fadeIn(200);
			overlay.fadeIn(200);
			
		},
		close: function () {
			$('#instructionsDialog').fadeOut(200);
			$('#dialogOverlay').fadeOut(200);
		}
	},
	draw: function () {
		var g, l;
		main.context.clearRect(0, 0, main.CANVAS_WIDTH, main.CANVAS_HEIGHT);
		if (main.showBackground) main.background.draw();
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
	}
};