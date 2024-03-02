const WebSocket = require('ws');
const http = require('http');

const fs = require('fs');
const path = require('path');

const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

const SERVER_VERSION = 1

let UUID = 0

wss.on('connection', (ws) => {
	console.log('Nouvelle connexion WebSocket.');
	ws.playerId = UUID ++;

	ws.on('message', (message) => {
		const packet = JSON.parse(message);

		// Traitez différents types de paquets ici
		switch(packet.type) {
			case 'checkVersion':
				ws.send(JSON.stringify({
					type: 'versionCheckResponse',
					isCompatible: packet.version === SERVER_VERSION,
					version: SERVER_VERSION
				}))
				break
			case 'createGame':
				// Gestion du paquet de création de partie
				// TODO : Corriger les arguments
				initGame(ws, packet.numPlayers, packet.numColumns, packet.numRows);
				break;
			case 'joinGame':
				// Gestion du paquet de rejoindre une partie
				handlePlayerConnection(ws, packet.gameCode);
				break;
			//~ case 'makeMove':
				//~ handleColumnChoice(ws, packet.column);
				//~ break;
		}
	});

	ws.on('close', () => {
		handlePlayerDisconnection(ws);
	});
});

const parties = {}; // Objet pour stocker les informations des parties
const clients = new Map(); // Map pour associer les connexions WebSocket aux joueurs
//~ const COLORS = ['rouge', 'jaune', 'vert', 'bleu', 'violet', 'orange']; // Couleurs disponibles

// Définition des états du jeu
const GAME_STATES = {
	WAITING: 'Attente de Joueurs',
	IN_PROGRESS: 'Jeu en Cours',
	GAME_OVER: 'Fin de Partie',
};

function initGame(playerWs, numPlayers, numColumns, numRows) {
	// Validation des valeurs fournies
	// TODO : Changer les arguments
	if (
		//~ !Number.isInteger(numPlayers) || numPlayers < 2 || numPlayers > 6 ||
		//~ !Number.isInteger(numColumns) || numColumns < 4 || numColumns > 32 ||
		//~ !Number.isInteger(numRows) || numRows < 4 || numRows > 32
		true
	) {
		// Paquet échec création partie
		playerWs.send(JSON.stringify({
			type: 'error',
			message: "Paramètres de partie invalides.",
		}));
		return;
	}

	// Génération d'un code de partie
	const gameCode = generateGameCode();

	// Initialisation de la grille
	//~ const gameGrid = initializeGameGrid(numColumns, numRows);

	// Ajout du joueur à la partie
	const game = {
		code: gameCode,
		state: GAME_STATES.WAITING,
		//~ numPlayers,
		//~ cols: numColumns,
		//~ rows: numRows,
		players: {1: playerWs},
		currentTurn: 0, // Le premier joueur qui a le tour est celui qui a créé la partie
		//~ grid: gameGrid,
	};

	// Stockage de la partie
	parties[gameCode] = game;

	// Envoi d'un paquet d'informations au joueur
	playerWs.send(JSON.stringify({
		type: 'gameInfo',
		gameCode,
		//~ numPlayers,
		//~ cols: numColumns,
		//~ rows: numRows,
		//~ playerColor: 1,
		//~ grid: gameGrid,
		state: GAME_STATES.WAITING,
		players: 1,
		turn: 0
	}));
}

//~ function initializeGameGrid(numColumns, numRows) {
    //~ return new Array(numRows * numColumns).fill(0);
//~ }

