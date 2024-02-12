// Puzzle en cours
let puzzle={
	mat: [   // matrice representant la carte
		[1,1,1,2,1,1],
		[1,0,1,2,2,1],
		[1,0,0,0,0,1],
		[1,0,0,0,0,1],
		[1,1,0,0,1,1],
		[1,1,1,1,1,1]
	],
	cat:"",     // categorie de la carte de l'user
	pieces: {   // liste des pieces posées dans le puzzle
		2: "rouge"
	}
};

// Constantes
let pieceList = { // liste des pieces existantes
	orange: [[1]],
	jaune: [[1,1,1]],
	violet: [[1,1,1,1]],
	rouge: [[1,0],[1,1]],
	bleu: [[1,0,0],[1,1,1]]
};

let couleurs = { // liste des pieces existantes
	orange: "2", // s'affiche en vert car c'est plus simple
	jaune: "3",
	violet: "5",
	rouge: "1",
	bleu: "4"
};

// Variables
select = "orange"; // Pièce actuellement sélectionnée
rotation = 0; // Nombre de rotations
reverse = 0; // Nombre de reverse
posX = 0; // Position X
posY = 0; // Position Y
lastMsg = `  Z Q S D : Déplacer la pièce
  1 2 3 4 5 : Choisir une autre pièce
  R : Reverse
  T : Tourner
  V : Poser la pièce
  exit : Quitter
Il faut appuyer sur ENTER à chaque fois.`; // Message pour l'utilisateur
selectedPiece = []; // Représentation de la pièce actuellement sélectionnée (à mettre à jour grace à updatePiece)


// Initialisation
updatePiece(); // initialisation du contenu de selectedPiece
printToConsole(); // Premier affichage dans la console

// Écoute les données d'entrée utilisateur
process.stdin.on('data', (chunk) => {
	// Recuperation de la commande, sans espaces, pas de majuscules
	const input = chunk.toString().trim().toLowerCase();

	lastMsg = ""; // RaZ du message

	switch(input) {
		case "z":
			if(posY > 0) posY --; // On remonte la pièce de 1
			break;
		case "q":
			if(posX > 0) posX --; // On décale la pièce à gauche
			break;
		case "s":
			if(posY + pieceList[select].length < puzzle.mat.length) posY ++; // On descend de 1
			break;
		case "d":
			if(posX + pieceList[select][0].length < puzzle.mat[0].length) posX ++; // On décale à droite
			break;
		case "r":
			reverse = (reverse + 1)%2; // Reverse
			updatePiece();
			break;
		case "t":
			rotation = (rotation + 1)%4; // Rotation
			updatePiece();
			break;
		case "v":
			fillPuzzle(); // Poser la pièce
			break;
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
			select = ({
				"1": "orange",
				"2": "jaune",
				"3": "violet",
				"4": "rouge",
				"5": "bleu",
			})[input]; // Changement de la pièce sélectionnée
			rotation = 0;
			reverse = 0;
			updatePiece();
			break;
		case "exit":
			process.exit(0); // On termine le procgramme
		default:
			// commande invalide
			lastMsg = `  Z Q S D : Déplacer la pièce
  1 2 3 4 5 : Choisir une autre pièce
  R : Reverse
  T : Tourner
  V : Poser la pièce
  exit : Quitter
Il faut appuyer sur ENTER à chaque fois.`;
	}

	printToConsole()
});

function rotatePiece(piece){ // sens horaire +90deg
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

function printToConsole() {
	console.clear(); // On nettoye la console

	// Remarque:
	// Les "\x1b[ ... m" permettent de choisir la couleur des caractères qui suivent
	//  0 : remise à zéro / couleurs par défaut
	//  1 : en gras ou couleur accentuée ou les deux (selon les consoles)
	//  3X : couleur du caractère
	//  4X : couleur de fond
	// process.stdout.write = console.log sans le retour à la ligne

	console.log("\x1b[1;30m╔" + "═".repeat(28) + "╗\x1b[0m");
	console.log("\x1b[1;30m║\x1b[0m" + " ".repeat(17) + "1 \x1b[42m  \x1b[0m" + " ".repeat(7) + "\x1b[1;30m║\x1b[0m");
	console.log("\x1b[1;30m║" + " ".repeat(28) + "║\x1b[0m");
	console.log("\x1b[1;30m║\x1b[0m \x1b[37m" + "▄".repeat(14) + "\x1b[0m  2 \x1b[43m" + " ".repeat(6) + "\x1b[0m" + " ".repeat(3) + "\x1b[1;30m║\x1b[0m");
	for(i = 0; i < puzzle.mat.length; i++) { // ligne
		process.stdout.write("\x1b[1;30m║\x1b[0m \x1b[47m "); // début de la ligne
		for(j = 0; j < puzzle.mat[0].length; j++) { // colonne
			let disp = "  "; // Caractères pour représenter la pièce à placer
			if((posY <= i) && (posY + selectedPiece.length > i)) {
				if((posX <= j) && (posX + selectedPiece[0].length > j)) {
					disp = selectedPiece[i - posY][j - posX] ? "[]" : "  "; // [] si il y a une case, vide sinon
				}
			}
			process.stdout.write("\x1b[3" + couleurs[select])
			switch(puzzle.mat[i][j]) { // Couleur de fond : selon le contenu de la grille du puzzle
				case 0: // case vide
					break;
				case 1: // Hors du puzzle
					process.stdout.write(";47");
					break;
				default: // Pièce déjà posée
					process.stdout.write(";1;4" + couleurs[puzzle.pieces[puzzle.mat[i][j]]]);
			}
			process.stdout.write("m" + disp + "\x1b[0m") // On affiche par dessus la pièce en train d'être posée
		}
		process.stdout.write("\x1b[47m \x1b[0m  ") // Bord droit
		switch(i) { // Fin des lignes
			case 0:
			case 2:
			case 5:
				console.log(" ".repeat(11) + "\x1b[1;30m║\x1b[0m");
				break;
			case 1:
				console.log("3 \x1b[45m" + " ".repeat(8) + "\x1b[0m" + " \x1b[1;30m║\x1b[0m");
				break;
			case 3:
				console.log("4 \x1b[41m  \x1b[0m" + " ".repeat(7) + "\x1b[1;30m║\x1b[0m");
				break;
			case 4:
				console.log("  \x1b[41m" + " ".repeat(4) + "\x1b[0m" + " ".repeat(5) + "\x1b[1;30m║\x1b[0m");
				break;
		}
	}
	console.log("\x1b[1;30m║\x1b[0m \x1b[37m" + "▀".repeat(14) + "\x1b[0m  5 \x1b[44m  \x1b[0m" + " ".repeat(7) + "\x1b[1;30m║\x1b[0m");
	console.log("\x1b[1;30m║" + " ".repeat(19) + "\x1b[44m" + " ".repeat(6) + "\x1b[0m" + " ".repeat(3) + "\x1b[1;30m║\x1b[0m");
	console.log("\x1b[1;30m║" + " ".repeat(28) + "║\x1b[0m");
	console.log("\x1b[1;30m╚" + "═".repeat(28) + "╝\x1b[0m");
	console.log(lastMsg);
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