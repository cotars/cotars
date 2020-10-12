import { protoJSON } from './grpc-test';
import { TestStanSubscriber } from './test-stan-subscriber';
import { TestController } from './test.controller';
import { ConsulModule } from '@cotars/consul';
import { JSONLoader } from '@cotars/grpc';
import { ServiceModule } from '@cotars/service';
import { GRPCModule } from '@cotars/service-grpc/grpc.module';
import { StanModule } from '@cotars/stan';
import { Module } from '@nestjs/common';
import { v4 } from 'uuid';

@Module({
    imports: [
        ConsulModule.forRoot({ host: '127.0.0.1', port: '8500' }),
        ServiceModule.forRoot(),
        GRPCModule.forRoot({
            name: 'abc.dd.ee',
            loader: new JSONLoader(protoJSON),
        }),
        GRPCModule.forRoot({
            name: 'abc.dd.eefff',
            loader: new JSONLoader(protoJSON),
        }),
        StanModule.forRoot({
            clientID: v4(),
            clusterID: 'nats1',
            stanOptions: { url: 'http://127.0.0.1:4223'},
        }),
        // StanModule.forRoot(
        //     {
        //         clientID: v4(),
        //         clusterID: 'nats1',
        //         options: { url: 'http://127.0.0.1:4223' },
        //     },
        //     'bbbb',
        // ),
        // StanModule.forPublisher(['aa.bb.cc'])
    ],
    controllers: [TestController, TestStanSubscriber],
    providers: []
})
export class AppModule {}
