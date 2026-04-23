/**
 * Quantumult X 脚本: 扫描全能王 VIP 差异化解锁
 * 适配 v3.camscanner.com (嵌套结构) 和 api-cs.intsig.net (扁平结构)
 */

let body = $response.body;
if (!body) $done({}); 

let obj = JSON.parse(body);

// 定义你要求的核心 VIP 属性数据
const myVipData = {
    "svip": 1,
    "is_super_vip": 1,
    "vip_type": "normal_vip", // 你测试成功的字段
    "pc_vip": 1,
    "expiry": 4092599349,
    "grade": 10,
    "in_trial": 0,
    "group1_paid": 1,
    "group2_paid": 1,
    "initial_tm": "1511188713",
    "last_payment_method": "promote",
    "auto_renewal": false,
    "vip_level_info": {
        "level": 10,
        "score": 9999,
        "next_score": 10,
        "create_time": 0
    },
    "level_info": {}
};

// --- 差异化处理逻辑 ---

if (obj.data) {
    // 路径 A: 适配 v3.camscanner.com (data -> ar_property -> psnl_vip_property)
    if (obj.data.ar_property) {
        console.log("检测到 v3 嵌套结构，执行差异化替换");
        obj.data.ar_property.psnl_vip_property = myVipData;
        obj.data.ar_property.server_time = "1776961568";
    } 
    // 路径 B: 适配 api-cs.intsig.net (data -> psnl_vip_property)
    else if (obj.data.psnl_vip_property) {
        console.log("检测到 api-cs 扁平结构，执行标准替换");
        obj.data.psnl_vip_property = myVipData;
        obj.data.server_time = "1776961568";
    }
    
    // 通用补丁：开启去广告（如果存在该字段）
    if (obj.data.removead !== undefined) {
        obj.data.removead = "1";
    }
}

$done({ body: JSON.stringify(obj) });
