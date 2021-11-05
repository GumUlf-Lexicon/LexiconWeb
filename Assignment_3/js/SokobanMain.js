
// Don't change without making new images
const tileSideLengthPx = "50";

// Where is the character?
let characterPos = {
	X: 0,
	Y: 0,
};

// What way do we want to go?
const Direction = {
	UP: 'UP',
	LEFT: 'LEFT',
	DOWN: 'DOWN',
	RIGHT: 'RIGHT'
};

// Initiate and start the game
let characterMoves;
let numberOfBlocks;
let numberOfBlocksInGoal;
let isGameDone;

setupGameArea(tileMap01);
document.addEventListener('keydown', keyListner);


function setupGameArea(tileMap) {
	// Reset values to not be using old data
	characterPos = {
		X: 0,
		Y: 0,
	};
	
	characterMoves = 0;
	numberOfBlocks = 0;
	numberOfBlocksInGoal = 0;
	isGameDone = false;
	
	const sokobanBody = document.getElementsByTagName('body')[0];
	
	// Cleanup the playing area
	while (sokobanBody.lastChild) { sokobanBody.removeChild(sokobanBody.lastChild) }
	

	// Setup the cointainers for the game area
	const game = document.createElement('div');
	game.setAttribute("id", "game");
	sokobanBody.appendChild(game);
	
	game.style.width = tileMap.width * tileSideLengthPx + "px";
	game.style.height = tileMap.height * tileSideLengthPx + "px";
	

	const gameArea = document.createElement('div');
	gameArea.setAttribute("id", "gameArea");
	game.appendChild(gameArea);

	// Setup the grid for the game tiles
	gameArea.style.display = "grid";
	
	let gridColumns = "";
	let gridRows = "";
	
	for (let x = 0; x < tileMap.width; x++) {
		gridColumns = gridColumns + tileSideLengthPx +"px ";
	}
	
	for (let y = 0; y < tileMap.height; y++) {
		gridRows = gridRows + tileSideLengthPx+ "px ";
	}
	
	gameArea.style.gridTemplateColumns = gridColumns;
	gameArea.style.gridTemplateRows = gridRows;

	
	// Fill the grid with game tiles
	for (let row = 0; row < tileMap.height; row++){
		for (let column = 0; column < tileMap.width; column++){
			
			const gameTile = document.createElement("div");
			gameTile.setAttribute("id", constructTileId(column, row));
			
			/*  Legend
			W = Wall
   		B = Movable block
   		P = Player starting position
   		G = Goal area for the blocks
			" " = Empty space
			*/
			// The third index is to be able to access the value bc of reasons :-p
			switch (tileMap.mapGrid[row][column][0]) {
				case " ":
					gameTile.classList.add(Tiles.Space);
					break;
					
				case "W":
					gameTile.classList.add(Tiles.Wall);
					break;
					
				case "G":
					gameTile.classList.add(Tiles.Goal);
					break;
						
				case "P":
					gameTile.classList.add(Tiles.Space);

					const characterTile = document.createElement("div");
					characterTile.setAttribute("id", Entities.Character);
					characterTile.classList.add(Entities.Character);
					gameTile.appendChild(characterTile);
					
					characterPos.X = column;
					characterPos.Y = row;
					break;
							
				case "B":
					gameTile.classList.add(Tiles.Space);

					const blockTile = document.createElement("div");
					blockTile.setAttribute("id", Entities.Block + '_' + numberOfBlocks);
					blockTile.classList.add(Entities.Block);
					gameTile.appendChild(blockTile);

					numberOfBlocks++;
					break;
								
				default:
					break;
			}
									
			gameArea.appendChild(gameTile);
									
		}
	}
}


// Listen for key presses to capture game commands
function keyListner(e) {

	switch (e.key) {
	
		// Move character upwards
		case 'ArrowUp':
		case 'w':
		case 'W':
			e.preventDefault();
			moveCharacter(Direction.UP);
			break;
		
		// Move character downwards
		case 'ArrowDown':
		case 's':
		case 'S':
			e.preventDefault();
			moveCharacter(Direction.DOWN);
			break;
		
		// Move character to the left
		case 'ArrowLeft':
		case 'a':
		case 'A':
			e.preventDefault();
			moveCharacter(Direction.LEFT);
			break;
		
		// Move charater to the right
		case 'ArrowRight':
		case 'd':
		case 'D':
			e.preventDefault();
			moveCharacter(Direction.RIGHT);
			break;
	
		// Restart the game
		case 'r':
		case 'R':
			setupGameArea(tileMap01);
			break;
		
		default:
			break;
	}
}

