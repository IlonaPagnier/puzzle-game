const http = require('http');
const fs = require('fs');
const path = require('path');

// Définir le dictionnaire route-cheminType
const routeMappings = {
	'/': { filePath: '../client/index.html', contentType: 'text/html' },
	'/script.js': { filePath: '../client/script.js', contentType: 'application/javascript' },
	'/styles.css': { filePath: '../client/styles.css', contentType: 'text/css' },
	//~ '/cell.svg': { filePath: '../cell.svg', contentType: 'image/svg+xml' }
};

// Créer le serveur sur le port 80 pour le serveur web
const server80 = http.createServer((req, res) => {
	const route = routeMappings[req.url];

	if (route) {
		// La route existe dans le dictionnaire
		const filePath = path.join(__dirname, route.filePath);
		fs.readFile(filePath, 'utf8', (err, data) => {
			if (err) {
				// Impossible de lire le fichier
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end('Internal Server Error');
			} else {
				res.writeHead(200, { 'Content-Type': route.contentType });
				res.end(data);
			}
		});
	} else {
		// Gérer les routes non définies
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('Not Found');
	}
});

// Écouter sur le port 80
server80.listen(80, () => {
	console.log('Interface web ouverte.');
});