/**
 * @name BilibiliSponsorBlock_QX
 * @author Gemini & User
 * @description 识别B站视频中的推广、一键三连等片段，并发送跳转预警通知。
 */

const API_HOST = "https://bili.sponsor.host"; // ⚠️ 请务必修改为你实际的 API 服务器地址
const ORIGIN = "chrome-extension://eaoelafamejbnggahofapllmfhlhajdd";
const VERSION = "0.5.0";

const url = $request.url;
const bvid = getBvid(url);

if (bvid) {
    querySponsor(bvid);
} else {
    $done({});
}

/**
 * 核心查询函数
 */
function querySponsor(id) {
    const opts = {
        url: `${API_HOST}/api/skipSegments?videoID=${id}`,
        headers: {
            "origin": ORIGIN,
            "x-ext-version": VERSION,
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)"
        },
        timeout: 5 // 设置5秒超时
    };

    $task.fetch(opts).then(response => {
        if (response.statusCode === 200) {
            const segments = JSON.parse(response.body);
            showNotification(segments, id);
        } else if (response.statusCode === 404) {
            console.log(`[SponsorBlock] ${id} 暂无社区标记片段`);
        } else {
            console.log(`[SponsorBlock] 服务器返回错误: ${response.statusCode}`);
        }
        $done({});
    }, reason => {
        console.log(`[SponsorBlock] 网络请求失败: ${reason.error}`);
        $done({});
    });
}

/**
 * 发送系统通知
 */
function showNotification(segments, id) {
    if (!segments || segments.length === 0) return;

    let content = "";
    segments.forEach((s, i) => {
        const start = formatTime(s.segment[0]);
        const end = formatTime(s.segment[1]);
        const type = translate(s.category);
        content += `【${i + 1}】${start} ➟ ${end} (${type})\n`;
    });

    $notify("🎬 发现推广片段", `视频: ${id}`, content + "请手动拖动进度条跳过");
    
    // 自动复制第一个片段的时间点，方便操作
    if (segments[0]) {
        const firstJump = formatTime(segments[0].segment[1]);
        $copy(firstJump);
    }
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
}

function translate(cat) {
    const dict = {
        "sponsor": "广告内容",
        "intro": "开场动画",
        "outro": "片尾总结",
        "interaction": "一键三连",
        "selfpromo": "自我推广",
        "filler": "无意义填充"
    };
    return dict[cat] || cat;
}

function getBvid(url) {
    const res = url.match(/[bB][vV][a-zA-Z0-9]{10}/);
    return res ? res[0] : null;
}