// Move the character one step in the specified direction
function moveCharacter(direction) {

	if (isGameDone) {
		return;
	}

	let dX=0, dY=0;

	switch (direction) {

		case Direction.UP:
			dY = -1;
			break;

		case Direction.LEFT:
			dX = -1;
			break;
		
		case Direction.DOWN:
			dY = 1;
			break;
		
		case Direction.RIGHT:
			dX = 1;
			break;
		
		default:
			return;
	}
	


	if (!positionInsideGameArea(characterPos.X + dX, characterPos.Y + dY)) {
		return;
	}

	let newCharacterTile = document.getElementById(constructTileId(characterPos.X + dX, characterPos.Y + dY));
	if (newCharacterTile.classList.contains(Tiles.Wall)) {
		// Can't move into a wall
		return;
	}
	else if (containsBlock(newCharacterTile) && !moveBlock(characterPos.X + dX, characterPos.Y + dY, dX, dY)) {
		// Can't move block
		return;
	}
	else {
		// Move of Character is possible
		let currentTile = document.getElementById(constructTileId(characterPos.X, characterPos.Y));			
		let characterTile = currentTile.removeChild(document.getElementById(Entities.Character));
		
		newCharacterTile.appendChild(characterTile);
		
		// Keep track of the character position
		characterPos.X = characterPos.X + dX;
		characterPos.Y = characterPos.Y + dY;
		
		characterMoves++;
	}

	// Check if the game is won, and present some stats and 
	// give the player the possibility to start a new game.
	if (numberOfBlocks === numberOfBlocksInGoal) {
		isGameDone = true;
		if (confirm("Congratulations! You won the game in " + characterMoves + " moves!\n To start a new game, press OK!")) {
			setupGameArea(tileMap01);
		}
	}

}

function moveBlock(x, y, dX, dY) {

	// Checking that the new place for the block is inside the game area
	if (!positionInsideGameArea(x + dX, y + dY)) {
		return false;
	}

	// We can't move the block to a tile with a wall or another block
	const newBlockTile = document.getElementById(constructTileId(x + dX, y + dY));
	if (newBlockTile.classList.contains(Tiles.Wall) || containsBlock(newBlockTile)) {
		return false;
	}

	// Time to move the Block
	const presentBlockTile = document.getElementById(constructTileId(x, y));
	
	if (presentBlockTile.classList.contains(Tiles.Space) && newBlockTile.classList.contains(Tiles.Space)) {

		// Block is moved from one space tile to another
	
		let block = presentBlockTile.removeChild(presentBlockTile.lastChild);
		newBlockTile.appendChild(block);

		return true;
	
	}
	else if (presentBlockTile.classList.contains(Tiles.Goal) && newBlockTile.classList.contains(Tiles.Space)) {

		// Block is moved from a goal tile to a space tile
	
		let block = presentBlockTile.removeChild(presentBlockTile.lastChild);
		block.classList.remove(Entities.BlockDone);
		
		block.classList.add(Entities.Block);
		newBlockTile.appendChild(block);
		
		numberOfBlocksInGoal--;
	
		return true;
	
	}
	else if (presentBlockTile.classList.contains(Tiles.Goal) && newBlockTile.classList.contains(Tiles.Goal)) {
	
		// Block is moved from one goal tile to another
	
		let block = presentBlockTile.removeChild(presentBlockTile.lastChild);
		block.classList.remove(Entities.BlockDone);
	
		block.classList.add(Entities.BlockDone);
		newBlockTile.appendChild(block);
	
		return true;
	
	}
	else if (presentBlockTile.classList.contains(Tiles.Space) && newBlockTile.classList.contains(Tiles.Goal)) {
	
		// Block is moved from a space tile to a goal tile
	
		let block = presentBlockTile.removeChild(presentBlockTile.lastChild);
		block.classList.remove(Entities.Block);

		block.classList.add(Entities.BlockDone);
		newBlockTile.appendChild(block);

		numberOfBlocksInGoal++;
	
		return true;
	}
	else {

		// Why are we here?
		return false;
	}		
}


// Check that the coordinates are inside the game area.
function positionInsideGameArea(x, y) {
	var isInside = true;
	isInside = x >= 0;
	isInside = isInside && x < tileMap01.width;
	isInside = isInside && y >= 0;
	isInside = isInside && y < tileMap01.height;
	return isInside;
}

// Check if a given tile has any kind of block on it
function containsBlock(tile){
	return tile.getElementsByClassName(Entities.Block).length > 0 || tile.getElementsByClassName(Entities.BlockDone).length > 0;
}

// Make a tileId from coordinates
function constructTileId(x, y) {
	return 'x' + x + '_y' + y;
}