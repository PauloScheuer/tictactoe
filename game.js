//constants
//Game type
const gtEasy = 0;
const gtMedium = 1;
const gtHard = 2;
const gtImpossible = 3;
const gtTwoPlayers = 4;

//Player Type
const ptPlayerNone = -1;
const ptPlayer1=0;
const ptPlayer2=1;

//End type
const etWin1 = ptPlayer1;
const etWin2 = ptPlayer2;
const etDraw = 2;
const etContinue = 3;
const etRestart = 4;

//Agent type
const atHuman = 0;
const atAI = 1;

const boardSize = 3;
const names = ['Player 1', 'Player 2'];
const visuals = ['X','O'];

// game variables
const board = Array.from({length:boardSize},_=>Array.from({length:boardSize},_=>-1));
let ptCurrentPlayer = ptPlayer1;
let bHumanCanPlay = true;
let bControlEndGame = false;
let etControlHowEnded = etContinue;
let atPlayer1 = atHuman;
let atPlayer2 = atAI;
let nDifficulty = 0;
let acController = null;

// html elements
const configHTML     = document.getElementById('config');
const resultHTML     = document.getElementById('result');
const stateHTML      = document.getElementById('state');
const restartHTML    = document.getElementById('restart');
const boardHTML      = document.getElementById('board');
const easyHTML       = document.getElementById('easy');
const mediumHTML     = document.getElementById('medium');
const hardHTML       = document.getElementById('hard');
const impossibleHTML = document.getElementById('impossible');
const twoPlayersHTML = document.getElementById('twoplayers');

window.addEventListener('load',async()=>{
  boardHTML.classList.add('invisible');
  resultHTML.classList.add('invisible');

  restartHTML.onclick     = ()=>handleRestart();

  easyHTML.onclick        = ()=>startGame(gtEasy);
  mediumHTML.onclick      = ()=>startGame(gtMedium);
  hardHTML.onclick        = ()=>startGame(gtHard);
  impossibleHTML.onclick  = ()=>startGame(gtImpossible);
  twoPlayersHTML.onclick  = ()=>startGame(gtTwoPlayers);
});

const startGame = (gtMode)=>{
  ptCurrentPlayer = ptPlayer1;

  atPlayer1 = atHuman;
  if(gtMode === gtTwoPlayers){
    atPlayer2 = atHuman;
    nDifficulty = 0;
  }else{
    atPlayer2 = atAI;
    switch(gtMode){
      case gtEasy:
        nDifficulty = 20;
        break;
      case gtMedium:
        nDifficulty = 40;
        break;
      case gtHard:
        nDifficulty = 60;
        break;
      default:
        nDifficulty = 100;
    }
  }

  configHTML.classList.add('invisible');
  boardHTML.classList.remove('invisible');
  resultHTML.classList.remove('invisible');

  resetBody();
  playerNPlay();
}

const fieldClicked = (i,j)=>{
  if(board[i][j]===ptPlayerNone){
    board[i][j] = ptCurrentPlayer;
    const field = document.getElementById(`${i}_${j}`);
    field.innerText = visuals[ptCurrentPlayer];

    setPlayer();
    return true;
  }else{
    return false;
  }
}

const resetBody = ()=>{
  boardHTML.innerText = '';
  let field;
  board.forEach((row,i)=>{
    row.forEach((item,j)=>{
      board[i][j] = -1;
      field = document.createElement('div');
      field.className = "field";
      field.id = `${i}_${j}`;
      field.onclick = ()=>handleFieldClicked(i,j);
      boardHTML.appendChild(field);
    })
  });
}

const handleRestart = ()=>{
  ptCurrentPlayer = ptPlayer1;

  //if the game is currently being played, need to stop the turn recursion
  if(etControlHowEnded == etContinue){
    bControlEndGame = true;
  }

  resetBody();
  playerNPlay();
}

const checkGameEnd = (board)=>{
  let fieldX = ptPlayerNone;
  let fieldY = ptPlayerNone;
  let fieldZ1 = board[0][0];
  let fieldZ2 = board[0][boardSize-1];

  let nFilledFields = 0;

  for (let i = 0;i<boardSize;i++){
    if (board[i][0] !== ptPlayerNone) nFilledFields++;

    fieldX = board[i][0];
    fieldY = board[0][i];

    for (let j = 1;j<boardSize;j++){
      if (board[i][j] !== ptPlayerNone) nFilledFields++;

      if (fieldX !== board[i][j]) fieldX = ptPlayerNone;

      if (fieldY !== board[j][i]) fieldY = ptPlayerNone;
    }

    if((fieldX !== ptPlayerNone) || (fieldY !== ptPlayerNone)) break;

    if(i > 0){
      if (fieldZ1 !== board[i][i]) fieldZ1 = ptPlayerNone;
      if (fieldZ2 !== board[i][boardSize-i-1]) fieldZ2 = ptPlayerNone;
    }
  }

  if(fieldX !== ptPlayerNone) return fieldX;
  if(fieldY !== ptPlayerNone) return fieldY;
  if(fieldZ1 !== ptPlayerNone) return fieldZ1;
  if(fieldZ2 !== ptPlayerNone) return fieldZ2;
  if(nFilledFields === boardSize*boardSize) return etDraw;
  
  return etContinue;
}

