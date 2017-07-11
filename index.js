//TODO FOR NEXT TIME:
// - make sure literally nothing is shown on the page if javascript is not enabled. i.e. probably add all the buttons programmatically.
// for custom button, sanitize inputs.
// for custom button, add default values or background text.
// set up custom button formatting and layout
// - try to make the grid stay...a grid... instead of the poor alignment we see right now: see https://user-images.githubusercontent.com/13173037/27986310-b24f3218-63cb-11e7-8ada-7455cecedff6.png


/*
Other assorted things (no set timeline)
- things marked PROD, aka things to be done when no longer in debug mode. this includes some graphical changes, but also importantly-- hiding the numbers/mines for the cells-- in-game the player won't have access to that
- refactor button.id (anything labeled COORDINATE). See comments there to see--basically try to avoid manipulating strings for everything.
- add a game timer
// implement feature-- can't lose on the first click
- make the website independent of browser, version, mobile vs desktop, etc.
- support chording--look up minesweeper wiki for this.
- add game statistics (that can be reset of course) and leaderboard
- see link: http://www.chezpoor.com/minesweeper/help/minetechnicalnotes.html

- overall plan-- implement logic => design/UI/UX => github pages => user testing.
*/

/*jshint esversion: 6 */

// If Javascript is not disabled, then remove the message saying that it is.
var jsDisabledMessage = document.getElementById("Javascript disabled message");
jsDisabledMessage.parentNode.removeChild(jsDisabledMessage);

var DEBUG = false;

var difficulty = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
    CUSTOM: 'custom'
};

var currentDifficulty = difficulty.EASY;

// cell status must be one of these.
var cellStatusEnum = {
    UNCLICKED: 0,
    CLICKED: 1,
    RIGHTCLICKED: -1
};

var IS_MINE = -1;

var numMinesRemaining = "if you are seeing this something has gone wrong with the number of mines remaining counter";

var UNCLICKED_COLOR;
var RIGHT_CLICKED_COLOR;
var LEFT_CLICKED_COLOR;
var CLICKED_MINE_COLOR = 'red';

var NUM_SAFE_CELLS_LEFT; // this value will be set at the start as number of safe cells - number of mines. Each safe click (including automatically revealed cell clicks) will decrease it by 1. When it reaches 0, then all the safe cells have been revealed, meaning the player has won the game (regardless of flagging status.)

function cell(row, col, status=cellStatusEnum.UNCLICKED, mineStatus=-2) {
    // represents one cell on the board.
    this.row = row;
    this.col = col;
    this.status = status;
    this.mineStatus = mineStatus; // -1 indicates this cell is a mine; 0-8 indicates number of adjacent mines. -2 indicates this didn't get initialized--this shouldn't happen but potentially a useful flag.
}

function numAdjacent(row, col, mineLocations) {
    // returns the number of mines adjacent to the cell with given row and column.
    // mineLocations is an array of cells that are the locations of the mines.
    var adj = 0;
    mineLocations.forEach(function(cell, index, array) {
        if ((row <= cell.row + 1) && (row >= cell.row - 1) &&
            (col <= cell.col + 1) && (col >= cell.col - 1)) {
            adj++;
        }
    });
    return adj;
}

/* Constructs game board given numRows, numCols, and numMines. Returns 2-D array representing the board state of dimensions numRows x numCols. */
function generateGameBoard(numRows, numCols, numMines) {
    var gameBoard = [];
    for (var row = 0; row < numRows; row++) {
        var rowArray = [];
        for (var col = 0; col < numCols; col++) {
            rowArray.push(new cell(row, col));
        }
        gameBoard.push(rowArray);
    }
    // generate random locations for mines.
    var mineLocations = []; // handy list of mine coordinates for convenience. Can be derived from gameBoard but this is more convenient.
    var numMinesSoFar = 0; // avoid marking the same location twice as a mine.
    while (numMinesSoFar < numMines) {
        var mineRow = Math.floor(Math.random() * numRows);
        var mineCol = Math.floor(Math.random() * numCols);
        if (gameBoard[mineRow][mineCol].mineStatus != IS_MINE) {
            gameBoard[mineRow][mineCol].mineStatus = IS_MINE;
            mineLocations.push(new cell(mineRow, mineCol));
            numMinesSoFar++;
        }
    }
    // assign numbers to non-numerical cells
    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            if (gameBoard[row][col].mineStatus != IS_MINE) {
                // If the given cell doesn't have a mine, then we need the number of mines around it.
                gameBoard[row][col].mineStatus = numAdjacent(row, col, mineLocations);
            }
        }
    }

    // set number for mine counter
    document.getElementById('numMinesRemainingNumber').innerHTML = numMines;
    numMinesRemaining = numMines;
    NUM_SAFE_CELLS_LEFT = numRows * numCols - numMines; // this may seem like unnecessary code but it's needed for checking win conditions-- the number of flags doesn't affect that.
    return gameBoard;
}

