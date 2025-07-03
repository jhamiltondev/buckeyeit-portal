import { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const { logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    logout().then(() => {
      navigate('/login');
    });
  }, [logout, navigate]);

  return null;
} 