import { useEffect } from 'react';
import { useUser } from '../context/UserContext';

export default function Logout() {
  const { logout } = useUser();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-700 mb-2">Signing out...</div>
        <div className="text-gray-500">Please wait while we log you out.</div>
      </div>
    </div>
  );
} 