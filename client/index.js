let puzzle={
    mat:[   //matrice representant la carte
[1,1,1,0,1,1],
[1,0,1,0,0,1],
[1,0,1,1,0,1],
[1,0,0,0,0,1],
[1,1,0,0,1,1],
[1,1,1,1,1,1]
    ],
    cat:"",    //categorie de la carte de l'user
    pieces:[]   //liste des pieces posées dans le puzzle
};

let pieceList={ //liste des pieces existantes
    orange: [[1]],
    jaune: [[1,1,1]],
    violet: [[1,1,1,1]],
    rouge: [[1,0],[1,1]],
    bleu: [[1,0,0],[1,1,1]]
};



function showPuzzle(puzzle){
    for(l of puzzle.mat){
        let t = ""
        for(c of l) {
            switch(c) {
                case 0:
                    t += "..";
                    break;
                case 1:
                    t += "  ";
                    break;
                default:
                    t += "##";
            }
        }
        console.log(t);
    }
}


function showPiece(piece){
    for(l of piece){
        console.log(l);
    }
}

function rotatePiece(piece){ //sens horaire +90deg
    let res=[];
    for(i in piece[0]){
        res.push([]);
        for(j of piece){
            res[i].unshift(j[i]);
        }
    }
    return res;
}

function reversePiece(piece){ //sens horaire +90deg
    let res=[];
    for(i of piece){
        res.unshift(i);
    }
    return res;
}



showPuzzle(puzzle);
console.log("\n");

for(p in pieceList){
    showPiece(pieceList[p]);
    console.log("\n");
    showPiece(rotatePiece(pieceList[p]));
    console.log("\n");
    showPiece(reversePiece(pieceList[p]));
    console.log("\n");

}

function fillPuzzle(puzzle,indexPiece,posx,posy, rotation, reverse) {
    /* Args:
    - puzzle : puzzle à completer
    - indexPiece : index de la pièce à poser
    - posx et posy = emplacement DANS puzzle
    - rotation : nombre de rotation que la piece effectue (0 à 3)
    - reverse : est-ce que la pièce fait un reverse (0 ou 1)
*/
    let pieceAPoser;
    let monPuzzle=[   //matrice representant la carte
    [0,0,0,0,0,0],
    [0,0,0,0,0,0],
    [0,0,0,0,0,0],
    [0,0,0,0,0,0],
    [0,0,0,0,0,0],
    [0,0,0,0,0,0]
        ];
    // La on a une matrice vide ducoup

    // Recréation de la matrice de la pièce
    if(reverse==1){
        pieceAPoser=reversePiece(indexPiece);
    }
    if(rotation>0){
        for
        pieceAPoser=

    // verifier les bords


    // Boucles for pour vérifier si la pièce peut être posée
}