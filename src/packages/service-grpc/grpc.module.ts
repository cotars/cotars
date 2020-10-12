import { GRPC_NODE_SERVICE_OPTIONS, GRPC_NODE_SERVICES } from './constants';
import { GRPCNodeService } from './grpc-node.service';
import { GRPCNodeOptions } from './interfaces/grpc.options';
import { ModuleAsyncOptions } from '@cotars/core';
import { DynamicModule, Module } from '@nestjs/common';

const GRPCNodes: GRPCNodeService[] = [];

@Module({
    imports: [],
    providers: [
        {
            provide: GRPC_NODE_SERVICES,
            useValue: GRPCNodes,
        },
    ],
    exports: [GRPC_NODE_SERVICES],
})
export class GRPCModule {
    static forRoot(options?: GRPCNodeOptions): DynamicModule {
        return this.register({ useValue: options });
    }

    protected static register(
        options: ModuleAsyncOptions<GRPCNodeOptions>,
    ): DynamicModule {
        const { imports, ...provider } = options;
        return {
            module: GRPCModule,
            imports: options.imports || [],
            providers: [
                { provide: GRPC_NODE_SERVICE_OPTIONS, ...provider },
                GRPCNodeService,
            ],
            exports: [],
        };
    }

    static forRootAsync(
        options: ModuleAsyncOptions<GRPCNodeOptions>,
    ): DynamicModule {
        return this.register(options);
    }
}
