# Springboot Official: https://spring.io/guides/topicals/spring-boot-docker/
FROM eclipse-temurin:17-jdk as image-with-jar
WORKDIR /any-path/flying-monkey
COPY . .
RUN ./gradlew clean build

FROM eclipse-temurin:17-jdk
WORKDIR /any-path/flying-horse
COPY --from=image-with-jar /any-path/flying-monkey/build/libs/backend-*-SNAPSHOT.jar ./backend.jar
ENTRYPOINT ["java", "-jar", "backend.jar"]

