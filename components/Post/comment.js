import {
  ChartBarIcon,
  DotsHorizontalIcon,
  HeartIcon,
  ShareIcon,
  TrashIcon,
} from '@heroicons/react/outline';
import { HeartIcon as HeartIconFilled } from '@heroicons/react/solid';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Moment from 'react-moment';
import { firestore, storage } from '../../firebase';

const CommentItem = ({ id, comment, postTag }) => {
  const router = useRouter();
  const postId = router.query?.id;
  const { data: session } = useSession();
  const [likes, setLikes] = useState([]);
  const [liked, setLiked] = useState(false);

  useEffect(
    () =>
      onSnapshot(collection(firestore, 'replies', id, 'likes'), (snapshot) => {
        setLikes(snapshot.docs);
      }),
    [firestore, postId, id]
  );

  useEffect(
    () =>
      setLiked(
        likes.findIndex((like) => like.id === session?.user?.uid) !== -1
      ),
    [likes]
  );

  const likeComment = async () => {
    if (liked) {
      await deleteDoc(doc(firestore, 'replies', id, 'likes', session.user.uid));
    } else {
      await setDoc(doc(firestore, 'replies', id, 'likes', session.user.uid), {
        username: session.user.name,
      });
    }
  };

  const deleteComment = async () => {
    if (comment.image) {
      const imageRef = ref(storage, `/replies/${postId}/image`);
      await deleteObject(imageRef);
    }

    await deleteDoc(doc(firestore, 'replies', id));
  };

  return (
    <div className="p-3 cursor-pointer flex border-b border-gray-700">
      <img
        className="h-11 w-11 rounded-full mr-4"
        src={comment.userImg}
        alt={`commentItem-${comment.username}`}
      />
      <div className="flex flex-col space-y-2 w-full">
        <div className="flex justify-between">
          <div className="text-[#6e767d] space-y-2 w-full">
            <div className="inline-block group">
              <h4 className="font-bold text-[#d9d9d9] text-[15px] sm:text-base inline-block group-hover:underline">
                {comment.username}
              </h4>
            </div>
            <span className="hover:underline ml-1.5 text-sm sm:text-[15px]">
              replied to @{postTag} ·{' '}
              <Moment fromNow>{comment.timestamp?.toDate()}</Moment>
            </span>
            <p className="text-[#d9d9d9] mt-0.5 max-w-lg text-[15px] sm:text-base">
              {comment.comment}
            </p>
            {comment.image ? (
              <img
                className="rounded-2xl max-h-[700px] object-cover"
                src={comment.image}
                alt={`commentItem-${comment.username}`}
              />
            ) : null}
          </div>
          <div className="icon-wrapper group flex-shrink-0">
            <DotsHorizontalIcon className="h-5 text-[#6e767d] group-hover:text-[#1d9bf0]" />
          </div>
        </div>

        <div className="text-[#6e767d] flex justify-between w-10/12">
          {session.user.uid === comment.userId ? (
            <div className="icon-wrapper hover:bg-red-600/10 group">
              <TrashIcon
                onClick={(e) => {
                  e.stopPropagation();
                  deleteComment();
                }}
                className="h-5 group-hover:text-red-600"
              />
            </div>
          ) : null}

          <div
            onClick={(e) => {
              e.stopPropagation();
              likeComment();
            }}
            className="flex items-center space-x-1 group"
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

export default CommentItem;
