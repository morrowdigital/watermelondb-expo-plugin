import { withObservables } from '@nozbe/watermelondb/react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { deleteBoardGame, increasePlayers } from '../model/helpers';
import { BoardGame } from '../model/model';

function GameListItemComponent({ game }: { game: BoardGame }) {
  return (
    <View key={game.title} style={styles.gameRow}>
      <View style={styles.button}>
        <Button title='DEL' onPress={() => deleteBoardGame(game)} />
        {/* For demo simplicity when we update a record we just update its minPlayers */}
        <Button title='INC' onPress={() => increasePlayers(game)} />
      </View>
      <Text>{game.title} - </Text>
      <Text>{game.minPlayers}+</Text>
    </View>
  );
}

export const GameListItem = withObservables(['game'], ({ game }) => ({ game }))(
  GameListItemComponent,
);

const styles = StyleSheet.create({
  gameRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  button: { marginRight: 8, flexDirection: 'row' },
});
