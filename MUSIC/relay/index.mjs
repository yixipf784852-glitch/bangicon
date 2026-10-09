// MUSIC!!!!! 的本机中转（酒馆服务端插件）：脚本把玩家自己的网易云 MUSIC_U 交过来，这里替它去网易云官方接口取搜索结果、播放地址和歌词。
// 浏览器直接读不了网易云的接口（没有 CORS），所以要在酒馆这台机器上转一手。问网易云的部分在 网易云.mjs（自建 Worker 也用它）。
//
// 装法：把整个 MUSIC 文件夹放进酒馆的 plugins/ 目录，config.yaml 里 enableServerPlugins 改成 true，重启酒馆。
// 接口都在 /api/plugins/music/ 下：GET ping；POST status、search、url、lyric（带酒馆的 CSRF 令牌，请求体是 JSON）。
// 请求体：酒馆已经在全局解析好 JSON（server-main.js 的 bodyParser.json），这里直接用 req.body。
import { 版本, 处理, 错误话 } from './网易云.mjs';

export const info = {
  id: 'music',
  name: 'MUSIC!!!!!',
  description: 'MUSIC!!!!! 放歌插件的本机中转：用玩家自己的网易云账号取播放地址和歌词',
};

export async function init(router) {
  // 脚本用来看插件装没装
  router.get('/ping', (req, res) => res.json({ 名字: 'MUSIC!!!!!', 版本 }));
  for (const [名, fn] of Object.entries(处理)) {
    router.post('/' + 名, async (req, res) => {
      try {
        res.json(await fn(req.body || {}));
      } catch (e) {
        res.status(502).json({ 错误: 错误话(e) });
      }
    });
  }
}

export async function exit() { /* 没有要收的东西 */ }
