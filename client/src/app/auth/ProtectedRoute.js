import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/auth/signin');
    } else {
      fetch('http://127.0.0.1:5000/verify', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          router.push('/auth/signin');
        }
      });
    }
  }, [router]);
  if (!authenticated) return null;

  return <>{children}</>;
}
