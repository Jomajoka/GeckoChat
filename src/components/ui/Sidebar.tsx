// components/ui/Sidebar.tsx
'use client';
import PendingRequestsModal from './PendingRequestsModal';
import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../app/lib/firebase';
import { useRouter } from 'next/navigation';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../app/lib/firebase';
import AddFriendModal from './AddFriendModal';
import FriendList from './FriendList';

export default function Sidebar({ onSelectFriend }: { onSelectFriend: (friend: any) => void }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };



   useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
      const friendUIDs = docSnap.data()?.friends || [];

      const friendData = await Promise.all(
        friendUIDs.map(async (uid: string) => {
          const friendSnap = await getDoc(doc(db, 'users', uid));
          return { id: uid, ...friendSnap.data() };
        })
      );

      setFriends(friendData.filter(Boolean));
    });

    return () => unsubscribe();
  }, []);




  return (
    <>
      <div className="w-[300px] bg-darkgreen text-white flex flex-col p-4">
        <h2 className="text-4xl font-bold mb-4">GeckoChat</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 px-3 py-2 mb-2 font-bold rounded hover:bg-green-700"
        >
          Add Friend
        </button>

        <button
            onClick={() => setShowRequests(true)}
            className="bg-yellow-500 px-3 py-2 mb-10 font-bold rounded hover:bg-yellow-600"
        >
          Pending Requests
        </button>
        
        <h2 className="text-2xl font-bold mb-1">Friends</h2>
        <ul>
          {friends.map((friend) => (
            <li
              key={friend.id}
              onClick={() => onSelectFriend(friend)}
              className="cursor-pointer px-2 py-1 hover:bg-green-600 rounded border border-white mb-2"
            >
              {friend.username}
            </li>
          ))}
        </ul>

        <button
          onClick={handleLogout}
          className="mt-auto bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {showModal && <AddFriendModal onClose={() => setShowModal(false)} />}
      {showRequests && <PendingRequestsModal onClose={() => setShowRequests(false)} />}
    </>
  );
}
