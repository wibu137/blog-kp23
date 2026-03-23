'use client';

export const dynamic = 'force-dynamic';

import { Button, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PostCard from '../components/PostCard';
import { POST_CATEGORIES } from '@/lib/postCategories';

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: '',
  });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const searchTermFromUrl = urlParams.get('searchTerm') || '';
    const sortFromUrl = urlParams.get('sort') || 'desc';
    const categoryFromUrl = urlParams.get('category') || '';

    setSidebarData({
      searchTerm: searchTermFromUrl,
      sort: sortFromUrl,
      category: categoryFromUrl,
    });

    const fetchPosts = async () => {
      setLoading(true);
      const res = await fetch('/api/post/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 9,
          order: sortFromUrl,
          category: categoryFromUrl,
          searchTerm: searchTermFromUrl,
        }),
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPosts(data.posts);
      setLoading(false);
      setShowMore(data.posts.length === 9);
    };

    fetchPosts();
  }, [searchParams]);

  const handleChange = (e) => {
    if (e.target.id === 'searchTerm') {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    }

    if (e.target.id === 'sort') {
      setSidebarData({ ...sidebarData, sort: e.target.value || 'desc' });
    }

    if (e.target.id === 'category') {
      setSidebarData({ ...sidebarData, category: e.target.value || '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(searchParams);

    if (sidebarData.searchTerm) {
      urlParams.set('searchTerm', sidebarData.searchTerm);
    } else {
      urlParams.delete('searchTerm');
    }

    urlParams.set('sort', sidebarData.sort);

    if (sidebarData.category) {
      urlParams.set('category', sidebarData.category);
    } else {
      urlParams.delete('category');
    }

    const nextQuery = urlParams.toString();
    router.push(nextQuery ? `/search?${nextQuery}` : '/search');
  };

  const handleShowMore = async () => {
    const res = await fetch('/api/post/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: 9,
        order: sidebarData.sort,
        category: sidebarData.category,
        searchTerm: sidebarData.searchTerm,
        startIndex: posts.length,
      }),
    });

    if (!res.ok) {
      return;
    }

    const data = await res.json();
    setPosts([...posts, ...data.posts]);
    setShowMore(data.posts.length === 9);
  };

  const hasActiveFilters =
    Boolean(searchParams.get('searchTerm')) ||
    Boolean(searchParams.get('category'));

  return (
    <div className='flex flex-col md:flex-row'>
      <div className='border-b border-gray-500 p-7 md:min-h-screen md:border-r'>
        <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
          <div className='flex items-center gap-2'>
            <label className='whitespace-nowrap font-semibold'>
              Search Term:
            </label>
            <TextInput
              placeholder='Search...'
              id='searchTerm'
              type='text'
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Sort:</label>
            <Select onChange={handleChange} id='sort' value={sidebarData.sort}>
              <option value='desc'>Latest</option>
              <option value='asc'>Oldest</option>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Category:</label>
            <Select
              onChange={handleChange}
              id='category'
              value={sidebarData.category}
            >
              <option value=''>All</option>
              {POST_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
          <Button type='submit' outline gradientDuoTone='purpleToPink'>
            Apply Filters
          </Button>
        </form>
      </div>
      <div className='w-full'>
        <div className='mt-5 border-gray-500 p-3 sm:border-b'>
          <h1 className='text-3xl font-semibold'>
            {hasActiveFilters ? 'Post results' : 'Suggested posts'}
          </h1>
          <p className='mt-2 text-sm text-gray-500'>
            {hasActiveFilters
              ? 'These posts match the filters you selected.'
              : 'Recent articles appear here even before you run a search.'}
          </p>
        </div>
        <div className='flex flex-wrap gap-4 p-7'>
          {!loading && posts.length === 0 && (
            <p className='text-xl text-gray-500'>No posts found.</p>
          )}
          {loading && <p className='text-xl text-gray-500'>Loading...</p>}
          {!loading &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}
          {showMore && (
            <button
              onClick={handleShowMore}
              className='w-full p-7 text-lg text-teal-500 hover:underline'
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
