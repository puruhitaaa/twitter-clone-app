import Image from 'next/image';

import SidebarLink from './link';
import { HomeIcon } from '@heroicons/react/solid';
import {
  BellIcon,
  BookmarkIcon,
  ClipboardListIcon,
  DotsCircleHorizontalIcon,
  DotsHorizontalIcon,
  HashtagIcon,
  InboxIcon,
  UserIcon,
} from '@heroicons/react/outline';
import { signOut, useSession } from 'next-auth/react';

const Sidebar = () => {
  const { data: session } = useSession();

  return (
    <div className="hidden fixed h-full sm:flex flex-col items-center xl:items-start xl:w-[340px] p-2">
      <div className="flex justify-center items-center p-0 xl:ml-24 w-14 h-14 hoverAnimation">
        <Image
          src="http://assets.stickpng.com/images/580b57fcd9996e24bc43c53e.png"
          width={30}
          height={30}
        />
      </div>

      <div className="space-y-2.5 mt-4 mb-2.5 xl:ml-24">
        <SidebarLink href="/" text="Home" Icon={HomeIcon} active />
        <SidebarLink href="/" text="Explore" Icon={HashtagIcon} />
        <SidebarLink href="/" text="Notifications" Icon={BellIcon} />
        <SidebarLink href="/" text="Messages" Icon={InboxIcon} />
        <SidebarLink href="/" text="Bookmarks" Icon={BookmarkIcon} />
        <SidebarLink href="/" text="Lists" Icon={ClipboardListIcon} />
        <SidebarLink
          href={`/profile/${session.user.uid}`}
          text="Profile"
          Icon={UserIcon}
        />
        <SidebarLink text="More" Icon={DotsCircleHorizontalIcon} />
      </div>

      <button className="hidden ml-auto bg-[#1d9bf0] text-white text-lg font-bold rounded-full w-56 h-[52px] hover:bg-[#1a8cd8] xl:inline">
        Tweet
      </button>

      <div
        onClick={signOut}
        className="text-[#d9d9d9] flex items-center justify-center hoverAnimation mt-auto xl:ml-auto"
      >
        <img
          className="w-10 h-10 object-cover pointer-events-none rounded-full xl:mr-2.5"
          src={session.user.image}
          alt={`profile-${session.user.name}`}
        />

        <div className="hidden xl:inline leading-5">
          <h4 className="font-bold">{session.user.name}</h4>
          <p className="text-[#6e767d]">@{session.user.tag}</p>
        </div>

        <DotsHorizontalIcon className="hidden h-5 ml-10 xl:inline" />
      </div>
    </div>
  );
};

export default Sidebar;
