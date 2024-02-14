function printToConsole() {
	console.clear(); // On nettoie la console

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
  console.log(puzzleValide);
  
  

}