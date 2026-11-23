'use strict';

hexo.extend.generator.register('blog-index-and-archive', function (locals) {
  const posts = locals.posts.sort('-date');
  return [
    {
      path: 'index.html',
      layout: ['index'],
      data: {
        title: '首页',
        posts,
      },
    },
    {
      path: 'archives/index.html',
      layout: ['archive', 'index'],
      data: {
        title: '文章归档',
        posts,
      },
    },
    {
      path: 'gallery/index.html',
      layout: ['gallery'],
      data: {
        title: '摄影画廊',
        description: '光影定格的瞬间与旅途记忆。',
      },
    },
  ];
});
