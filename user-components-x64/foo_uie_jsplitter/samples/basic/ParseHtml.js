//
// 演示 utils.ParseHtml()、HtmlDocument 和 HtmlNode。
//

function log_section(title) {
    console.log("");
    console.log("=== " + title + " ===");
}

function normalize_text(s) {
    return (s || "").replace(/\s+/g, " ").trim();
}

// 本示例使用与 samples/basic/html/parse_test.html 相同的结构。
// const html = utils.ReadUTF8(`${fb.ComponentPath}\\samples\\basic\\html\\parse_test.html`);
const html = `
<!doctype html>
<html lang="zh">
<head>
	<meta charset="utf-8">
	<title>Lexbor 解析器测试</title>
	<meta property="og:title" content="测试艺人传记">
</head>
<body>
	<main id="page" class="artist-page biography">
		<h1 class="artist-name">测试艺人</h1>

		<section class="wiki-content" data-source="lastfm">
			<p>
				测试艺人是一个来自伦敦的实验音乐项目。
				该项目融合了 <strong>氛围</strong>、<em>工业</em>
				和电子音乐。
			</p>

			<p>
				他们的第一张专辑，
				<a href="/music/Test+Artist/First+Album" class="album-link">第一张专辑</a>，
				于 2020 年发行。
			</p>
		</section>

		<section class="albums">
			<h2>专辑</h2>

			<ul class="album-list">
				<li class="album" data-year="2020">
					<a href="/music/Test+Artist/First+Album">第一张专辑</a>
				</li>
				<li class="album featured" data-year="2022">
					<a href="/music/Test+Artist/Second+Album">第二张专辑</a>
				</li>
				<li class="album" data-year="2024">
					<span>无链接专辑</span>
				</li>
			</ul>
		</section>

		<section class="external-links">
			<h2>外部链接</h2>

			<ul>
				<li>
					链接前的文本
					<a href="https://example.com/artist" rel="external">官方网站</a>
				</li>
				<li>
					<!-- 链接前的注释 -->
					<a href="https://musicbrainz.org/artist/test">MusicBrainz</a>
				</li>
				<li>
					<span>没有 href 的损坏项目</span>
				</li>
			</ul>
		</section>
	</main>
</body>
</html>
`;

const doc = utils.ParseHtml(html);

if (!doc) {
    console.log("解析失败。");
} else {
    log_section("文档基本信息");

    console.log("documentElement 标签:", doc.documentElement.tagName); // html
    console.log("根标签:", doc.root.tagName);                       // html
    console.log("head innerHTML:", normalize_text(doc.head.innerHTML));
    console.log("body 文本:", normalize_text(doc.body.textContent));

    log_section("querySelector");

    const title = doc.querySelector("title");
    console.log("标题:", title ? title.textContent : "<缺失>");

    const artistName = doc.querySelector(".artist-name");
    console.log("艺人:", artistName ? artistName.textContent : "<缺失>");

    const wiki = doc.querySelector(".wiki-content");
    if (wiki) {
        console.log("wiki 来源:", wiki.getAttribute("data-source")); // lastfm
        console.log("wiki 文本:", normalize_text(wiki.textContent));
    }

    log_section("querySelectorAll");

    const albums = doc.querySelectorAll(".album");
    console.log("专辑数量:", albums.length); // 3

    for (let i = 0; i < albums.length; i++) {
        const album = albums[i];
        const link = album.querySelector("a");

        console.log(
            "专辑 #" + (i + 1) + ":",
            "year=" + album.getAttribute("data-year"),
            "featured=" + album.hasClass("featured"),
            "title=" + (link ? normalize_text(link.textContent) : normalize_text(album.textContent)),
            "href=" + (link ? link.getAttribute("href") : "<无链接>")
        );
    }

    log_section("属性选择器");

    const nodesWithClass = doc.querySelectorAll("[class]");
    console.log("带 class 的节点:", nodesWithClass.length);

    const featuredAlbums = doc.querySelectorAll(".album.featured");
    console.log("特色专辑:", featuredAlbums.length);

    const albumToken = doc.querySelectorAll("[class~='album']");
    console.log("[class~='album']:", albumToken.length);

    log_section("getElementsByTagName");

    const allLinks = doc.getElementsByTagName("a");
    console.log("所有链接:", allLinks.length);

    for (let i = 0; i < allLinks.length; i++) {
        console.log(
            "#" + (i + 1),
            normalize_text(allLinks[i].textContent),
            "=>",
            allLinks[i].getAttribute("href")
        );
    }

    log_section("children 与 childNodes");

    const p = doc.querySelector(".wiki-content p");

    console.log("p.children.length:", p.children.length);
    console.log("p.childNodes.length:", p.childNodes.length);

    // 这里的 firstChild 是一个文本节点。刻意使用 JSON.stringify()
    // 以表明原始的空白和换行会被保留。
    console.log("p.firstChild 文本:", JSON.stringify(p.firstChild.textContent));

    log_section("安全的链接提取");

    const externalItems = doc.querySelectorAll(".external-links li");

    for (let i = 0; i < externalItems.length; i++) {
        const li = externalItems[i];

        // 不要使用 li.firstChild.getAttribute("href")：
        // firstChild 可能是文本节点或注释。
        const a = li.querySelector("a[href]");

        if (!a) {
            console.log("外部项目 #" + (i + 1) + ": 无链接");
            continue;
        }

        console.log(
            "外部项目 #" + (i + 1) + ":",
            normalize_text(a.textContent),
            "=>",
            a.getAttribute("href")
        );
    }

    log_section("缺失的节点");

    console.log("缺失节点:", doc.querySelector(".missing"));          // null
    console.log("缺失列表长度:", doc.querySelectorAll(".missing").length); // 0
}
