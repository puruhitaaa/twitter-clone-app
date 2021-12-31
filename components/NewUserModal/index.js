import { Dialog, Transition } from '@headlessui/react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { profileExistState } from '../../atoms/modalAtom';
import { firestore, storage } from '../../firebase';

const NewUserModal = () => {
  const [profileExist, setProfileExist] = useRecoilState(profileExistState);
  const { data: session } = useSession();
  const [username, setUsername] = useState('');
  const [userTag, setUserTag] = useState('');
  const [bio, setBio] = useState('');
  const [coverImg, setCoverImg] = useState(null);

  const createProfile = async (e) => {
    e.preventDefault();

    await setDoc(doc(firestore, 'profiles', session.user.uid), {
      bio,
      userTag,
      userId: session.user.uid,
      userImg: session.user.image,
      username,
      followersCount: 0,
      followingsCount: 0,
      followerIds: [],
      followingIds: [],
      createdAt: serverTimestamp(),
    });

    const imageRef = ref(storage, `/profiles/${session.user.uid}/coverImg`);

    if (coverImg) {
      await uploadString(imageRef, coverImg, 'data_url').then(async () => {
        const downloadURL = await getDownloadURL(imageRef);
        const profileRef = doc(firestore, 'profiles', session.user.uid);
        await setDoc(
          profileRef,
          {
            coverImg: downloadURL,
          },
          { merge: true }
        );
      });
    }

    setProfileExist(true);
  };

  const addImageToProfile = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setCoverImg(readerEvent.target.result);
    };
  };

  return (
    <Transition.Root show={!profileExist} as="div">
      <Dialog
        as="div"
        className="fixed z-50 inset-0 pt-8"
        onClose={setProfileExist}
      >
        <div className="flex items-start justify-center min-h-[800px] sm:min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as="div"
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
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block p-6 overflow-visible align-bottom bg-black rounded-2xl text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="flex flex-col items-center w-full h-full">
                <div>
                  <img
                    className="h-24 w-24 rounded-full object-contain cursor-not-allowed"
                    src={session.user.image}
                    alt={`profileItem-${session.user.tag}`}
                  />
                </div>

                <div className="self-start">
                  <label className="text-white">
                    Username{' '}
                    <span className="text-gray-500 ml-2 text-xs">
                      *must be filled
                    </span>
                  </label>
                  <input
                    className="bg-transparent outline-none text-[#d9d9d9] text-lg placeholder-gray-500 tracking-wide w-full min-h-[50px]"
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="what should we call you?"
                    type="text"
                    minLength="6"
                    maxLength="12"
                    value={username}
                  />
                </div>

                <div className="self-start">
                  <label className="text-white">
                    User tag{' '}
                    <span className="text-gray-500 ml-2 text-xs">
                      *must be filled
                    </span>
                  </label>
                  <input
                    className="bg-transparent outline-none text-[#d9d9d9] text-lg placeholder-gray-500 tracking-wide w-full min-h-[50px]"
                    onChange={(e) => setUserTag(e.target.value)}
                    placeholder="enter your @"
                    type="text"
                    minLength="6"
                    maxLength="12"
                    value={userTag}
                  />
                </div>

                <div className="self-start">
                  <label className="text-white">Bio</label>
                  <input
                    className="bg-transparent outline-none text-[#d9d9d9] text-lg placeholder-gray-500 tracking-wide w-full min-h-[50px]"
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="enter a short bio"
                    type="text"
                    minLength="6"
                    maxLength="24"
                    value={bio}
                  />
                </div>

                <div className="self-start">
                  <label className="text-white">Cover image</label>
                  <input
                    className="block bg-transparent outline-none text-[#d9d9d9] text-lg py-5 placeholder-gray-500 tracking-wide w-full min-h-[50px]"
                    onChange={addImageToProfile}
                    type="file"
                  />
                </div>

                <button
                  onClick={createProfile}
                  className="mx-auto bg-[#1d9bf0] text-white text-lg font-bold rounded-full w-56 h-[52px] hover:bg-[#1a8cd8]"
                >
                  Create profile
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default NewUserModal;
