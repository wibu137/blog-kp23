import CallToAction from '../components/CallToAction';

export const dynamic = 'force-dynamic';

const pageCopy = {
  eyebrow: 'Ch\u1ee7 \u0110\u1ec1 N\u1ed5i B\u1eadt',
  title:
    'Kh\u00f4ng gian n\u1ed9i dung \u0111\u01b0\u1ee3c x\u00e2y d\u1ef1ng nh\u01b0 m\u1ed9t t\u1ea1p ch\u00ed nh\u1ecf',
  description:
    'T\u1ea1i \u0111\u00e2y, KP23 chia s\u1ebb nh\u1eefng b\u00e0i vi\u1ebft \u0111\u01b0\u1ee3c \u0111\u1ea7u t\u01b0 v\u1ec1 con ng\u01b0\u1eddi, v\u0103n h\u00f3a, thi\u00ean nhi\u00ean, m\u00f4i tr\u01b0\u1eddng v\u00e0 \u0111\u1ed9ng v\u1eadt, gi\u00fap ng\u01b0\u1eddi \u0111\u1ecdc ti\u1ebfp c\u1eadn tri th\u1ee9c b\u1eb1ng m\u1ed9t g\u00f3c nh\u00ecn r\u00f5 r\u00e0ng, s\u00e2u s\u1eafc v\u00e0 truy\u1ec1n c\u1ea3m h\u1ee9ng.',
};

export default function Projects() {
  return (
    <div className='min-h-screen mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:px-6'>
      <div className='mx-auto max-w-3xl text-center'>
        <p className='mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700'>
          {pageCopy.eyebrow}
        </p>
        <h1 className='text-3xl font-bold leading-tight text-slate-900 md:text-5xl'>
          {pageCopy.title}
        </h1>
        <p className='mt-4 text-base leading-8 text-slate-600 md:text-lg'>
          {pageCopy.description}
        </p>
      </div>

      <CallToAction />
    </div>
  );
}
