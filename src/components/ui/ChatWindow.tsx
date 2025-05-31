'use client';

import { useEffect, useState, useRef } from 'react';
import { db, auth } from '../../app/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';




function getChatId(uid1: string, uid2: string) {
  return [uid1, uid2].sort().join('_');
}

export default function ChatWindow({ friend, currentUser }: { friend: any; currentUser: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  const [newMessage, setNewMessage] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setNewMessage(e.target.value);

 
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
     }
};


  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (!friend || !currentUser) return;

    const chatId = getChatId(currentUser.uid, friend.id);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [friend, currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const chatId = getChatId(currentUser.uid, friend.id);
    const messagesRef = collection(db, 'chats', chatId, 'messages');

    await addDoc(messagesRef, {
      text: newMessage,
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!friend) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a friend to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 bg-chatwindow flex flex-col p-4">
      <h2 className="text-lg font-bold mb-2 border-b border-black pb-2">
        Chat with {friend.username}
      </h2>

      <div className="flex-1  overflow-y-auto mb-4 space-y-2">
        {messages.map((msg) => ( 
          <div
            key={msg.id}
              className={`p-2 rounded break-words whitespace-pre-wrap max-w-[65%] min-w-[60px] w-fit ${
    msg.senderId === currentUser.uid
      ? 'bg-blue-500 text-white self-end ml-auto'
      : 'bg-white self-start'
  }`}
          >


            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
      <textarea
        ref={textareaRef}
        value={newMessage}
        onChange={handleInputChange}
        onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
    }}
  rows={1}
  className="flex-1 border border-black rounded px-3 py-2 resize-none overflow-hidden"
  placeholder="Type your message..."
/>
        <button
          onClick={sendMessage}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
