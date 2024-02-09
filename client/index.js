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
    pieces:[]   //liste des pieces accessibles a l'user
};

let pieceList=[ //liste des pieces existantes
[[1]],
[[1,1,1]],
[[1,1,1,1]],
[[1,0],[1,1]],
[[1,0,0],[1,1,1]]
];

//TODO creer une fonction reverse ET rotate pour les pieces de l'utilisateur

function showPuzzle(puzzle){
    for(l of puzzle.mat){
        console.log(l);
    }

}
showPuzzle(puzzle);