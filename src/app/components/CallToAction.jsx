import { Button } from 'flowbite-react';
export default function CallToAction() {
  return (
    <div className='flex flex-col sm:flex-row p-3 border border-teal-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center'>
        <div className="flex-1 justify-center flex flex-col">
            <h2 className='text-2xl'>
                Khám phá những câu chuyện đẹp về con người và thiên nhiên
            </h2>
            <p className='text-gray-500 my-2'>
                KP23&apos;s Blog mang đến những bài viết chỉn chu về con người, văn hóa, thiên nhiên, môi trường và động vật với góc nhìn sâu sắc, giàu cảm xúc và đáng tin cậy.
            </p>
            <Button gradientDuoTone='purpleToPink' className='rounded-tl-xl rounded-bl-none'>
                <a href="/search" rel='noopener noreferrer'>
                    Đọc các bài viết nổi bật
                </a>
            </Button>
        </div>
        <div className="p-7 flex-1">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
              alt="Thiên nhiên và hành trình khám phá văn hóa, môi trường"
              className='rounded-2xl shadow-lg object-cover'
            />
        </div>
    </div>
  )
}
