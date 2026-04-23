/**
 * Quantumult X 脚本: 扫描全能王 VIP + 余额差异化全拦截
 * 适配: v3.camscanner.com / api-cs.intsig.net / open.camscanner.com
 */

let body = $response.body;
if (!body) $done({}); 

let obj = JSON.parse(body);

// 1. 定义核心 VIP 属性数据
const myVipData = {
    "svip": 1,
    "is_super_vip": 1,
    "vip_type": "normal_vip",
    "pc_vip": 1,
    "expiry": 4092599349,
    "grade": 10,
    "in_trial": 0,
    "group1_paid": 1,
    "group2_paid": 1,
    "initial_tm": "1511188713",
    "last_payment_method": "promote",
    "auto_renewal": false,
    "vip_level_info": { "level": 10, "score": 9999, "next_score": 10, "create_time": 0 },
    "level_info": {}
};

// 2. 差异化处理逻辑
if (obj.data) {
    // --- 路径 A: 嵌套结构 (v3.camscanner.com) ---
    if (obj.data.ar_property) {
        console.log("检测到 v3 嵌套结构");
        obj.data.ar_property.psnl_vip_property = myVipData;
        obj.data.ar_property.points = "999999"; // 顺便注入点券
        obj.data.ar_property.server_time = "1776961568";
    } 
    // --- 路径 B: 扁平结构 (api-cs.intsig.net / 属性查询) ---
    else if (obj.data.psnl_vip_property) {
        console.log("检测到 api-cs 扁平结构");
        obj.data.psnl_vip_property = myVipData;
        obj.data.server_time = "1776961568";
        // 补全所有可能被查的余额字段
        obj.data.points = "999999";
        obj.data.ocr_balance = 9999;
        obj.data.pdfword_balance = "9999";
    }
    // --- 路径 C: 任务执行结构 (open.camscanner.com / upload_wps_pdf) ---
    // 只要响应里包含 points 或 balance 字段，全部暴力改为 999999
    if (obj.data.points !== undefined) {
        console.log("检测到点券结算字段，强制修改为 999999");
        obj.data.points = "999999";
    }
    if (obj.data.balance !== undefined) {
        console.log("检测到余额结算字段，强制修改为 999999");
        obj.data.balance = "999999";
    }

    // 通用补丁：去广告
    if (obj.data.removead !== undefined) {
        obj.data.removead = "1";
    }
}

$done({ body: JSON.stringify(obj) });
