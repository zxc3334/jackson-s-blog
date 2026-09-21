import { getCollection, type CollectionEntry } from 'astro:content';
import { url } from './site';

export type Post = CollectionEntry<'posts'>;

/** 文章在站点中的绝对路径，如 `/jackson-s-blog/posts/hello-world/` */
export function postPath(post: Post) {
	return url(`posts/${post.id}/`);
}

/** 标签归档页路径，如 `/jackson-s-blog/tags/随笔/` */
export function tagPath(tag: string) {
	return url(`tags/${encodeURIComponent(tag)}/`);
}

/**
 * 草稿隔离（生产构建的唯一出口）。
 * `astro dev` 保留草稿以便本地预览；`pnpm build` 一律剔除。
 */
export async function getPublishedPosts(): Promise<Post[]> {
	const posts = await getCollection('posts', ({ data }) =>
		import.meta.env.PROD ? data.draft !== true : true,
	);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** 汇总标签及文章数，按文章数倒序、同数按名称排序 */
export function collectTags(posts: Post[]) {
	const counter = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.data.tags) {
			counter.set(tag, (counter.get(tag) ?? 0) + 1);
		}
	}
	return [...counter.entries()]
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

/** 中文按字数、英文按词数估算阅读时长 */
export function readingTime(body: string) {
	const chars = body.replace(/\s+/g, '').length;
	const words = body.split(/\s+/).filter(Boolean).length;
	const minutes = Math.ceil(Math.max(chars / 350, words / 200));
	return `${Math.max(1, minutes)} 分钟`;
}

const HTML_ENTITIES: Record<string, string> = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&nbsp;': ' ',
};

/** Markdown 正文 → 纯文本摘要，供搜索索引与 RSS 描述使用 */
export function plainText(body: string) {
	return body
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]*)`/g, '$1')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/^\s{0,3}#{1,6}\s+/gm, '')
		.replace(/^\s{0,3}>\s?/gm, '')
		.replace(/^\s{0,3}[-*+]\s+/gm, '')
		.replace(/[*_~]/g, '')
		.replace(/&[a-z#0-9]+;/gi, (m) => HTML_ENTITIES[m.toLowerCase()] ?? ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** 摘要优先取 front matter description，否则回退正文首个自然段 */
export function makeExcerpt(post: Post, maxLength = 140) {
	if (post.data.description) return post.data.description;
	const paragraph = (post.body ?? '')
		.split(/\n{2,}/)
		.map((block) => plainText(block))
		.find((text) => text.length > 0);
	if (!paragraph) return '';
	return paragraph.length > maxLength ? `${paragraph.slice(0, maxLength)}…` : paragraph;
}

export function formatDate(date: Date) {
	return date.toISOString().slice(0, 10);
}
