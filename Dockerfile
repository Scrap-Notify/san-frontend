FROM node:22-alpine AS build

# pnpm 활성화
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# working directory를 /app으로 설정
WORKDIR /app

# 의존성 설치를 위한 매니페스트 복사
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/dashboard/package.json ./packages/dashboard/
RUN pnpm install --frozen-lockfile

# 소스 파일 복사 및 dashboard 빌드
COPY packages/shared ./packages/shared
COPY packages/dashboard ./packages/dashboard
COPY tailwind.config.js ./
RUN pnpm --filter dashboard build

# Nginx
FROM nginx:alpine

# 빌드된 정적 파일을 nginx html 디렉토리로 복사
COPY --from=build /app/packages/dashboard/dist /usr/share/nginx/html

# 포트 노출 및 실행
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
