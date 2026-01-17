import { useContext } from 'react';
import { Button, View, StyleSheet } from 'react-native';

import { Auth } from '../../src/Components/Auth';
import { BoardGameForm } from '../../src/Components/BoardGameForm';
import { GameList } from '../../src/Components/GameList';
import { getDb } from '../../src/model/helpers';
import { sync } from '../../src/model/sync';

const gamesQuery = getDb().get('board_games').query();

export default function Index() {
  const authContext = useContext(Auth);
  const logout = () => {
    authContext?.logout();
  };

  return (
    <>
      <GameList games={gamesQuery} />
      <BoardGameForm />
      {/* For the demo we choose to Sync manually, for test purposes. */}
      <View style={styles.wrapper}>
        <Button title='SYNC' onPress={sync} />
        <Button title='Logout' onPress={logout} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
  },
});
