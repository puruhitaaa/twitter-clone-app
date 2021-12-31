import { SearchIcon } from '@heroicons/react/outline';
import { arrayUnion, doc, setDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { firestore } from '../../firebase';
import Trending from '../Trending';
import { useRouter } from 'next/router';

const Widgets = ({ loggedInUserProfile, trendingResults, followResults }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleFollow = async (
    id,
    followedProfileUsername,
    followedProfileFC
  ) => {
    await setDoc(
      doc(firestore, 'profiles', id, 'followers', session.user.uid),
      {
        username: session.user.name,
      },
      { merge: true }
    );
    await setDoc(
      doc(firestore, 'profiles', id),
      {
        followersCount: followedProfileFC + 1,
        followerIds: arrayUnion(session.user.uid),
      },
      { merge: true }
    );

    await setDoc(
      doc(firestore, 'profiles', session.user.uid, 'followings', id),
      {
        username: followedProfileUsername,
      },
      { merge: true }
    );
    await setDoc(
      doc(firestore, 'profiles', session.user.uid),
      {
        followingsCount: loggedInUserProfile[0]?.data()?.followingsCount + 1,
        followingIds: arrayUnion(id),
      },
      { merge: true }
    );
  };

  return (
    <div className="hidden lg:inline ml-8 xl:w-[450px] py-1 space-y-5">
      <div className="sticky top-0 py-1.5 bg-black z-50 w-11/12 xl:w-9/12">
        <div className="flex items-center bg-[#202327] p-3 rounded-full relative">
          <SearchIcon className="text-gray-500 h-5 z-50" />
          <input
            className="bg-transparent placeholder-gray-500 outline-none text-[#d9d9d9] absolute inset-0 pl-11 border border-transparent w-full focus:border-[#1d9bf0] rounded-full focus:bg-black focus:shadow-lg"
            placeholder="Search Twitter"
            type="text"
          />
        </div>
      </div>

      <div className="text-[#d9d9d9] space-y-3 bg-[#15181c] pt-2 rounded-xl w-11/12 xl:w-9/12">
        <h4 className="font-bold text-xl px-4">What's happening</h4>
        {trendingResults.map((dt, idx) => (
          <Trending key={idx} result={dt} />
        ))}
        <button className="hover:bg-white hover:bg-opacity-[0.03] px-4 py-3 cursor-pointer transition duration-200 ease-out flex items-center justify-between w-full text-[#1d9bf0] font-light">
          Show more
        </button>
      </div>

      <div className="text-[#d9d9d9] space-y-3 bg-[#15181c] pt-2 rounded-xl w-11/12 xl:w-9/12">
        <h4 className="font-bold text-xl px-4">Who to follow</h4>
        {followResults.filter(
          (dt) =>
            dt?.data()?.userId !== session.user.uid &&
            !dt?.data()?.followerIds?.includes(session.user.uid)
        ).length > 0 ? null : (
          <h1 className="px-4 py-3">
            Oops.. it seems like there are no profiles left for you to follow.
          </h1>
        )}
        {followResults
          .filter(
            (dt) =>
              dt?.data()?.userId !== session.user.uid &&
              !dt?.data()?.followerIds?.includes(session.user.uid)
          )
          .map((dt, idx) => (
            <div
              className="hover:bg-white hover:bg-opacity-[0.03] px-4 py-3 cursor-pointer transition duration-200 ease-out flex items-center"
              key={idx}
            >
              <Image
                src={dt?.data()?.userImg}
                width={50}
                height={50}
                objectFit="cover"
                className="rounded-full"
              />
              <div className="ml-4 leading-5 group">
                <h4
                  onClick={() => router.push(`/profile/${dt?.data()?.userId}`)}
                  className="font-bold group-hover:underline"
                >
                  {dt?.data()?.username}
                </h4>
                <h5 className="text-gray-500 text-[15px]">
                  @{dt?.data()?.userTag}
                </h5>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollow(
                    dt?.data()?.userId,
                    dt?.data()?.username,
                    dt?.data()?.followersCount
                  );
                }}
                className="ml-auto bg-white text-black rounded-full text-sm font-bold py-1.5 px-3.5"
              >
                Follow
              </button>
            </div>
          ))}
        <button className="hover:bg-white hover:bg-opacity-[0.03] px-4 py-3 cursor-pointer transition duration-200 ease-out flex items-center justify-between w-full text-[#1d9bf0] font-light">
          Show more
        </button>
      </div>
    </div>
  );
};

export default Widgets;
