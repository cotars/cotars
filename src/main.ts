import { AppModule } from './app.module';
import { protoJSON } from './grpc-test';
import { ClientGrpc, JSONLoader, ServerGRPC } from '@cotars/grpc';
import { NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableShutdownHooks();
    app.init();
    app.connectMicroservice<CustomStrategy>({
        strategy: new ServerGRPC({
            package: 'com.cotars.accounts',
            loader: new JSONLoader(protoJSON)
        })
    })

    const client = new ClientGrpc({
        package: ['com.cotars.accounts', 'com.cotars.users'],
        loader: new JSONLoader(protoJSON)
    })
    await client.connect();
    client.getService('com.cotars.users.Test')
    await app.startAllMicroservicesAsync();
}

bootstrap();
