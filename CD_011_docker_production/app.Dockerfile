# Springboot Official: https://spring.io/guides/topicals/spring-boot-docker/
FROM eclipse-temurin:17-jdk AS image-with-jar
WORKDIR /any-path
COPY . .
RUN ./gradlew clean build

FROM eclipse-temurin:17-jdk
WORKDIR /any-path
COPY --from=image-with-jar /any-path/build/libs/docker.prod-*-SNAPSHOT.jar ./app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]