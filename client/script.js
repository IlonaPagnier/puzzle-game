// Déclarer la constante de version
const CLIENT_VERSION = 1;
let	 socket;
// Timeout pour la vérification de version (en millisecondes)
const versionCheckTimeout = 5000; // 5 secondes

const COULEURS = ["", "ROUGE", "JAUNE", "BLEU", "VERT", "ORANGE", "VIOLET"]

let numPlayers, numColumns, numRows, playerColor, playerTurn;

// Fonction pour afficher le message
function showMessage(message) {
	const messageBox = document.getElementById('message-box');
	const messageText = document.getElementById('message-text');
	console.log(message)
	messageText.textContent = message;
	messageBox.style.display = 'block';
}

// Fonction pour masquer le message
function hideMessage() {
	const messageBox = document.getElementById('message-box');
	messageBox.style.display = 'none';
}

// Fonction pour tenter la connexion au serveur
function connectToServer(event) {
	//~ const gameCodeDisplay = document.getElementById('game-code-display');
	//~ const playerColorDisplay = document.getElementById('player-color');
	//~ const gameStatusDisplay = document.getElementById('game-status');
	//~ const nbPlayersDisplay = document.getElementById('nb-players');
	//~ const playerTurnDisplay = document.getElementById('player-turn');

	//~ let cells

	event.preventDefault();
	const serverAddressInput = document.getElementById('server-address');
	let serverAddress = serverAddressInput.value.trim(); // Récupérer l'adresse saisie
	if(! /:\/\//.test(serverAddress)) serverAddress = "ws://" + serverAddress

	// Réinitialiser le message d'erreur
	showMessage('Connexion au serveur...');

	socket = new WebSocket(`${serverAddress}`);

	let versionCheckTimer; // Timer pour gérer le timeout

	// Événement déclenché lorsque la connexion WebSocket est ouverte
	socket.addEventListener('open', () => {
		showMessage('Connexion WebSocket ouverte...');

		// Envoyer un paquet de vérification de version
		const versionCheckPacket = {
			type: 'checkVersion',
			version: CLIENT_VERSION,
		};
		socket.send(JSON.stringify(versionCheckPacket));

		// Définir le timer pour le timeout de la vérification de version
		versionCheckTimer = setTimeout(() => {
			console.log('Timeout de vérification de version.');
			// Fermer la connexion en cas de timeout
			socket.close();
		}, versionCheckTimeout);
	});

	// Événement déclenché lorsque le serveur envoie un message
	socket.addEventListener('message', event => {
		const packet = JSON.parse(event.data);

		// Traiter les différents types de paquets reçus
		switch (packet.type) {
			case 'error':
				// Gérer les erreurs
				console.error('Erreur du serveur :', packet.message);
				showMessage(packet.message)
				// Ajoutez le code pour afficher le message d'erreur à l'utilisateur
				clearTimeout(versionCheckTimer); // Annuler le timer en cas d'erreur
				break;
			case 'versionCheckResponse':
				// Gérer la réponse de vérification de version
				clearTimeout(versionCheckTimer); // Annuler le timer en cas de réponse
				if (packet.isCompatible) {
					console.log('Version compatible avec le serveur.');

					// Masquer le bloc "offline-block" et afficher le bloc "lobby-block"
					const offlineBlock = document.getElementById('offline-block');
					const lobbyBlock = document.getElementById('lobby-block');

					offlineBlock.style.display = 'none';
					lobbyBlock.style.display = 'block';

					hideMessage();
				} else {
					console.log('Version incompatible avec le serveur.');
					let errorMessage = 'Versions incompatibles.';
					if (packet.version) {
						errorMessage += ` Serveur: v${packet.version}, Client: v${CLIENT_VERSION}.`;
					}
					showMessage(errorMessage);
					socket.close(); // Fermer la connexion en cas d'incompatibilité de version
				}
				break;
				/*
			case 'gameInfo':
				numPlayers = packet.numPlayers;
				numColumns = packet.cols;
				numRows = packet.rows;
				playerColor = packet.playerColor;
				playerTurn = packet.turn;

				// Gérer les informations de la partie// Masquer le lobby
				const lobbyBlock = document.getElementById('lobby-block');
				lobbyBlock.style.display = 'none';

				// Afficher le bloc de jeu
				const gameBlock = document.getElementById('game-block');
				gameBlock.style.display = 'block';

				// Afficher les informations de la partie
				gameCodeDisplay.textContent = packet.gameCode
				playerColorDisplay.textContent = COULEURS[packet.playerColor]
				gameStatusDisplay.textContent = packet.state
				nbPlayersDisplay.textContent = packet.players + "/" + packet.numPlayers
				playerTurnDisplay.textContent = COULEURS[packet.turn]

				// Générer la grille
				const gameBoard = document.getElementById('game-board');
				gameBoard.innerHTML = ''; // Effacer le contenu existant

				// Appliquer le style grid-template-columns
				gameBoard.style.gridTemplateColumns = `repeat(${packet.cols}, 1fr)`;

				for (let i = 0; i < packet.rows * packet.cols; i++) {
					const cell = document.createElement('div');
					cell.setAttribute('data-id', i);
					cell.setAttribute('data-color', COULEURS[packet.grid ? packet.grid[i] : 0]);
					gameBoard.appendChild(cell);
				}

				// Ajouter des événements de clic à chaque cellule de la grille
				cells = document.querySelectorAll('#game-board > div');
				cells.forEach(cell => {
					cell.addEventListener('click', () => handleCellClick(cell));
				});
				break;
			case "gameUpdate":
				numPlayers = packet.numPlayers;
				playerTurn = packet.turn;

				gameStatusDisplay.textContent = packet.state
				playerTurnDisplay.textContent = COULEURS[packet.turn]
				nbPlayersDisplay.textContent = packet.players + "/" + packet.numPlayers

				cells = document.querySelectorAll('#game-board > div');
				cells.forEach((cell, index) => {
					const color = packet.grid ? packet.grid[index] : 0;
					cell.setAttribute('data-color', COULEURS[color]);
				});

				break
			// Ajoutez d'autres types de paquets si nécessaire
			*/
		}
	});

	// Événement déclenché lorsque la connexion WebSocket est fermée
	socket.addEventListener('close', () => {
		showMessage('Connexion WebSocket fermée.');
		// Ajoutez le code pour gérer la fermeture de la connexion
		// TODO : Affichage interface de connexion
	});

	// Événement déclenché en cas d'erreur
	socket.addEventListener('error', event => {
		console.error('Erreur WebSocket :', event);
		showMessage('Connexion WebSocket perdue. Vérifiez les logs.');

		// Ajoutez le code pour gérer les erreurs WebSocket
	});

	// Ajoutez d'autres gestionnaires d'événements si nécessaire
}

// Fonction pour créer une nouvelle partie
function createGame(event) {
	event.preventDefault();

	// Récupérer les valeurs des champs
	//~ const numPlayers = parseInt(document.getElementById('num-players').value);
	//~ const numColumns = parseInt(document.getElementById('num-columns').value);
	//~ const numRows = parseInt(document.getElementById('num-rows').value);

	// Envoyer une demande de création de partie au serveur
	try {
		// Envoyer une demande de création de partie au serveur via WebSocket
		const message = {
			type: 'createGame',
			//~ numPlayers,
			//~ numColumns,
			//~ numRows,
		};

		socket.send(JSON.stringify(message));
	} catch (error) {
		console.error('Erreur lors de la création de la partie :', error);
		displayErrorMessage('Une erreur est survenue lors de la création de la partie.');
	}
}

// Fonction pour rejoindre une partie existante
function joinGame(event) {
	event.preventDefault();

	// Récupérer le code de la partie à rejoindre
	const gameCode = document.getElementById('game-code').value;

	// Envoyer une demande pour rejoindre la partie au serveur
	try {
		// Envoyer une demande pour rejoindre la partie au serveur via WebSocket
		const message = {
			type: 'joinGame',
			gameCode,
		};

		socket.send(JSON.stringify(message));
	} catch (error) {
		console.error('Erreur lors de la tentative de rejoindre la partie :', error);
		displayErrorMessage('Une erreur est survenue lors de la tentative de rejoindre la partie.');
	}
}


// Fonction pour se déconnecter du serveur
function disconnect() {
	// Ajouter la logique nécessaire
	// TODO : Fermer le websocket
	// TODO : Afficher l'interface de connexion
}
/*
// Fonction pour gérer le clic sur une cellule de la grille
function handleCellClick(cell) {
	// Vérifier si c'est le tour du joueur en comparant les valeurs sauvegardées
	if (playerTurn !== playerColor) {
		showMessage("Ce n'est pas votre tour.");
		return;
	}

	// Récupérer la colonne à partir de l'ID de la cellule (appliquer un modulo)
	const column = parseInt(cell.getAttribute('data-id')) % numColumns;

	// Envoyer une demande au serveur pour indiquer le coup joué
	const message = {
		type: 'makeMove',
		column,  // Envoyer la colonne cliquée
	};

	try {
		socket.send(JSON.stringify(message));
	} catch (error) {
		console.error('Erreur lors de l\'envoi du coup au serveur :', error);
		// Gérer l'erreur, par exemple, afficher un message à l'utilisateur
	}
}
*/

// Fonction pour revenir à la page d'accueil
function returnToHome() {
	// Ajouter la logique nécessaire
	// TODO : Quitter la partie sans se déconnecter
	// Il faudra prévoir un paquet pour ça
}

// Associer les écouteurs d'événements aux fonctions correspondantes
document.getElementById('server-connect').addEventListener('click', connectToServer);
document.getElementById('create-game').addEventListener('click', createGame);
document.getElementById('join-game').addEventListener('click', joinGame);
document.getElementById('disconnect').addEventListener('click', disconnect);
document.getElementById('return-home').addEventListener('click', returnToHome);
document.getElementById('create-game-form').addEventListener('submit', createGame);
document.getElementById('join-game-form').addEventListener('submit', joinGame);
document.getElementById('connect-form').addEventListener('submit', connectToServer);


