// components/ui/PendingRequestsModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../app/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from 'firebase/firestore';

export default function PendingRequestsModal({ onClose }: { onClose: () => void }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const requestIds = userSnap.data()?.requests || [];

      const requestData = await Promise.all(
        requestIds.map(async (id: string) => {
          const snap = await getDoc(doc(db, 'users', id));
          return snap.exists() ? { id, ...snap.data() } : null;
        })
      );

      setRequests(requestData.filter(Boolean));
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const handleAccept = async (requesterId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const requesterRef = doc(db, 'users', requesterId);

    await updateDoc(userRef, {
      requests: arrayRemove(requesterId),
      friends: arrayUnion(requesterId),
    });

    await updateDoc(requesterRef, {
      friends: arrayUnion(user.uid),
    });

    setRequests((prev) => prev.filter((r) => r.id !== requesterId));
  };

  const handleDecline = async (requesterId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    await updateDoc(userRef, {
      requests: arrayRemove(requesterId),
    });

    setRequests((prev) => prev.filter((r) => r.id !== requesterId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">Pending Friend Requests</h2>

        {loading ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <ul>
            {requests.map((req) => (
              <li key={req.id} className="mb-3 flex justify-between items-center">
                <span>{req.email}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(req.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-6 text-red-600 hover:underline text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
