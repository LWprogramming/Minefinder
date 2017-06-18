// If Javascript is not disabled, then remove the message saying that it is.
var jsDisabledMessage = document.getElementById("Javascript disabled message");
jsDisabledMessage.parentNode.removeChild(jsDisabledMessage);
// TODO: this entire program is run regarless of whether javascript is allowed when viewing this in chrome or not. not sure why; commenting it out prevents it from being run, so probably an issue with chrome settings or whatever, not js.

// game parameters
var numRows = 6;
var numCols = 6;
var numMines = 5; // todo: put in a check so that the number of mines doesn't exceed the number of cells.

function cell(row, col) {
    // represents one cell on the board.
    this.row = row;
    this.col = col;
    this.isEqual = function(otherCell) {return (this.row == otherCell.row) && (this.col == otherCell.col);} // rather hacky and will need to change if the definition of cell changes, but unfortunately Javascript doesn't seem to have a compare objects by value equality operator. 
}

// Put together game board.
for (var row = 0; row < numRows; row++) {
    var divRow = document.createElement('div');
    divRow.className = 'row';
    for (var col = 0; col < numCols; col++) {
        var button = document.createElement('button');
        button.id = 'button' + row + col;
        // TODO: refactor this from trying to manipulate strings and into some more coherent pattern, such as an object with a row and column or something. See all locations tagged with the word COORDINATE.
        button.typeName = 'button';
        button.innerHTML = '.';
        button.className = 'button col-xs-' + 12 / numCols;
        button.onclick = function() {
            console.log(this.id);
        }
        divRow.appendChild(button);   
    }
    document.getElementById('grid').appendChild(divRow);
}

// generate random locations for mines.
var mineLocations = [];
for (var i = 0; i < numMines; i++){
    var row = Math.floor(Math.random() * numRows);
    var col = Math.floor(Math.random() * numCols);
    mineLocations.push(new cell(row, col));
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

function generateGameBoard() {
    // place mines
    mineLocations.forEach(function(mine, index, array) {
        document.getElementById('button' + mine.row + mine.col).innerHTML = '*';
        console.log(mine, index);
    });

    // assign numbers to non-numerical cells
    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            if (!mineLocations.find((mineLocation, index, array) => {
                return mineLocation.isEqual(new cell(row, col)); })) {
                // If the given cell is not found within mineLocations, then that cell doesn't have a mine.
                document.getElementById('button' + row + col).innerHTML = numAdjacent(row, col, mineLocations);
            }
        }
    }
}

generateGameBoard();


// TODO: implement game logic, i.e. for every non-mine cell, write a function to determine number of mines around it and fill.