// Fonction pour traiter la connexion d'un joueur
function handlePlayerConnection(ws, code) {
	// Vérification que le code correspond à une partie en cours
	const game = parties[code];

	if (!game) {
		// Code de partie invalide, envoyer un paquet d'erreur au joueur
		ws.send(JSON.stringify({
			type: 'error',
			message: 'Code de partie invalide.',
		}));
		return;
	}

	// Attribution d'une couleur au nouveau joueur
	// TODO : Changer de méthode s'assignation (couleur -> place)
	const playerColor = assignPlayerColor(game);

	if (playerColor === 0) {
		// Aucune couleur libre, la partie est pleine, envoyer un paquet d'erreur au joueur
		ws.send(JSON.stringify({
			type: 'error',
			message: 'La partie est pleine.',
		}));
		return;
	}

	// Ajout du joueur à la partie
	game.players[playerColor] = ws;
	const nbPlayers = Object.keys(game.players).length

	// Vérifier si le nombre de joueurs atteint le maximum
	if (nbPlayers === game.numPlayers) {
		// Changer le statut de la partie en cours
		game.state = GAME_STATES.IN_PROGRESS;

		// Mettre à jour le tour s'il est encore nul
		if (game.currentTurn === 0) {
			game.currentTurn = 1; // Le premier joueur qui a le tour est celui qui a créé la partie
		}
	}

	// Envoi des paquets aux joueurs
	Object.keys(game.players).forEach((color) => {
		const playerWs = game.players[color];
		if (playerWs === ws) {
			// Envoi du paquet GameInfo au nouveau joueur
			playerWs.send(JSON.stringify({
				type: 'gameInfo',
				gameCode: code,
				//~ numPlayers: game.numPlayers,
				//~ cols: game.cols,
				//~ rows: game.rows,
				//~ playerColor: playerColor,
				//~ grid: game.grid,
				state: game.state,
				players: nbPlayers,
				turn: game.currentTurn
			}));
		} else {
			sendGameUpdate(playerWs, game);
		}
	});
}

