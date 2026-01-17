import { withObservables } from '@nozbe/watermelondb/react';
import { View, StyleSheet } from 'react-native';

import { GameListItem } from './GameListItem';
import { BoardGame } from '../model/model';

function GameListComponent({ games }: { games: BoardGame[] }) {
  return (
    <View style={styles.wrapper}>
      {games.map((game) => (
        <GameListItem key={game.title} game={game} />
      ))}
    </View>
  );
}

const enhance = withObservables(['games'], ({ games }) => ({
  games,
}));

export const GameList = enhance(GameListComponent);

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
});
