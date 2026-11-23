'use strict';

const fs = require('node:fs');
const path = require('node:path');

hexo.extend.filter.register('before_generate', function () {
  const cnamePath = path.join(hexo.source_dir, 'CNAME');
  if (fs.existsSync(cnamePath)) {
    const cname = fs.readFileSync(cnamePath, 'utf8').trim().split(/\s+/)[0];
    if (cname) {
      hexo.config.url = `https://${cname.replace(/^https?:\/\//i, '').replace(/\/+$/, '')}`;
      hexo.config.root = '/';
      return;
    }
  }

  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return;

  const [owner, repo] = repository.split('/');
  const isUserSite = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;
  const root = isUserSite ? '/' : `/${repo}/`;

  hexo.config.url = `https://${owner}.github.io${isUserSite ? '' : `/${repo}`}`;
  hexo.config.root = root;
});
