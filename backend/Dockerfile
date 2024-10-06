FROM gradle:8-jdk17 AS BUILD_STAGE
WORKDIR /tmp
COPY gradle gradle
COPY build.gradle.kts gradle.properties settings.gradle.kts gradlew ./
COPY src src
RUN ./gradlew --no-daemon --info buildFatJar

FROM openjdk:17-jdk-slim
EXPOSE 8080:8080
RUN mkdir /app
COPY --from=BUILD_STAGE /tmp/build/libs/*-all.jar /app/ktor-server.jar
ENTRYPOINT ["java","-Xlog:gc+init","-XX:+PrintCommandLineFlags","-jar","/app/ktor-server.jar"]
