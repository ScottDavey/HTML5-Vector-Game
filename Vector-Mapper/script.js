/**********************
*****  ULILITIES  *****
**********************/

const Vector2 = function(x, y) {
    this.x = x;
    this.y = y;
};

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function SecondsToTime (sec) {
	const h = Math.floor(s / 3600);
	const m = Math.floor(s % 3600 / 60);
	const s = Math.floor(Number(sec) % 3600 % 60);
	return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

/****************************
*****  RECTANGLE CLASS  *****
****************************/
class Rectangle {
	
	constructor (x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.left = this.x;
		this.top = this.y;
		this.right = this.x + this.width;
		this.bottom = this.y + this.height;
		this.center = new Vector2((this.x + (this.width/2)), (this.y + (this.height/2)));
		this.halfSize = new Vector2((this.width / 2), (this.height / 2));
	}

	GetIntersectionDepth(rect) {
        const distanceX = this.center.x - rect.center.x;
        const distanceY = this.center.y - rect.center.y;
        const minDistanceX = this.halfSize.x + rect.halfSize.x;
        const minDistanceY = this.halfSize.y + rect.halfSize.y;

        // If we are not intersecting, return (0, 0)
        if (Math.abs(distanceX) >= minDistanceX || Math.abs(distanceY) >= minDistanceY)
            return new Vector2(0, 0);

        // Calculate and return intersection depths
        const depthX = distanceX > 0 ? minDistanceX - distanceX : -minDistanceX - distanceX;
        const depthY = distanceY > 0 ? minDistanceY - distanceY : -minDistanceY - distanceY;

        return new Vector2(depthX, depthY);
    }

}

/***********************
*****  LINE CLASS  *****
***********************/
class Line {
	
	constructor(startPos, endPos, color, collision, normal, sound, region, slope = null, yIntercept = null) {
		this.startPos = startPos;
		this.endPos = endPos;
		this.color = color;
		this.collision = collision;
		this.normal = normal;
		this.sound = sound;
		this.region = region;
		this.slope = slope;
		this.yIntercept = yIntercept;
	}

	draw() {
		main.context.save();
		main.context.lineWidth = 2;
		main.context.strokeStyle = (typeof this.color === 'undefined') ? '#00FF88' : this.color;
		main.context.beginPath();
		main.context.moveTo(this.startPos.x, this.startPos.y);
		main.context.lineTo(this.endPos.x, this.endPos.y);
		main.context.stroke();
		main.context.closePath();
		main.context.restore();
	}

}

/**************************
*****  TEXTURE CLASS  *****
**************************/
class Texture {
	constructor(pos, size, fillColor, lineWidth, lineColor) {
		this.pos = pos;
		this.size = size;
		this.lineWidth = lineWidth;
		this.fillColor = fillColor;
		this.lineColor = lineColor;
	}

	updatePos(pos) {
		this.pos = pos;
	};

	updateSize(size) {
		this.size = size;
	}
	
	updateColor(fillColor, lineColor) {
		this.fillColor = fillColor;
		this.lineColor = lineColor;
	}
	
	draw() {
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

}

/*************************
*****  ENTITY CLASS  *****
*************************/

class Character {
	constructor(position, size, type) {
		this.position = position;
		this.size = size;
		this.type = type;
		this.path = this.getPathByType();
		this.sprite = new Sprite(this.path, this.position, this.size);
	}

	getPathByType() {
		let path;

		switch (this.type) {
			case 'player':
				path = 'images/entities/HoneyBear.png';
				break;
			case 'bear':
				path = 'images/entities/Bear.png';
				break;
			case 'boss':
				path = 'images/entities/Boss.png';
				break;
			case 'beeHive':
				path = 'images/entities/BeeHive.png';
				break;
			default:
				break;
		}

		return path;
	}

	updatePos(pos) {
		this.position = pos;
		this.sprite.updatePos(this.position);
	}

	updateSize(size) {
		this.size = size;
		this.sprite.updateSize(size);
	}

	draw() {
		this.sprite.draw();
	}
}

/**********************************
*****  COLLISION EVENT CLASS  *****
**********************************/

class CollisionEvent {
	constructor(type, name, texture) {
		this.type = type;
		this.name = name;
		this.texture = texture;
	}

	getPos() {
		return this.texture.pos;
	}

	getSize() {
		return this.texture.size;
	}

	updatePos(pos) {
		this.texture.updatePos(pos);
	}

	updateSize(size) {
		this.texture.updateSize(size);
	}

	draw() {
		this.texture.draw();
	}
}

/*************************
*****  SPRITE CLASS  *****
*************************/
class Sprite {

	constructor(path, pos, size) {
		const pathSplit = path.split('/');
		this.filename = pathSplit[pathSplit.length - 1];
		this.pos = pos;
		this.size = size;
		this.img = document.createElement('img');
		this.img.setAttribute('src', path);
	}

	getFilename() {
		return this.filename;
	}

	updateImage(path) {
		this.img.setAttribute('src', path);
	}
	
	updatePos(pos) {
		this.pos = pos;
	}

	updateSize(size) {
		this.size = size;
	}
	
	draw() {
		main.context.drawImage(this.img, this.pos.x, this.pos.y);
	}

}

class Background {

	constructor(path, pos, size, isRepeating = false, parallax = new Vector2(0, 0)) {
		this.path = path;
		this.pos = pos;
		this.size = size;
		this.isRepeating = isRepeating;
		this.parallax = parallax;
		this.sprites = [];

		this.refreshRepeatingSprites();
	}

	getFilename() {
		return this.sprites[0].getFilename();
	}

	getParallax() {
		return this.parallax;
	}

	getRepeat() {
		return this.isRepeating;
	}

	updateImage(path) {
		this.path = path;
		this.refreshRepeatingSprites();
	}

	updatePos(pos) {
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].updatePos(
				new Vector2(
					pos.x + (i * this.size.x),
					pos.y
				)
			);
		}
	}

	updateSize(size) {
		this.size = new Vector2(size.x, size.y);

		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].updateSize(
				new Vector2(
					size.x,
					size.y
				)
			);
		}
	}

	updateParallax(parallax) {
		this.parallax = parallax;
	}

	updateRepeat(isRepeating) {
		this.isRepeating = isRepeating;
		this.refreshRepeatingSprites();
	}

	refreshRepeatingSprites() {
		let numberOfBackgrounds = 1;

		// First delete all sprite before re-creating them
		this.sprites = [];
		
		if (this.isRepeating) {
			numberOfBackgrounds = Math.ceil(main.WORLD_WIDTH / this.size.x);
		}

		for (let i = 0; i < numberOfBackgrounds; i++) {
			this.sprites.push(
				new Sprite(
					this.path,
					new Vector2(this.pos.x + (i * this.size.x), this.pos.y),
					new Vector2(this.size.x, this.size.y)
				)
			);
		}

	}

	draw() {
		for (const sprite of this.sprites) {
			sprite.draw();
		}
	}

}

/*************************
*****  CAMERA CLASS  *****
*************************/
class Camera {
	
