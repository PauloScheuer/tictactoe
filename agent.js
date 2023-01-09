//file with the implementation of the AI agent with minmax algorithm

import { boardSize, etContinue, etDraw, ptPlayerNone, ptPlayer1 } from "./consts.js";
import { checkGameEnd } from "./utils.js";

export const getRandomAction = (board)=>{
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
  
export const getBestAction = (board, ptCurrentPlayer)=>{
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

const oponent = (player)=>{
  return player === ptPlayer1 ? ptPlayer2 : ptPlayer1;
}