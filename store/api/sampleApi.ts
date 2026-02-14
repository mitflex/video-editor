import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export const sampleApi = createApi({
  reducerPath: 'sampleApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => 'posts?_limit=5',
    }),
    getPostById: builder.query<Post, number>({
      query: (id) => `posts/${id}`,
    }),
  }),
});

export const { useGetPostsQuery, useGetPostByIdQuery } = sampleApi;