//COORDINATE
// accounts for the fact that the row and column number for buttons, when that number gets to be two digits, bugs crop up.
// returns a string that is the button id given numerical coordinates.
function buttonIDFromCoordinates(row, col) {
    var rowString = '';
    var colString = '';
    if (row < 10) {
        rowString += '0' + row;
    }
    else {
        rowString += row;
    }
    if (col < 10) {
        colString += '0' + col;
    }
    else {
        colString = col;
    }
    return 'button' + rowString + colString;
}

//COORDINATE
// returns two key-value pairs with row and column information given button id string.
function coordinatesFromButtonID(buttonID) {
    var rowString = buttonID[6] + buttonID[7];
    var colString = buttonID[8] + buttonID[9];
    return {
        row: parseInt(rowString),
        col: parseInt(colString)
    };
}

/*  Given ints row and col, use the 2-D gameBoard array to change contents of the corresponding button.
*/
function revealCellContents(row, col, gameBoard) {
    var symbol;
    if (gameBoard[row][col].mineStatus != IS_MINE) {
        symbol = '' + gameBoard[row][col].mineStatus;
    }
    else {
        symbol = "*"; // for mines
    }
    document.getElementById(buttonIDFromCoordinates(row, col)).innerHTML = symbol; //COORDINATE
}

/*
Given ints row and col, boolean flagStatus (true = currentlyFlagged), toggle the status of the cell in question--i.e. change the corresponding button's innerHTML content. gameBoard parameter used for debugging purposes only, so flagging and then unflagging doesn't hide the value of a cell.
*/
function toggleFlag(row, col, flagStatus, gameBoard=null) {
    if (flagStatus) {
        if (DEBUG) {
            revealCellContents(row, col, gameBoard);
        }
        else {
            document.getElementById(buttonIDFromCoordinates(row, col)).innerHTML = '.';
        }
    }
    else {
        document.getElementById(buttonIDFromCoordinates(row, col)).innerHTML = 'F';
    }
}

