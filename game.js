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

//Agent type
const atHuman = 0;
const atAI = 1;

const boardSize = 3;
const names = ['Player 1', 'Player 2'];
const visuals = ['X','O'];

// game variables
const board = Array.from({length:boardSize},_=>Array.from({length:boardSize},_=>-1));
let currentPlayer = ptPlayer1;
let humanCanPlay = true;
let controlEndGame = false;
let controlHowEnded = etContinue;
let player1 = atHuman;
let player2 = atAI;
let difficulty = 0;

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
  player1 = atHuman;
  if(gtMode === gtTwoPlayers){
    player2 = atHuman;
    difficulty = 0;
  }else{
    player2 = atAI;
    switch(gtMode){
      case gtEasy:
        difficulty = 20;
        break;
      case gtMedium:
        difficulty = 40;
        break;
      case gtHard:
        difficulty = 60;
        break;
      default:
        difficulty = 100;
    }
  }

  configHTML.classList.add('invisible');
  boardHTML.classList.remove('invisible');
  resultHTML.classList.remove('invisible');

  resetBody();
  player1Play();
}

const fieldClicked = (i,j)=>{
  if(board[i][j]===ptPlayerNone){
    board[i][j] = currentPlayer;
    const field = document.getElementById(`${i}_${j}`);
    field.innerText = visuals[currentPlayer];

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
  currentPlayer = ptPlayer1;

  //if the game is currently being played, need to stop the turn recursion
  if(controlHowEnded == etContinue){
    controlEndGame = true;
  }

  resetBody();
  player1Play();
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
  humanCanPlay = false;
  if(!controlEndGame){
    if (howEnded === etWin1){
      stateHTML.innerText = `${names[ptPlayer1]} won!`;
    } else if(howEnded === etWin2){
      stateHTML.innerText = `${names[ptPlayer2]} won!`;
    } else{
      stateHTML.innerText = "It's a draw!";
    }
  }
  controlHowEnded = howEnded;
  controlEndGame = false;
}

const pause = async(time)=>{
  await new Promise((resolve) => setTimeout(resolve, time));
}

const setPlayer = ()=>{
  currentPlayer = currentPlayer === ptPlayer1 ? ptPlayer2 : ptPlayer1;
}

const oponent = (player)=>{
  return player === ptPlayer1 ? ptPlayer2 : ptPlayer1;
}

const handleFieldClicked = (i,j)=>{
  if (humanCanPlay && fieldClicked(i,j)){
    humanCanPlay = false;
  }
}

const player1Play = async()=>{
  stateHTML.innerText = `${names[ptPlayer1]}'s turn:`;

  player1 === atHuman ? await humanPlay() : await agentPlay();

  let howEnded = checkGameEnd(board);
  ((howEnded === etContinue) && (!controlEndGame)) ? player2Play() : endGame(howEnded);
}

const player2Play = async()=>{
  stateHTML.innerText = `${names[ptPlayer2]}'s turn:`;
  player2 === atHuman ? await humanPlay() : await agentPlay();

  let howEnded = checkGameEnd(board);
  ((howEnded === etContinue) && (!controlEndGame)) ? player1Play() : endGame(howEnded);
}

const humanPlay = async()=>{
  humanCanPlay = true;
  while (humanCanPlay) await pause(50);
}

const agentPlay = async()=>{
  await pause(1000);
  let i,j;

  let lucky = Math.random();
  if(lucky < difficulty/100){
    [i,j] = getBestAction(board);
  }else{
    [i,j] = getRandomAction(board);
  }

  fieldClicked(i,j);
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
  const [v,i,j] = max(board,currentPlayer,alpha,beta);
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
