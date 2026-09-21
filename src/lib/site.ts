/** 站点级常量：导航、作者信息、URL 拼接 */

export const SITE = {
	title: 'Jackson 的博客',
	description: '技术沉淀、项目复盘与随笔。基于 Astro 的静态博客。',
	author: 'Jackson',
	lang: 'zh-CN',
} as const;

export const NAV_LINKS = [
	{ href: '', label: '首页' },
	{ href: 'tags/', label: '标签' },
	{ href: 'search/', label: '搜索' },
	{ href: 'about/', label: '关于' },
] as const;

// Astro 的 BASE_URL 不带尾斜杠（如 `/jackson-s-blog`），直接拼接会得到死链，
// 统一从这里生成站内路径。
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** 站内路径，如 url('tags/') → `/jackson-s-blog/tags/`；url() → `/jackson-s-blog/` */
export function url(path = '') {
	return path ? `${BASE}/${path.replace(/^\/+/, '')}` : `${BASE}/`;
}

/** 绝对 URL，用于 canonical 与 RSS */
export function absoluteUrl(path: string, site: URL | undefined) {
	return new URL(url(path), site ?? 'https://zxc3334.github.io').href;
}
