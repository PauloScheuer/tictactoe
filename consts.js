//file with game constants

//Game type
export const gtEasy       = 0;
export const gtMedium     = 1;
export const gtHard       = 2;
export const gtImpossible = 3;
export const gtTwoPlayers = 4;

//Player Type
export const ptPlayerNone = -1;
export const ptPlayer1    = 0;
export const ptPlayer2    = 1;

//End type
export const etWin1     = ptPlayer1;
export const etWin2     = ptPlayer2;
export const etDraw     = 2;
export const etContinue = 3;
export const etRestart  = 4;

//Agent type
export const atHuman = 0;
export const atAI    = 1;

//Line type
export const ltFirstX  = 0;
export const ltSecondX = 1;
export const ltThirdX  = 2;
export const ltFirstY  = 3;
export const ltSecondY = 4;
export const ltThirdY  = 5;
export const ltFirstZ  = 6;
export const ltSecondZ = 7;
export const ltNone    = 8;

//Others
export const boardSize = 3;
export const names = ['Player 1', 'Player 2'];
export const visuals = ['X','O'];