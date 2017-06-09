// game parameters
var cellsPerRow = 6;
var cellsPerCol = 6;
var numMines = 5; // todo: put in a check so that the number of mines doesn't exceed the number of cells.


// Put together game board.
for (var row = 0; row < cellsPerRow; row++) {
    var divRow = document.createElement('div');
    divRow.className = 'row';
    for (var col = 0; col < cellsPerCol; col++) {
        var button = document.createElement('button');
        button.id = 'button' + row + col;
        // TODO: refactor this from trying to manipulate strings and into some more coherent pattern, such as an object with a row and column or something. See all locations tagged with the word COORDINATE.
        button.typeName = 'button';
        button.innerHTML = '.';
        button.className = 'button col-xs-' + 12 / cellsPerCol;
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
    var row = Math.floor(Math.random() * cellsPerRow);
    var col = Math.floor(Math.random() * cellsPerCol);
    mineLocations.push([row, col]);
}

mineLocations.forEach(function(item, index, array) {
    document.getElementById('button' + item[0] + item[1]).innerHTML = '*'; // TODO COORDINATE 
    console.log(item, index);
});

// TODO: implement game logic, i.e. for every non-mine cell, write a function to determine number of mines around it and fill.