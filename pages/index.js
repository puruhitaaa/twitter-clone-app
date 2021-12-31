import Head from 'next/head';
import { getProviders, getSession, useSession } from 'next-auth/react';

import Feed from '../components/Feed';
import Modal from '../components/Modal';
import Sidebar from '../components/Sidebar';
import Widgets from '../components/Widgets';
import { useRecoilState } from 'recoil';
import { modalState, profileExistState } from '../atoms/modalAtom';
import Login from '../components/Login';
import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { firestore } from '../firebase';
import NewUserModal from '../components/NewUserModal';

export default function Home({ trendingResults, providers }) {
  const { data: session } = useSession();
  const [isOpen, _] = useRecoilState(modalState);
  const [profiles, setProfiles] = useState([]);
  const [loggedInUserProfile, setLoggedInUserProfile] = useState([]);
  const [profileExist, setProfileExist] = useRecoilState(profileExistState);

  if (!session) return <Login providers={providers} />;

  useEffect(
    () =>
      onSnapshot(
        query(doc(firestore, 'profiles', session.user.uid)),
        (snapshot) => (snapshot.data() ? null : setProfileExist(false))
      ),
    [firestore, session]
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
        <title>Twitter Clone</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-black flex mx-auto min-h-screen max-w-[1500px]">
        <Sidebar />
        <Feed />
        <Widgets
          trendingResults={trendingResults}
          loggedInUserProfile={loggedInUserProfile && loggedInUserProfile}
          followResults={profiles && profiles}
        />

        {isOpen ? <Modal /> : null}
        {!profileExist && session ? <NewUserModal /> : null}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const trendingResults = await fetch('https://jsonkeeper.com/b/NKEV').then(
    (res) => res.json()
  );

  const providers = await getProviders();
  const session = await getSession(context);

  return {
    props: {
      trendingResults,
      providers,
      session,
    },
  };
}
