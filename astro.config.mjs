// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages 项目站点：https://zxc3334.github.io/jackson-s-blog/
// 若日后绑定自定义域名，只需改 site 并删除 base。
export default defineConfig({
  site: 'https://zxc3334.github.io',
  base: '/jackson-s-blog',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
