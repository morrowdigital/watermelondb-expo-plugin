import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { AuthContextProvider } from '../src/Components/Auth';

export default function PublicLayout() {
  return (
    <AuthContextProvider>
      <View style={styles.container}>
        <Slot />
      </View>
      <StatusBar style='auto' />
    </AuthContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
