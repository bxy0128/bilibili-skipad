/**
 * @name BilibiliSponsorBlock_Debug_Edition
 * @version 1.0.1
 * @author Gemini
 */

// --- 配置区 ---
const API_HOST = "https://bili.sponsor.host"; // ⚠️ 确认这是你可用的后端地址
const ORIGIN = "chrome-extension://eaoelafamejbnggahofapllmfhlhajdd";
const VERSION = "0.5.0";

// --- 日志初始化 ---
console.log("🔔 [BiliSkip] 脚本已触发");

const url = $request.url;
const bvid = getBvid(url);

if (bvid) {
    console.log(`✅ [BiliSkip] 成功捕获 BVID: ${bvid}`);
    querySponsor(bvid);
} else {
    console.log("⚠️ [BiliSkip] 当前请求未包含 BVID，跳过逻辑");
    $done({});
}

/**
 * 请求后端 API
 */
function querySponsor(id) {
    const targetUrl = `${API_HOST}/api/skipSegments?videoID=${id}`;
    console.log(`🌐 [BiliSkip] 正在请求 API: ${targetUrl}`);

    const opts = {
        url: targetUrl,
        headers: {
            "origin": ORIGIN,
            "x-ext-version": VERSION,
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)"
        },
        timeout: 10
    };

    $task.fetch(opts).then(response => {
        console.log(`📡 [BiliSkip] API 响应状态码: ${response.statusCode}`);
        
        if (response.statusCode === 200) {
            console.log(`📄 [BiliSkip] 原始数据: ${response.body}`);
            try {
                const segments = JSON.parse(response.body);
                handleSegments(segments, id);
            } catch (e) {
                console.log("❌ [BiliSkip] JSON 解析失败");
            }
        } else if (response.statusCode === 404) {
            console.log("ℹ️ [BiliSkip] 该视频在数据库中尚无标记");
        } else {
            console.log(`❗ [BiliSkip] 服务器异常，错误代码: ${response.statusCode}`);
        }
        $done({});
    }, reason => {
        console.log(`❌ [BiliSkip] 网络连接失败: ${reason.error}`);
        $done({});
    });
}

/**
 * 处理片段并展示结果
 */
function handleSegments(segments, id) {
    if (!segments || segments.length === 0) {
        console.log("ℹ️ [BiliSkip] 返回片段为空");
        return;
    }

    let msg = "";
    segments.forEach((item, index) => {
        const start = formatTime(item.segment[0]);
        const end = formatTime(item.segment[1]);
        const type = translate(item.category);
        msg += `【${index + 1}】${start} ➔ ${end} (${type})\n`;
    });

    console.log(`🎉 [BiliSkip] 准备发送通知: \n${msg}`);
    
    $notify("🎬 发现推广/冗余片段", `视频: ${id}`, msg + "🕒 建议手动调整进度条");

    // 自动复制第一个跳过终点
    if (segments[0] && segments[0].segment[1]) {
        const copyTime = formatTime(segments[0].segment[1]);
        $copy(copyTime);
        console.log(`📋 [BiliSkip] 已将首个跳转时间点 ${copyTime} 复制到剪贴板`);
    }
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' + sec : sec}`;
}

function translate(c) {
    const d = {
        "sponsor": "广告内容",
        "intro": "开场动画",
        "outro": "片尾总结",
        "interaction": "一键三连",
        "selfpromo": "自我推广",
        "filler": "填充内容"
    };
    return d[c] || c;
}

function getBvid(u) {
    const m = u.match(/[bB][vV][a-zA-Z0-9]{10}/);
    return m ? m[0] : null;
}
