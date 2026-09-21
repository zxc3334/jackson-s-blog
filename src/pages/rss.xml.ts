import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPublishedPosts, makeExcerpt, postPath } from '../lib/posts';
import { absoluteUrl, SITE } from '../lib/site';

export const GET: APIRoute = async (context) => {
	const posts = await getPublishedPosts();

	return rss({
		title: SITE.title,
		description: SITE.description,
		// site 取博客根路径（含 base），item 链接是绝对路径，解析时不受影响
		site: absoluteUrl('', context.site),
		trailingSlash: true,
		customData: `<language>${SITE.lang}</language><atom:link href="${absoluteUrl('rss.xml', context.site)}" rel="self" type="application/rss+xml"/>`,
		xmlns: { atom: 'http://www.w3.org/2005/Atom' },
		items: posts.map((post) => ({
			title: post.data.title,
			link: postPath(post),
			pubDate: post.data.date,
			description: makeExcerpt(post, 200),
			categories: post.data.tags,
		})),
	});
};
