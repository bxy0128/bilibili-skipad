/**
 * @name Wink_Vip_Crack_Debug
 * @description 绕过 Wink 会员检测 + 详细调试日志
 */

let url = $request.url;
let body = $response.body;

try {
    let obj = JSON.parse(body);

    if (url.includes("api-wink.meitumv.com/user/show.json")) {
        console.log("🔔 [Wink] 触发用户信息接口修改");
        if (obj.data) {
            console.log(`📝 [Wink] 修改前 vip_type: ${obj.data.vip_type}`);
            obj.data.vip_type = 1; 
            obj.data.coin = 8888;
            console.log("✅ [Wink] 已成功将 vip_type 修改为 1");
        }
    } 
    
    else if (url.includes("api.account.meitu.com/users/show_current.json")) {
        console.log("🔔 [Wink] 触发美图通行证接口修改");
        if (obj.response && obj.response.user) {
            // 修改 VIP 列表
            if (obj.response.user.vip && obj.response.user.vip.list) {
                obj.response.user.vip.list.forEach(item => {
                    if (item.app_id === 184) {
                        console.log(`📝 [Wink] 修改前 status: ${item.status}`);
                        item.status = 1; 
                        item.expire_time = 4102444800; // 2100年
                    }
                });
            }
            // 强制注入全局 VIP 标识
            obj.response.user.is_vip = true;
            console.log("✅ [Wink] 已强制注入全局 VIP 身份标识");
        }
    }

    $done({ body: JSON.stringify(obj) });

} catch (e) {
    console.log(`❌ [Wink] 脚本执行出错: ${e}`);
    $done({});
}