	constructor() {
		this.distance = 0.0;
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

	begin() {
		main.context.save();
		this.applyScale();
		this.applyTranslation();
	}
	
	end() {
		main.context.restore();
	}

	applyScale() {
		main.context.scale(this.viewport.scale[0],this.viewport.scale[1]);
	}
	
	applyTranslation() {
		main.context.translate(-this.viewport.left, -this.viewport.top);
	}
		
	updateViewport() {
		this.aspectRatio = main.CANVAS_WIDTH / main.CANVAS_HEIGHT;
		this.viewport.width = this.distance * Math.tan(this.fieldOfView);
		this.viewport.height = this.viewport.width / this.aspectRatio;
		this.viewport.left = this.lookat[0] - (this.viewport.width / 2.0);
		this.viewport.top = this.lookat[1] - (this.viewport.height / 2.0);
		this.viewport.right = this.viewport.left + this.viewport.width;
		this.viewport.bottom = this.viewport.top + this.viewport.height;
		this.viewport.scale[0] = main.CANVAS_WIDTH / this.viewport.width;
		this.viewport.scale[1] = main.CANVAS_HEIGHT / this.viewport.height;
	}

	zoomTo(z) {
		this.distance = z;
		this.updateViewport();
		main.draw();
	}

	moveTo(x, y) {
		this.lookat[0] = x;
		this.lookat[1] = y;
		this.updateViewport();
		main.draw();
	}

	screenToWorld(x, y, obj) {
		obj = obj || {};
		obj.x = (x / this.viewport.scale[0]) + this.viewport.left;
		obj.y = (y / this.viewport.scale[1]) + this.viewport.top;
		return obj;
	}

	worldToScreen(x, y, obj) {
		obj = obj || {};
		obj.x = (x - this.viewport.left) * (this.viewport.scale[0]);
		obj.y = (y - this.viewport.top) * (this.viewport.scale[1]);
		return obj;
	}

}

/*****************
*****  MAIN  *****
*****************/

const main = {
	init: function () {
		this.CANVAS_WIDTH = 0;
		this.CANVAS_HEIGHT = 0;
		this.WORLD_WIDTH = 0;
		this.WORLD_HEIGHT = 0;
		this.initialWorldWidth = 2560;
		this.initialWorldHeight = 1440;
		this.initialViewportWidth = 1280;
		this.initialViewportHeight = 720;
		this.canvas = document.getElementById('canvas');
		this.jCanvas = $('#canvas');
		this.canvas.width = this.CANVAS_WIDTH;
		this.canvas.height = this.CANVAS_HEIGHT;
		this.context = this.canvas.getContext('2d');
		this.isToolBoxShowing = true;
		
		// Initialize
		main.input.init();
		main.camera.init();
		main.modes.init();
		main.finalization.init();
		$('input[type=text]').on('focus', main.autoSelectTextboxContents);	// Automatically select text in a text box
		
		main.loading.toggle(true);
		setTimeout(() => {
			main.draw();
			main.loading.toggle(false);
		}, 1000);
	},
	autoSelectTextboxContents() {
		const thisEl = $(this);
		thisEl.select();
	},
	input: {
		previousMousePos: undefined,
		currentMousePos: undefined,
		isMouseDown: false,
		isSpaceDown: false,
		isCtrlDown: false,
		isShiftDown: false,
		keys: [],
		init() {
			main.input.previousMousePos = new Vector2(0, 0);
			main.canvas.addEventListener('mousedown', e => main.input.onMouseDown(e), false);
			document.getElementById('content').addEventListener('mousemove', e => main.input.onMouseMove(e), false);
			document.addEventListener('mouseup', e => main.input.onMouseUp(e), false);
			document.addEventListener('keydown', e => main.input.onKeyDown(e), false);
			document.addEventListener('keyup', e => main.input.onKeyUp(e), false);
		},
		onMouseDown(e) {
			// Correct the mouse positioning if the canvas has been panned
			const x = (e.offsetX + main.camera.position.x);
			const y = (e.offsetY + main.camera.position.y);
			const mousePosition = new Vector2(x, y);

			main.input.isMouseDown = true;

			const mode = main.modes.active;

			if (!main.input.isSpaceDown) {

				if (mode === 'collision') {
					main.modes.collisions.action(mousePosition);
				} else if (mode === 'entity') {
					main.modes.entities.action(mousePosition);
				}

			}

		},
		onMouseUp() {
			main.input.isMouseDown = false;
		},
		onMouseMove(e) {
			const x = e.offsetX;
			const y = e.offsetY;
			const xPanned = x + main.camera.position.x;
			const yPanned = y + main.camera.position.y;

			main.input.currentMousePos = new Vector2(xPanned, yPanned);

			// Update info with mouse coordinates (taking camera pannging into account)
			$('#mouseX').text(main.input.currentMousePos.x);
			$('#mouseY').text(main.input.currentMousePos.y);

			if (main.modes.active === 'entity' && main.modes.entities.entityGuide) {
				main.modes.entities.entityGuide.updatePos(new Vector2(main.input.currentMousePos.x, main.input.currentMousePos.y));
				main.draw();
			}

			if (main.modes.active === 'collision' && main.modes.collisions.active === 'events' && main.modes.collisions.events.currentEvent) {
				main.modes.collisions.events.updatecurrentEventSize();
			}

			// If space bar is pressed and left mouse button is being clicked, pan the canvas
			// else if left mouse button is pressed, update lines
			if (main.input.isSpaceDown && main.input.isMouseDown) {
				main.camera.pan(x, y, main.input.currentMousePos.x, main.input.currentMousePos.y);
			}

			// Set the current coordinates to our previous variable
			main.input.previousMousePos = new Vector2(x, y);

			// If we've started a line, update the end position so we can see it real-time
			if (typeof main.modes.collisions.lines.currentLine !== 'undefined') {
				main.modes.collisions.lines.showEnd(main.input.currentMousePos.x, main.input.currentMousePos.y);
			}
		},
		onKeyDown(e) {
			const key = e.key;

			main.input.keys[key] = true;

			if (main.input.keys[' ']) {
				// Pan camera on canvas
				main.input.isSpaceDown = true;
				main.jCanvas.addClass('move');
			} else if (main.modes.active === 'collision' || main.modes.active === 'entity') {
				if (main.input.keys['Control'] && main.input.keys['z']) {
					// Undo the last line
					main.modes.collisions.lines.erase.lastLine();
					main.draw();
				} else if (main.input.keys['Control']) {
					// Erase line
					main.input.isCtrlDown = true;
					main.jCanvas.addClass('erase');
				}
			} if (main.input.keys['Shift']) {
				main.input.isShiftDown = true;
			}

		},
		onKeyUp(e) {
			const key = e.key;
			main.input.keys[key] = false;

			if (key === 'Control') {
				main.input.isCtrlDown = false;
				main.jCanvas.removeClass('erase');
			} else if (key === ' ') {
				main.input.isSpaceDown = false;
				main.jCanvas.removeClass('move');
			} else if (key === 'Shift') {
				main.input.isShiftDown = false;
			}

		}
	},
	camera: {
		camera: undefined,
		position: undefined,
		init() {
			main.camera.camera = new Camera();
			main.camera.position = new Vector2(0, 0);
			main.camera.camera.moveTo(main.camera.position.x, main.camera.position.y);
		},
		pan(x, y) {
			// Get the difference between current mouse position and previous
			const mouseXDiff = x - main.input.previousMousePos.x;
			const mouseYDiff = y - main.input.previousMousePos.y;
			// apply the difference to the camera position variable
			main.camera.position.x -= mouseXDiff;
			main.camera.position.y -= mouseYDiff;
			
			// Ensure camera panning doesn't go past world bounds
			if (main.camera.position.x <= 0)
				main.camera.position.x = 0;
			else if ((main.camera.position.x + main.CANVAS_WIDTH) > main.WORLD_WIDTH)
				main.camera.position.x = main.WORLD_WIDTH - main.CANVAS_WIDTH;

			if (main.camera.position.y <= 0)
				main.camera.position.y = 0;
			else if ((main.camera.position.y + main.CANVAS_HEIGHT) > main.WORLD_HEIGHT)
				main.camera.position.y = main.WORLD_HEIGHT - main.CANVAS_HEIGHT;

			// update the camera (the Camera.moveTo function calls Camera.updateViewport where main.draw() is called)
			main.camera.camera.moveTo(main.camera.position.x, main.camera.position.y);

			// Apply parallax scrolling to the backgrounds
			main.modes.backgrounds.parallax(main.camera.position);
		}
	},
	modes: {
		active: 'properties',
		init() {
			// Initialize mode buttons
			$('.viewBtn').on('click', main.modes.onBtnClick);
			main.modes.reset();
			main.modes.set('properties');

			// Initialize each mode
			main.modes.properties.init();
			main.modes.entities.init();
			main.modes.collisions.init();
			main.modes.backgrounds.init();
		},
		properties: {
			showBackground: true,
			showGrid: false,
			allowSnapping: true,
			showLines: true,
			showEntities: true,
			showEvents: true,
			init() {
				$('#propertiesSection .checkboxes').on('change', main.modes.properties.onChange);
				const introText = $('#introText');
				const levelName = $('#levelName');
				const { onFocus, onBlur } = main.modes.properties.fields;

				introText.on('focus', onFocus);
				introText.on('blur', onBlur).trigger('blur');
				levelName.on('focus', onFocus);
				levelName.on('blur', onBlur).trigger('blur');
			},
			onChange() {
				const that = $(this);
				const val = that.val();
				const isChecked = (that.is(':checked'));

				main.modes.properties[`show${val}`] = isChecked;

				if (val === 'Snap') {
					const lineSnapThreshold = $('#lineSnapThreshold');
					if (isChecked) {
						lineSnapThreshold.attr({ readonly: false, disabled: false });
					} else {
						lineSnapThreshold.attr({ readonly: true, disabled: true });
					}
				}

				main.draw();
			},
			fields: {
				onFocus() {
					const fieldEl = $(this);
					const val = fieldEl.val().replace('\n\n', '').trim();
					const defaultText = fieldEl.data('defaulttext');

					if (val === defaultText) {
						fieldEl.val('');
						fieldEl.css({ color: '#222222', 'text-align': 'left' } );
					}
				},
				onBlur() {
					const fieldEl = $(this);
					const val = fieldEl.val();
					const defaultText = fieldEl.data('defaulttext');

					if (val.length === 0) {
						const fieldType = fieldEl.attr('id');
						const fieldVal = fieldType === 'introText' ? `\n${defaultText}` : defaultText;

						fieldEl.val(fieldVal);
						fieldEl.css({ color: '#BBBBBB', 'text-align': 'center' } );
					}
				}
			}
		},
		entities: {
			entityGuide: undefined,
			player: undefined,
			boss: undefined,
			bears: [],
			beeHives: [],
			init() {
				$('#entityType').on('change', main.modes.entities.onGuideChange);
				$('.entitySize')
					.on('blur', main.modes.entities.onGuideChange)
					.trigger('blur');
			},
			onGuideChange() {
				const width = $('#entityWidth').val();
				const height = $('#entityHeight').val();
				const entitySize = new Vector2(width, height);
				const entityType = $('#entityType').val();

				main.modes.entities.entityGuide = new Character(new Vector2(0, 0), entitySize, entityType);
			},
			action(mousePos) {
				if (main.input.isCtrlDown) {
					main.modes.entities.erase(mousePos);
				} else {
					main.modes.entities.add(mousePos);
				}
			},
			add(mousePos) {
				const entityType = $('#entityType').val();
				const width = $('#entityWidth').val();
				const height = $('#entityHeight').val();

				const character = new Character(
					new Vector2(mousePos.x, mousePos.y),
					new Vector2(width, height),
					entityType
				);

				switch(entityType) {
					case 'player':
						main.modes.entities.player = character;
						break;
					case 'bear':
						main.modes.entities.bears.push(character);
						break;
					case 'boss':
						main.modes.entities.boss = character;
						break;
					case 'beeHive':
						main.modes.entities.beeHives.push(character);
						break;
					default:
						break;
				}

				main.draw();
			},
			erase(mousePos) {
				// Create rect from mouse point. The mouse position is the center point
				const pointerRect = new Rectangle(mousePos.x - 2, mousePos.y - 2, 4, 4);

				const player = main.modes.entities.player;
				const boss = main.modes.entities.boss;
				
				// Erase player
				if (player) {
					const playerRect = new Rectangle(player.position.x, player.position.y, player.size.x, player.size.y);

					// If the pointer is intersecting with the player, remove it
					if (main.modes.checkRectIntersect(pointerRect, playerRect)) {
						main.modes.entities.player = undefined;
					}

				}

				if (boss) {
					const bossRect = new Rectangle(boss.position.x, boss.position.y, boss.size.x, boss.size.y);

					// If the pointer is intersecting with the boss, remove it
					if (main.modes.checkRectIntersect(pointerRect, bossRect)) {
						main.modes.entities.boss = undefined;
					}
				}

				// Erase Bears
				for (let i = 0; i < main.modes.entities.bears.length; i++) {

					const bear = main.modes.entities.bears[i];
					const bearRect = new Rectangle(bear.position.x, bear.position.y, bear.size.x, bear.size.y);

					// If the pointer is intersecting with a bear, remove it
					if (main.modes.checkRectIntersect(pointerRect, bearRect)) {
						main.modes.entities.bears.splice(i, 1);
						break;
					}

				}
				
				// Erase Bee Hives
				for (let i = 0; i < main.modes.entities.beeHives.length; i++) {

					const hive = main.modes.entities.beeHives[i];
					const hiveRect = new Rectangle(hive.position.x, hive.position.y, hive.size.x, hive.size.y);

					// If the pointer is intersecting with a bee hive, remove it
					if (main.modes.checkRectIntersect(pointerRect, hiveRect)) {
						main.modes.entities.beeHives.splice(i, 1);
						break;
					}

				}

				main.draw();
			}
		},
		collisions: {
			active: 'lines',
			init() {
				$('.collisionType').on('click', main.modes.collisions.onBtnClick);
				$('#eventType')
					.on('change', main.modes.collisions.events.onTypeChange)
					.trigger('change');
				main.modes.collisions.reset();
				main.modes.collisions.set('lines');
				main.modes.collisions.lines.init();
			},
			action(mousePosition) {
				const collisionType = main.modes.collisions.active;

				if (collisionType === 'lines') {
					// If Control key is down, we're erasing lines
					// Else, we're adding lines
					if (main.input.isCtrlDown) {
						main.modes.collisions.lines.erase.line(mousePosition);
					} else {
						main.modes.collisions.lines.add(mousePosition);
					}
				} else if (collisionType === 'events') {
					main.modes.collisions.events.action(mousePosition);
				}
			},
			lines: {
				currentLine: undefined,
				lastEndPos: undefined,
				lineArr: [],
				linesColors: {
					FLOOR: '#9F0313',
					WALL: '#02AA30',
					CEILING: '#0E72D5',
				},
				init() {
					$('#lineType')
						.on('change', main.modes.collisions.lines.onTypeChange)
						.trigger('change');
					/*
					$('#lineNormal')
						.on('change', main.modes.collisions.lines.onLineNormalChange)
						.trigger('change');
					*/
				},
				onTypeChange() {
					const that = $(this);
					const val = that.val();
					const lineNormal = $('#lineNormal');
					const lineSound = $('#lineSound');

					if (val === 'WALL') {
						lineNormal.attr({'readonly': false, 'disabled': false});
						lineNormal.val(1);
						lineSound.attr({'readonly': true, 'disabled': true});
						lineSound.val('');
					} else {

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
						}

					}

					lineNormal.trigger('change');
				},
				onLineNormalChange() {
					const lineNormalEl = $(this);
					const lineNormalVal = +lineNormalEl.val();
					const lineNormalIcon = $('#normalIcon');

					if (lineNormalVal === -1) {
						lineNormalIcon.css({ 'background-image': 'url("./images/icons/normal-bottomright.png")' });
					} else {
						lineNormalIcon.css({ 'background-image': 'url("./images/icons/normal-topleft.png")' });
					}
				},
				add(mousePosition) {
					const lineType = $('#lineType').val();
					const lineSound = $('#lineSound').val();
					const lineNormal = $('#lineNormal').val();
					const lineColor = main.modes.collisions.lines.linesColors[lineType];
					let snappedPosition;
					
					// If we're allowing snapping, find a line point that's close by
					if (main.modes.properties.allowSnapping) {
						linePosition = main.modes.collisions.lines.snapToLine(mousePosition);
					} else {
						linePosition = new Vector2(mousePosition.x, mousePosition.y);
					}

					if (!main.modes.collisions.lines.currentLine) {
						// Begin creating our new line
						main.modes.collisions.lines.currentLine = new Line(
							linePosition,
							new Vector2(mousePosition.x, mousePosition.y),
							lineColor,
							lineType,
							lineNormal,
							lineSound
						);
					} else {

						// Our walls need to be completely vertical.
						if (lineType === 'WALL') {
							linePosition.x = main.modes.collisions.lines.currentLine.startPos.x;
						} else if (main.input.isShiftDown) {
							// Make the line perfectly level (on the x axis)
							linePosition.y = main.modes.collisions.lines.currentLine.startPos.y;
						}					

						// We need to make sure the lines are going in the proper direction.
						// If the start position (x,y) is greater than the end position, switch them
						if (main.modes.collisions.lines.currentLine.startPos.x > linePosition.x || (lineType === 'WALL' && main.modes.collisions.lines.currentLine.startPos.y > linePosition.y)) {
							main.modes.collisions.lines.currentLine.endPos = main.modes.collisions.lines.currentLine.startPos;
							main.modes.collisions.lines.currentLine.startPos = linePosition;
						} else {
							main.modes.collisions.lines.currentLine.endPos = linePosition;
						}

						// Based on the line's start position, calculate what region it's in
						// const regionX = Math.floor(main.modes.collisions.lines.currentLine.startPos.x / main.gridSize); 
						// const regionY = Math.floor(main.modes.collisions.lines.currentLine.startPos.y / main.gridSize)
						// const region = new Vector2(regionX, regionY);
						// main.modes.collisions.lines.currentLine.region = region;

						// Calculate our line's slope and y-Intercept
						if (lineType !== 'WALL') {
							const slope = (main.modes.collisions.lines.currentLine.endPos.y - main.modes.collisions.lines.currentLine.startPos.y) / (main.modes.collisions.lines.currentLine.endPos.x - main.modes.collisions.lines.currentLine.startPos.x);
							const yIntercept = main.modes.collisions.lines.currentLine.startPos.y - (slope * main.modes.collisions.lines.currentLine.startPos.x);
							main.modes.collisions.lines.currentLine.slope = slope;
							main.modes.collisions.lines.currentLine.yIntercept = yIntercept;
						}

						// Push our new line to the lines array, then reset our currentLine variable
						main.modes.collisions.lines.lineArr.push(main.modes.collisions.lines.currentLine);
						main.modes.collisions.lines.currentLine = undefined;
						main.modes.collisions.lines.lastEndPos = linePosition;
						main.draw();
					}

					// UPDATE INFO
					$('#lastPointX').text(mousePosition.x);
					$('#lastPointY').text(mousePosition.y);
				},
				snapToLine(mousePosition) {
					const lineSnapThreshold = +$('#lineSnapThreshold').val() || 10;
					let startPos = new Vector2(mousePosition.x, mousePosition.y);

					// Loop over each line - both start position and end - to see if we're close
					for (const line of main.modes.collisions.lines.lineArr) {

						// Create a rectangle, 10px wide, with the point as the center
						const lineStartRect = new Rectangle(line.startPos.x - 5, line.startPos.y - 5, lineSnapThreshold, lineSnapThreshold);
						const lineEndRect = new Rectangle(line.endPos.x - 5, line.endPos.y - 5, lineSnapThreshold, lineSnapThreshold);
						const mousePointRect = new Rectangle(mousePosition.x - 5, mousePosition.y - 5, lineSnapThreshold, lineSnapThreshold);

						// Overwrite our startPos if we found a line point
						if (main.modes.checkRectIntersect(mousePointRect, lineStartRect)) {
							startPos = new Vector2(line.startPos.x, line.startPos.y);
						} else if (main.modes.checkRectIntersect(mousePointRect, lineEndRect)) {
							startPos = new Vector2(line.endPos.x, line.endPos.y);
						}

					}
					
					return startPos;
				},
				showEnd(xPanned, yPanned) {
					if (main.modes.collisions.lines.currentLine.collision === 'WALL') {
						// Walls can only be perfectly vertical
						xPanned = main.modes.collisions.lines.currentLine.startPos.x;
					} else if (main.input.isShiftDown) {
						// Floors and Ceiling can be perfect horizontal if shift is pressed
						yPanned = main.modes.collisions.lines.currentLine.startPos.y;
					}
					main.modes.collisions.lines.currentLine.endPos = new Vector2(xPanned, yPanned);
					main.draw();
				},
				erase: {
					line(mousePosition) {
						const lines = main.modes.collisions.lines.lineArr;
						const bounds = new Rectangle(mousePosition.x-5, mousePosition.y-5, 10, 10);	// give a 10 pixel buffer and offset it so the click point is the center
						let eraseLine = false;

						// Loop through lines and figure out whether or not we're intersecting
						for (let l = 0; l < lines.length; l++) {

							const line = lines[l];

							if ((line.collision == 'FLOOR' || line.collision == 'CEILING') && bounds.center.x >= line.startPos.x && bounds.center.x <= line.endPos.x) {

								const slope = (line.endPos.y - line.startPos.y) / (line.endPos.x - line.startPos.x);
								const b = line.startPos.y - (slope * line.startPos.x);
								const yc = (slope * bounds.center.x) + b;

								if (Math.abs(yc - bounds.center.y) <= bounds.halfSize.y) {
									eraseLine = true;
								}

							} else if (line.collision == 'WALL' && bounds.center.y > line.startPos.y && bounds.center.y < line.endPos.y) {

								const xDiff = Math.abs(bounds.center.x - line.startPos.x);

								if (xDiff <= bounds.halfSize.x) {
									eraseLine = true;
								}

							}

							// If we clicked on a line, remove it from the array and re-draw
							if (eraseLine) {
								lines.splice(l, 1);
								main.draw();
								break; // no sense in continuing loop
							}

						}
					},
					lastLine() {
						// If we've just completed a line, delete the last node of the main lines array. Else, cancel the current line in progress.
						if (typeof main.modes.collisions.lines.currentLine === 'undefined' && main.modes.collisions.lines.lineArr.length > 0) {
							main.modes.collisions.lines.lineArr.pop();
						} else {
							main.modes.collisions.lines.currentLine = undefined;
						}
					}
				}
			},
			events: {
				currentEvent: undefined,
				eventArr: [],
				eventColor: {
					EXIT: '#FF8800',
					PITFALLS: '#88FF00',
					GENERIC: '#E76960',
				},
				exit: undefined,
				action(mousePos) {
					if (main.input.isCtrlDown) {
						main.modes.collisions.events.erase(mousePos);
					} else {
						main.modes.collisions.events.add(mousePos);
					}
				},
				add(mousePos) {
					const eventType = $('#eventType').val();
					
					if (!main.modes.collisions.events.currentEvent) {

						const eventName = $('#eventName').val();
						const eventTexture = new Texture(
							new Vector2(mousePos.x, mousePos.y),
							new Vector2(0, 0),
							`${main.modes.collisions.events.eventColor[eventType]}66`,
							1,
							main.modes.collisions.events.eventColor[eventType]
						);

						// Start a new collision event
						main.modes.collisions.events.currentEvent = new CollisionEvent(
							eventType,
							eventName,
							eventTexture
						);

					} else {

						const currentSize = new Vector2(
							main.modes.collisions.events.currentEvent.texture.size.x,
							main.modes.collisions.events.currentEvent.texture.size.y
						);
						const currentPos = new Vector2(
							main.modes.collisions.events.currentEvent.texture.pos.x,
							main.modes.collisions.events.currentEvent.texture.pos.y
						);
						const newSize = new Vector2(Math.abs(currentSize.x), Math.abs(currentSize.y));
						let newPos = currentPos;

						// Check to see if the x or y for the size is a negative number. If so, fix it by reversing the pos/size
						// Shape will be the same but the size will no longer be negative.

						// Pos is Upper right
						if (currentSize.x < 0 && currentSize.y > 0) {
							newPos = new Vector2(
								currentPos.x - newSize.x,
								currentPos.y
							);
						}

						// Pos is bottom left
						if (currentSize.x > 0 && currentSize.y < 0) {
							newPos = new Vector2(
								currentPos.x,
								currentPos.y - newSize.y
							);
						}

						// Pos is bottom right
						if (currentSize.x < 0 && currentSize.y < 0) {
							newPos = new Vector2(
								currentPos.x - newSize.x,
								currentPos.y - newSize.y
							);
						}
						
						main.modes.collisions.events.currentEvent.updatePos(newPos);
						main.modes.collisions.events.currentEvent.updateSize(newSize);

						// Only finish the event if the rectangle size is big enough
						if (Math.floor(newSize.x) > 0 && Math.floor(newSize.y) > 0) {

							// Finish our Collision Event
							if (eventType === 'EXIT') {
								main.modes.collisions.events.exit = main.modes.collisions.events.currentEvent;
							} else {
								main.modes.collisions.events.eventArr.push(main.modes.collisions.events.currentEvent);
							}
						}
						// Clear currentEvent for the next one
						main.modes.collisions.events.currentEvent = undefined;

					}

					main.draw();

				},
				erase(mousePos) {
					// Create rect from mouse point. The mouse position is the center point
					const pointerRect = new Rectangle(mousePos.x - 2, mousePos.y - 2, 4, 4);

					const exit = main.modes.collisions.events.exit;
					
					// Erase exit
					if (exit) {
						const exitRect = new Rectangle(exit.getPos().x, exit.getPos().y, exit.getSize().x, exit.getSize().y);

						// If the pointer is intersecting with the exit, remove it
						if (main.modes.checkRectIntersect(pointerRect, exitRect)) {
							main.modes.collisions.events.exit = undefined;
						}

					}

					// Erase Pitfalls or Generic
					for (let i = 0; i < main.modes.collisions.events.eventArr.length; i++) {

						const event = main.modes.collisions.events.eventArr[i];
						const eventRect = new Rectangle(event.getPos().x, event.getPos().y, event.getSize().x, event.getSize().y);

						// If the pointer is intersecting with an event, remove it
						if (main.modes.checkRectIntersect(pointerRect, eventRect)) {
							main.modes.collisions.events.eventArr.splice(i, 1);
							break;
						}

					}

					main.draw();
				},
				updatecurrentEventSize() {
					const startPos = main.modes.collisions.events.currentEvent.texture.pos;
					const size = new Vector2(
						main.input.currentMousePos.x - startPos.x,
						main.input.currentMousePos.y - startPos.y
					);

					main.modes.collisions.events.currentEvent.updateSize(new Vector2(size.x, size.y));

					main.draw();
				},
				onTypeChange() {
					const typeEl = $(this);
					const defaultName = typeEl.find('option:selected').data('defaultname');
					const nameEl = $('#eventName');

					nameEl
						.val('')
						.attr(
							{
								disabled: false,
								readonly: false
							}
						);

					// Set default name
					if (defaultName) {
						nameEl
							.val(defaultName)
							.attr(
								{
									disabled: true,
									readonly: true
								}
							);
					}
				}
			},
			hazards: {
				
			},
			onBtnClick() {
				const thisType = $(this);
				const type = thisType.attr('id');
				const isTypeAlreadyActive = thisType.hasClass('active');
				if (!isTypeAlreadyActive) {
					main.modes.collisions.reset();
					main.modes.collisions.set(type);
				}
			},
			set(type) {
				// Set new type
				main.modes.collisions.active = type;
				$(`#${type}`).addClass('active');

				// Show Section
				$(`#${type}Section`).slideDown();
			},
			reset() {
				// Reset all btns
				const collisionTypes = $('.collisionType');
				for (let i = 0; i <= collisionTypes.length; i++) {
					const jCT = $(collisionTypes[i]);
					const collisionSectionID = jCT.attr('id') + 'Section';

					// Deactivate
					jCT.removeClass('active');

					// Hide section
					$(`#${collisionSectionID}`).slideUp();
				}
			}
		},
		backgrounds: {
			active: undefined,
			sprites: [],
			imageOptions: [
				{ filename: '7680x720-Charcoal-Background.jpg', optgroup: 'GENERAL', layer: 0, width: 7680, height: 720, },
				{ filename: 'Blank-2560x1440.jpg', optgroup: 'GENERAL', layer: 0, width: 2560, height: 1440, },
				{ filename: 'LEVEL_1.png', optgroup: 'GENERAL', layer: 0, width: 1024, height: 590, },
				{ filename: 'LEVEL_3.jpg', optgroup: 'GENERAL', layer: 0, width: 839, height: 393, },
				{ filename: 'LEVEL_4.jpg', optgroup: 'GENERAL', layer: 0, width: 1920, height: 1080, },
				{ filename: 'LEVEL_4_Sized.jpg', optgroup: 'GENERAL', layer: 0, width: 1280, height: 720, },
				{ filename: 'LEVEL_5.jpg', optgroup: 'GENERAL', layer: 0, width: 1200, height: 675, },
				{ filename: 'LEVEL_6.jpg', optgroup: 'GENERAL', layer: 0, width: 1280, height: 720, },
				{ filename: 'BG0.png', optgroup: 'JUNGLE', layer: 0, width: 8064, height: 648, },
				{ filename: 'BG1.png', optgroup: 'JUNGLE', layer: 1, width: 8064, height: 648, },
				{ filename: 'BG2.png', optgroup: 'JUNGLE', layer: 2, width: 8064, height: 648, },
				{ filename: 'BG3.png', optgroup: 'JUNGLE', layer: 3, width: 8064, height: 648, },
				{ filename: 'BG4.png', optgroup: 'JUNGLE', layer: 4, width: 8064, height: 648, },				
				{ filename: 'FOREST_BACKGROUND.png', optgroup: 'FOREST', layer: 0, width: 4000, height: 648, },
				{ filename: 'FOREST_TREES_1.png', optgroup: 'FOREST', layer: 1, width: 4000, height: 648, },
				{ filename: 'FOREST_TREES_2.png', optgroup: 'FOREST', layer: 2, width: 4000, height: 648, },
				{ filename: 'FOREST_TREES_3.png', optgroup: 'FOREST', layer: 3, width: 4000, height: 648, },
				{ filename: 'FOREST_TREES_4.png', optgroup: 'FOREST', layer: 4, width: 4000, height: 648, },
				{ filename: 'FOREST_FOREGROUND.png', optgroup: 'FOREST', layer: 5, width: 4000, height: 648, },
				{ filename: 'Blockland-BG-0.png', optgroup: 'BLOCKLAND', layer: 0, width: 6000, height: 648, },
				{ filename: 'Blockland-BG-0-2.png', optgroup: 'BLOCKLAND', layer: 0, width: 1000, height: 648, },
				{ filename: 'Blockland-BG-1.png', optgroup: 'BLOCKLAND', layer: 1, width: 6000, height: 648, },
				{ filename: 'Blockland-BG-2.png', optgroup: 'BLOCKLAND', layer: 2, width: 6000, height: 648, },
				{ filename: 'Blockland-BG-3.png', optgroup: 'BLOCKLAND', layer: 3, width: 6000, height: 648, },
				{ filename: 'Blockland-BG-4.png', optgroup: 'BLOCKLAND', layer: 4, width: 6000, height: 648, },
				{ filename: 'Background_1.png', optgroup: 'GRAVEYARD', layer: 0, width: 3000, height: 1143, },
				{ filename: 'Background_2.png', optgroup: 'GRAVEYARD', layer: 2, width: 3000, height: 1143, },
				{ filename: 'Background_3.png', optgroup: 'GRAVEYARD', layer: 3, width: 3000, height: 1143, },
				{ filename: 'Background_4.png', optgroup: 'GRAVEYARD', layer: 4, width: 1280, height: 1143, },
				{ filename: 'moon.png', optgroup: 'GRAVEYARD', layer: 1, width: 900, height: 900, },
				{ filename: 'moon_blur.png', optgroup: '', layer: 1, width: 879, height: 875, },
			],
			imageSelectOpeners: [
				'Pick something... quickly',
				'Choose wisely',
				'Here we go again...',
				'Haven\'t you had enough?',
				'[REDACTED]',
				'Is this one a repeat?',
				'Now is it a repeat?'
			],
			init() {
				$('.backgroundModeBtn').on('click', main.modes.backgrounds.onModeChange);
				$('#backgroundImg0').on('change', main.modes.backgrounds.onBackgroundChange);
				$('.addLayer').on('click', main.modes.backgrounds.onAddLayer);
				$('#backgroundApplyBtn').on('click', main.modes.backgrounds.onBackgroundSizeChange);
				$('.backgroundPropertiesBtn').on('click', main.modes.backgrounds.backgroundProperties.init);
				main.modes.backgrounds.reset();
				main.modes.backgrounds.set('backgroundSize');
				main.modes.backgrounds.loadBGs(0);
				main.modes.backgrounds.setBackgroundSize(
					new Vector2(main.initialWorldWidth, main.initialWorldHeight),
					new Vector2(main.initialViewportWidth, main.initialViewportHeight)
				);
			},
			onModeChange() {
				const thisType = $(this);
				const type = thisType.attr('id');
				const isTypeAlreadyActive = thisType.hasClass('active');
				if (!isTypeAlreadyActive) {
					main.modes.backgrounds.reset();
					main.modes.backgrounds.set(type);
				}
			},
			set(type) {
				// Set new type
				main.modes.backgrounds.active = type;
				$(`#${type}`).addClass('active');

				// Show Section
				$(`#${type}Section`).slideDown();
			},
			reset() {
				// Reset all btns
				const backgroundModes = $('.backgroundModeBtn');
				for (let i = 0; i <= backgroundModes.length; i++) {
					const jBM = $(backgroundModes[i]);
					const backgroundSectionID = jBM.attr('id') + 'Section';

					// Deactivate
					jBM.removeClass('active');

					// Hide section
					$(`#${backgroundSectionID}`).slideUp();
				}
			},
			loadBGs(index) {
				const imgSelect = $(`#backgroundImg${index}`);
				const images = main.modes.backgrounds.imageOptions;
				const imageOptGroups = images.map(image => image.optgroup);
				const uniqueOptGroups = [...new Set(imageOptGroups)];
				let selects;

				// Populate select box with images
				for (const optGroup of uniqueOptGroups) {
					const optGroupDefaultLabel = optGroup.length === 0 ? 'OTHER' : optGroup;
					selects += `<optgroup label="${optGroupDefaultLabel}">`;
					
					for (const image of images) {
						if (image.optgroup === optGroup) {
							const imageName = image.filename.split('.')[0];
							const optionText = `${imageName} - ${image.width}x${image.height}`;
							selects += `
								<option
									title="${optionText}"
									alt="${optionText}"
									data-width="${image.width}"
									data-height="${image.height}"
									value="${image.filename}"
								>${optionText}</option>
							`;
						}
					}

					selects += `</optgroup>`;

				}

				imgSelect.append(selects);

				// trigger a change event
				imgSelect.trigger('change');
			},
			onBackgroundChange() {
				const thisImageEl = $(this);
				const selected = thisImageEl.find('option:selected');
				const selectedVal = selected.val();

				if (+selectedVal === -1) {
					return;
				}

				const selectedWidth = selected.data('width');
				const selectedHeight = selected.data('height');
				const imagePath = `images/backgrounds/${selectedVal}`;

				// Find the index we're changing
				const selectIndex = +thisImageEl.data('index');
				const parallax = new Vector2(0, 0);

				// If that index already exists, then we're updating. Otherwise we're creating new
				if (main.modes.backgrounds.sprites[selectIndex]) {
					main.modes.backgrounds.sprites[selectIndex].updateImage(imagePath);
					main.modes.backgrounds.sprites[selectIndex].updateSize(new Vector2(selectedWidth, selectedHeight));
				} else {
					main.modes.backgrounds.sprites.push(
						new Background(
							imagePath,
							new Vector2(0, 0),
							new Vector2(selectedWidth, selectedHeight),
							false,
							parallax
						)
					);
				}

				main.modes.properties.showBackground = true;

				thisImageEl.trigger('blur');

				main.loading.toggle(true);
				setTimeout(() => {
					main.draw();
					main.loading.toggle(false);
				}, 1000);
			},
			onBackgroundSizeChange() {
				const worldWidthEl = $('#worldWidth');
				const worldHeightEl = $('#worldHeight');
				const viewportWidthEl = $('#viewportWidth');
				const viewportHeightEl = $('#viewportHeight');
				const worldWidthVal = worldWidthEl.val();
				const worldHeightVal = worldHeightEl.val();
				const viewportWidthVal = viewportWidthEl.val();
				const viewportHeightVal = viewportHeightEl.val();
				
				main.modes.backgrounds.setBackgroundSize(
					new Vector2(worldWidthVal, worldHeightVal),
					new Vector2(viewportWidthVal, viewportHeightVal)
				);
			},
			onAddLayer() {
				const bgImageDiv = $('#backgroundLayers');
				const currentImageSelects = $('.backgroundImg');
				const lastSelect = $(currentImageSelects[currentImageSelects.length - 1]).data('index');
				const selectIndex = +lastSelect + 1;
				const imageSelectOpeners = main.modes.backgrounds.imageSelectOpeners;
				const randomOpener = imageSelectOpeners[random(0, imageSelectOpeners.length - 1)];
				const newImageSelect = `
					<div class="row">
						<label for="backgroundImg${selectIndex}">${selectIndex}:</label>
						<select id="backgroundImg${selectIndex}" data-index="${selectIndex}" class="backgroundImg">
							<option value="-1">${randomOpener}</option>
						</select>
						<div class="backgroundPropertiesBtn">&nbsp;</div>
					</div>
				`;
				
				bgImageDiv.append(newImageSelect);
				main.modes.backgrounds.loadBGs(selectIndex);

				const newSelectEl = $(`#backgroundImg${selectIndex}`);
				const newBGPropertiesBtn = newSelectEl.parent('.row').find('.backgroundPropertiesBtn');
				newSelectEl.on('change', main.modes.backgrounds.onBackgroundChange);
				newBGPropertiesBtn.on('click', main.modes.backgrounds.backgroundProperties.init);
			},
			backgroundProperties: {
				init() {
					const propertiesEl = $(this);
					const parentRow = propertiesEl.parent('.row');
					const backgroundImg = parentRow.find('.backgroundImg');
					const index = backgroundImg.data('index');
					const currentProperties = main.modes.backgrounds.sprites[index] || {};
					const backgroundImageSection = $('#backgroundImageSection');

					// Make sure we don't open more than 1 at a time, and that we've selected a BG
					if ($('.backgroundPropertyDiv').length > 0 || +backgroundImg.val() === -1) {
						return;
					}

					backgroundImageSection.append(`
						<div class="backgroundPropertyDiv">
							<input type="hidden" class="backgroundIndex" value="${index}" />
							<div class="header">
								<div class="title">Background ${index} Properties</div>
								<div class="close">X</div>
							</div>
							<div class="fields">
								<div class="row">
									<label for="backgroundRepeat${index}">Repeating:</label>
									<select id="backgroundRepeat${index}">
										<option value="0" ${+(currentProperties.getRepeat() || 0) === 0 ? 'selected' : ''}>No</option>
										<option value="1" ${+(currentProperties.getRepeat() || 0) === 1 ? 'selected' : ''}>Yes</option>
									</select>
								</div>

								<div class="row">
									<label for="backgroundParallax${index}">Parallax:</label>
									<p>x</p>
									<input type="text" id="backgroundParallaxX${index}" class="backgroundParallax" value="${currentProperties.getParallax().x || 0.0}" />
									<p>y</p>
									<input type="text" id="backgroundParallaxY${index}" class="backgroundParallax" value="${currentProperties.getParallax().y || 0.0}" />
								</div>
							</div>
						</div>
					`);

					// Close by just removing the element
					$('.backgroundPropertyDiv .header .close').on('click', main.modes.backgrounds.backgroundProperties.save);
				},
				save() {
					const thisPropertiesBox = $(this).parent('.header').parent('.backgroundPropertyDiv');
					const backgroundIndex = thisPropertiesBox.find('.backgroundIndex').val();
					const backgroundImage = main.modes.backgrounds.sprites[backgroundIndex];
					
					// Update the appropriate Background image based on the index
					if (backgroundImage) {
						const isRepeating = +$(`#backgroundRepeat${backgroundIndex}`).val();
						const parallaxX = +$(`#backgroundParallaxX${backgroundIndex}`).val();
						const parallaxY = +$(`#backgroundParallaxY${backgroundIndex}`).val();
						backgroundImage.updateParallax(new Vector2(parallaxX, parallaxY));
						backgroundImage.updateRepeat(isRepeating === 1 ? true : false);
					}

					thisPropertiesBox.remove();
					
					main.loading.toggle(true);
					setTimeout(() => {
						main.draw();
						main.loading.toggle(false);
					}, 1000);
				}
			},
			setBackgroundSize(worldSize, viewportSize) {
				// Reset global dimensions
				main.WORLD_WIDTH = +worldSize.x;
				main.WORLD_HEIGHT = +worldSize.y;
				main.CANVAS_WIDTH = +viewportSize.x;
				main.CANVAS_HEIGHT = +viewportSize.y;

				// Apply Dimensions
				main.canvas.width = main.CANVAS_WIDTH;
				main.canvas.height = main.CANVAS_HEIGHT;

				// Refresh background sprites
				for (const sprite of main.modes.backgrounds.sprites) {
					sprite.refreshRepeatingSprites();
				}

				// Update info sectoin
				$('#viewportSize').text(`${viewportSize.x}x, ${viewportSize.y}y`);
				$('#worldSize').text(`${worldSize.x}x, ${worldSize.y}y`);

				main.loading.toggle(true);
				setTimeout(() => {
					// Update camera
					main.camera.camera.updateViewport();
					main.draw();
					main.loading.toggle(false);
				}, 1500);
			},
			parallax(cameraPosition) {
				for (const background of main.modes.backgrounds.sprites) {
					background.updatePos(
						new Vector2(
							cameraPosition.x * background.getParallax().x,
							cameraPosition.y * background.getParallax().y
						)
					);
				}
			}
		},
		checkRectIntersect(rect1, rect2) {
			const intersectionDepth = rect1.GetIntersectionDepth(rect2);
			const absDepthX = Math.abs(intersectionDepth.x);
			const absDepthY = Math.abs(intersectionDepth.y);

			return (absDepthY < absDepthX || absDepthX < absDepthY);
		},
		onBtnClick() {
			const thisMode = $(this);
			const mode = thisMode.attr('id');
			const isModeAlreadyActive = thisMode.hasClass('active');
			if (!isModeAlreadyActive) {
				main.modes.reset();
				main.modes.set(mode);
				main.draw();
			}
		},
		set(mode) {
			// SET NEW MODE			
			main.modes.active = mode;
			$(`#${mode}`).addClass('active').show();

			// SHOW SECTION
			$(`#${mode}Section`).slideDown();
		},
		reset() {
			// RESET ALL BTNS
			const viewBtns = $('.viewBtn');
			for (let i = 0; i <= viewBtns.length; i++) {
				const jViewBtn = $(viewBtns[i]);
				const sectionID = jViewBtn.attr('id') + 'Section';
				
				// Deactivate
				jViewBtn.removeClass('active');

				// Hide Section
				$(`#${sectionID}`).slideUp();
			};
		},
		resetCanvas(shouldResetBackgrounds = 1) {
			main.modes.collisions.lines.lineArr = [];
			main.modes.collisions.currentLine = undefined;
			main.modes.collisions.events.eventArr = [];
			main.modes.entities.player = undefined;
			main.modes.entities.bears = [];
			main.modes.entities.beeHives = [];
			main.modes.collisions.events.exit = undefined;
			main.modes.collisions.events.eventArr = [];
			$('#introText').val('').trigger('blur');
			main.modes.backgrounds.setBackgroundSize(
				new Vector2(main.initialWorldWidth, main.initialWorldHeight),
				new Vector2(main.initialViewportWidth, main.initialViewportHeight)
			);

			if (shouldResetBackgrounds) {

				// Delete all background elements except the first
				for (let i = 1; i < main.modes.backgrounds.sprites.length; i++) {
					$(`#backgroundImg${i}`).parent('.row').remove();
				}

				// Set first select box back to initial state
				$('#backgroundImg0').val(-1);

				// Clear backgroud sprite array
				main.modes.backgrounds.sprites = [];

			}

			main.loading.toggle(true);
			setTimeout(() => {
				main.loading.toggle(false);
				main.draw();
			}, 1000);
		},
	},
	toggleToolBox() {
		const toolBox = $('#toolBox');
		const toolBoxHideArrow = $('#toolBoxHideBar #arrow');
		
		toolBox.toggle();

		if (this.isToolBoxShowing) {
			this.isToolBoxShowing = false;
			toolBoxHideArrow.text('<');
		} else {
			this.isToolBoxShowing = true;
			toolBoxHideArrow.text('>');
		}
	},
	finalization: {
		init() {
			// Event Handlers
			$('#loadBtn').on('click', main.finalization.load.show);
			$('#exportBtn').on('click', main.finalization.export.output);
			$('#resetBtn').on('click', main.finalization.reset);
			$('#toolBoxHideBar').on('click', main.toggleToolBox);
			$('#dialogSaveBtn').on('click', main.finalization.load.save);
			$('#dialogCloseBtn').on('click', main.finalization.dialog.close);
			main.finalization.export.init();
		},
		load: {
			show() {
				main.finalization.dialog.show(
					{
						title: 'LOAD',
						showSave: true,
					}
				);
			},
			save() {
				const content = $('#dialogTextarea');
				const val = content.val();

				// If there's no content, abort
				if (val.length === 0) {
					return;
				}

				const input = JSON.parse(val);

				// World & Canvas Dimensions
				main.modes.backgrounds.setBackgroundSize(
					new Vector2(input.worldWidth, input.worldHeight),
					new Vector2(main.CANVAS_WIDTH, main.CANVAS_HEIGHT)	// Keep as is - we don't send viewport size with level info
				);
				$('#worldWidth').val(input.worldWidth);
				$('#worldHeight').val(input.worldHeight);

				// Intro Text
				const introTextEl = $('#introText');
				introTextEl.trigger('focus');
				introTextEl.val(input.introText);

				// Level Name
				const levelNameEl = $('#levelName');
				levelNameEl.trigger('focus');
				levelNameEl.val(input.levelName);

				// Player
				main.modes.entities.player = undefined;

				main.modes.entities.player = new Character(
					new Vector2(input.player.start[0], input.player.start[1]),
					new Vector2(input.player.size[0], input.player.size[1]),
					'player'
				);

				// Boss
				main.modes.entities.boss = undefined;

				main.modes.entities.boss = new Character(
					new Vector2(input.boss.start[0], input.boss.start[1]),
					new Vector2(input.boss.size[0], input.boss.size[1]),
					'boss'
				);

				// Bears
				main.modes.entities.bears = [];

				for (const bear of input.bears) {
					main.modes.entities.bears.push(
						new Character(
							new Vector2(bear.start[0], bear.start[1]),
							new Vector2(bear.size[0], bear.size[1]),
							'bear'
						)
					);
				}

				// Bee Hives
				main.modes.entities.beeHives = [];

				if (input.beeHives) {
					for (const hive of input.beeHives) {
						main.modes.entities.beeHives.push(
							new Character(
								new Vector2(hive.start[0], hive.start[1]),
								new Vector2(hive.size[0], hive.size[1]),
								'beeHive'
							)
						);
					}
				}

				// Background - Load Canvas
				main.modes.backgrounds.sprites = [];

				for (const bg of input.backgrounds) {
					main.modes.backgrounds.sprites.push(
						new Background(
							bg.path,
							new Vector2(bg.pos[0], bg.pos[1]),
							new Vector2(bg.size[0], bg.size[1]),
							bg.isRepeating,
							new Vector2(bg.parallax[0], bg.parallax[1])
						)
					);
				}

				// Background - Load select boxes
				for (let i = 0; i < main.modes.backgrounds.sprites.length; i++) {
					const fileName = main.modes.backgrounds.sprites[i].getFilename();
					// First one already exists so we don't need to create a new select box
					if (i > 0) {
						main.modes.backgrounds.onAddLayer();
					}

					$(`#backgroundImg${i}`).val(fileName);
				}

				// Event Collision - Exit
				main.modes.collisions.events.exit = undefined;
				const exitTexture = new Texture(
					new Vector2(input.eventCollision.exit.pos[0], input.eventCollision.exit.pos[1]),
					new Vector2(input.eventCollision.exit.size[0], input.eventCollision.exit.size[1]),
					`${main.modes.collisions.events.eventColor['EXIT']}66`,
					1,
					main.modes.collisions.events.eventColor['EXIT']
				);
				main.modes.collisions.events.exit = new CollisionEvent('EXIT', 'EXIT', exitTexture);

				// Event Collision - Pitfalls
				main.modes.collisions.events.eventArr = [];

				for (const pitfall of input.eventCollision.pitfalls) {
					const pitfallTexture = new Texture(
						new Vector2(pitfall.pos[0], pitfall.pos[1]),
						new Vector2(pitfall.size[0], pitfall.size[1]),
						`${main.modes.collisions.events.eventColor['PITFALLS']}66`,
						1,
						main.modes.collisions.events.eventColor['PITFALLS']
					);
					main.modes.collisions.events.eventArr.push(
						new CollisionEvent('PITFALLS', 'PITFALLS', pitfallTexture)
					);
				}

				// Event Collision - Generic
				for (const generic of input.eventCollision.generic) {
					const genericTexture = new Texture(
						new Vector2(generic.pos[0], generic.pos[1]),
						new Vector2(generic.size[0], generic.size[1]),
						`${main.modes.collisions.events.eventColor['GENERIC']}66`,
						1,
						main.modes.collisions.events.eventColor['GENERIC']
					);
					main.modes.collisions.events.eventArr.push(
						new CollisionEvent('GENERIC', '', genericTexture)
					);
				}

				// Boundary Collision
				main.modes.collisions.lines.lineArr = [];

				for (const line of input.collision) {
					main.modes.collisions.lines.lineArr.push(
						new Line(
							new Vector2(line.sx, line.sy),
							new Vector2(line.ex, line.ey),
							line.h,
							line.c,
							line.n,
							line.s,
							new Vector2(0, 0),
							line.sl,
							line.b
						)
					);
				}

				// Update canvas (including BG loading hack!)
				main.loading.toggle(true);
				setTimeout(() => {
					main.draw();
					main.loading.toggle(false);
				}, 3000);

				// Close dialog
				main.finalization.dialog.close();

			}
		},
		export: {
			init() {
				const copyBtn = $('#dialogContent #copy');
				copyBtn.on('click', main.finalization.export.onCopyClick);
				$('#copySuccessDiv').hide();
			},
			onCopyClick() {
				const dialogTextarea = $('#dialogTextarea');
				const dialogTextareaVal = dialogTextarea.val();
				const copySuccess = $('#copySuccessDiv');

				// Copy the text inside the text field
				navigator.clipboard.writeText(dialogTextareaVal);
				
				copySuccess.fadeIn();
				setTimeout(() => copySuccess.fadeOut(), 2000);
			},
			output() {
				const output = {};
				const errors = [];

				// World dimensions
				output.worldWidth = main.WORLD_WIDTH;
				output.worldHeight = main.WORLD_HEIGHT;

				// Intro text
				const introText = $('#introText').val();
				if ((introText.replace('\n\n', '').trim().toLowerCase() !== 'intro text')) {
					output.introText = introText;
				} else {
					output.introText = 'Somebody forgot to add intro text...';
					errors.push('<span class="keyword">INTRO TEXT</span> missing');
				}

				// Level Name
				const levelName = $('#levelName').val();
				if ((levelName.toLowerCase() !== 'level name')) {
					output.levelName = levelName;
				} else {
					output.levelName = 'No Name';
					errors.push('<span class="keyword">LEVEL NAME</span> missing');
				}

				// PLAYER
				if (main.modes.entities.player) {
					output.player = {
						start: [+main.modes.entities.player.position.x, +main.modes.entities.player.position.y],
						size: [+main.modes.entities.player.size.x, +main.modes.entities.player.size.y]
					}
				} else {
					output.player = {};
					errors.push('<span class="keyword">PLAYER</span> missing');
				}

				// BOSS
				if (main.modes.entities.boss) {
					output.boss = {
						name: 'Tree Monster',
						start: [+main.modes.entities.boss.position.x, +main.modes.entities.boss.position.y],
						size: [+main.modes.entities.boss.size.x, +main.modes.entities.boss.size.y]
					}
				} else {
					output.boss = {};
					errors.push('<span class="keyword">BOSS</span> missing');
				}

				// Bears
				output.bears = [];

				if (main.modes.entities.bears.length > 0) {
					for (const bear of main.modes.entities.bears) {
						output.bears.push(
							{
								start: [+bear.position.x, +bear.position.y],
								size: [+bear.size.x, +bear.size.y],
								region: {
									pos: [0, 0],
									size: [9000, 9000],
								}
							}
						);
					}
				} else {
					errors.push('<span class="keyword">Bears</span> missing');
				}

				// Bee Hives
				output.beeHives = [];

				if (main.modes.entities.beeHives.length > 0) {
					for (const hive of main.modes.entities.beeHives) {
						output.beeHives.push(
							{
								start: [+hive.position.x, +hive.position.y],
								size: [+hive.size.x, +hive.size.y],
								region: {
									pos: [0, 0],
									size: [9000, 9000],
								}
							}
						);
					}
				} else {
					errors.push('<span class="keyword">Bee Hives</span> missing');
				}

				// Backgrounds
				output.backgrounds = [];

				if (main.modes.backgrounds.sprites.length > 0) {
					for (const bg of main.modes.backgrounds.sprites) {
						output.backgrounds.push(
							{
								path: `./images/backgrounds/${bg.getFilename()}`,
								pos: [0, 0],
								size: [bg.size.x, bg.size.y],
								isRepeating: bg.getRepeat(),
								parallax: [bg.getParallax().x, bg.getParallax().y]
							}
						);
					}
				} else {
					errors.push('<span class="keyword">BACKGROUNDS</span> missing');
				}

				// event collision - exit
				output.eventCollision = {
					exit: {},
					pitfalls: {},
					generic: {}
				};

				if (main.modes.collisions.events.exit) {
					const events = main.modes.collisions.events;
					output.eventCollision = {
						exit: {
							pos: [events.exit.getPos().x, events.exit.getPos().y],
							size: [events.exit.getSize().x, events.exit.getSize().y]
						}
					};
				} else {
					output.eventCollision.exit = {};
					errors.push('<span class="keyword">EXIT</span> missing');
				}
				
				// event collision - other
				output.eventCollision.pitfalls = [];
				output.eventCollision.generic = [];

				if (main.modes.collisions.events.eventArr.length > 0) {
					for (const event of main.modes.collisions.events.eventArr) {
						const type = event.type.toLowerCase();
						output.eventCollision[type].push(
							{
								pos: [event.getPos().x, event.getPos().y],
								size: [event.getSize().x, event.getSize().y],
								name: event.name,
							}
						);
					}
				} else {
					errors.push('<span class="keyword">EVENTS</span> missing');
				}

				// Boundary collision
				output.collision = [];

				if (main.modes.collisions.lines.lineArr.length > 0) {
					for (const line of main.modes.collisions.lines.lineArr) {
						output.collision.push(
							{
								sx: line.startPos.x,
								sy: line.startPos.y,
								ex: line.endPos.x,
								ey: line.endPos.y,
								c: line.collision,
								n: line.normal,
								s: line.sound,
								h: line.color,
								// rx: line.region.x,
								// ry: line.region.y,
								sl: line.slope,
								b: line.yIntercept,
							}
						);
					}
				} else {
					errors.push('<span class="keyword">BOUNDARY COLLISION</span> missing');

				}

				const stringified = JSON.stringify(output);

				main.finalization.dialog.show(
					{
						title: 'EXPORT',
						content: stringified,
						showSave: false,
						showCopy: true,
					},
					errors
				);
			}
		},
		reset() {
			main.modes.resetCanvas();
		},
		dialog: {
			show(data, errors = []) {
				const title = data.title || 'DIALOG';
				const content = data.content || '';
				const showSave = data.showSave || false;
				const showCopy = data.showCopy || false;
				const dialogColors = { LOAD: '#C68A0D', EXPORT: '#11BE41', DIALOG: '#F11B2B' };
				const mainColor = dialogColors[title];
				const dialog = $('#dialog');
				const headerArea = $('#dialogHeader');
				const contentArea = $('#dialogTextarea');
				const saveBtn = $('#dialogSaveBtn');
				const copyBtn = $('#dialogContent #copy');
				const overlay = $('#dialogOverlay');
				const errorsDiv = $('#dialogErrors');
				headerArea.css('background-color', mainColor);
				saveBtn.css('background-color', mainColor);

				// SAVE BUTTON
				if (showSave) {
					saveBtn.show();
				} else {
					saveBtn.hide();
				}

				// COPY BUTTON
				if (showCopy) {
					copyBtn.show();
				} else {
					copyBtn.hide();
				}

				// ERRORS
				if (errors.length > 0) {
					// Clear current contents
					errorsDiv.html('');
					// Append new errors
					for (const error of errors) {
						errorsDiv.append(`
							${error}<br />
						`);
					}
					// Show div
					errorsDiv.show();
				}

				headerArea.text(title);
				contentArea.val(content);

				dialog.fadeIn(200);
				overlay.fadeIn(200);
			},
			close() {
				$('#dialog').fadeOut(200);
				$('#dialogOverlay').fadeOut(200);
				setTimeout(() => {
					$('#dialogErrors').text('').hide();
					$('#dialogTextarea').text('');
				}, 300);
			}
		}
	},
	loading: {
		gifs: [
			{ path: 'images/loading_plain.gif', bgColor: '#000000' },
			{ path: 'images/loading_8bit.gif', bgColor: '#040204' },
			{ path: 'images/loading_swordfight.gif', bgColor: '#000000' },
			{ path: 'images/loading_string.gif', bgColor: '#000000' },
			{ path: 'images/loading_scifi.gif', bgColor: '#0c0c0c' }
		],
		toggle(show = false) {
			const loadingOverlay = $('#loadingOverlay');
			const loadingImg = $('#loadingGif');
			const randomGif = main.loading.gifs[random(0, main.loading.gifs.length - 1)];
			
			if (show) {
				loadingOverlay.css("background-color", randomGif.bgColor);

				loadingImg.attr('src', randomGif.path);

				loadingOverlay.show();
			} else {
				loadingOverlay.fadeOut();
			}
		}
	},
	draw() {
		main.context.clearRect(0, 0, main.CANVAS_WIDTH, main.CANVAS_HEIGHT);

		main.camera.camera.begin();
		
		/* BACKGROUNDS */
		if (main.modes.backgrounds.sprites.length > 0 && main.modes.properties.showBackground) {
			for (const sprite of main.modes.backgrounds.sprites) {
				sprite.draw();
			}
		}

		/* LINES */
		if (main.modes.properties.showLines) {
			for (const line of main.modes.collisions.lines.lineArr) {
				line.draw();
			}

			if (typeof main.modes.collisions.lines.currentLine !== 'undefined') {
				main.modes.collisions.lines.currentLine.draw();
			}
		}

		/* EVENTS */
		if (main.modes.properties.showEvents) {

			// Event Guide
			if (main.modes.collisions.events.currentEvent && !main.input.isCtrlDown) {
				main.modes.collisions.events.currentEvent.draw();
			}

			// Events
			for(const event of main.modes.collisions.events.eventArr) {
				event.draw();
			}

			// Exit
			if (main.modes.collisions.events.exit) {
				main.modes.collisions.events.exit.draw();
			}
		}

		/* ENTITIES */
		if (main.modes.properties.showEntities) {

			// ENTITY GUIDE
			if (main.modes.active === 'entity' && main.modes.entities.entityGuide && !main.input.isCtrlDown) {
				main.modes.entities.entityGuide.draw();
			}

			// Bears
			for (const bear of main.modes.entities.bears) {
				bear.draw();
			}
			
			// Bee Hives
			for (const hive of main.modes.entities.beeHives) {
				hive.draw();
			}

			// Player
			if (main.modes.entities.player) {
				main.modes.entities.player.draw();
			}

			// Boss
			if (main.modes.entities.boss) {
				main.modes.entities.boss.draw();
			}

		}
		
		main.camera.camera.end();
	}

};