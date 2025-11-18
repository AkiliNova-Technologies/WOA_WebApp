import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { loadAuthState } from '@/redux/slices/authSlice';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadAuthState());
  }, [dispatch]);

  return <>{children}</>;
}