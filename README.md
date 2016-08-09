# HTML5-Vector-Game

There are 2 components to this repository:

1. **Vector Platformer:** This is actual game where you can move a player around a level using W, A, S, D, and SPACE (jump).
2. **Vector Mapper:** This is like a level editor for the Vector Platformer.

### Vector Platformer

In order to play, simply download this repository and open the index.html file (I've only developed in Chrome. Use another browser at your own risk)

### Vector Mapper

Like the Platformer, simply open the index.html file to use. Here's how it works:

#### Tools:

*	**INFO:** General information about the level, mouse coordinates, and the ending point of the last line.
*	**VISIBILITY:**
	* **Show Background:** This will toggle the display of the background image
	* **Show Grid**: This is in beta. Eventually the grid will act as areas of collision to help with the broad collision phase (only collidable objects inside the area will be checked for collision. This means we can have more collidable objects without taking as much performance hit)
	* **Show Lines**: This will toggle the display of the collision lines.
	* **Allow Snapping**: When checked, the start of the previous line will snap to the end of the last line if the start is within 5 pixels. Eventually, I'd like to implement snapping to any point on the canvas.
*	**Properties:**
	* **Line Types:**
		* FLOOR: This line will prevent the player from falling beneath it.
		* WALL: This line will prevent horizontal movement. You can only create a perfectly vertical wall (for now).
		* CEILING: This line will prevent the player from jumping up, through it.
	* **Line Normal:** This property is used to determine where the allowable area of a line is. For example, a floor's normal is -1 because the space the the player is allowed to occupy is -y in relation (or, the line will push the player in the -y direction). For floors and ceilings, the line normal field is disabled. The line normal for the wall line type will need be changed depending on the wall you want to make. If you want the player to come from the left and bump into the wall, set the line normal to 1 (so the wall will push the player in the +x direction).
	* **Line Sound:** This property only applies to floor line types at the moment. When placing a floor line, you can choose between different collision sound types. This is the sound that will play when the player walks over that line.
*	**ACTION BUTTONS:**
	* **Load:** This will allow you to load a previously exported collision map. The format MUST be as follows: *this.lines.push(new Line(new Vector2(0, 355), new Vector2(50, 360), "#000000", "FLOOR", -1, "GRASS"));*
	* **Export:** When you're happy with your collision map, you can export it for use in the Vector Platformer
	* **Reset:** This will reset your canvas to a clean slate. Be careful... I haven't added a confirm dialog yet.

#### Working In The Canvas

**General Instructions**

To get started builing your collision map simply set your properties in the tools pane and click on the canvas where you'd like to start your first line. You will be able to see in real time where your line will be placed as you moved your mouse around the canvas.

After clicking your start point for your first line, click again to complete it. To start a new line, click again. Unlike some programs, the lines aren't continous and you must click twice to add 1 line (in other words, a new line won't automatically begin where the last one left off).

**Making a Mistake**

If you've clicked somewhere by accident simply press `CTRL + Z` to undo the last line. If you have only added your first point, it will cancel the line in progress. If you don't have a line in progress, it will remove the last line added. Continuing to press `CTRL + Z` will result in more lines being removed until they're all gone.

**Changing the Background Image**

If you'd like to load in another level you'll need to do the following:

1.	Go into the Vector Mapper's script.js file. Change `main.init.CANVAS_WIDTH` and `main.init.CANVAS_HEIGHT` to the dimensions of your new image. Be aware that there is a limit of 800 px for the height. You can set the width to whatever you want however it might get awkward if it stretches past the bounds of the screen.
2.	In the same file, change first argument of `main.init.background`. This is the path to the new image.
3.	Go into the Vector Platformer's temp.js file and you'll have to do the same 2 changes. They may be named slightly differently and in different spots:
	* At the bottom of the file you should find the game object. Change the `CANVAS_WIDTH` and `CANVAS_HEIGHT` (game.init... etc)
	* Scroll up and find the Level function (pseudo class). You should see `this.levelBG` - change the first parameter here too.

**Applying Exported Collision Maps**

When you're happy with your collision map in the Vector Mapper you can click the "Export" button. A dialog will appear with code ready to be plugged into the Vector Platformer.

Copy the code and head over to the temp.js file in the Vector Platformer. Find the LoadLines() function within the Level class (`Level.prototype.LoadLines = function () {}`) and paste the code anywhere inside. Then, simply reload the Vector Platformer's index.html file. If you'd like to see the collision map within the level you can un-comment the line drawing loop in the Level's draw function (`Level.prototype.draw = function () {}`).

	// Draw Collision Map
	/*for (l = 0; l < this.lines.length; l++) {
		this.lines[l].draw();
	}*/

**Loading a Collision Map**

You can load a previously created collision map by pasting line code (like that which you would find in the LoadLines() function) into the Load dialog of the Vector Mapper.

**Tips**

*	Be careful when joining lines at too acute of an angle. Sometimes this can result in the player being squished out the other side (where he's not supposed to be).
*	Sometimes it's better to just create a wall than a ceiling (if the ceiling you're creating is at an angle too close to vertical). When a ceiling is too steep it causes the player to be pushed down to the bottom of the line if pressed up against it.
*	Find a balance between enough lines to model the contours of your level and performance. Once the grid system is in place this will become less of an issue.