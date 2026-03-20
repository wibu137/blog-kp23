'use client';

import { Button, Navbar, TextInput } from 'flowbite-react';
import Link from 'next/link';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { dark, light } from '@clerk/themes';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const headerCopy = {
  brand: "KP23's",
  title: 'Blog',
  searchPlaceholder:
    'T\u00ecm b\u00e0i vi\u1ebft v\u1ec1 con ng\u01b0\u1eddi, v\u0103n h\u00f3a, thi\u00ean nhi\u00ean...',
  signIn: '\u0110\u0103ng nh\u1eadp',
  nav: [
    { href: '/', label: 'Trang ch\u1ee7' },
    { href: '/about', label: 'Gi\u1edbi thi\u1ec7u' },
    { href: '/projects', label: 'Ch\u1ee7 \u0111\u1ec1 n\u1ed5i b\u1eadt' },
  ],
};

export default function Header() {
  const path = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(searchParams);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    router.push(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [searchParams]);

  return (
    <Navbar className='border-b-2'>
      <Link
        href='/'
        className='self-center whitespace-nowrap text-sm font-semibold dark:text-white sm:text-xl'
      >
        <span className='rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 px-2 py-1 text-white'>
          {headerCopy.brand}
        </span>
        <span className='ml-2'>{headerCopy.title}</span>
      </Link>

      <form onSubmit={handleSubmit} className='hidden lg:block'>
        <div className='relative'>
          <TextInput
            type='text'
            placeholder={headerCopy.searchPlaceholder}
            className='w-full min-w-[18rem]'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type='submit'
            aria-label='Tìm kiếm'
            className='absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 transition-colors hover:text-teal-600'
          >
            <AiOutlineSearch className='h-5 w-5' />
          </button>
        </div>
      </form>

      <Button className='h-10 w-12 lg:hidden' color='gray' pill>
        <AiOutlineSearch />
      </Button>

      <div className='flex gap-2 md:order-2'>
        <Button
          className='hidden h-10 w-12 sm:inline'
          color='gray'
          pill
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? <FaSun /> : <FaMoon />}
        </Button>

        <SignedIn>
          <UserButton
            appearance={{
              baseTheme: theme === 'light' ? light : dark,
            }}
            userProfileUrl='/dashboard?tab=profile'
          />
        </SignedIn>

        <SignedOut>
          <Link href='/sign-in'>
            <Button gradientDuoTone='greenToBlue' outline>
              {headerCopy.signIn}
            </Button>
          </Link>
        </SignedOut>

        <Navbar.Toggle />
      </div>

      <Navbar.Collapse>
        {headerCopy.nav.map((item) => (
          <Link key={item.href} href={item.href}>
            <Navbar.Link active={path === item.href} as={'div'}>
              {item.label}
            </Navbar.Link>
          </Link>
        ))}
      </Navbar.Collapse>
    </Navbar>
  );
}
