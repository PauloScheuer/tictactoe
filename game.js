import { gtEasy, gtMedium, gtHard, gtImpossible, gtTwoPlayers, ptPlayerNone, ptPlayer1,
  ptPlayer2, etWin1, etWin2, etContinue, etRestart, atHuman, atAI, boardSize,
  names, visuals } from "./consts.js";

import {getRandomAction, getBestAction} from './agent.js';
import {checkGameEnd} from './utils.js';

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
const backHTML       = document.getElementById('back');
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
  backHTML.onclick        = ()=>handleGoBack();

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

const handleGoBack = ()=>{
  //if the game is currently being played, need to stop the turn recursion
  if(etControlHowEnded == etContinue){
    bControlEndGame = true;
  }

  configHTML.classList.remove('invisible');
  boardHTML.classList.add('invisible');
  resultHTML.classList.add('invisible');
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
      [i,j] = getBestAction(board, ptCurrentPlayer);
    }else{
      [i,j] = getRandomAction(board);
    }

    fieldClicked(i,j);
  }
}
