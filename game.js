import { gtEasy, gtMedium, gtHard, gtImpossible, gtTwoPlayers, ptPlayerNone, ptPlayer1,
  ptPlayer2, etWin1, etWin2, etContinue, atHuman, atAI, boardSize,
  names, visuals, ltNone, etDraw } from "./consts.js";

import {getRandomAction, getBestAction} from './agent.js';
import {checkGameEnd} from './utils.js';
import { drawEndGame } from "./canvas.js";

// game variables
const board = Array.from({length:boardSize},_=>Array.from({length:boardSize},_=>-1));
let ptCurrentPlayer = ptPlayer1;
let bHumanCanPlay = true;
let atPlayers = [atHuman,atAI];
let nDifficulty = 0;
let acController = null;
let curID = 0;
let bStartGame = false;

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

  gameLoop();
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
  bStartGame = true
}

const endGame = (howEnded, positionEnd = ltNone)=>{
  bHumanCanPlay = false;

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
  if(acController !== null){
    acController.abort()
  }

  resetBody();
  bStartGame = true;
}

const handleGoBack = ()=>{
  if(acController !== null){
    acController.abort()
  }

  configHTML.classList.remove('invisible');
  boardHTML.classList.add('invisible');
  resultHTML.classList.add('invisible');
}

const handleGoBackVisual = ()=>{
  visualHTML.classList.add('invisible');
  configHTML.classList.remove('invisible');
}

const pause = async(time, useAbort = true)=>{
  if(!useAbort){
    await new Promise(resolve=>setTimeout(()=>resolve(),time));
    return;
  }

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
}

const setPlayer = ()=>{
  ptCurrentPlayer = ptCurrentPlayer === ptPlayer1 ? ptPlayer2 : ptPlayer1;
}

const handleFieldClicked = (i,j)=>{
  if (bHumanCanPlay && fieldClicked(i,j)){
    bHumanCanPlay = false;
  }
}

const gameLoop = async ()=>{
  while(true){
    if(bStartGame){
      bStartGame = false;
      ptCurrentPlayer = ptPlayer1;
      await game(curID);
      curID++;
    }
    await pause(50, false);
  }
}

const game = async(id)=>{
  for(let i = 0;i<9;i++){
    try {
      acController = new AbortController();
      await new Promise(async(resolve,reject)=>{

        acController.signal.addEventListener('abort',()=>{
          reject();
        })

        stateHTML.innerText = `${names[ptCurrentPlayer]}'s turn:`;

        atPlayers[ptCurrentPlayer] === atHuman ? await humanPlay(id) : await agentPlay(id);

        resolve();
      });
    } catch (error) {
      acController = null;
      break;
    } finally{
      acController = null;
      const [howEnded, positionEnd] = checkGameEnd(board);

      if (howEnded !== etContinue){
        endGame(howEnded, positionEnd);
        break;
      }
    }
  }
}

const humanPlay = async(id)=>{
  if(id !== curID){
    return;
  }

  bHumanCanPlay = true;
  while (bHumanCanPlay) await pause(50);
}

const agentPlay = async(id)=>{
  bHumanCanPlay = false;
  await pause(1000);

  if(id === curID){
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
