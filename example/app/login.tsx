import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, StyleSheet, Text, TextInput } from 'react-native';

import { Auth } from '../src/Components/Auth';

export default function Login() {
  const authContext = useContext(Auth);
  const [username, setUsername] = useState('');

  const onLogin = () => {
    authContext?.login(username);
    router.navigate('/');
  };

  return (
    <>
      <Text>Username</Text>
      <TextInput onChangeText={setUsername} style={styles.textInput} />
      <Button title='Login' onPress={onLogin} />
    </>
  );
}

const styles = StyleSheet.create({
  textInput: {
    padding: 4,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'lightgray',
    minWidth: 200,
  },
});
