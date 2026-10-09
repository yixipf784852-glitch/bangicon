// MUSIC!!!!! 中转的核心：替浏览器去问网易云官方接口。酒馆服务端插件（index.mjs）和自建 Worker（构建.py 拼成单文件）共用这一份。
// 只向 music.163.com 发请求，不转发任何别的地址；cookie 只取 MUSIC_U 一项，不保存、不打印。
// 账号状态只回「登录没有、有没有会员」，不回昵称和账号 id。不做任何绕过版权限制的事：放不了的歌就是放不了。

export const 版本 = '0.1.1';
const 网易云 = 'https://music.163.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

// 只要 MUSIC_U：玩家贴整串 cookie 也只取这一项；只贴了值也认。值里不许有空白和分号（防止拼出别的请求头）
export function 整理cookie(值) {
  const s = String(值 || '').trim();
  const m = /(?:^|;\s*)MUSIC_U=([^;\s]+)/.exec(s);
  const u = m ? m[1] : (/^[^\s;=]+$/.test(s) ? s : '');
  return (u ? 'MUSIC_U=' + u + '; ' : '') + 'os=pc';
}

async function 问网易云(路径, { cookie, 表单 } = {}) {
  const r = await fetch(网易云 + 路径, {
    method: 表单 ? 'POST' : 'GET',
    headers: Object.assign({ 'User-Agent': UA, Referer: 网易云 + '/', Cookie: 整理cookie(cookie) },
      表单 ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    body: 表单 ? new URLSearchParams(表单).toString() : undefined,
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error('网易云回了 ' + r.status);
  return r.json();
}

const 整数 = v => (/^\d{1,15}$/.test(String(v)) ? Number(v) : null);

// 各接口：收请求体（已解析的 JSON），回一个对象
export const 处理 = {
  // 账号状态：登录没有、有没有会员
  async status({ cookie }) {
    const d = await 问网易云('/api/nuser/account/get', { cookie });
    const 账号 = d && d.account;
    const vip = 账号 ? Number(账号.vipType) || 0 : 0;
    return { 登录: !!账号, 会员: vip > 0, vipType: vip };
  },

  // 按曲名、歌手搜，带上这个账号能不能放（pl 大于 0 能放，st 小于 0 是下架或地区限制）
  async search({ cookie, keywords, limit }) {
    const 词 = String(keywords || '').trim().slice(0, 100);
    if (!词) return { 歌们: [] };
    const d = await 问网易云('/api/search/get/web', { cookie, 表单: { s: 词, type: 1, limit: Math.min(30, 整数(limit) || 20), offset: 0 } });
    const 们 = ((d && d.result && d.result.songs) || []).map(s => ({
      id: s.id, 曲名: s.name, 艺人: (s.artists || []).map(a => a.name), 专辑: s.album ? s.album.name : '',
      别名: [].concat(s.alias || [], s.transNames || []), 时长: s.duration, fee: s.fee,
    }));
    if (!们.length) return { 歌们: [] };
    const c = JSON.stringify(们.map(s => ({ id: s.id })));
    const 详 = await 问网易云('/api/v3/song/detail?c=' + encodeURIComponent(c), { cookie });
    const 权 = new Map(((详 && 详.privileges) || []).map(p => [p.id, p]));
    们.forEach(s => { const p = 权.get(s.id) || {}; s.pl = p.pl || 0; s.st = typeof p.st === 'number' ? p.st : 0; });
    return { 歌们: 们 };
  },

  // 播放地址：会员歌在没有会员的账号下可能只给 30 秒试听（试听里是起止秒数）
  async url({ cookie, id }) {
    const n = 整数(id);
    if (!n) return { 地址: null };
    const d = await 问网易云('/api/song/enhance/player/url?ids=' + encodeURIComponent('[' + n + ']') + '&br=320000', { cookie });
    const x = ((d && d.data) || [])[0] || {};
    const 试 = x.freeTrialInfo;
    return { id: n, 地址: x.url || null, 码率: x.br || 0, fee: x.fee, 试听: 试 ? { 起: 试.start, 止: 试.end } : null };
  },

  // 带时间的歌词（脚本拿来对楼里的歌词是哪一段；只给这个玩家自己的浏览器用）
  async lyric({ cookie, id }) {
    const n = 整数(id);
    if (!n) return { lrc: '' };
    const d = await 问网易云('/api/song/lyric?id=' + n + '&lv=1', { cookie });
    return { lrc: (d && !d.nolyric && d.lrc && d.lrc.lyric) || '' };
  },
};

// 出错只回一句话，不带请求内容
export const 错误话 = e => (e && e.message ? String(e.message).slice(0, 80) : '网易云没回应');
