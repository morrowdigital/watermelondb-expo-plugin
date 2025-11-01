import { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  Dimensions,
  Button,
  Text,
} from 'react-native';

import { createBoardGame } from '../model/helpers';

export function BoardGameForm() {
  const [title, setTitle] = useState('');
  const [minPlayers, setMinPlayers] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const clearForm = () => {
    setTitle('');
    setMinPlayers(0);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    await createBoardGame(title, minPlayers);
    setSubmitting(false);
    clearForm();
  };

  if (submitting) return <Text>Submitting...</Text>;

  return (
    <View style={styles.container}>
      <TextInput
        placeholder='Name'
        style={styles.textInput}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder='Min Players'
        style={styles.textInput}
        value={minPlayers.toString()}
        onChangeText={(text) => setMinPlayers(Number(text))}
      />
      <Button title='Add Game' onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    padding: 5,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    marginBottom: 12,
  },
  container: {
    marginBottom: 8,
    width: '100%',
  },
});
