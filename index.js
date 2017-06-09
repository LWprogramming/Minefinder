

// game parameters
var cellsPerRow = 6;
var cellsPerCol = 6;
var numMines = 5; // todo: put in a check so that the number of mines doesn't exceed the number of cells.

// generate random locations for mines.


// Put together game board.
for (var row = 0; row < cellsPerRow; row++) {
    var divRow = document.createElement('div');
    divRow.className = 'row';
    for (var col = 0; col < cellsPerCol; col++) {
        var button = document.createElement('button');
        button.id = 'button' + row + col;
        button.typeName = 'button';
        button.innerHTML = '.';
        button.className = 'button col-xs-' + 12 / cellsPerCol;
        button.onclick = function() {
            console.log(this.id);
            // TODO: refactor this from trying to manipulate strings and into some more coherent pattern, such as an object with a row and column or something.
        }
        divRow.appendChild(button);   
    }
    document.getElementById('grid').appendChild(divRow);
}