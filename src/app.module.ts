import { protoJSON } from './grpc-test';
import { TestController } from './test.controller';
import { ConsulModule } from '@cotars/consul';
import { JSONLoader } from '@cotars/grpc';
import { ServiceModule } from '@cotars/service';
import { GRPCModule } from '@cotars/service-grpc/grpc.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        ConsulModule.forRoot({ host: '127.0.0.1', port: '8500' }),
        ServiceModule.forRoot(),
        GRPCModule.forRoot({
            name: 'abc.dd.ee',
            loader: new JSONLoader(protoJSON)
        }),
        GRPCModule.forRoot({
            name: 'abc.dd.eefff',
            loader: new JSONLoader(protoJSON)
        })
    ],
    controllers: [TestController],
})
export class AppModule {}
