import { AppModule } from './app.module';
import { protoJSON } from './grpc-test';
import { GRPC_NODE_SERVICES } from './packages/service-grpc/constants';
import { GRPCNodeService } from './packages/service-grpc/grpc-node.service';
import { ClientGrpc, JSONLoader, ServerGRPC } from '@cotars/grpc';
import { NestFactory } from '@nestjs/core';
import { CustomStrategy } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableShutdownHooks();
    const grpcServices = app.get<GRPCNodeService[]>(GRPC_NODE_SERVICES);

    app.connectMicroservice<CustomStrategy>({
        strategy: new ServerGRPC({
            packages: grpcServices.map(v => v.options),
            bindCallback: (port) => {
                grpcServices.forEach(v => v.callback(port));
            }
        })
    })
    await app.startAllMicroservicesAsync();
}

bootstrap();
