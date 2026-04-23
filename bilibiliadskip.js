/**
 * @name Wink_Vip_Crack
 * @description 绕过 Wink 会员检测
 */

let url = $request.url;
let body = $response.body;
let obj = JSON.parse(body);

if (url.includes("api-wink.meitumv.com/user/show.json")) {
    // 处理第一个接口
    if (obj.data) {
        obj.data.vip_type = 1; // 激活 VIP 标识
        obj.data.coin = 9999;  // 顺手改个金币数量 (视觉效果)
    }
} 

else if (url.includes("api.account.meitu.com/users/show_current.json")) {
    // 处理第二个接口 (美图通行证)
    if (obj.response && obj.response.user && obj.response.user.vip) {
        let vipList = obj.response.user.vip.list;
        vipList.forEach(item => {
            if (item.app_id === 184) { // 184 是 Wink 的 AppID
                item.status = 1; // 改为有效状态
                item.is_sub = true;
                item.expire_time = 4102444800; // 2100年
            }
        });
        // 也可以直接强制给 user 增加一些 vip 属性
        obj.response.user.is_vip = true;
    }
}

$done({ body: JSON.stringify(obj) });