function setButtons(gameBoard) {
    if (DEBUG) {
        UNCLICKED_COLOR = 'white';
        RIGHT_CLICKED_COLOR = 'green';
        LEFT_CLICKED_COLOR = 'cyan';
    }

    // Put together game board.
    var numRows = gameBoard.length;
    var numCols = gameBoard[0].length;

    for (var row = 0; row < numRows; row++) {
        var divRow = document.createElement('div');
        divRow.className = 'row';
        for (var col = 0; col < numCols; col++) {
            var button = document.createElement('button');
            button.id = buttonIDFromCoordinates(row, col);
            // refactor this from trying to manipulate strings and into some more coherent pattern, such as an object with a row and column or something. See all locations tagged with the word COORDINATE.
            // https://stackoverflow.com/a/16775485
            button.typeName = 'button';
            button.innerHTML = '.';
            button.className = 'button col-xs-' + 12 / numCols;
            button.disabled = false; // for restarting games.
            if (DEBUG) {
                button.style.background = UNCLICKED_COLOR;
            }
            // button.row = row;
            // button.colum = col; // COORDINATE

            // left-click logic
            button.onclick = function(event) {
                var coordinates = coordinatesFromButtonID(this.id);
                var thisRow = coordinates.row; // COORDINATE
                var thisCol = coordinates.col; // COORDINATE
                if (gameBoard[thisRow][thisCol].status != cellStatusEnum.UNCLICKED) {
                    return; // can't click unless the cell is in its UNCLICKED state.
                }
                gameBoard[thisRow][thisCol].status = cellStatusEnum.CLICKED;
                if (DEBUG) {
                    this.style.background = LEFT_CLICKED_COLOR;
                }
                revealCellContents(thisRow, thisCol, gameBoard);
                if (gameBoard[thisRow][thisCol].mineStatus == 0) {
                    // Clicked a cell with no mines next to it-- a zero. Then for each adjacent unclicked cell, click it.
                    var adjacentCellsList = []; // list of cells adjacent to current cell.
                    if (thisRow != 0) {
                        if (thisCol != 0) {
                            // upper left exists
                            adjacentCellsList.push([thisRow - 1, thisCol - 1]);
                        }
                        if (thisCol != numCols - 1) {
                            // upper right exists
                            adjacentCellsList.push([thisRow - 1, thisCol + 1]);
                        }
                        // cell directly above exists
                        adjacentCellsList.push([thisRow - 1, thisCol]);
                    }
                    if (thisRow != numRows - 1) {
                        if (thisCol != 0) {
                            // lower left exists
                            adjacentCellsList.push([thisRow + 1, thisCol - 1]);
                        }
                        if (thisCol != numCols - 1) {
                            // lower right exists
                            adjacentCellsList.push([thisRow + 1, thisCol + 1]);
                        }
                        // cell directly below exists
                        adjacentCellsList.push([thisRow + 1, thisCol]);
                    }
                    if (thisCol != 0) {
                        // cell to left exists
                        adjacentCellsList.push([thisRow, thisCol - 1]);
                    }
                    if (thisCol != numCols - 1) {
                        // cell to right exists
                        adjacentCellsList.push([thisRow, thisCol + 1]);
                    }
                    for (var i = 0; i < adjacentCellsList.length; i++) {
                        adjCell = adjacentCellsList[i];
                        var adjRow = adjCell[0];
                        var adjCol = adjCell[1];
                        if (gameBoard[adjRow][adjCol].status == cellStatusEnum.UNCLICKED) {
                            document.getElementById(buttonIDFromCoordinates(adjRow, adjCol)).onclick(); // COORDINATE
                        }
                    }
                }
                if (gameBoard[thisRow][thisCol].mineStatus == IS_MINE) {
                    // clicked a mine

                    /*
                    Game over logic:
                    Set the clicked mine to be in red.
                    Then for every other cell c:
                    set button to disabled. No more clicks should register.
                    if c has a number but is flagged, insert the icon that indicates incorrect flagging.
                    if c has a mine and is not flagged, reveal it (i.e. add the icon that indicates mine, but do not click it and do not set background to red).
                    if c has a number and is not flagged, skip over it. only leave the cells that were already clicked.
                    */

                    for (var row = 0; row < numRows; row++) {
                        for (var col = 0; col < numCols; col++) {
                            var currentButton = document.getElementById(buttonIDFromCoordinates(row, col)); // COORDINATE
                            currentButton.disabled = true; // disable clicking after the game
                            if (gameBoard[row][col].mineStatus != IS_MINE && gameBoard[row][col].status == cellStatusEnum.RIGHTCLICKED) {
                                // flagged but not a mine
                                if (DEBUG) {
                                    document.getElementById('button' + row + col).innerHTML = "+";
                                }
                                // PROD : INSERT ICON THAT INDICATES INCORRECT FLAGGING
                            }
                            if (gameBoard[row][col].mineStatus == IS_MINE && gameBoard[row][col].status != cellStatusEnum.RIGHTCLICKED) {
                                // unflagged mine
                                // PROD : INSERT ICON THAT INDICATES INCORRECT FLAGGING
                            }
                        }
                    }

                    if (DEBUG) {
                        console.log("Game over!");
                    }

                    document.getElementById(buttonIDFromCoordinates(thisRow, thisCol)).style.background = CLICKED_MINE_COLOR; // COORDINATE
                    // Change the content to the picture of a mine. PROD
                }

                // all safe cells have been revealed-- player wins!
                NUM_SAFE_CELLS_LEFT--;
                console.log(NUM_SAFE_CELLS_LEFT);
                if (NUM_SAFE_CELLS_LEFT == 0) {
                    if (DEBUG) {
                        console.log("You win!");
                    }
                    // PROD: add a win message/ smiley face/ whatever.
                }
            };

            // right-click logic
            button.onmouseup = function(event) {
                if (event.which == 3) {
                    var coordinates = coordinatesFromButtonID(this.id);
                    var thisRow = coordinates.row; // COORDINATE
                    var thisCol = coordinates.col; // COORDINATE

                    if (gameBoard[thisRow][thisCol].status != cellStatusEnum.CLICKED) {
                        if (DEBUG) {
                            toggleFlag(thisRow, thisCol, gameBoard[thisRow][thisCol].status == cellStatusEnum.RIGHTCLICKED, gameBoard);
                        }
                        else {
                            toggleFlag(thisRow, thisCol, gameBoard[thisRow][thisCol].status == cellStatusEnum.RIGHTCLICKED);
                            // toggle the flag as long as it hasn't been left-clicked already.
                        }
                    }
                    if (gameBoard[thisRow][thisCol].status == cellStatusEnum.UNCLICKED) {
                        gameBoard[thisRow][thisCol].status = cellStatusEnum.RIGHTCLICKED;
                        document.getElementById('numMinesRemainingNumber').innerHTML = --numMinesRemaining;

                        // small easter egg if the number of mines decreases to less than zero-- naturally at least one of the flags is wrong.
                        // note that it's checking for -1 since that's the only time player would go from nonnegative to negative number of mines. This way, we don't create a bunch of messages when going from -1 to -2, -2 to -3 (and back)-- only create the message once.
                        if (numMinesRemaining == -1) {
                            var negativeMinesLeft = document.createElement('div');
                            negativeMinesLeft.id = 'negativeMinesLeft message';
                            negativeMinesLeft.innerHTML = 'Negative mines? Are you sure about that?';
                            document.getElementById('negativeMinesLeftParent').appendChild(negativeMinesLeft);
                        }

                        if (DEBUG) {
                            this.style.background = RIGHT_CLICKED_COLOR;
                        }
                    }
                    else {
                        if (gameBoard[thisRow][thisCol].status == cellStatusEnum.RIGHTCLICKED) {
                            gameBoard[thisRow][thisCol].status = cellStatusEnum.UNCLICKED;
                            document.getElementById('numMinesRemainingNumber').innerHTML = ++numMinesRemaining;
                            // remove the easter egg message if the player removes some mines so that the number of mines goes from -1 to 0, in which case the easter egg message no longer makes sense.
                            if (numMinesRemaining == 0) {
                                var negativeMinesLeftParent = document.getElementById('negativeMinesLeftParent');
                                negativeMinesLeftParent.removeChild(negativeMinesLeftParent.firstChild);
                            }

                            if (DEBUG) {
                                this.style.background = UNCLICKED_COLOR;
                            }
                        }
                    }

                }
            };

            divRow.appendChild(button);
        }
        document.getElementById('grid').appendChild(divRow);
    }

    if (DEBUG) {
        // fill out each button with the correct content.
        for (var row = 0; row < numRows; row++) {
            for (var col = 0; col < numCols; col++) {
                revealCellContents(row, col, gameBoard);
            }
        }
    }
}

