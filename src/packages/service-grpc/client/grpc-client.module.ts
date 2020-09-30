import { GRPCClient } from './grpc-client';
import { REGISTRY_PROVIDER } from '../../service/constants';
import { IRegistry } from '../../service/interfaces/registry.interface';
import { IGRPCServiceOptions } from '../interfaces/grpc.options';
import { ModuleAsyncOptions } from '@cotars/common';
import { SERVICE_CLIENT, SERVICE_CLIENT_OPTIONS } from '@cotars/core';
import { DynamicModule, Provider } from '@nestjs/common';

export class GRPCClientModule {
    static forRoot(
        options: IGRPCServiceOptions,
        service?: string,
    ): DynamicModule {
        return this.forRootAsync({ useValue: options }, service);
    }

    static forRootAsync(
        options: ModuleAsyncOptions<IGRPCServiceOptions>,
        service?: string,
    ): DynamicModule {
        service = service || 'default';
        const { imports, ...provider } = options;
        const clientProvider = this.createClientProvider(service);
        return {
            imports: options.imports || [],
            module: GRPCClientModule,
            providers: [
                { provide: SERVICE_CLIENT_OPTIONS(service), ...provider },
                clientProvider,
            ],
            exports: [clientProvider],
        };
    }

    protected static createClientProvider(service: string): Provider {
        return {
            provide: SERVICE_CLIENT(service),
            useFactory: (options: IGRPCServiceOptions, registry: IRegistry) => {
                return new GRPCClient(service, options, registry);
            },
            inject: [SERVICE_CLIENT_OPTIONS(service), REGISTRY_PROVIDER],
        };
    }
}
