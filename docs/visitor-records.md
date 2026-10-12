# 访客 IP 后台：注册、配置和审核

状态（2026-10-12）：Cloudflare 数据库和 Worker 已创建并部署，用户已确认采集范围；本地待发布前端已开启并附带隐私说明，服务端仍关闭，线上网站尚未更新，尚未启用真实记录。数据库和查询视图均可通过已授权账号查询，目前记录数为 0。网站继续放在 GitHub Pages，Namecheap 的 DNS 保持现状。

当前已完成注册、授权、建库、建表和 Worker 部署，不要重复执行下文的资源创建步骤；保留这些步骤供以后查阅。

- Worker：`https://yiran-visitor-records.yiranyang-visitor.workers.dev`
- 写入接口：`https://yiran-visitor-records.yiranyang-visitor.workers.dev/collect`
- D1 数据库：`yiran-visitor-records`
- 清理任务：每小时整点运行
- 待发布网站配置已填写真实接口地址，`enabled` 为 `true`；服务端 `COLLECTION_ENABLED` 仍为 `"false"`
- 验收状态：Cloudflare 报告部署成功；数据库表和视图查询通过；本地 10 项测试、网站构建和静态导出检查通过。新接口地址的本机 HTTPS 连接检查失败，线上 HTTP 状态验收尚未通过，需要继续排查。
- 已完成仓库核对，采集范围及保留期已由用户确认。下一步：上传接入文件、通过 GitHub Actions 检查、发布隐私说明，再启用服务端写入。

## 当前 GitHub 接入步骤

已核对仓库：https://github.com/whatififwhat/yiranyang.gitub.io/ ，基线提交 `c51d10c9014704c31aa84de498b8ea4a38dd17eb`。保留了你在 Research 中修改的项目介绍，以及远端已有的 `.nojekyll`。

1. 解压增量包 `github-visitor-ip-update.zip`。将其中普通文件和文件夹上传到该仓库根目录，保持路径；这是新增/覆盖指定文件，不要删除已有照片、CV 或其他页面，也不要上传 zip 本身。
2. 隐藏目录容易被浏览器上传遗漏：在 GitHub 单独打开 `.github/workflows/pages.yml` 的编辑器，用包中同一路径文件的内容替换。这次仅新增 `npm test` 和 `npm run verify:visitor-service` 两项检查。根目录的 `workflows/pages.yml` 不会生效，不要改错位置。`.gitignore` 可以用 Add file → Create new file 按同名补上。
3. 提交后查看 Actions 自动构建。新增的 `Verify visitor service without recording a visit` 会从 GitHub 的网络检查 Cloudflare，POST 携带 DNT/GPC，不保存这次检查的 IP。它校验端点连通、CORS 和没有公开读取入口，不证明正常写入已经启用。
4. 当前包的前端接入已开启，Worker 仍关闭写入。自动检查全部通过后，Actions → Build and publish website → Run workflow，选择 main 并勾选 Publish the reviewed website publicly on GitHub Pages，发布接入代码和 Privacy 说明。如果检查失败，先展开红色步骤查看具体错误，不要跳过失败的检查。
5. 发布完成后告诉我。我会确认线上 Privacy 已显示 IP 说明及退出选项，然后开启 Worker，并验收实际写入。隐私范围已经确认，无需重复批准；仅上传前端代码不会开始保存记录。

本机对新 `workers.dev` 地址的普通 DNS 查询出现不同结果，HTTPS 测试亦失败，原因尚未最终确定。若 GitHub 的检查成功而本机继续失败，将说明可达性因网络而异。被阻断网络中的访问可能无法计入；若需要解决这些网络的覆盖问题，应单独讨论接口域名与 DNS 调整，不能擅自更换你的网站解析。

## 这次具体增加什么

网站六个内容页面加载时，向独立的 Cloudflare Worker 发送当前页面路径和一次性的随机事件编号。Worker 从 Cloudflare 入站请求获取来源 IP，加入服务器时间，写入 D1 数据库。浏览器不传 IP，也不提供时间。你通过自己的 Cloudflare 账号进入 D1 Console/Tables 查看记录；访客无法通过网站或 Worker 下载这些记录。