function startGame(newDifficulty) {
    // clean out the old stuff, removing all buttons
    // probably can be optimized to just overwrite the previous states but this works fine since boards are small.
    var grid = document.getElementById('grid');
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }

    // board parameters
    // console.log(currentDifficulty);
    if (newDifficulty != difficulty.CUSTOM) {
        currentDifficulty = newDifficulty;
    }
    switch (newDifficulty) {
        case difficulty.EASY:
            var numRows = 8;
            var numCols = 8;
            var numMines = 10;
            break;
        case difficulty.MEDIUM:
            var numRows = 16;
            var numCols = 16;
            var numMines = 40;
            break;
        case difficulty.HARD:
            var numRows = 24;
            var numCols = 24;
            var numMines = 99;
            break;
        case difficulty.CUSTOM:
            // in this case, the number of rows, columns, and mines are custom-set.
            var numRows = document.getElementById('customNumRows').value;
            var numCols = document.getElementById('customNumCols').value;
            var numMines = document.getElementById('customNumMines').value;
            break;
        default:
            // TODO: insert some error handling here--shouldn't ever happen but just in case
            break;
    }
    // build everything back up.
    var gameBoard = generateGameBoard(numRows, numCols, numMines);
    setButtons(gameBoard);
}

startGame(currentDifficulty);

// ***********************************************************************
// some stuff for testing-- delete when done.

// enter debug mode button
var debugToggler = document.createElement('button');
debugToggler.innerHTML = 'toggle debug mode';
debugToggler.onclick = function (event) {
    DEBUG = !DEBUG;
    startGame(currentDifficulty);
};
document.getElementById('difficulties').appendChild(debugToggler);

// instructions for play testing
// var instructionsDiv = document.createElement('div');
var instructions = document.createElement('p');
// instructionsDiv.appendChild(instructions);
instructions.innerHTML = '. is a blank cell; numbers are numbers; mines are asterisks; flags are F. Red means you clicked a mine so that\'s game over, but you can click one of the buttons below to restart at any time.';
instructions.style.cssFloat = 'initial';
instructions.style.width = '500px';
document.getElementById('allcontent').appendChild(instructions);