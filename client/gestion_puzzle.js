function rotatePiece(piece) { // sens horaire +90deg
	let res=[];
	for(i in piece[0]){
		res.push([]);
		for(j of piece){
			res[i].unshift(j[i]);
		}
	}
	return res;
}

function reversePiece(piece){ // reverse
	let res=[];
	for(i of piece) res.unshift(i);
	return res;
}

function updatePiece() {
	selectedPiece = pieceList[select]; // Piece de départ
	for(k = 0; k < rotation; k++) selectedPiece = rotatePiece(selectedPiece); // Application des rotations
	for(k = 0; k < reverse; k++) selectedPiece = reversePiece(selectedPiece); // Application du reverse

	// On empêche la pièce de sortir du cadre
	if(posX + selectedPiece[0].length > puzzle.mat[0].length) posX = puzzle.mat[0].length - selectedPiece[0].length;
	if(posY + selectedPiece.length > puzzle.mat.length) posY = puzzle.mat.length - selectedPiece.length;
}

function isComplete() {
    let value=true;
    // Parcourir chaque ligne
    for (var i = 0; i < puzzle.mat.length; i++) {
    // Parcourir chaque élément dans la ligne
        for (var j = 0; j < puzzle.mat[i].length; j++) {
            //console.log(puzzle.mat[i][j]);
            if(puzzle.mat[i][j]=='0'){
            value= false;
            
            } // Afficher chaque élément
        }
    }
    return value;
}

function getNextId() {
	for(i = 2; i < 36; i++) {
		if(!puzzle.pieces[i]) return i;
	}
}

function fillPuzzle() {
    // Boucles for pour vérifier si la pièce peut être posée
	let posable = true;
	for(y in selectedPiece) {
		for(x in selectedPiece[y]) {
			if(selectedPiece[y][x] == 1) {
				posable &= (puzzle.mat[posY*1 + y*1][posX*1 + x*1] == 0);
			}
		}
	}
	if(posable) {
		let id = getNextId();
		for(y in selectedPiece) {
			for(x in selectedPiece[y]) {
				if (selectedPiece[y][x] == 1) {
					puzzle.mat[posY*1 + y*1][posX*1 + x*1] = id;
				}
			}
		}
		puzzle.pieces[id] = select;
		return true;
	} else {
		return false;
	}
}

function refillDeck(deck,nbPieceRendues){
    
    for (let index = 0; index < nbPieceRendues-1; index++) {
        let randomPiece = Math.floor(Math.random() * 5) + 1;
        // Pousser le nombre aléatoire dans le tableau
        deck.push(randomPiece);
    }
    
}