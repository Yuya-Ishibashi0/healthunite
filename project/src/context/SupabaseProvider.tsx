import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import type { User } from '../types/database';

interface SupabaseContextType {
  user: User | null;
  loading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { getCurrentUser, auth } = useSupabase();

  useEffect(() => {
    // Initial user check
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getCurrentUser, auth]);

  return (
    <SupabaseContext.Provider value={{ user, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseContext() {
  return useContext(SupabaseContext);
}