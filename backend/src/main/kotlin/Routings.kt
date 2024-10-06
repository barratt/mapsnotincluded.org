/*
 * ONI Seed Browser Backend
 * Copyright (C) 2024 Stefan Oltmann
 * https://stefan-oltmann.de
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import com.mongodb.ConnectionString
import com.mongodb.MongoClientSettings
import com.mongodb.ServerApi
import com.mongodb.ServerApiVersion
import com.mongodb.kotlin.client.coroutine.MongoClient
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondBytes
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import kotlinx.coroutines.flow.toList
import kotlinx.serialization.json.Json
import model.World
import org.slf4j.LoggerFactory

private val mongoUrl: String = System.getenv("MONGO_DB_URL") ?: "cluster0.um7sl.mongodb.net"
private val mongoPassword: String? = System.getenv("MONGO_DB_PASSWORD")
private val mniApiKey: String? = System.getenv("MNI_API_KEY")

private val connectionString =
    "mongodb+srv://mongodb:$mongoPassword@$mongoUrl/?retryWrites=true&w=majority&appName=cluster0"

private val serverApi = ServerApi.builder()
    .version(ServerApiVersion.V1)
    .build()

private val mongoClientSettings = MongoClientSettings.builder()
    .applyConnectionString(ConnectionString(connectionString))
    .serverApi(serverApi)
    .build()

private val logger = LoggerFactory.getLogger("Routings")

fun Application.configureRouting() {

    install(ContentNegotiation) {
        json()
    }

    routing {

        get("/") {
            call.respondText("MapsNotIncluded.org")
        }

        get("/bench") {

            val start = System.nanoTime()

            Json.decodeFromString<World>(sampleWorldJson)

            val durationNanos = System.nanoTime() - start

            val millis = durationNanos / 1000000.0

            call.respondText("Parsing of sample took $millis ms.")
        }

        get("/all") {

            val start = System.currentTimeMillis()

            logger.info("Should deliver all worlds...")

            MongoClient.create(mongoClientSettings).use { mongoClient ->

                val database = mongoClient.getDatabase("oni")

                val collection = database.getCollection<World>("worlds")

                val allWorlds = collection.find().toList()

                logger.info("Found ${allWorlds.size} worlds.")

                call.respond(allWorlds)
            }

            val duration = System.currentTimeMillis() - start

            logger.info("Returned all worlds in $duration ms.")
        }

        get("/distinct") {

            val start = System.currentTimeMillis()

            logger.info("Should deliver all worlds...")

            MongoClient.create(mongoClientSettings).use { mongoClient ->

                val database = mongoClient.getDatabase("oni")

                val collection = database.getCollection<World>("worlds")

                val allWorlds = collection.find().toList().distinctBy {
                    it.cluster
                }

                logger.info("Found ${allWorlds.size} distinct worlds.")

                call.respond(allWorlds)
            }

            val duration = System.currentTimeMillis() - start

            logger.info("Returned distinct worlds in $duration ms.")
        }

        post("/upload") {

            val start = System.currentTimeMillis()

            val apiKey = this.context.request.headers["MNI_API_KEY"]

            if (apiKey != System.getenv("MNI_API_KEY")) {

                logger.warn("Unauthorized API key used.")

                call.respond(HttpStatusCode.Unauthorized)

                return@post
            }

            try {

                val byteArray = call.receive<ByteArray>()

                val jsonString = byteArray.decodeToString()

                val world = Json.decodeFromString<World>(jsonString)

                logger.info("Received world: $world")

                MongoClient.create(mongoClientSettings).use { mongoClient ->

                    val database = mongoClient.getDatabase("oni")

                    val collection = database.getCollection<World>("worlds")

                    collection.insertOne(world)
                }

                call.respond(HttpStatusCode.OK)

                val duration = System.currentTimeMillis() - start

                logger.info("Completed upload in $duration ms.")

            } catch (ex: Exception) {

                ex.printStackTrace()

                logger.error("Exception on submitting.", ex)

                call.respond(HttpStatusCode.InternalServerError)
            }
        }

        get("/health") {

            if (mongoPassword.isNullOrBlank()) {
                logger.error("No DB key set.")
                call.respond(HttpStatusCode.InternalServerError, "No DB key.")
                return@get
            }

            if (mniApiKey.isNullOrBlank()) {
                logger.error("No API key set.")
                call.respond(HttpStatusCode.InternalServerError, "No API key.")
                return@get
            }

            call.respondText("OK", ContentType.Text.Plain, HttpStatusCode.OK)
        }
    }
}
