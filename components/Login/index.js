import Head from 'next/head';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

const Login = ({ providers }) => {
  return (
    <div className="flex flex-col items-center space-y-20 pt-48">
      <Head>
        <title>Login - Twitter Clone</title>
      </Head>

      <Image
        src="http://assets.stickpng.com/images/580b57fcd9996e24bc43c53e.png"
        width={150}
        height={150}
        objectFit="contain"
      />
      <div>
        {Object.values(providers).map((provider) => (
          <div key={provider.name}>
            <button
              className="relative inline-flex items-center justify-start px-6 py-3 overflow-hidden font-medium transition-all bg-white rounded hover:bg-white group"
              onClick={() => signIn(provider.id, { callbackUrl: '/' })}
            >
              <span className="w-48 h-48 rounded rotate-[-40deg] bg-[#1d9bf0] absolute bottom-0 left-0 -translate-x-full translate-y-full duration-500 transition-all ease-out mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0" />
              <span className="relative w-full text-left text-black transition-colors duration-300 ease-in-out group-hover:text-white">
                Sign in with {provider.name}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Login;
