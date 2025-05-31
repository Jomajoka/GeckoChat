
'use client';

import { auth } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import ChatWindow from '@/components/ui/ChatWindow';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) return null;

  return (
    <div className="flex h-screen">
      <Sidebar onSelectFriend={setSelectedFriend} />
      <ChatWindow friend={selectedFriend} currentUser={user} />
    </div>
  );
}
