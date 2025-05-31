// components/ui/AddFriendModal.tsx
'use client';

import { useState } from 'react';
import { db, auth } from '../../app/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
} from 'firebase/firestore';

export default function AddFriendModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSearchAndSend = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !email) return;

    if (email === currentUser.email) {
      setMessage("You can't add yourself.");
      return;
    }

    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMessage('No user found with that email.');
        return;
      }

      const friendDoc = snapshot.docs[0];
      const friendId = friendDoc.id;

      const friendRef = doc(db, 'users', friendId);
      const friendSnap = await getDoc(friendRef);

      if (!friendSnap.exists()) {
        await setDoc(friendRef, { requests: [currentUser.uid], email });
      } else {
        await updateDoc(friendRef, {
          requests: arrayUnion(currentUser.uid),
        });
      }

      setMessage('Friend request sent!');
      setEmail('');
    } catch (err) {
      console.error(err);
      setMessage('Error sending request.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">Add a Friend</h2>
        <input
          type="email"
          placeholder="Enter email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-4 py-2 rounded mb-3"
        />
        <button
          onClick={handleSearchAndSend}
          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Send Request
        </button>
        {message && <p className="text-sm text-gray-700 mt-2">{message}</p>}
        <button
          onClick={onClose}
          className="mt-4 text-red-600 hover:underline text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