const endGame = (howEnded)=>{
  bHumanCanPlay = false;
  if(acController != null){
    acController.abort();
  }

  if(!bControlEndGame){
    if (howEnded === etWin1){
      stateHTML.innerText = `${names[ptPlayer1]} won!`;
    } else if(howEnded === etWin2){
      stateHTML.innerText = `${names[ptPlayer2]} won!`;
    } else{
      stateHTML.innerText = "It's a draw!";
    }
  }
  etControlHowEnded = howEnded;
  bControlEndGame = false;
}

const pause = async(time)=>{
  acController = new AbortController();
  try {
    await new Promise((resolve, reject) => {
      let tTimer;

      const handleAbort = ()=>{
        clearTimeout(tTimer);
        reject();
      }

      tTimer = setTimeout(()=>{
        resolve();
        acController.signal.removeEventListener('abort',handleAbort);
      }, time);

      acController.signal.addEventListener('abort',handleAbort);

    });
  } catch (error) {
    //do nothing
  }
  acController = null;
}


const setPlayer = ()=>{
  ptCurrentPlayer = ptCurrentPlayer === ptPlayer1 ? ptPlayer2 : ptPlayer1;
}

const oponent = (player)=>{
  return player === ptPlayer1 ? ptPlayer2 : ptPlayer1;
}

const handleFieldClicked = (i,j)=>{
  if (bHumanCanPlay && fieldClicked(i,j)){
    bHumanCanPlay = false;
  }
}

const playerNPlay = async()=>{
  stateHTML.innerText = `${names[ptCurrentPlayer]}'s turn:`;
  if(!bControlEndGame){
    let atPlayer = ptCurrentPlayer === ptPlayer1 ? atPlayer1 : atPlayer2;

    atPlayer === atHuman ? await humanPlay() : await agentPlay();

    let howEnded = checkGameEnd(board);

    if (howEnded === etContinue){
      etControlHowEnded = etContinue;
      playerNPlay();
    }else{
      endGame(howEnded);
    }
  }else{
    endGame(etRestart);
  }
}

const humanPlay = async()=>{
  bHumanCanPlay = true;
  while (bHumanCanPlay) await pause(50);
}

const agentPlay = async()=>{
  await pause(1000);

  if(etControlHowEnded !== etRestart){
    let i,j;

    let lucky = Math.random();
    if(lucky < nDifficulty/100){
      [i,j] = getBestAction(board);
    }else{
      [i,j] = getRandomAction(board);
    }

    fieldClicked(i,j);
  }
}

const getRandomAction = (board)=>{
  let i = -1;
  let j = -1;
  let bInvalid = true;
  while(bInvalid){
    i = Math.floor(Math.random()*boardSize);
    j = Math.floor(Math.random()*boardSize);
    bInvalid = board[i][j] !== ptPlayerNone;
  }
  return [i,j];
}

const getBestAction = (board)=>{
  let alpha = Number.NEGATIVE_INFINITY;
  let beta = Number.POSITIVE_INFINITY;
  const [v,i,j] = max(board,ptCurrentPlayer,alpha,beta);
  return [i,j];
}

const max = (board_current,player,alpha,beta)=>{
  let howEnded = checkGameEnd(board_current);
  
  if (howEnded === player){
    return [1,-1,-1];
  }else if(howEnded === etDraw){
    return [0,-1,-1];
  }else if(howEnded !== etContinue){
    return [-1,-1,-1];
  }

  let v = Number.NEGATIVE_INFINITY;
  let minValue;
  let i = -1;
  let j = -1;

  const successors = getStateSuccessors(board_current,player);
  successors.every(successor=>{
    minValue = min(successor.board,player,alpha,beta)[0];
    if(minValue > v){
      v = minValue;
      [i,j] = successor.indexes;

      alpha = Math.max(alpha,v);
    }
    return alpha < beta;
  });

  return [v,i,j];
}

const min = (board_current,player,alpha,beta)=>{
  let howEnded = checkGameEnd(board_current);

  if (howEnded === oponent(player)){
    return [-1,-1,-1];
  }else if(howEnded === etDraw){
    return [0,-1,-1];
  }else if(howEnded !== etContinue){
    return [1,-1,-1];
  }

  let v = Number.POSITIVE_INFINITY;
  let maxValue;
  let i = -1;
  let j = -1;

  const successors = getStateSuccessors(board_current,oponent(player));
  successors.every(successor=>{
    maxValue = max(successor.board,player,alpha,beta)[0];
    if(maxValue < v){
      v = maxValue;
      [i,j] = successor.indexes;

      beta = Math.min(beta,v);
    }

    return beta > alpha;
  });

  return [v,i,j];
}

const getStateSuccessors = (board_parent,player)=>{
  const successors = [];
  let newBoard;
  board_parent.forEach((row,i)=>{
    row.forEach((item,j)=>{
      if (item === ptPlayerNone){
        newBoard = board_parent.map(i=>i.map(j=>j));
        newBoard[i][j] = player;
        successors.push({board:newBoard,indexes:[i,j]});
      } 
    })
  });

  return successors;
}
