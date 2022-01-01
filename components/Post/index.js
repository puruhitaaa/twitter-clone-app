import {
  ChartBarIcon,
  ChatIcon,
  DotsHorizontalIcon,
  HeartIcon,
  ShareIcon,
  SwitchHorizontalIcon,
  TrashIcon,
} from '@heroicons/react/outline';
import {
  HeartIcon as HeartIconFilled,
  ChatIcon as ChatIconFilled,
} from '@heroicons/react/solid';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Moment from 'react-moment';
import { useRecoilState } from 'recoil';
import { modalState, postIdState } from '../../atoms/modalAtom';
import { firestore, storage } from '../../firebase';

const Post = ({ id, post, postPage }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useRecoilState(modalState);
  const [postId, setPostId] = useRecoilState(postIdState);
  const [replies, setReplies] = useState([]);
  const [likes, setLikes] = useState([]);
  const [liked, setLiked] = useState(false);

  useEffect(
    () =>
      setLiked(
        likes.findIndex((like) => like.id === session?.user?.uid) !== -1
      ),
    [likes]
  );

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(firestore, 'replies'),
          where('postId', '==', id),
          orderBy('timestamp', 'desc')
        ),
        (snapshot) => setReplies(snapshot.docs)
      ),
    [firestore, id]
  );

  useEffect(
    () =>
      onSnapshot(collection(firestore, 'posts', id, 'likes'), (snapshot) => {
        setLikes(snapshot.docs);
      }),
    [firestore, id]
  );

  const likePost = async () => {
    if (liked) {
      await deleteDoc(doc(firestore, 'posts', id, 'likes', session.user.uid));
    } else {
      await setDoc(doc(firestore, 'posts', id, 'likes', session.user.uid), {
        username: session.user.name,
      });
    }
  };

  const deletePost = async (e) => {
    e.stopPropagation();
    const imageRef = ref(storage, `/posts/${id}/image`);

    await deleteDoc(doc(firestore, 'posts', id));
    await deleteObject(imageRef);
    router.push('/');
  };

  return (
    <div
      onClick={() => router.push(`/tweet/${id}`)}
      className="p-3 flex cursor-pointer border-b border-gray-700"
    >
      {!postPage ? (
        <img
          className="h-11 w-11 rounded-full mr-4"
          src={post?.userImg}
          alt={`profile-${post?.tag}`}
        />
      ) : null}
      <div className="flex flex-col space-y-2 w-full">
        <div className={`flex ${!postPage ? 'justify-between' : null}`}>
          {postPage ? (
            <img
              className="h-11 w-11 rounded-full mr-4"
              src={post?.userImg}
              alt={`profile-${post?.tag}`}
            />
          ) : null}
          <div className="text-[#6e767d]">
            <div
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/profile/${post?.userId}`);
              }}
              className="inline-block group"
            >
              <h4
                className={`font-bold text-[15px] sm:text-base text-[#d9d9d9] group-hover:underline ${
                  !postPage ? 'inline-block' : null
                }`}
              >
                {post?.username}
              </h4>
              <span
                className={`text-sm sm:text-[15px] ${
                  !postPage ? 'ml-1.5' : null
                }`}
              >
                @{post?.tag}
              </span>
            </div>{' '}
            ·{' '}
            <span className="hover:underline text-sm sm:text-[15px]">
              <Moment fromNow>{post?.timestamp?.toDate()}</Moment>
            </span>
            {!postPage ? (
              <p className="text-[#d9d9d9] text-[15px] sm:text-base mt-0.5">
                {post?.text}
              </p>
            ) : null}
          </div>
          <div className="icon-wrapper group flex-shrink-0 ml-auto">
            <DotsHorizontalIcon className="h-5 text-[#6e767d] group-hover:text-[#1d9bf0]" />
          </div>
        </div>
        {postPage ? (
          <p className="text-[#d9d9d9] text-[15px] sm:text-base mt-0.5">
            {post?.text}
          </p>
        ) : null}
        {post?.image ? (
          <img
            alt={`postItem-${post?.tag}`}
            src={post?.image}
            className="rounded-2xl max-h-[700px] object-cover"
          />
        ) : null}

        <div
          className={`text-[#6e767d] flex justify-between w-10/12 ${
            postPage ? 'mx-auto' : null
          }`}
        >
          <div
            className="flex items-center space-x-1 group"
            onClick={(e) => {
              e.stopPropagation();
              setPostId(id);
              setIsOpen(true);
            }}
          >
            <div className="icon-wrapper group-hover:bg-[#1d9bf0] group-hover:bg-opacity-10">
              <ChatIcon className="h-5 group-hover:text-[#1d9bf0]" />
            </div>
            {replies.length > 0 ? (
              <span className="group-hover:text-[#1d9bf0] text-sm">
                {replies.length}
              </span>
            ) : null}
          </div>

          {session.user.uid === post?.userId ? (
            <div
              className="flex items-center space-x-1 group"
              onClick={deletePost}
            >
              <div className="icon-wrapper group-hover:bg-red-600/10">
                <TrashIcon className="h-5 group-hover:text-red-600" />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1 group">
              <div className="icon group-hover:bg-green-500/10">
                <SwitchHorizontalIcon className="h-5 group-hover:text-green-500" />
              </div>
            </div>
          )}

          <div
            className="flex items-center space-x-1 group"
            onClick={(e) => {
              e.stopPropagation();
              likePost();
            }}
          >
            <div className="icon-wrapper group-hover:bg-pink-600/10">
              {liked ? (
                <HeartIconFilled className="h-5 text-pink-600" />
              ) : (
                <HeartIcon className="h-5 group-hover:text-pink-600" />
              )}
            </div>
            {likes.length > 0 ? (
              <span
                className={`group-hover:text-pink-600 text-sm ${
                  liked && 'text-pink-600'
                }`}
              >
                {likes.length}
              </span>
            ) : null}
          </div>

          <div className="icon-wrapper group">
            <ShareIcon className="h-5 group-hover:text-[#1d9bf0]" />
          </div>
          <div className="icon-wrapper group">
            <ChartBarIcon className="h-5 group-hover:text-[#1d9bf0]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
