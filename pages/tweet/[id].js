import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { ArrowLeftIcon } from '@heroicons/react/outline';
import { getProviders, getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { modalState } from '../../atoms/modalAtom';
import { firestore } from '../../firebase';
import Sidebar from '../../components/Sidebar';
import Login from '../../components/Login';
import Post from '../../components/Post';
import Modal from '../../components/Modal';
import CommentItem from '../../components/Post/comment';
import Widgets from '../../components/Widgets';

const TweetPage = ({ trendingResults, followResults, providers }) => {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loggedInUserProfile, setLoggedInUserProfile] = useState([]);
  const { data: session } = useSession();
  const [isOpen, _] = useRecoilState(modalState);
  const id = router.query?.id;

  if (!session) return <Login providers={providers} />;

  useEffect(
    () =>
      onSnapshot(doc(firestore, 'posts', id), (snapshot) => {
        setPost(snapshot.data());
      }),
    [firestore]
  );

  useEffect(
    () =>
      onSnapshot(
        query(collection(firestore, 'replies'), orderBy('timestamp', 'desc')),
        (snapshot) => setReplies(snapshot.docs)
      ),
    [firestore, id]
  );

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(firestore, 'profiles'),
          where('followerIds', 'not-in', [session.user.uid])
        ),
        (snapshot) => {
          setProfiles(snapshot.docs);
        }
      ),
    [firestore, session]
  );

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(firestore, 'profiles'),
          where('userId', '==', session.user.uid)
        ),
        (snapshot) => {
          setLoggedInUserProfile(snapshot.docs);
        }
      ),
    [firestore, session]
  );

  return (
    <div>
      <Head>
        <title>
          {post?.username} on Twitter: "{post?.text}"
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-black min-h-screen flex max-w-[1500px] mx-auto">
        <Sidebar />
        <div className="flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[370px]">
          <div className="flex items-center px-1.5 py-2 border-b border-gray-700 text-[#d9d9d9] font-semibold text-xl gap-x-4 sticky top-0 z-50 bg-black">
            <div
              onClick={() => router.back()}
              className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0"
            >
              <ArrowLeftIcon className="h-5 text-white" />
            </div>
            Tweet
          </div>

          <Post id={id} post={post} postPage />
          {replies.length > 0 ? (
            <div className="pb-72">
              {replies.map((comment) => (
                <CommentItem
                  key={comment.id}
                  id={comment.id}
                  postTag={post?.tag}
                  comment={comment.data()}
                />
              ))}
            </div>
          ) : null}
        </div>
        <Widgets
          trendingResults={trendingResults}
          loggedInUserProfile={loggedInUserProfile && loggedInUserProfile}
          followResults={profiles && profiles}
        />

        {isOpen ? <Modal /> : null}
      </main>
    </div>
  );
};

export default TweetPage;

export async function getServerSideProps(context) {
  const trendingResults = await fetch('https://jsonkeeper.com/b/NKEV').then(
    (res) => res.json()
  );
  const followResults = await fetch('https://jsonkeeper.com/b/WWMJ').then(
    (res) => res.json()
  );

  const providers = await getProviders();
  const session = await getSession(context);

  return {
    props: {
      trendingResults,
      followResults,
      providers,
      session,
    },
  };
}
