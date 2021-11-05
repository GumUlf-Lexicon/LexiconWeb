const tileSideLengthPx = "50";

let characterPos = {
	X: 0,
	Y: 0,
};

let characterMoves = 0;
let numberOfBlocks = 0;
let numberOfBlocksInGoal = 0;
let isGameDone = false;

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
	
	// Setup the cointainers for the game area
	const game = document.getElementById("game");
	
	game.style.width = tileMap.width * tileSideLengthPx + "px";
	game.style.height = tileMap.height * tileSideLengthPx + "px";
	
	const gameArea = document.getElementById("gameArea");
	
	// Remove any old game tiles
	while(gameArea.lastChild){ gameArea.removeChild(gameArea.lastChild)}

	// Setup the grid
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
			gameTile.setAttribute("id", createTileId(column, row));
			
			/*  Legend
			W = Wall
   		B = Movable block
   		P = Player starting position
   		G = Goal area for the blocks
			" " = Empty space
			*/
			// The third indes is to be able to access the value bc of reasons :-p
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
					gameTile.classList.add(Entities.Character);
					characterPos.X = column;
					characterPos.Y = row;
					break;
							
				case "B":
					gameTile.classList.add(Tiles.Space);
					gameTile.classList.add(Entities.Block);
					numberOfBlocks++;
					break;
								
				default:
					break;
			}
									
			gameArea.appendChild(gameTile);
									
		}
	}
}


function keyListner(e) {
	// Listen for key presses to capture game commands

	switch (e.code) {
	
		case 'ArrowUp':
		case 'KeyW':
			e.preventDefault();
			moveCharacter(0, -1);
			break;
		
		case 'ArrowDown':
		case 'KeyS':
			e.preventDefault();
			moveCharacter(0, 1);
			break;
		
		case 'ArrowLeft':
		case 'KeyA':
			e.preventDefault();
			moveCharacter(-1, 0);
			break;
		
		case 'ArrowRight':
		case 'KeyD':
			e.preventDefault();
			moveCharacter(1, 0);
			break;
	
		case 'KeyR':
			setupGameArea(tileMap01);
			break;
		
		default:
			break;
	}
}

function moveCharacter(dX, dY) {

	if (positionInsideGameArea(characterPos.X + dX, characterPos.Y + dY)) {
		let newCharacterTile = document.getElementById(createTileId(characterPos.X + dX, characterPos.Y + dY));
		if (newCharacterTile.classList.contains(Tiles.Wall)) {
			// Can't move into a wall
			return;
		}
		else if ((newCharacterTile.classList.contains(Entities.Block) || newCharacterTile.classList.contains(Entities.BlockDone)) && !moveBlock(characterPos.X + dX, characterPos.Y + dY, dX, dY)) {
			// Can't move block
			return;
		}
		else {
			// Move of Character is possible
			let currentTile = document.getElementById(createTileId(characterPos.X, characterPos.Y));
			
			currentTile.classList.remove(Entities.Character);

			if (currentTile.classList.contains(Tiles.Goal)) {
				currentTile.classList.remove(Entities.Character + '-goal');
			}
			
			newCharacterTile.classList.add(Entities.Character);

			if (newCharacterTile.classList.contains(Tiles.Goal)) {
				newCharacterTile.classList.add(Entities.Character + '-goal');
			}

			characterPos.X = characterPos.X + dX;
			characterPos.Y = characterPos.Y + dY;
			characterMoves++;
		}
	}

	if (numberOfBlocks === numberOfBlocksInGoal) {
		if (confirm("Congratulations! You won the game in " + characterMoves + " moves!\n To start a new game, press OK!")) {
			setupGameArea(tileMap01);
		}
		else {
			return;
		}
	}

}

function moveBlock(x, y, dX, dY) {

	if (positionInsideGameArea(x + dX, y + dY)){
		let presentBlockTile = document.getElementById(createTileId(x, y));
		let newBlockTile = document.getElementById(createTileId(x + dX, y + dY));

		let isMovePossible = !newBlockTile.classList.contains(Tiles.Wall) && !newBlockTile.classList.contains(Entities.Block) && !newBlockTile.classList.contains(Entities.BlockDone);

		if (isMovePossible && presentBlockTile.classList.contains(Tiles.Space) && newBlockTile.classList.contains(Tiles.Space)) {
			// Block is moved from one space tile to another
			presentBlockTile.classList.remove(Entities.Block);
			newBlockTile.classList.add(Entities.Block);
			return true;
		}
		else if (isMovePossible && presentBlockTile.classList.contains(Tiles.Goal) && newBlockTile.classList.contains(Tiles.Space)) {
			// Block is move out from a goal tile to a space tile
			presentBlockTile.classList.remove(Entities.BlockDone);
			newBlockTile.classList.add(Entities.Block);
			numberOfBlocksInGoal--;
			return true;
		}
		else if (isMovePossible && presentBlockTile.classList.contains(Tiles.Goal) && newBlockTile.classList.contains(Tiles.Goal)) {
			// Block is moved from one goal tile to another
			presentBlockTile.classList.remove(Entities.BlockDone);
			newBlockTile.classList.add(Entities.BlockDone);
			return true;
		}
		else if (isMovePossible && presentBlockTile.classList.contains(Tiles.Space) && newBlockTile.classList.contains(Tiles.Goal)) {
			// Block is moved from a space tile to a goal tile
			presentBlockTile.classList.remove(Entities.Block);
			newBlockTile.classList.add(Entities.BlockDone);
			numberOfBlocksInGoal++;
			return true;			
		}
		else {
			return false;
		}
			
	}
	return false;
}


function positionInsideGameArea(x, y) {
	var positionIsInside = true;
	positionIsInside = x >= 0;
	positionIsInside = positionIsInside && x < tileMap01.width;
	positionIsInside = positionIsInside && y >= 0;
	positionIsInside = positionIsInside && y < tileMap01.height;
	return positionIsInside;
}

function createTileId(x, y) {
	return 'x' + x + '_y' + y;
}