import { useRef, useState } from 'react';
import {
  CalendarIcon,
  ChartBarIcon,
  EmojiHappyIcon,
  PhotographIcon,
  XIcon,
} from '@heroicons/react/outline';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import { firestore, storage } from '../../firebase';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { useSession } from 'next-auth/react';

const Input = () => {
  const { data: session } = useSession();
  const [tweet, setTweet] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [loading, setLoading] = useState(false);
  const filePickerRef = useRef(null);

  const sendPost = async () => {
    if (loading) return;
    setLoading(true);

    const docRef = await addDoc(collection(firestore, 'posts'), {
      userId: session.user.uid,
      username: session.user.name,
      userImg: session.user.image,
      tag: session.user.tag,
      text: tweet,
      timestamp: serverTimestamp(),
    });

    const imageRef = ref(storage, `/posts/${docRef.id}/image`);

    if (selectedFile) {
      await uploadString(imageRef, selectedFile, 'data_url').then(async () => {
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(doc(firestore, 'posts', docRef.id), {
          image: downloadURL,
        });
      });
    }

    setLoading(false);
    setTweet('');
    setSelectedFile(null);
    setShowEmojis(false);
  };

  const addImageToPost = (e) => {
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
    setTweet(tweet + emoji);
  };

  return (
    <div
      className={`border-b border-gray-700 p-3 flex space-x-3 overflow-y-scroll ${
        loading && 'opacity-60'
      }`}
    >
      <img
        className="w-11 h-11 object-contain rounded-full pointer-events-none"
        src={session.user.image}
        alt={`profile-${session.user.name}`}
      />

      <div className="w-full divide-y divide-gray-700">
        <div className={`${selectedFile && 'pb-7'} ${tweet && 'space-y-2.5'}`}>
          <textarea
            className="text-[#d9d9d9] w-full min-h-[50px] tracking-wide text-lg placeholder-gray-500 bg-transparent outline-none"
            onChange={(e) => setTweet(e.target.value)}
            placeholder="What's happening?"
            rows="2"
            value={tweet}
          />

          {selectedFile ? (
            <div className="relative">
              <div
                onClick={() => setSelectedFile(null)}
                className="absolute flex items-center justify-center w-8 h-8 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 rounded-full top-1 left-1 cursor-pointer"
              >
                <XIcon className="text-white h-5" />
              </div>
              <img
                className="rounded-2xl max-h-80 object-contain"
                src={selectedFile}
                alt="input-item"
              />
            </div>
          ) : null}
        </div>

        {!loading ? (
          <div className="flex items-center justify-between pt-2.5">
            <div className="flex items-center">
              <div
                onClick={() => filePickerRef.current.click()}
                className="icon-wrapper"
              >
                <PhotographIcon className="icon-item" />
                <input
                  ref={filePickerRef}
                  onChange={addImageToPost}
                  type="file"
                  hidden
                />
              </div>

              <div className="icon-wrapper rotate-90">
                <ChartBarIcon className="icon-item" />
              </div>

              <div
                onClick={() => setShowEmojis(!showEmojis)}
                className="icon-wrapper"
              >
                <EmojiHappyIcon className="icon-item" />
              </div>

              <div className="icon-wrapper">
                <CalendarIcon className="icon-item" />
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
              onClick={sendPost}
              disabled={!tweet.trim() && !selectedFile}
              className="bg-[#1d9bf0] text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-[#1a8cd8] disabled:hover:bg-[#1d9bf0] disabled:opacity-50 disabled:cursor-default"
            >
              Tweet
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Input;
