import { ClientStan } from './client-stan';
import { STAN_CONNECTION_NAME, STAN_CONNECTION_TOKEN, STAN_PROVIDER_OPTIONS } from './constants';
import { StanProviderOptions } from './interfaces';
import { createAsyncOptionsProvider, DiscoveryModule, ModuleAsyncOptions } from '@cotars/core';
import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';

@Module({
    imports: [DiscoveryModule],
    providers: [],
})
export class StanModule implements OnModuleInit {
    constructor(protected readonly connection: ClientStan) {}

    static forRoot(options: StanProviderOptions, name?: string): DynamicModule {
        return this.register({ useValue: options }, name);
    }

    static forRootAsync(
        options: ModuleAsyncOptions<StanProviderOptions>,
        name?: string,
    ): DynamicModule {
        return this.register(options, name);
    }

    protected static register(
        options: ModuleAsyncOptions<StanProviderOptions>,
        name?: string,
    ): DynamicModule {
        const optionsProvider = createAsyncOptionsProvider(
            STAN_PROVIDER_OPTIONS,
            options,
        );
        const connectionToken = STAN_CONNECTION_TOKEN(name);
        return {
            module: StanModule,
            imports: options.imports || [],
            providers: [
                { provide: STAN_CONNECTION_NAME, useFactory: () => name },
                ClientStan,
                optionsProvider,
                {
                    provide: connectionToken,
                    useExisting: ClientStan,
                },
            ],
            exports: [ClientStan, STAN_CONNECTION_NAME, connectionToken],
        };
    }

    async onModuleInit() {
        await this.connection.connect();
    }
}
