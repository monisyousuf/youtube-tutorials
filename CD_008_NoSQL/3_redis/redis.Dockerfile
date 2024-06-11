FROM redis:7.2.5
WORKDIR /usr/local/etc/redis/
COPY ./init-redis.sh init-redis.sh
COPY ./data.redis data.redis
RUN chmod u+x ./init-redis.sh
ENTRYPOINT ./init-redis.sh