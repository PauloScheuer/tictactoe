// file with util functions

import { boardSize, etContinue, etDraw, ltFirstX, ltFirstY, ltFirstZ, ltNone, ltSecondX,
  ltSecondY, ltSecondZ, ltThirdX, ltThirdY, ptPlayerNone } from "./consts.js";

export const checkGameEnd = (board)=>{
    let fieldX = ptPlayerNone;
    let fieldY = ptPlayerNone;
    let fieldZ1 = board[0][0];
    let fieldZ2 = board[0][boardSize-1];
  
    let nFilledFields = 0;
  
    let nIndex = -1;

    const positionsX = [ltFirstX, ltSecondX, ltThirdX];
    const positionsY = [ltFirstY, ltSecondY, ltThirdY];

    for (let i = 0;i<boardSize;i++){
      if (board[i][0] !== ptPlayerNone) nFilledFields++;
  
      fieldX = board[i][0];
      fieldY = board[0][i];
  
      for (let j = 1;j<boardSize;j++){
        if (board[i][j] !== ptPlayerNone) nFilledFields++;
  
        if (fieldX !== board[i][j]) fieldX = ptPlayerNone;
  
        if (fieldY !== board[j][i]) fieldY = ptPlayerNone;
      }
  
      if((fieldX !== ptPlayerNone) || (fieldY !== ptPlayerNone)){
        nIndex = i;
        break;
      }
  
      if(i > 0){
        if (fieldZ1 !== board[i][i]) fieldZ1 = ptPlayerNone;
        if (fieldZ2 !== board[i][boardSize-i-1]) fieldZ2 = ptPlayerNone;
      }
    }
  
    if(fieldX !== ptPlayerNone) return [fieldX, positionsX[nIndex]];
    if(fieldY !== ptPlayerNone) return [fieldY, positionsY[nIndex]];
    if(fieldZ1 !== ptPlayerNone) return [fieldZ1, ltFirstZ];
    if(fieldZ2 !== ptPlayerNone) return [fieldZ2, ltSecondZ];
    if(nFilledFields === boardSize*boardSize) return [etDraw, ltNone];
    
    return [etContinue, ltNone];
}