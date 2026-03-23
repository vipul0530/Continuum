import { useAuthContext } from '../context/AuthContext.js';

export function useAuth() {
  return useAuthContext();
}
