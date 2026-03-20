import PostCard from './PostCard';

const recentPostsCopy = {
  title: 'B\u00e0i vi\u1ebft m\u1edbi nh\u1ea5t',
};

export default async function RecentPosts({ limit }) {
  let posts = null;
  try {
    const result = await fetch(process.env.URL + '/api/post/get', {
      method: 'POST',
      body: JSON.stringify({ limit: limit, order: 'desc' }),
      cache: 'no-store',
    });
    const data = await result.json();
    posts = data.posts;
  } catch (error) {
    console.log('Error getting post:', error);
  }
  return (
    <div className='flex flex-col justify-center items-center mb-5'>
      <h1 className='text-xl mt-5'>{recentPostsCopy.title}</h1>
      <div className='flex flex-wrap gap-5 mt-5 justify-center'>
        {posts && posts.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
    </div>
  );
}
