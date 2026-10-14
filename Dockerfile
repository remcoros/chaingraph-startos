# syntax=docker/dockerfile:1@sha256:ecfaec9ed6d810b56388c508f4121597bfbba70d41a6dfeee4d8cad5f295fc32

# Pin a public main commit. Bump this SHA and the package's downstream revision together.
ARG CHAINGRAPH_COMMIT=720f28bc60f1e580ba30146f31ba95a5afae2be8

FROM --platform=$BUILDPLATFORM node:24.20.0-bookworm-slim@sha256:ba849c60be29959425b8734d57b8b4b7d56f98edd9504c9af091d5281095a71e AS build
ARG CHAINGRAPH_COMMIT
WORKDIR /app
ADD https://github.com/remcoros/chaingraph/archive/${CHAINGRAPH_COMMIT}.tar.gz /tmp/chaingraph.tar.gz
RUN tar -xzf /tmp/chaingraph.tar.gz --strip-components=1 -C /app \
    && rm /tmp/chaingraph.tar.gz \
    && npm ci --ignore-scripts --no-audit --no-fund \
    && CHAINGRAPH_SOURCE_URL=https://github.com/remcoros/chaingraph npm run build \
    && mkdir /app/runtime-config \
    && npm exec --no -- esbuild server/index.ts --bundle --platform=node --target=node24 --format=cjs --outfile=build/server.cjs

FROM node:24.20.0-bookworm-slim@sha256:ba849c60be29959425b8734d57b8b4b7d56f98edd9504c9af091d5281095a71e
ARG CHAINGRAPH_COMMIT
WORKDIR /app
ENV NODE_ENV=production SERVER_HOST=0.0.0.0 SERVER_PORT=3000 CHAINGRAPH_NETWORK_CONFIG_DIR=/run/chaingraph
LABEL org.opencontainers.image.title="Chaingraph" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/remcoros/chaingraph" \
      org.opencontainers.image.revision="$CHAINGRAPH_COMMIT"
COPY --from=build /app/build/server.cjs ./server.cjs
COPY --from=build /app/dist ./dist
COPY --from=build /app/LICENSE /app/THIRD_PARTY_NOTICES.md /app/package.json /app/package-lock.json ./
COPY --from=build /app/runtime-config /run/chaingraph
USER node
EXPOSE 3000
CMD ["node", "/app/server.cjs"]
