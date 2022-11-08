//constants
const PlayerNone = -1;
const Player1=0;
const Player2=1;

const boardSize = 3;

const Win1 = 0;
const Win2 = 1;
const Draw = 2;
const Continue = 3;

const names = ['Player 1', 'Player 2'];
const visuals = ['x','o'];

// game variables
const board = Array.from({length:boardSize},_=>Array.from({length:boardSize},_=>-1));
let currentPlayer = Player1;
let humanCanPlay = true;

window.addEventListener('load',async()=>{
  resetBody();

  let howEnded = Continue;
  while (howEnded === Continue){
    if (currentPlayer === Player1){
      humanPlay();
    }else{
      agentPlay();
    }
    await pause(1000);
    howEnded = checkGameEnd(board);
  }
  humanCanPlay = false;
  if (howEnded === Win1){
    console.log(`${names[Player1]} won!`);
  } else if(howEnded === Win2){
    console.log(`${names[Player2]} won`)
  } else{
    console.log("It's a draw!");
  }
});

const fieldClicked = (i,j)=>{
  if(board[i][j]===PlayerNone){
    board[i][j] = currentPlayer;
    const field = document.getElementById(`${i}_${j}`);
    field.innerHTML = visuals[currentPlayer];

    setPlayer();
    return true;
  }else{
    console.log('invalid')
    return false;
  }
}

const resetBody = ()=>{
  const boardHTML = document.getElementById('board');
  boardHTML.innerHTML = '';
  let field;
  board.forEach((row,i)=>{
    row.forEach((_,j)=>{
      field = document.createElement('div');
      field.className = "field";
      field.id = `${i}_${j}`;
      field.onclick = ()=>handleFieldClicked(i,j);
      boardHTML.appendChild(field);
    })
  })
}

const checkGameEnd = (board)=>{
  let nDraw = 0;
  
  let fieldX;
  let fieldY;
  let fieldZ1;
  let fieldZ2;
  let bEndedX = false;
  let bEndedY = false;

  let bEndedZ1 = true;
  fieldZ1 = board[0][0];

  let bEndedZ2 = true;
  fieldZ2 = board[0][boardSize-1];
  for(let i = 0;i<boardSize;i++){
    bEndedX = true;
    bEndedY = true;

    fieldX = board[i][0];
    fieldY = board[0][i];

    if(board[i][0] !== PlayerNone){
      nDraw++;
    }
    
    for(let j = 1;j<boardSize;j++){
      if (board[i][j] !== PlayerNone) {
        nDraw++;
      }

      bEndedX = bEndedX && (board[j][i] !== PlayerNone) && (fieldX === board[i][j]);
      bEndedY = bEndedY && (board[j][i] !== PlayerNone) && (fieldY === board[j][i]);
      
      fieldX = board[i][j];
      fieldY = board[j][i];
    }

    if (i>0){
      bEndedZ1 = bEndedZ1 && (board[i][i] !== PlayerNone) && (fieldZ1 === board[i][i]);
      bEndedZ2 = bEndedZ2 && (board[i][boardSize-i-1] !== PlayerNone) && (fieldZ2 === board[i][boardSize-i-1]);
    }
    
    if(bEndedX || bEndedY){
      break;
    }
  }
  let howEnded = Continue;
  if (bEndedX){
    howEnded = fieldX;
  }else if(bEndedY){
    howEnded = fieldY;
  }else if(bEndedZ1){
    howEnded = fieldZ1;
  }else if(bEndedZ2){
    howEnded = fieldZ2;
  }else if(nDraw === boardSize*boardSize){
    howEnded = Draw;
  }
  
  return howEnded;
}

const pause = async(time)=>{
  await new Promise((resolve) => setTimeout(resolve, time));
}

const setPlayer = ()=>{
  currentPlayer = currentPlayer === Player1 ? Player2 : Player1;
}

const oponent = ()=>{
  return currentPlayer === Player1 ? Player2 : Player1;
}

const handleFieldClicked = (i,j)=>{
  if (humanCanPlay){
    fieldClicked(i,j);
  }
}

const humanPlay = ()=>{
  humanCanPlay = true;
}

const agentPlay = ()=>{
  humanCanPlay = false;
  let i,j;
  [i,j] = getBestAction(board);

  let bTryAgain = !fieldClicked(i,j);
  while (bTryAgain){
    [i,j] = getBestAction();
    bTryAgain = !fieldClicked(i,j);
  }
}

const getBestAction = (board)=>{
  const [v,i,j] = max(board);
  // const i = Math.floor(Math.random()*boardSize);
  // const j = Math.floor(Math.random()*boardSize);


  return [i,j];
}

const max = (board_current)=>{
  let howEnded = checkGameEnd(board_current);
  
  if (howEnded === currentPlayer){
    return [1,-1,-1];
  }else if(howEnded === Draw){
    return [0,-1,-1];
  }else if(howEnded !== Continue){
    return [-1,-1,-1];
  }

  let v = Number.NEGATIVE_INFINITY;
  let minValue;
  let i = -1;
  let j = -1;

  const successors = getStateSuccessors(board_current);
  successors.forEach(successor=>{
    minValue = min(successor.board)[0];
    if(minValue > v){
      v = minValue;
      [i,j] = successor.indexes;
    }
  });

  return [v,i,j];
}

const min = (board_current)=>{
  let howEnded = checkGameEnd(board_current);
  if (howEnded === oponent()){
    return [-1,-1,-1];
  }else if(howEnded === Draw){
    return [0,-1,-1];
  }else if(howEnded !== Continue){
    return [1,-1,-1];
  }

  let v = Number.POSITIVE_INFINITY;
  let maxValue;
  let i = -1;
  let j = -1;

  const successors = getStateSuccessors(board_current);
  successors.forEach(successor=>{
    maxValue = max(successor.board)[0];
    if(maxValue < v){
      v = maxValue;
      [i,j] = successor.indexes;
    }
  });

  return [v,i,j];
}

const getStateSuccessors = (board_parent)=>{
  const successors = [];
  let newBoard;
  board_parent.forEach((row,i)=>{
    row.forEach((item,j)=>{
      if (item === PlayerNone){
        newBoard = board_parent.map(i=>i.map(j=>j));
        newBoard[i][j] = currentPlayer;
        successors.push({board:newBoard,indexes:[i,j]});
      } 
    })
  });

  return successors;
}
