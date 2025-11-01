import { Slot } from 'expo-router';

import { AuthGuard } from '../../src/Components/Auth';

export default function ProtectedLayout() {
  return (
    <AuthGuard>
      <Slot />
    </AuthGuard>
  );
}
