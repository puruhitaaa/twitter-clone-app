import { useRouter } from 'next/router';

const SidebarLink = ({ active, Icon, text, href }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`${href}`)}
      className={`text-[#d9d9d9] text-xl flex items-center justify-center xl:justify-start space-x-3 hoverAnimation ${
        active ? 'font-bold' : null
      }`}
    >
      <Icon className="h-7" />
      <span className="hidden xl:inline">{text}</span>
    </div>
  );
};

export default SidebarLink;
