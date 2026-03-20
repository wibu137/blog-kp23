export const dynamic = 'force-dynamic';

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80',
    alt: 'Con người và văn hóa cộng đồng',
    className:
      'top-8 -left-8 md:-left-24 h-36 w-28 rotate-[-8deg] md:h-52 md:w-40',
  },
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    alt: 'Cảnh quan thiên nhiên xanh mát',
    className:
      'top-20 -right-8 md:-right-24 h-24 w-32 rotate-[7deg] md:h-32 md:w-44',
  },
  {
    src: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=900&q=80',
    alt: 'Động vật trong môi trường tự nhiên',
    className:
      'bottom-28 -left-10 md:-left-28 h-24 w-32 rotate-[6deg] md:h-32 md:w-44',
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
    alt: 'Rừng xanh và môi trường bền vững',
    className:
      'bottom-6 -right-8 md:-right-24 h-36 w-28 rotate-[-6deg] md:h-52 md:w-40',
  },
];

const aboutCopy = {
  eyebrow: 'ABOUT KP23',
  title:
    'Những câu chuyện đẹp về con người, văn hóa và thế giới tự nhiên',
  intro:
    "KP23's Blog theo đuổi lối viết có chiều sâu, tinh tế và giàu cảm xúc, như một tạp chí nhỏ dành cho những tâm hồn yêu tri thức và thiên nhiên.",
  paragraphs: [
    "KP23's Blog là không gian dành cho những câu chuyện được viết bằng sự quan sát sâu sắc, tinh thần nhân văn và tình yêu bền bỉ với thế giới tự nhiên. Tại đây, mỗi bài viết không chỉ truyền tải thông tin mà còn mở ra góc nhìn giàu chiều sâu về con người, văn hóa và môi trường sống quanh ta.",
    'Nội dung của blog tập trung vào những chủ đề cốt lõi như đời sống con người, bản sắc văn hóa, vẻ đẹp của thiên nhiên, các vấn đề môi trường và thế giới động vật. KP23 theo đuổi lối viết chỉn chu, giàu tư liệu và giàu cảm xúc, nhằm giúp người đọc vừa hiểu rõ vấn đề, vừa cảm nhận được giá trị của sự kết nối giữa con người với hành tinh này.',
    'Mỗi bài viết được xây dựng như một hành trình khám phá: từ những nét đẹp của cộng đồng địa phương, những chuyển động âm thầm của hệ sinh thái, cho đến các câu chuyện về động vật hoang dã và trách nhiệm bảo vệ môi trường. KP23 mong muốn mang đến một blog có chiều sâu, đáng tin cậy và truyền cảm hứng cho lối sống hiểu biết, tử tế và bền vững.',
    'Blog luôn chào đón những độc giả yêu thích tri thức, yêu thiên nhiên và quan tâm đến các giá trị văn hóa. Mỗi lượt đọc, mỗi bình luận và mỗi cuộc trò chuyện tại đây đều góp phần tạo nên một cộng đồng cùng chia sẻ nhận thức, nuôi dưỡng sự đồng cảm và lan tỏa ý thức gìn giữ thế giới sống cho các thế hệ mai sau.',
  ],
};

export default function About() {
  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_28%),linear-gradient(to_bottom,_#fffbeb,_#ffffff_40%,_#ecfdf5)] px-4 py-16 md:px-8'>
      <div className='relative mx-auto max-w-6xl'>
        {galleryImages.map((image) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            className={`absolute hidden rounded-3xl object-cover shadow-2xl ring-4 ring-white/80 md:block ${image.className}`}
          />
        ))}

        <div className='mx-auto max-w-3xl rounded-[2rem] border border-white/70 bg-white/85 p-6 text-center shadow-xl backdrop-blur md:p-10'>
          <p className='text-xs font-semibold uppercase tracking-[0.42em] text-emerald-700 md:text-sm'>
            {aboutCopy.eyebrow}
          </p>

          <h1 className='mx-auto my-5 max-w-2xl font-serif text-4xl font-bold leading-[1.12] text-slate-900 md:text-6xl'>
            {aboutCopy.title}
          </h1>

          <p className='mx-auto mb-8 max-w-2xl font-serif text-lg italic leading-8 text-amber-900/80 md:text-xl'>
            {aboutCopy.intro}
          </p>

          <div className='mb-8 grid grid-cols-2 gap-3 md:hidden'>
            {galleryImages.map((image) => (
              <img
                key={image.alt}
                src={image.src}
                alt={image.alt}
                className='h-28 w-full rounded-2xl object-cover shadow-md'
              />
            ))}
          </div>

          <div className='space-y-6 text-left font-serif text-[1.08rem] leading-8 text-slate-700 md:text-[1.16rem] md:leading-9'>
            {aboutCopy.paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0
                    ? 'first-letter:mr-1 first-letter:align-top first-letter:text-5xl first-letter:font-semibold first-letter:leading-none first-letter:text-emerald-800'
                    : ''
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
