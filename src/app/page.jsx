export const dynamic = 'force-dynamic';

import Link from 'next/link';
import CallToAction from './components/CallToAction';
import RecentPosts from './components/RecentPosts';

const homeCopy = {
  title: "Ch\u00e0o m\u1eebng \u0111\u1ebfn v\u1edbi KP23's Blog",
  description:
    'N\u01a1i quy t\u1ee5 nh\u1eefng b\u00e0i vi\u1ebft c\u00f3 chi\u1ec1u s\u00e2u v\u1ec1 con ng\u01b0\u1eddi, v\u0103n h\u00f3a, thi\u00ean nhi\u00ean, m\u00f4i tr\u01b0\u1eddng v\u00e0 \u0111\u1ed9ng v\u1eadt. M\u1ed7i n\u1ed9i dung \u0111\u01b0\u1ee3c x\u00e2y d\u1ef1ng \u0111\u1ec3 mang \u0111\u1ebfn g\u00f3c nh\u00ecn r\u00f5 r\u00e0ng, tinh t\u1ebf v\u00e0 truy\u1ec1n c\u1ea3m h\u1ee9ng cho ng\u01b0\u1eddi \u0111\u1ecdc y\u00eau tri th\u1ee9c.',
  viewAll: 'Xem t\u1ea5t c\u1ea3 b\u00e0i vi\u1ebft',
};

export default async function Home() {
  let posts = null;

  try {
    const result = await fetch(process.env.URL + '/api/post/get', {
      method: 'POST',
      body: JSON.stringify({ limit: 9, order: 'desc' }),
      cache: 'no-store',
    });
    const data = await result.json();
    posts = data.posts;
  } catch (error) {
    console.log('Error getting post:', error);
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='mx-auto flex max-w-6xl flex-col gap-6 px-3 py-20 md:py-28'>
        <h1 className='text-3xl font-bold leading-tight text-slate-800 lg:text-6xl'>
          {homeCopy.title}
        </h1>
        <p className='max-w-5xl text-sm leading-8 text-slate-500 sm:text-base'>
          {homeCopy.description}
        </p>
        <Link
          href='/search'
          className='text-xs font-bold text-teal-600 hover:underline sm:text-sm'
        >
          {homeCopy.viewAll}
        </Link>
      </div>

      <div className='bg-amber-100 p-3 dark:bg-slate-700'>
        <CallToAction />
      </div>

      <div className='flex flex-col gap-8 p-3 py-7'>
        <RecentPosts limit={9} />
        <Link
          href='/search?category=null'
          className='text-center text-lg text-teal-600 hover:underline'
        >
          {homeCopy.viewAll}
        </Link>
      </div>
    </div>
  );
}