这不是 Cloudflare Web Analytics 的汇总统计产品，也不在网站增加一套密码登录系统。数据库的读取权限由 Cloudflare 账号权限控制。建议账号启用双重验证，不要给无关账号授予这个数据库的访问权限。

以下范围已于 2026-10-12 经你确认（保留审核内容供查阅）：

| 项目 | 实现 |
| --- | --- |
| 保存 | 公网 IP、服务器访问时间、六个公开页面的路径、用于去重的随机事件编号 |
| 不写入访问表 | 邮箱、浏览器型号、来源网站、查询参数、浏览器指纹、持久访客编号 |
| 保存时长 | 活跃数据库保留约 30 天，每小时删除超期记录；正常运行下最长多保留一个清理周期 |
| 恢复备份 | Cloudflare D1 自动备份可能额外保留删除前数据 7 天（Free）或 30 天（Paid） |
| 访客选择 | 尊重 Do Not Track / Global Privacy Control；Privacy 页面可保存此浏览器的退出统计偏好 |
| 私有后台 | 只有获授权的 Cloudflare 账号通过 D1 控制台读取；不提供公开读取接口 |
| 启用条件 | 范围已获确认；隐私说明上线、检查通过后，才开启 Worker 写入 |

IP 是网络出口地址，可能是 VPN、代理、学校或公司的共享地址，不能据此可靠识别具体个人。统计从启用后开始，无法补回过去的访问记录；禁用脚本、拦截请求、网络阻断和频率限制都会造成漏记。源站校验与限流可减少误用，但公开写入接口无法保证每条记录都是真实访问。

## 1. 注册 Cloudflare（现在可以做）

1. 打开 https://dash.cloudflare.com/sign-up 注册账号并验证邮箱。
2. 登录后使用 Workers & Pages / D1 开发者服务。此方案不要求添加 `yiranyang.com` 为 Cloudflare DNS 站点，也不要求更换 Namecheap nameservers。
3. 使用 Free 方案起步；不要为了本教程升级付费套餐。实际使用受 Cloudflare 当时的额度限制，超过额度可能停止记录。

下面用 Cloudflare 官方 Wrangler 工具一次性配置服务，比在网页中手工配置绑定更完整。代码已用 Wrangler 4.92.0 进行本地部署演练。命令需要在 Mac 的「终端」执行；当前电脑已具备 Node.js 24。首次运行 npx 如询问安装包，确认安装 `wrangler@4.92.0`。

## 2. 登录并创建数据库（此时不采集）

先进入准备好的源码目录（将 `/path/to/your/website` 替换为你电脑上的实际位置；当前电脑的建库和部署已经完成，不必重复）：

```sh
cd /path/to/your/website/analytics-worker
npx wrangler@4.92.0 login
```

浏览器打开 Cloudflare 授权页面后，确认是你刚注册的账号，再授权本机官方 Wrangler。不要将登录密码、验证码、API Token 发到聊天或放进 GitHub。

```sh
npx wrangler@4.92.0 d1 create yiran-visitor-records
```

输出中会包含 `database_id`。把本目录 `wrangler.jsonc` 中 `REPLACE_WITH_D1_DATABASE_ID` 替换为该值，其他绑定名称保持不变。数据库 ID 是资源标识，不是密码；如需要我继续配置，可以提供该 ID。

建立数据表：

```sh
npx wrangler@4.92.0 d1 execute yiran-visitor-records --remote --file=schema.sql
```

## 3. 部署关闭状态的 Worker

确认 `wrangler.jsonc` 仍是 `"COLLECTION_ENABLED": "false"`，然后执行：

```sh
npx wrangler@4.92.0 deploy
```

首次使用时可能要求设置账号的 `workers.dev` 子域名。部署会输出类似 `https://yiran-visitor-records.YOUR-SUBDOMAIN.workers.dev` 的真实地址，以实际输出为准。无需购买另一个域名，也不要把示例占位地址写进网站。

配置文件同时创建数据库绑定、每 IP 每分钟约 30 次的限流绑定，以及每小时清理任务。限流是 Cloudflare 节点级的近似计数，不是全局精确计数。Worker 日志采集在配置中关闭，代码也不打印 IP 或请求正文。

