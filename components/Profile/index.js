import { LocationMarkerIcon, LinkIcon } from '@heroicons/react/outline';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { firestore } from '../../firebase';
import { numFormatter } from '../../helper/numberFormatter';
import Post from '../Post';

const Profile = ({ profileId, profile }) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(1);
  const [tweets, setTweets] = useState([]);
  const [replies, setReplies] = useState([]);

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(firestore, 'posts'),
          where('userId', '==', profileId),
          orderBy('timestamp', 'desc')
        ),
        (snapshot) => {
          setTweets(snapshot.docs);
        }
      ),
    [firestore, profileId]
  );

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(firestore, 'replies'),
          orderBy('timestamp', 'desc'),
          where('userId', '==', profileId)
        ),
        (snapshot) => {
          setReplies(snapshot.docs);
        }
      ),
    [firestore, profileId]
  );

  const _renderContent = () => {
    switch (activeTab) {
      case 1:
        return (
          <>
            {tweets.length > 0 ? (
              tweets.map((tweet) => (
                <Post key={tweet.id} id={tweet.id} post={tweet.data()} />
              ))
            ) : (
              <>
                <h1 className="text-gray-500 text-2xl text-center">
                  No tweets yet.
                </h1>
              </>
            )}
          </>
        );
      case 2:
        return (
          <>
            {tweets.length && replies.length > 0 ? (
              tweets.concat(replies).map((dt) => null)
            ) : (
              <></>
            )}
          </>
        );
      case 3:
        return null;
      case 4:
        return null;
      default:
        return null;
    }
  };

  const handleClick = (num) => {
    setActiveTab(num);
  };

  return (
    <div className="p-3">
      <div className="relative mb-[5.5rem]">
        <div className="w-full h-80 overflow-hidden">
          {profile?.coverImg && profile?.userTag ? (
            <img
              className="w-full h-full object-cover"
              src={profile?.coverImg}
              alt={`coverItem-${profile.userTag}`}
            />
          ) : (
            <div className="w-full h-full object-cover bg-white" />
          )}
        </div>

        <div className="absolute -bottom-20 left-2">
          {profile?.userImg && profile?.userTag ? (
            <img
              className="rounded-full object-contain w-36 h-36 border-4 border-white"
              src={profile.userImg}
              alt={`profileItem-${profile.userTag}`}
            />
          ) : (
            <div className="rounded-full object-contain w-36 h-36 border-4 bg-white" />
          )}
        </div>

        {profile && profileId === session.user.uid ? (
          <button className="profile-btn">Edit profile</button>
        ) : null}
      </div>

      <div className="p-3">
        <h1 className="text-sm text-white font-bold sm:text-[15px]">
          {profile?.username}
        </h1>
        <h6 className="text-gray-500">@{profile?.userTag}</h6>
      </div>

      <div className="p-3">
        <h6 className="text-sm text-white sm:text-[15px]">{profile?.bio}</h6>
      </div>

      {profile?.location || profile?.link ? (
        <div className="p-3 space-x-2 flex items-center">
          {profile?.location ? (
            <div>
              <h6 className="text-sm inline-flex text-gray-500 sm:text-[15px]">
                <LocationMarkerIcon className="h-5 mr-2" />
                {profile.location}
              </h6>
            </div>
          ) : null}

          {profile?.link ? (
            <div>
              <h6 className="text-sm inline-flex text-[#1d9bf0] sm:text-[15px] truncate hover:underline cursor-pointer">
                <LinkIcon className="h-5 mr-2 text-gray-500" />
                {profile.link}
              </h6>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="p-3 flex items-center space-x-3.5">
        <div>
          <h6 className="text-sm inline-flex text-white sm:text-[15px]">
            {numFormatter(profile?.followersCount)}
            <span className="text-gray-500 ml-1">Followers</span>
          </h6>
        </div>

        <div>
          <h6 className="text-sm inline-flex text-white sm:text-[15px]">
            {numFormatter(profile?.followingsCount)}
            <span className="text-gray-500 ml-1">Followings</span>
          </h6>
        </div>
      </div>

      <div className="p-3 w-full flex items-center">
        <div
          onClick={() => handleClick(1)}
          className={
            activeTab === 1 ? 'profile-stepper-active' : 'profile-stepper'
          }
        >
          <h4>Tweets</h4>
        </div>

        <div
          onClick={() => handleClick(2)}
          className={
            activeTab === 2 ? 'profile-stepper-active' : 'profile-stepper'
          }
        >
          <h4>Tweets & replies</h4>
        </div>

        <div
          onClick={() => handleClick(3)}
          className={
            activeTab === 3 ? 'profile-stepper-active' : 'profile-stepper'
          }
        >
          <h4>Media</h4>
        </div>

        <div
          onClick={() => handleClick(4)}
          className={
            activeTab === 4 ? 'profile-stepper-active' : 'profile-stepper'
          }
        >
          <h4>Likes</h4>
        </div>
      </div>

      <div>
        <_renderContent />
      </div>
    </div>
  );
};

export default Profile;
