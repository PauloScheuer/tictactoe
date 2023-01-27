import { gtEasy, gtMedium, gtHard, gtImpossible, gtTwoPlayers, ptPlayerNone, ptPlayer1,
  ptPlayer2, etWin1, etWin2, etContinue, etRestart, atHuman, atAI, boardSize,
  names, visuals, ltNone, etDraw } from "./consts.js";

import {getRandomAction, getBestAction} from './agent.js';
import {checkGameEnd} from './utils.js';
import { drawEndGame } from "./canvas.js";

// game variables
const board = Array.from({length:boardSize},_=>Array.from({length:boardSize},_=>-1));
let ptCurrentPlayer = ptPlayer1;
let bHumanCanPlay = true;
let bControlEndGame = false;
let etControlHowEnded = etContinue;
let atPlayers = [atHuman,atAI];
let nDifficulty = 0;
let acController = null;

// html elements
const configHTML     = document.getElementById('config');
const resultHTML     = document.getElementById('result');
const stateHTML      = document.getElementById('state');
const restartHTML    = document.getElementById('restart');
const backHTML       = document.getElementById('back');
const visualHTML     = document.getElementById('visual');
const backVisualHTML = document.getElementById('backVisual');
const xHTML          = document.getElementById('x');
const oHTML          = document.getElementById('o');
const boardHTML      = document.getElementById('board');
const easyHTML       = document.getElementById('easy');
const mediumHTML     = document.getElementById('medium');
const hardHTML       = document.getElementById('hard');
const impossibleHTML = document.getElementById('impossible');
const twoPlayersHTML = document.getElementById('twoplayers');

window.addEventListener('load',async()=>{
  boardHTML.classList.add('invisible');
  resultHTML.classList.add('invisible');
  visualHTML.classList.add('invisible');

  restartHTML.onclick     = ()=>handleRestart();
  backHTML.onclick        = ()=>handleGoBack();
  backVisualHTML.onclick  = ()=>handleGoBackVisual();

  easyHTML.onclick        = ()=>selectVisual(gtEasy);
  mediumHTML.onclick      = ()=>selectVisual(gtMedium);
  hardHTML.onclick        = ()=>selectVisual(gtHard);
  impossibleHTML.onclick  = ()=>selectVisual(gtImpossible);
  twoPlayersHTML.onclick  = ()=>startGame(gtTwoPlayers);
});

const selectVisual = (gtMode)=>{
  visualHTML.classList.remove('invisible');
  configHTML.classList.add('invisible');

  xHTML.onclick = ()=>handleSelect('X',gtMode);
  oHTML.onclick = ()=>handleSelect('O',gtMode);
}

const handleSelect = (option,gtMode)=>{
  if(visuals[0] === option){
    atPlayers = [atHuman,atAI];
    bHumanCanPlay = true;
  }else{
    atPlayers = [atAI,atHuman];
    bHumanCanPlay = false;
  }

  startGame(gtMode);
}

const startGame = (gtMode)=>{
  ptCurrentPlayer = ptPlayer1;
  etControlHowEnded = etContinue;

  if(gtMode === gtTwoPlayers){
    atPlayers = [atHuman,atHuman];
    nDifficulty = 0;
  }else{
    switch(gtMode){
      case gtEasy:
        nDifficulty = 30;
        break;
      case gtMedium:
        nDifficulty = 60;
        break;
      case gtHard:
        nDifficulty = 90;
        break;
      default:
        nDifficulty = 100;
    }
  }

  resetBody();
  playerNPlay();
}

const endGame = (howEnded, positionEnd = ltNone)=>{
  bHumanCanPlay = false;
  if(acController != null){
    acController.abort();
  }

  if(!bControlEndGame){
    if(howEnded === etDraw){
      stateHTML.innerText = "It's a draw!";
    }else{
      if (howEnded === etWin1){
        stateHTML.innerText = `${names[ptPlayer1]} won!`;
      } else if(howEnded === etWin2){
        stateHTML.innerText = `${names[ptPlayer2]} won!`;
      }

      drawEndGame(positionEnd,boardHTML);
    }
  }
  etControlHowEnded = howEnded;
  bControlEndGame = false;
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
  configHTML.classList.add('invisible');
  visualHTML.classList.add('invisible');
  boardHTML.classList.remove('invisible');
  resultHTML.classList.remove('invisible');

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

const handleGoBack = ()=>{
  //if the game is currently being played, need to stop the turn recursion
  if(etControlHowEnded == etContinue){
    bControlEndGame = true;
  }

  configHTML.classList.remove('invisible');
  boardHTML.classList.add('invisible');
  resultHTML.classList.add('invisible');
}

const handleGoBackVisual = ()=>{
  visualHTML.classList.add('invisible');
  configHTML.classList.remove('invisible');
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
        if (acController !== null){
          acController.signal.removeEventListener('abort',handleAbort);
        }
      }, time);

      if (acController !== null){
        acController.signal.addEventListener('abort',handleAbort);
      }
    });
  } catch (error) {
    //do nothing
  }
  acController = null;
}

const setPlayer = ()=>{
  ptCurrentPlayer = ptCurrentPlayer === ptPlayer1 ? ptPlayer2 : ptPlayer1;
}

const handleFieldClicked = (i,j)=>{
  if (bHumanCanPlay && fieldClicked(i,j)){
    bHumanCanPlay = false;
  }
}

const playerNPlay = async()=>{
  stateHTML.innerText = `${names[ptCurrentPlayer]}'s turn:`;
  if(!bControlEndGame){
    let atPlayer = ptCurrentPlayer === ptPlayer1 ? atPlayers[0] : atPlayers[1];

    atPlayer === atHuman ? await humanPlay() : await agentPlay();

    const [howEnded, positionEnd] = checkGameEnd(board);

    if (howEnded === etContinue){
      etControlHowEnded = etContinue;
      playerNPlay();
    }else{
      endGame(howEnded, positionEnd);
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
      [i,j] = getBestAction(board, ptCurrentPlayer);
    }else{
      [i,j] = getRandomAction(board);
    }

    fieldClicked(i,j);
  }
}