直接在浏览器打开 Worker 根地址会显示 404，这是正常的：该服务只有 `POST /collect` 写入接口，没有公开后台或读取入口。关闭状态的有效写入请求返回 503。

## 4. 审核后再接入网站

当前真实地址已填写、采集范围已确认；按上方“当前 GitHub 接入步骤”操作即可。以下配置示例用于后续维护。

审核通过后，网站 `lib/visitor-config.ts` 中的配置应为：

```ts
export const visitorConfig: { enabled: boolean; endpoint: string } = {
  enabled: true,
  endpoint: 'https://yiran-visitor-records.YOUR-SUBDOMAIN.workers.dev/collect',
};
```

只改配置值，保留文件其余的 URL 校验函数。此 URL 是公开接口地址，不是秘密；任何 Cloudflare 凭据都不能放到这个文件。

在 GitHub 更新本次修改的源码文件并保留它们的目录结构。增量包中有完整清单；它不是整站备份，不包含照片或 CV。若你已在 GitHub 改过相同文件，先比较并合并，不能用旧本地内容覆盖远端修改。`pages.yml` 必须仍位于 `.github/workflows/pages.yml`；也可以只在现有 workflow 的 `npm ci` 后加一行 `- run: npm test`，保留你当前能成功部署的流程。

按照已有方式 Actions → Build and publish website → Run workflow → main → 勾选发布。**先发布并确认 Privacy 页面显示 Visitor records 和 IP 说明**，此时 Worker 仍关闭。然后在本地 `analytics-worker/wrangler.jsonc` 将 `COLLECTION_ENABLED` 改成字符串 `"true"`，重新运行：

```sh
npx wrangler@4.92.0 deploy
```

这样真实采集只会在隐私说明已经上线后开始。以后可以把这个服务端开关改回 `"false"` 并部署来立即停止写入；保留清理任务，让旧记录按期删除。若完全撤销功能，也应将前端开关关闭后重新发布。

## 5. 在后台查看 IP

登录 Cloudflare → D1 SQL database（通常在 Storage & databases 下）→ `yiran-visitor-records` → Console，执行：

```sql
SELECT time_beijing, ip, path
FROM recent_visits
LIMIT 500;
```

展示最近 30 天的访问，按时间倒序；时间已换算为北京时间。也可以在 Tables 中打开 `visits` 查看原始记录，`visited_at` 是 UTC 毫秒时间戳。

按页面统计最近 30 天的访问次数：

```sql
SELECT path, COUNT(*) AS page_views
FROM visits
WHERE visited_at >= (unixepoch() - 30 * 86400) * 1000
GROUP BY path
ORDER BY page_views DESC;
```

接入后的验收：

1. 正常打开 `https://yiranyang.com/research/`，确认有一条 `/research` 记录。无痕模式本身不一定退出统计；如果记录不出现，检查 DNT/GPC、拦截扩展、Worker 请求和开关。
2. 在 Privacy 点击 Exclude this browser，再访问页面，确认不再新增。此操作只影响之后的记录。清除站点存储可以撤销本地偏好，DNT/GPC 仍优先。
3. 在未登录的浏览器访问 Worker 的 `/admin`、`/visits`、`/collect`，不能得到数据。
4. 在 Workers & Pages 中确认 Cron Trigger 存在并检查执行情况。若清理任务失败或数据库被 Time Travel 恢复，应立即重新运行清理，避免超期数据继续保存。

不要把含真实 IP 的数据库导出、查询结果或截图上传到公开 GitHub 仓库。

## 官方资料

- 注册：https://dash.cloudflare.com/sign-up
- Workers 入门：https://developers.cloudflare.com/workers/get-started/guide/
- D1 建库、绑定及控制台：https://developers.cloudflare.com/d1/get-started/
- IP 入站头的行为：https://developers.cloudflare.com/fundamentals/reference/http-headers/
- 限流绑定：https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- 定时任务：https://developers.cloudflare.com/workers/configuration/cron-triggers/
- D1 恢复备份：https://developers.cloudflare.com/d1/reference/time-travel/
