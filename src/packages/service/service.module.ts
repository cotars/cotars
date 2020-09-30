import { REGISTRY_PROVIDER } from './constants';
import { NodeService } from './node.service';
import { ConsulRegistry } from './registry-consul/consul.registry';
import {
    DynamicModule,
    Global,
    Module,
    Provider
    } from '@nestjs/common';

@Global()
@Module({
    providers: [NodeService],
    exports: [NodeService]
})
export class ServiceModule {
    static forRoot(): DynamicModule {
        const provider: Provider = {
            provide: REGISTRY_PROVIDER,
            useClass: ConsulRegistry,
        };
        return {
            module: ServiceModule,
            providers: [provider],
            exports: [provider]
        }
    }
}