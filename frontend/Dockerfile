FROM node:22-alpine3.21

WORKDIR /app

# パッケージ定義だけを先にコピーしてキャッシュ活用
COPY package.json package-lock.json ./

# 一度インストール（初回のみ失敗しても可）
RUN npm install

# アプリ本体をコピー
COPY . .

# lightningcss のネイティブバイナリを再ビルド
RUN npm rebuild lightningcss

EXPOSE 3000

CMD ["npm", "run", "dev"]