// Fonction pour traiter la déconnexion d'un joueur
function handlePlayerDisconnection(ws) {
	console.log("Déconnexion d'un joueur")
	// Recherche de la partie à laquelle le joueur était connecté
	let gameCode = null;
	let playerColor = null; // à changer

	// Parcourir les parties en cours pour trouver le joueur
	for (const code in parties) {
		const game = parties[code];
		for (const color in game.players) {
			if (ws.playerId === game.players[color].playerId) {
				gameCode = code;
				playerColor = color;
				break;
			}
		}
		if (gameCode && playerColor) {
			break;
		}
	}

	// Si le joueur n'était pas dans une partie, ne rien faire
	if (!gameCode || !playerColor) {
		return;
	}

	// Libérer la place du joueur dans la partie
	delete parties[gameCode].players[playerColor];

	// Si la partie était en cours et qu'il était le dernier joueur, abandonner la partie
	if (Object.keys(parties[gameCode].players).length === 0) {
		// Libérer le code de la partie
		delete parties[gameCode];
		return
	}
	if(parties[gameCode].state === GAME_STATES.IN_PROGRESS) {
		// Si d'autres joueurs sont encore présents
		// Mettre à jour le statut de la partie et envoyer un paquet de mise à jour
		parties[gameCode].state = GAME_STATES.WAITING;

		// Envoi des paquets aux joueurs
		Object.keys(parties[gameCode].players).forEach((color) => {
			sendGameUpdate(parties[gameCode].players[color], parties[gameCode]);
		});
	}
}
/*
// Fonction pour traiter le choix d'une colonne par un joueur
function handleColumnChoice(ws, column) {
	// Recherche de la partie à laquelle le joueur était connecté
	let game = null;
	let playerColor = null;

	// Parcourir les parties en cours pour trouver le joueur
	for (const code in parties) {
		game = parties[code];
		for (const color in game.players) {
			if (ws.playerId === game.players[color].playerId) {
				playerColor = color;
				break;
			}
		}
		if (playerColor) break;
	}

	// Vérifier si le joueur est dans une partie
	if (!playerColor) {
		// Envoyer un paquet d'erreur au joueur
		// Paquet échec création partie
		ws.send(JSON.stringify({
			type: 'error',
			message: "Message invalide: Vous n'est pas dans une partie.",
		}));
		return;
	}

	// Vérifier si la partie est en cours
	if (game.state !== GAME_STATES.IN_PROGRESS) {
		// Envoyer un paquet d'update au joueur
		sendGameUpdate(ws, game);
		return;
	}

	// Vérifier si c'est le tour du joueur
	if (game.currentTurn != playerColor) {
		// Envoyer un paquet d'update au joueur
		sendGameUpdate(ws, game);
		return;
	}

	if (!Number.isInteger(column) || column < 0 || column >= game.cols || game.grid[column] != 0) {
		// Envoyer un paquet d'update au joueur
		sendGameUpdate(ws, game);
		return;
	}

	for(let cell = column + (game.rows - 1) * game.cols; cell >= 0; cell -= game.cols) {
		if(game.grid[cell] == 0) {

			game.grid[cell] = game.currentTurn;
			break;
		}
	}

	let full = isGameFull(game)
	switch(full) {
		case -1:
			game.currentTurn = 0;
			game.state = GAME_STATES.GAME_OVER
			break
		case 0:
			// Passer au joueur suivant
			game.currentTurn = (game.currentTurn%game.numPlayers)+1;
			break
		default:
			// Gagnant : full
			game.currentTurn = 0;
			game.state = GAME_STATES.GAME_OVER
	}

	// Envoi des paquets aux joueurs
	Object.keys(game.players).forEach((color) => {
		sendGameUpdate(game.players[color], game);
	});
}
*/
// Fonction pour envoyer un paquet d'update à un joueur
function sendGameUpdate(ws, game) {
	const updatePacket = {
		type: 'gameUpdate',
		//~ numPlayers: game.numPlayers,
		state: game.state,
		turn: game.currentTurn,
		//~ grid: game.grid,
		players: Object.keys(game.players).length,
	};

	try {
		ws.send(JSON.stringify(updatePacket));
	} catch (error) {
		console.error('Erreur lors de l\'envoi du paquet d\'update au joueur :', error);
		// Gérer l'erreur, par exemple, déconnecter le joueur
		handlePlayerDisconnection(ws);
	}
}
/*
// Fonction pour vérifier si une partie est complète
function isGameFull(game) {
	const grid = game.grid;
	const numCols = game.cols;
	const numRows = game.rows;

	// Vérifier si la grille est complète
	if (grid.every(cell => cell !== 0)) {
		return -1; // La grille est complète
	}

	// Vérifier les lignes
	for (let row = 0; row < numRows; row++) {
		for (let col = 0; col < numCols - 3; col++) {
			const currentCell = grid[row * numCols + col];
			if (currentCell !== 0 &&
				currentCell === grid[row * numCols + col + 1] &&
				currentCell === grid[row * numCols + col + 2] &&
				currentCell === grid[row * numCols + col + 3]) {
				return currentCell; // Séquence de quatre cellules consécutives trouvée
			}
		}
	}

	// Vérifier les colonnes
	for (let col = 0; col < numCols; col++) {
		for (let row = 0; row < numRows - 3; row++) {
			const currentCell = grid[row * numCols + col];
			if (currentCell !== 0 &&
				currentCell === grid[(row + 1) * numCols + col] &&
				currentCell === grid[(row + 2) * numCols + col] &&
				currentCell === grid[(row + 3) * numCols + col]) {
				return currentCell; // Séquence de quatre cellules consécutives trouvée
			}
		}
	}

	// Vérifier les diagonales (de gauche à droite)
	for (let row = 0; row < numRows - 3; row++) {
		for (let col = 0; col < numCols - 3; col++) {
			const currentCell = grid[row * numCols + col];
			if (currentCell !== 0 &&
				currentCell === grid[(row + 1) * numCols + col + 1] &&
				currentCell === grid[(row + 2) * numCols + col + 2] &&
				currentCell === grid[(row + 3) * numCols + col + 3]) {
				return currentCell; // Séquence de quatre cellules consécutives trouvée
			}
		}
	}

	// Vérifier les diagonales (de droite à gauche)
	for (let row = 0; row < numRows - 3; row++) {
		for (let col = 3; col < numCols; col++) {
			const currentCell = grid[row * numCols + col];
			if (currentCell !== 0 &&
				currentCell === grid[(row + 1) * numCols + col - 1] &&
				currentCell === grid[(row + 2) * numCols + col - 2] &&
				currentCell === grid[(row + 3) * numCols + col - 3]) {
				return currentCell; // Séquence de quatre cellules consécutives trouvée
			}
		}
	}

	return 0; // Aucune condition de fin trouvée
}
*/

function generateGameCode() {
	const firstCode = Math.floor(Math.random() * 9000) + 1000;
	let currentCode = firstCode;

	do {
		if (!parties[currentCode]) {
			return currentCode;
		}

		currentCode = ((currentCode - 999) % 9000) + 1000;
	} while (currentCode !== firstCode);

	// Aucun code libre
	return 0;
}

// A renommer
function assignPlayerColor(game) {
	// Tableau des numéros déjà attribués
	const assignedColors = new Set(Object.keys(game.players).map(Number));

	// Trouver le premier numéro libre
	return Array.from({ length: game.numPlayers }, (_, i) => i + 1).find(num => !assignedColors.has(num)) || 0;
}

server.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, (ws) => {
		wss.emit('connection', ws, request);
	});
});

server.listen(3000, () => {
	console.log('Serveur WebSocket en écoute sur le port 3000');
});

