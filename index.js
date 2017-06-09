var cellsPerRow = 6;
var cellsPerCol = 6;

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