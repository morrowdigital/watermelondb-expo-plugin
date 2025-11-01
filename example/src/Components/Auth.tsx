import { Redirect } from 'expo-router';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Text } from 'react-native';

import { getDb } from '../model/helpers';

export type AuthContextType = {
  username: string | null;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  isReady: boolean;
};

export const Auth = createContext<AuthContextType | null>(null);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const db = getDb();
    // We use WMDB's localStorage instead of AsyncStorage
    const username = await db.localStorage.get<string>('username');
    setUsername(username ?? null);
    setIsReady(true);
  };

  const login = (username: string) => {
    setUsername(username);
    const db = getDb();
    return db.localStorage.set('username', username);
  };
  const logout = () => {
    setUsername(null);

    const db = getDb();
    // Once logout is done, we reset the database to blank state
    // to avoid leaving data on the device for the next user
    return db.write(() => {
      return db.unsafeResetDatabase();
    });
  };

  return (
    <Auth.Provider value={{ username, login, logout, isReady }}>
      {children}
    </Auth.Provider>
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const auth = useContext(Auth);

  if (!auth) {
    throw new Error('AuthGuard must be used within an AuthContextProvider');
  }

  if (!auth.isReady) {
    return <Text>Loading</Text>;
  }

  if (!auth.username) {
    return <Redirect href='/login' />;
  }

  return children;
}
