# 经验与踩坑记录

> 记录经过**实际运行验证**的踩坑经验，避免重复踩坑。每条必须包含可复现的现象、根因、已验证的解决方案。

## 微信云函数 `new Date()` 默认 UTC，导致"当天时分"判定错乱

- **Tags**: `#runtime` `#environment` `#tricky-issue`
- **Trigger Context**: 微信云开发云函数中对"当天时分"做业务校验。本项目场景：`create-order` 云函数校验用户选的预约时间是否在营业时间内、是否在"现在"之后（生日蛋糕提前 3 小时）。
- **Symptoms**: 前端（用户设备，北京时间）校验通过，但云函数返回"所选时间已过"。症状随真实北京时间变化——**北京早上最明显**（北京 00:00–08:00 = UTC 前一天 16:00–24:00）：用户选早上时间，云端用 UTC 的"晚上"判定为"已过"。修改营业时间范围无效（因为比的是"现在"，不是营业范围）。
- **Root Cause**: 微信云函数运行环境默认时区为 **UTC**，`new Date().getHours()` 返回 UTC 小时；而业务时间（营业时间 `09:00-22:00`、用户选的 `HH:MM`）都是北京时间（UTC+8）。两者差 8 小时，跨天环绕会把"未来"误判为"过去"。
- **Verified Solution**:

   ```typescript
   // ❌ 错误：getHours() 取服务器本地时区（云函数 = UTC）
   const nowM = new Date().getHours() * 60 + new Date().getMinutes();

   // ✅ 正确：用 getUTCHours()+8 显式算北京时间，无论服务器在 UTC 还是 UTC+8 都对
   function getBeijingNowMinutes(): number {
      const now = new Date();
      return (now.getUTCHours() * 60 + now.getUTCMinutes() + 8 * 60) % (24 * 60);
   }
   ```

   关键：`getUTCHours()` **永远返回 UTC**，`+8h` **永远是北京时间**，与服务器时区设置无关——这是最稳的写法。

- **Prevention Recommendations**:
   1. 云函数里凡涉及"当天时分"的业务逻辑，一律用 `getUTCHours()+8`（或 `Intl.DateTimeFormat` 指定 `timeZone: 'Asia/Shanghai'`），**不要用 `getHours()`**。
   2. 绝对时间戳（如 `created_at`）用 `new Date().toISOString()` 没问题（ISO 是绝对时间），只有"当天时分"才有时区问题。
   3. **排查这类问题的快速手段**：把后端算出的"当前时间"塞进错误消息返回前端，一眼对比设备时间与服务器时间，立即定位是时区还是时钟问题。
   4. 前端跑在用户设备上，`getHours()` 就是用户本地时间，无需换算；只有云端需要。

## 修改 `weixin-cloud/` 云函数后，必须重启 dev 才会重新编译

- **Tags**: `#environment` `#configuration` `#tricky-issue`
- **Trigger Context**: 本项目 `pnpm run dev`（`scripts/dev.mjs`）开发时，修改 `weixin-cloud/` 下的 `.ts` 云函数。
- **Symptoms**: 改了云函数 `.ts`、甚至点了"上传并部署"，但云端行为不变，仿佛跑的是旧代码。本地 `index.ts` 是新的，但症状像没部署。
- **Root Cause**: dev 的 watch **只监听 `src/`（前端）**，`weixin-cloud/*.ts` 只在 dev **启动时**编译一次到 `dist/dev/mp-weixin/weixin-cloud/*.js`。微信开发者工具的 `cloudfunctionRoot` 指向 `dist/dev/mp-weixin/weixin-cloud/`，上传的是这个编译产物。改了 `.ts` 但没重启 dev → dist 里的 `.js` 还是旧的 → 上传的就是旧代码。
- **Verified Solution**:
   ```bash
   pnpm run dev:stop   # 停掉旧 dev
   pnpm run dev        # 重启，重新编译 weixin-cloud → dist
   # 然后微信开发者工具右键云函数 → "上传并部署：上传所有文件"
   ```
   验证编译是否生效：`grep "<新代码特征>" dist/dev/mp-weixin/weixin-cloud/<函数名>/index.js`
- **Prevention Recommendations**: 每次改云函数后，**先重启 dev 再上传**；或记住 `weixin-cloud/` 不在 watch 范围内。判断方法：改完 `.ts` 后 grep 对应的 `dist/.../index.js`，若没有新代码特征，就是没重编译。
