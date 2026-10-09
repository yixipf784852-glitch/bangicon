#!/usr/bin/env bash
# MUSIC!!!!! 本机中转（酒馆服务端插件 MUSIC）一键安装，Termux 等 Linux 环境用。版本 0.1.0。
# 只做三件事：把插件的两个文件下载到 酒馆文件夹/plugins/MUSIC/；把 config.yaml 里 enableServerPlugins 改成 true；告诉你重启酒馆。
# 用法：curl -fsSL https://testingcf.jsdelivr.net/gh/yixipf784852-glitch/bangicon@main/MUSIC/relay/install.sh | bash
#   酒馆不在 ~/SillyTavern 的，在命令最后加上酒馆文件夹：… | bash -s -- ~/你的酒馆文件夹
#   再运行一次就是更新到最新版。
# MUSIC_MIRRORS、MUSIC_REPO_PATH 两个环境变量只在测试时用来换下载地址。
set -e

MIRRORS="${MUSIC_MIRRORS:-https://testingcf.jsdelivr.net https://fastly.jsdelivr.net https://cdn.jsdelivr.net}"
REPO_PATH="${MUSIC_REPO_PATH-/gh/yixipf784852-glitch/bangicon@main/MUSIC/relay}"

# 依次试几个镜像，下载完而且不是空文件才算
download() {
  for m in $MIRRORS; do
    if curl -fsSL --connect-timeout 10 --max-time 60 "$m$REPO_PATH/$1" -o "$2.tmp" && [ -s "$2.tmp" ]; then
      mv "$2.tmp" "$2"
      return 0
    fi
  done
  rm -f "$2.tmp"
  return 1
}

# 找酒馆文件夹：命令后面给了就用给的；没给就找几个常见的位置（里面要有 server.js）
ST="${1:-}"
if [ -z "$ST" ]; then
  for d in "$HOME/SillyTavern" "$HOME/sillytavern" "$HOME/SillyTavern-release" "$HOME/SillyTavern-staging"; do
    if [ -f "$d/server.js" ]; then ST="$d"; break; fi
  done
fi
if [ -z "$ST" ] || [ ! -f "$ST/server.js" ]; then
  echo "× 找不到酒馆文件夹（里面要有 server.js）。"
  echo "  在命令最后加上你的酒馆文件夹，例如：curl -fsSL …/install.sh | bash -s -- ~/我的酒馆"
  exit 1
fi
CFG="$ST/config.yaml"
if [ ! -f "$CFG" ]; then
  echo "× 没找到 $CFG：先把酒馆启动一次（会自动生成这个文件），再运行这条命令。"
  exit 1
fi

mkdir -p "$ST/plugins/MUSIC"
if ! download "index.mjs" "$ST/plugins/MUSIC/index.mjs" \
  || ! download "%E7%BD%91%E6%98%93%E4%BA%91.mjs" "$ST/plugins/MUSIC/网易云.mjs"; then
  echo "× 下载失败：网络不通，过一会儿再试。"
  exit 1
fi

if grep -q '^enableServerPlugins: true' "$CFG"; then
  echo "· config.yaml 里服务端插件本来就开着"
elif grep -q '^enableServerPlugins:' "$CFG"; then
  sed -i 's/^enableServerPlugins:.*/enableServerPlugins: true/' "$CFG"
  echo "· 已打开 config.yaml 里的 enableServerPlugins"
else
  printf '\nenableServerPlugins: true\n' >> "$CFG"
  echo "· config.yaml 里加上了 enableServerPlugins: true"
fi

V=$(grep -o "版本 = '[0-9.]*'" "$ST/plugins/MUSIC/网易云.mjs" | head -n 1 | grep -o "[0-9][0-9.]*" || true)
echo "✓ MUSIC 本机中转装好了（版本 ${V:-未知}）：$ST/plugins/MUSIC"
echo "  下一步：重启酒馆（在跑酒馆的窗口按 Ctrl+C 停下，再启动）。启动时看到 Initializing plugin from …plugins/MUSIC/index.mjs 就对了。"
echo "  然后在酒馆里：魔术棒 →「MUSIC!!!!! 设置」→「进阶」→ 中转选「本机插件」→ 点「测试连接」。"
