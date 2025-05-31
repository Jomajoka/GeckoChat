'use client';

import { db } from '../lib/firebase'; // Adjust the import path as necessary
import { addDoc, collection } from 'firebase/firestore';

export default function TestFirebase() {
  const handleClick = async () => {
    try {
      await addDoc(collection(db, 'testCollection'), {
        text: 'Hello from GeckoChat!',
        timestamp: new Date()
      });
      alert('Document added!');
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Error adding document. Check console.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={handleClick}
        className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
      >
        Test Firebase
      </button>
    </div>
  );
}
