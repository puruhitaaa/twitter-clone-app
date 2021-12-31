import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRecoilState } from 'recoil';
import { modalState, postIdState } from '../../atoms/modalAtom';
import { Picker } from 'emoji-mart';
import {
  addDoc,
  onSnapshot,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from '@firebase/firestore';
import { useSession } from 'next-auth/react';
import {
  CalendarIcon,
  ChartBarIcon,
  EmojiHappyIcon,
  PhotographIcon,
  XIcon,
} from '@heroicons/react/outline';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { firestore, storage } from '../../firebase';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';

const Modal = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useRecoilState(modalState);
  const [postId, _] = useRecoilState(postIdState);
  const [post, setPost] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [comment, setComment] = useState('');
  const filePickerRef = useRef(null);
  const router = useRouter();

  useEffect(
    () =>
      onSnapshot(doc(firestore, 'posts', postId), (snapshot) => {
        setPost(snapshot.data());
      }),
    [firestore, postId]
  );

  const sendComment = async (e) => {
    e.preventDefault();

    const docRef = await addDoc(collection(firestore, 'replies'), {
      comment,
      postId,
      userId: session.user.uid,
      username: session.user.name,
      userTag: session.user.tag,
      userImg: session.user.image,
      timestamp: serverTimestamp(),
    });

    const imageRef = ref(storage, `/replies/${postId}/image`);

    if (selectedFile) {
      await uploadString(imageRef, selectedFile, 'data_url').then(async () => {
        const downloadURL = await getDownloadURL(imageRef);
        const commentRef = doc(firestore, 'replies', docRef.id);
        await setDoc(
          commentRef,
          {
            image: downloadURL,
          },
          { merge: true }
        );
      });
    }

    setIsOpen(false);
    setComment('');

    router.push(`/tweet/${postId}`);
  };

  const addImageToComment = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target.result);
    };
  };

  const addEmoji = (e) => {
    let sym = e.unified.split('-');
    let codesArray = [];
    sym.forEach((element) => codesArray.push('0x' + element));
    let emoji = String.fromCodePoint(...codesArray);
    setComment(comment + emoji);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 pt-8" onClose={setIsOpen}>
        <div className="flex items-start justify-center min-h-[800px] sm:min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-[#5b7083] bg-opacity-40 transition-opacity" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block overflow-visible align-bottom bg-black rounded-2xl text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="flex items-center px-1 5 py-2 border-b border-gray-700">
                <div
                  className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0"
                  onClick={() => setIsOpen(false)}
                >
                  <XIcon className="h-[22px] text-white" />
                </div>
              </div>

              <div className="flex px-4 pt-5 pb-2.5 sm:px-6">
                <div className="w-full">
                  <div className="text-[#6e767d] flex gap-x-3 relative">
                    <span className="w-0.5 h-full z-[-1] absolute left-5 top-11 bg-gray-600" />
                    <img
                      className="h-11 w-11 object-cover rounded-full"
                      src={post?.userImg}
                      alt={`postItem-${post?.username}`}
                    />
                    <div>
                      <div className="inline-block cursor-pointer group">
                        <h4 className="font-bold inline-block text-[15px] sm:text-base text-[#d9d9d9] group-hover:underline">
                          {post?.username}
                        </h4>
                        <span className="ml-1.5 text-sm sm:text-[15px]">
                          @{post?.tag}
                        </span>
                      </div>{' '}
                      ·{' '}
                      <span className="hover:underline text-sm sm:text-[15px]">
                        <Moment fromNow>{post?.timestamp?.toDate()}</Moment>
                      </span>
                      <p className="text-[#d9d9d9] text-[15px] sm:text-base">
                        {post?.text}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex space-x-3 w-full">
                    <img
                      className="h-11 w-11 object-cover rounded-full"
                      src={session.user.image}
                      alt={`userImage-${session.user.name}`}
                    />
                    <div className="flex-grow mt-2">
                      <textarea
                        className="bg-transparent outline-none text-[#d9d9d9] text-lg placeholder-gray-500 tracking-wide w-full min-h-[80px]"
                        placeholder="Tweet your reply"
                        onChange={(e) => setComment(e.target.value)}
                        rows="2"
                        value={comment}
                      />

                      <div className="flex items-center justify-between pt-2.5">
                        <div className="flex items-center">
                          <div
                            onClick={() => filePickerRef.current.click()}
                            className="icon-wrapper"
                          >
                            <PhotographIcon className="text-[#1d9bf0] h-[22px]" />
                            <input
                              ref={filePickerRef}
                              onChange={addImageToComment}
                              type="file"
                              hidden
                            />
                          </div>

                          <div className="icon-wrapper rotate-90">
                            <ChartBarIcon className="text-[#1d9bf0] h-[22px]" />
                          </div>

                          <div
                            onClick={() => setShowEmojis(!showEmojis)}
                            className="icon-wrapper"
                          >
                            <EmojiHappyIcon className="text-[#1d9bf0] h-[22px]" />
                          </div>

                          <div className="icon-wrapper">
                            <CalendarIcon className="text-[#1d9bf0] h-[22px]" />
                          </div>

                          {showEmojis ? (
                            <Picker
                              theme="dark"
                              onSelect={addEmoji}
                              style={{
                                position: 'absolute',
                                marginTop: '465px',
                                marginLeft: -40,
                                maxWidth: '320px',
                                borderRadius: '20px',
                              }}
                            />
                          ) : null}
                        </div>

                        <button
                          className="bg-[#1d9bf0] text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-[#1a8cd8] disabled:hover:bg-[#1d9bf0] disabled:opacity-50 disabled:cursor-default"
                          type="submit"
                          onClick={sendComment}
                          disabled={!comment.trim()}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
