# bangicon

BanG 主卡面板用的角色立绘、头像和乐队标志，预设「奏明！序曲」前置设置的主题插画，以及放歌插件 MUSIC!!!!! 用的歌词时间轴和本机中转。

| 类型 | 文件名 | 规格 |
|---|---|---|
| 立绘 | `立绘_<角色名>.png`，原有 45 人多是 `.jpg` | 1432×1764，蓝色渐变背景，头顶在画面约 18% 处 |
| 头像 | `头像_<角色名>.jpg` | 740 上下见方的 JPG |
| 乐队标志 | `标志_<乐队键>.png` | 透明底 PNG，宽 225～600 |
| 乐队徽记 | `徽记_<乐队键>.webp`（ras、monica 是 `.svg`，mewtype 是 `.png`） | 26～62 像素的小图标，面板收起时「正在浏览」那颗胶囊用 |
| 前置设置插画 | `前置_<主题键>.webp` | 600×900 WebP，淡水彩，上方三分之一留空 |
| 歌词时间轴 | `MUSIC/时间轴/<网易云歌曲 id>.json` | 每行歌词的开始时间和指纹，没有歌词原文 |
| 认歌索引 | `MUSIC/索引/<两位十六进制>.json` | 歌词整行指纹 → 歌曲，没写曲名时按歌词认歌用 |
| 本机中转 | `MUSIC/relay/install.sh`、`index.mjs`、`网易云.mjs` | 酒馆服务端插件 MUSIC 和它的 Termux 一键安装脚本 |

现有角色：九支乐队原有的 45 人；仲町阿拉蕾、宫永野乃花、藤都子、千石由乃、峰月律、薇欧拉、墨缇丝（都有立绘、头像）。

乐队键（标志、徽记）：popipa、afterglow、hhw、pasupare、roselia、ras、monica、mygo、mujica、mewtype（梦限大MewType）。

前置设置主题：mujica（Ave Mujica）、popipa（Poppin'Party）、afterglow（Afterglow）、pasupare（Pastel＊Palettes）、roselia（Roselia）、hhw（Hello, Happy World!）、monica（Morfonica）、ras（RAISE A SUILEN）、mygo（MyGO!!!!!）。

引用地址：`https://testingcf.jsdelivr.net/gh/yixipf784852-glitch/bangicon@main/<文件名>`
