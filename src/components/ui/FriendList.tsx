// src/components/FriendList.tsx
export default function FriendList() {
  const dummyFriends = ['Alice', 'Bob', 'Charlie'];

  return (
    <div className="flex-1 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-2">Friends</h3>
      <ul className="space-y-2">
        {dummyFriends.map((friend, i) => (
          <li
            key={i}
            className="bg-gray-800 p-2 rounded hover:bg-gray-700 cursor-pointer"
          >
            {friend}
          </li>
        ))}
      </ul>
    </div>
  );
}
