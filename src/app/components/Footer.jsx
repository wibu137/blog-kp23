'use client';

import { Footer } from 'flowbite-react';
import Link from 'next/link';
import {
  BsFacebook,
  BsInstagram,
  BsTwitter,
  BsGithub,
  BsDribbble,
} from 'react-icons/bs';

const footerCopy = {
  brand: "KP23's",
  title: 'Blog',
  description:
    'N\u01a1i k\u1ec3 chuy\u1ec7n v\u1ec1 con ng\u01b0\u1eddi, v\u0103n h\u00f3a, thi\u00ean nhi\u00ean, m\u00f4i tr\u01b0\u1eddng v\u00e0 \u0111\u1ed9ng v\u1eadt b\u1eb1ng g\u00f3c nh\u00ecn s\u00e2u s\u1eafc, ch\u1ec9n chu v\u00e0 \u0111\u1ea7y c\u1ea3m h\u1ee9ng.',
  sectionTitles: {
    explore: 'Kh\u00e1m ph\u00e1',
    categories: 'Ch\u1ee7 \u0111\u1ec1',
    values: 'G\u00f3c nh\u00ecn',
  },
  explore: [
    { href: '/about', label: 'V\u1ec1 KP23' },
    { href: '/search', label: 'B\u00e0i vi\u1ebft n\u1ed5i b\u1eadt' },
  ],
  categories: [
    { href: '/search?searchTerm=con+nguoi', label: 'Con ng\u01b0\u1eddi' },
    { href: '/search?searchTerm=van+hoa', label: 'V\u0103n h\u00f3a' },
    { href: '/search?searchTerm=thien+nhien', label: 'Thi\u00ean nhi\u00ean' },
  ],
  values: [
    { href: '/search?searchTerm=moi+truong', label: 'M\u00f4i tr\u01b0\u1eddng' },
    { href: '/search?searchTerm=dong+vat', label: '\u0110\u1ed9ng v\u1eadt' },
    { href: '/search', label: 'Kho tri th\u1ee9c' },
  ],
  copyrightBy: "KP23's Blog",
};

export default function FooterCom() {
  return (
    <Footer
      container
      className='border-t-8 border-emerald-600 bg-[linear-gradient(180deg,_rgba(236,253,245,0.9),_rgba(255,255,255,1))]'
    >
      <div className='mx-auto w-full max-w-7xl'>
        <div className='grid gap-10 py-4 lg:grid-cols-[1.1fr_1.4fr]'>
          <div className='max-w-md'>
            <Link
              href='/'
              className='inline-flex items-center whitespace-nowrap text-lg font-semibold text-slate-900 sm:text-xl'
            >
              <span className='rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 px-2 py-1 text-white shadow-sm'>
                {footerCopy.brand}
              </span>
              <span className='ml-2'>{footerCopy.title}</span>
            </Link>

            <p className='mt-4 text-sm leading-7 text-slate-600 sm:text-base'>
              {footerCopy.description}
            </p>
          </div>

          <div className='grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6'>
            <div>
              <Footer.Title title={footerCopy.sectionTitles.explore} />
              <Footer.LinkGroup col>
                {footerCopy.explore.map((item) => (
                  <Footer.Link key={item.href} href={item.href}>
                    {item.label}
                  </Footer.Link>
                ))}
              </Footer.LinkGroup>
            </div>

            <div>
              <Footer.Title title={footerCopy.sectionTitles.categories} />
              <Footer.LinkGroup col>
                {footerCopy.categories.map((item) => (
                  <Footer.Link key={item.href} href={item.href}>
                    {item.label}
                  </Footer.Link>
                ))}
              </Footer.LinkGroup>
            </div>

            <div>
              <Footer.Title title={footerCopy.sectionTitles.values} />
              <Footer.LinkGroup col>
                {footerCopy.values.map((item) => (
                  <Footer.Link key={item.href} href={item.href}>
                    {item.label}
                  </Footer.Link>
                ))}
              </Footer.LinkGroup>
            </div>
          </div>
        </div>

        <Footer.Divider />

        <div className='w-full sm:flex sm:items-center sm:justify-between'>
          <Footer.Copyright
            href='/'
            by={footerCopy.copyrightBy}
            year={new Date().getFullYear()}
          />
          <div className='mt-4 flex gap-6 sm:mt-0 sm:justify-center'>
            <Footer.Icon href='#' icon={BsFacebook} />
            <Footer.Icon href='#' icon={BsInstagram} />
            <Footer.Icon href='#' icon={BsTwitter} />
            <Footer.Icon href='https://github.com/wibu137/blog-kp23' icon={BsGithub} />
            <Footer.Icon href='#' icon={BsDribbble} />
          </div>
        </div>
      </div>
    </Footer>
  );
}
