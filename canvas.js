//file responsable for functions related to painting on canvas

import { boardSize, ltFirstX, ltFirstY, ltNone, ltSecondX, ltSecondY, ltSecondZ, ltThirdX, ltThirdY } from "./consts.js";

export const drawEndGame = (positionEnd, parent)=>{
    if (positionEnd === ltNone){
      return;
    }
  
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
  
    parent.appendChild(canvas);
  
    const rect = canvas.getBoundingClientRect();
  
    canvas.setAttribute('width', rect.width);
    canvas.setAttribute('height', rect.height);
  
    const context = canvas.getContext('2d');
    context.strokeStyle = 'red';
    context.lineWidth = 5;
    context.lineCap = 'round';
  
    const [startX, startY, sizeStepX, sizeStepY] = getLinePosAndSize(positionEnd,parent,rect);
  
    let step = 0;
    const interval = setInterval(()=>{
      context.beginPath();
      context.moveTo(startX+step*sizeStepX,startY+step*sizeStepY);
      step++;
      context.lineTo(startX+step*sizeStepX,startY+step*sizeStepY);
      context.stroke();
  
      if (step > 99){
        clearInterval(interval);
      }
    },10);
  }
  
  const getLinePosAndSize = (positionEnd,parent,rect)=>{
    const fieldSize = document.getElementsByClassName('field')[0].clientWidth;
    const fieldGap = (parent.clientWidth - boardSize*fieldSize)/(boardSize-1);
  
    let startX = 10;
    let startY = 10;
    let sizeStepX = (rect.width-2*startX)/100;
    let sizeStepY = (rect.width-2*startY)/100;
  
    if ([ltFirstX,ltSecondX,ltThirdX].includes(positionEnd)){
      startY = fieldSize / 2;
      if (positionEnd === ltSecondX){
        startY += fieldSize + fieldGap;
      }else if(positionEnd === ltThirdX){
        startY += (fieldSize + fieldGap)*2;
      }
  
      sizeStepY = 0;
    }else if ([ltFirstY, ltSecondY, ltThirdY].includes(positionEnd)){
      startX = fieldSize / 2;
      if (positionEnd === ltSecondY){
        startX += fieldSize + fieldGap;
      }else if(positionEnd === ltThirdY){
        startX += (fieldSize + fieldGap)*2;
      }
  
      sizeStepX = 0;
    }else if(positionEnd === ltSecondZ){
      startY = fieldSize*3 + fieldGap*2 - 10;
  
      sizeStepY = (rect.width-2*startY)/100;
    }
  
    return [startX,startY,sizeStepX,sizeStepY];
  }