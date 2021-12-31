import { SparklesIcon } from '@heroicons/react/outline';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from '../../firebase';
import Post from '../Post';

import Input from './input';

const Feed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(
    () =>
      onSnapshot(
        query(collection(firestore, 'posts'), orderBy('timestamp', 'desc')),
        (snapshot) => {
          setPosts(snapshot.docs);
        }
      ),
    [firestore]
  );

  return (
    <div className="flex-grow text-white border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[370px]">
      <div className="text-[#d9d9d9] bg-black border-b border-gray-700 flex items-center py-2 px-3 sm:justify-between top-0 sticky z-50">
        <h2 className="text-lg font-bold sm:text-xl">Home</h2>
        <div className="hoverAnimation w-9 h-9 flex items-center justify-center ml-auto xl:px-0">
          <SparklesIcon className="h-5 text-white" />
        </div>
      </div>

      <Input />

      <div className="pb-72">
        {posts.map((post) => (
          <Post key={post.id} id={post.id} post={post.data()} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
