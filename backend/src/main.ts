import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const allowedOrigins = process.env.CORS_ORIGIN?.split(",")
        .map((value) => value.trim())
        .filter(Boolean);

    app.enableCors({
        origin: allowedOrigins?.length
            ? allowedOrigins
            : ["http://localhost:5173", "http://127.0.0.1:5173"],
        credentials: true,
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Accept", "Authorization"],
    });
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidUnknownValues: false,
        }),
    );
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
}

bootstrap();
