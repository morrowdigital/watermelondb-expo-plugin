import { database } from './database';
import { BoardGame } from './model';

export function getDb() {
  return database;
}

export const createBoardGame = (title: string, minPlayers: number) =>
  getDb().write(() =>
    getDb()
      .get<BoardGame>('board_games')
      .create((boardGame) => {
        boardGame.title = title;
        boardGame.minPlayers = minPlayers;
      }),
  );
export const deleteBoardGame = (game: BoardGame) => {
  return getDb().write(() => game.markAsDeleted());
};
export const increasePlayers = (game: BoardGame) => {
  return getDb().write(() =>
    game.update((game) => {
      game.minPlayers = game.minPlayers + 1;
    }),
  );
};
