import { createContext, useContext } from 'react';
import { useNekoClient } from '@/lib/nekoClient';

export const NekoClientContext = createContext([() => undefined]);

export const useNekoClientContext = () => useContext(NekoClientContext);

export default function NekoClientProvider({ children }) {
  const nekoClient = useNekoClient();

  return (
    <NekoClientContext.Provider value={nekoClient}>
      {children}
    </NekoClientContext.Provider>
  );
}
