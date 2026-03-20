import { Button } from 'flowbite-react';

const ctaCopy = {
  eyebrow: 'Kh\u00f4ng Gian Bi\u00ean T\u1eadp',
  title:
    'G\u00f3c nh\u00ecn s\u00e2u h\u01a1n v\u1ec1 con ng\u01b0\u1eddi, v\u0103n h\u00f3a v\u00e0 th\u1ebf gi\u1edbi s\u1ed1ng',
  description:
    "KP23's Blog \u0111\u01b0\u1ee3c x\u00e2y d\u1ef1ng nh\u01b0 m\u1ed9t \u0111i\u1ec3m d\u1eebng ch\u00e2n cho nh\u1eefng \u0111\u1ed9c gi\u1ea3 y\u00eau tri th\u1ee9c, y\u00eau thi\u00ean nhi\u00ean v\u00e0 quan t\u00e2m \u0111\u1ebfn m\u1ed1i li\u00ean k\u1ebft gi\u1eefa con ng\u01b0\u1eddi v\u1edbi m\u00f4i tr\u01b0\u1eddng s\u1ed1ng. M\u1ed7i b\u00e0i vi\u1ebft l\u00e0 m\u1ed9t h\u00e0nh tr\u00ecnh \u0111\u01b0\u1ee3c \u0111\u1ea7u t\u01b0 v\u1ec1 n\u1ed9i dung, h\u00ecnh \u1ea3nh v\u00e0 c\u1ea3m x\u00fac.",
  points: [
    'B\u00e0i vi\u1ebft v\u1ec1 con ng\u01b0\u1eddi v\u00e0 b\u1ea3n s\u1eafc v\u0103n h\u00f3a \u0111\u01b0\u1ee3c tri\u1ec3n khai b\u1eb1ng g\u00f3c nh\u00ecn tinh t\u1ebf, c\u00f3 chi\u1ec1u s\u00e2u.',
    'Ch\u1ee7 \u0111\u1ec1 thi\u00ean nhi\u00ean, m\u00f4i tr\u01b0\u1eddng v\u00e0 \u0111\u1ed9ng v\u1eadt \u0111\u01b0\u1ee3c k\u1ec3 l\u1ea1i r\u00f5 r\u00e0ng, \u0111\u1eb9p v\u00e0 d\u1ec5 ti\u1ebfp c\u1eadn.',
  ],
  buttonLabel: 'Kh\u00e1m ph\u00e1 b\u00e0i vi\u1ebft n\u1ed5i b\u1eadt',
  imageAlt:
    'C\u1ea3nh quan t\u1ef1 nhi\u00ean g\u1eafn v\u1edbi v\u0103n h\u00f3a v\u00e0 m\u00f4i tr\u01b0\u1eddng s\u1ed1ng',
};

export default function CallToAction() {
  return (
    <section className='overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-[linear-gradient(135deg,_rgba(236,253,245,0.95),_rgba(255,251,235,0.92))] shadow-lg'>
      <div className='grid items-stretch gap-0 lg:grid-cols-[1.1fr_0.9fr]'>
        <div className='flex flex-col justify-center px-6 py-10 text-left sm:px-10 lg:px-12 lg:py-14'>
          <p className='mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700'>
            {ctaCopy.eyebrow}
          </p>

          <h2 className='max-w-xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl'>
            {ctaCopy.title}
          </h2>

          <p className='mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg'>
            {ctaCopy.description}
          </p>

          <div className='mt-6 space-y-3 text-sm leading-7 text-slate-700 sm:text-base'>
            {ctaCopy.points.map((point) => (
              <p key={point} className='flex items-start gap-3'>
                <span className='mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-600' />
                <span>{point}</span>
              </p>
            ))}
          </div>

          <div className='mt-8'>
            <Button
              gradientDuoTone='greenToBlue'
              className='inline-flex rounded-full px-1'
            >
              <a href='/search'>{ctaCopy.buttonLabel}</a>
            </Button>
          </div>
        </div>

        <div className='relative min-h-[320px] lg:min-h-full'>
          <div className='absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-amber-700/10' />
          <img
            src='https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80'
            alt={ctaCopy.imageAlt}
            className='h-full w-full object-cover'
          />
          <div className='absolute inset-x-6 bottom-6 rounded-2xl border border-white/30 bg-white/85 p-4 shadow-lg backdrop-blur'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700'>
              Ch\u1ee7 \u0110\u1ec1 N\u1ed5i B\u1eadt
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-700'>
              Con ng\u01b0\u1eddi, v\u0103n h\u00f3a, thi\u00ean nhi\u00ean, m\u00f4i
              tr\u01b0\u1eddng v\u00e0 \u0111\u1ed9ng v\u1eadt \u0111\u01b0\u1ee3c k\u1ebft
              n\u1ed1i trong m\u1ed9t m\u1ea1ch k\u1ec3 chuy\u1ec7n r\u00f5 r\u00e0ng v\u00e0
              truy\u1ec1n c\u1ea3m h\u1ee9ng.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
