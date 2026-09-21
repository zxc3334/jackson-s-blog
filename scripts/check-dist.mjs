/**
 * 发布产物审计（工单 06）：构建后校验产物完整性、内部链接与 RSS 合规性。
 * 用法：node scripts/check-dist.mjs
 */
import { XMLParser } from 'fast-xml-parser';
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const BASE = '/jackson-s-blog/';
const failures = [];
const check = (ok, label, detail = '') => {
	console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
	if (!ok) failures.push(label);
};

// --- 1. 产物文件 ---
const files = [];
(function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		entry.isDirectory() ? walk(full) : files.push(full);
	}
})(DIST);

const rel = files.map((f) => f.slice(DIST.length + 1));
const required = ['index.html', '404.html', 'about/index.html', 'tags/index.html', 'posts/index.html', 'search/index.html', 'rss.xml', 'favicon.svg'];
check(
	required.every((f) => rel.includes(f)),
	'必需产物齐备',
	`${rel.length} 个文件`,
);
check(!rel.some((f) => f === 'dist' || f.includes('node_modules')), '产物中无杂项目录');

// --- 2. 内部链接无死链 ---
const htmlFiles = files.filter((f) => f.endsWith('.html'));
let linkCount = 0;
for (const file of htmlFiles) {
	const html = fs.readFileSync(file, 'utf8');
	for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
		const target = match[1];
		if (!target.startsWith(BASE)) continue; // 外链与 data: 跳过
		linkCount++;
		const sub = target.slice(BASE.length).split(/[?#]/)[0];
		const candidates =
			sub === ''
				? ['index.html']
				: [sub, `${sub}.html`, path.join(sub, 'index.html')].flatMap((c) => [c, decodeURIComponent(c)]);
		if (!candidates.some((c) => fs.existsSync(path.join(DIST, c)))) {
			failures.push(`死链 ${file} -> ${target}`);
		}
	}
}
check(!failures.some((f) => f.startsWith('死链')), '内部链接无死链', `${linkCount} 条站内链接`);

// --- 3. RSS 2.0 合规性 ---
const xml = fs.readFileSync(path.join(DIST, 'rss.xml'), 'utf8');
const channel = new XMLParser({ ignoreAttributes: false }).parse(xml).rss?.channel;
check(xml.startsWith('<?xml'), 'RSS 含 XML 声明');
check(channel?.title && channel?.link && channel?.description, 'RSS channel 字段完整');
const items = channel?.item ? [channel.item].flat() : [];
check(items.length > 0, 'RSS 含文章条目', `${items.length} 条`);
check(
	items.every((i) => i.title && i.link && i.pubDate && i.guid),
	'RSS 每条含 title/link/pubDate/guid',
);

// --- 4. 草稿隔离 ---
const draftMarker = '未完成的草稿标题';
const leaked = files.filter((f) => fs.readFileSync(f, 'utf8').includes(draftMarker));
check(leaked.length === 0, '草稿未泄露到产物', leaked.join(', ') || '无命中');

// --- 5. 每条 RSS/搜索索引链接可解析 ---
const searchHtml = fs.readFileSync(path.join(DIST, 'search/index.html'), 'utf8');
const indexMatch = searchHtml.match(/<script type="application\/json" id="search-index">([\s\S]*?)<\/script>/);
check(Boolean(indexMatch), '搜索索引内嵌于 search 页');
if (indexMatch) {
	const index = JSON.parse(indexMatch[1].replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c))));
	check(
		index.every((p) => fs.existsSync(path.join(DIST, p.url.slice(BASE.length), 'index.html'))),
		'搜索索引链接均指向真实页面',
		`${index.length} 条`,
	);
}

// --- 6. 主题切换脚本行为（在最小 DOM 桩上执行真实产物中的代码）---
const indexHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const initScript = indexHtml.match(/<head>.*?<script>([\s\S]*?)<\/script>/)?.[1];
const toggleScript = indexHtml.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
check(Boolean(initScript && toggleScript), '主题初始化与切换脚本均已内联');

if (initScript && toggleScript) {
	const run = (systemDark, stored) => {
		const store = new Map(stored ? [['theme', stored]] : []);
		const doc = { documentElement: { dataset: {} } };
		const button = { handlers: {}, addEventListener: (_, fn) => (button.handlers.click = fn) };
		globalThis.document = { ...doc, getElementById: () => button };
		globalThis.localStorage = {
			getItem: (k) => store.get(k) ?? null,
			setItem: (k, v) => store.set(k, v),
		};
		globalThis.matchMedia = () => ({ matches: systemDark });
		new Function(initScript)();
		const afterInit = document.documentElement.dataset.theme;
		new Function(toggleScript)();
		button.handlers.click();
		return { afterInit, afterClick: document.documentElement.dataset.theme, persisted: store.get('theme') };
	};

	const firstVisit = run(true, null);
	check(firstVisit.afterInit === 'dark', '无存储时跟随系统暗色偏好', `data-theme=${firstVisit.afterInit}`);
	check(run(false, null).afterInit === 'light', '无存储时跟随系统亮色偏好');
	check(run(false, 'dark').afterInit === 'dark', '已有存储时优先使用存储值');
	check(
		firstVisit.afterClick === 'light' && firstVisit.persisted === 'light',
		'点击切换后同步写入 localStorage',
		`${firstVisit.afterInit} → ${firstVisit.afterClick}`,
	);
}

console.log(`\n${failures.length === 0 ? '✅ 产物审计通过' : `❌ ${failures.length} 项未通过`}`);
process.exit(failures.length === 0 ? 0 : 1);
