import { CONSUL_OPTIONS_PROVIDER, CONSUL_PROVIDER } from './constants';
import { ConsulService } from './consul.service';
import { ModuleAsyncOptions } from '@cotars/core';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import * as Consul from 'consul';
@Module({
    imports: [DiscoveryModule],
    providers: [ConsulService],
    exports: [ConsulService],
})
export class ConsulModule {
    static forRoot(options: Consul.ConsulOptions): DynamicModule {
        return this.register({ useValue: options });
    }

    static forRootAsync(
        async: ModuleAsyncOptions<Consul.ConsulOptions>,
    ): DynamicModule {
        return this.register(async);
    }

    private static register(
        options: ModuleAsyncOptions<Consul.ConsulOptions>,
    ): DynamicModule {
        const { imports, ...provider } = options;
        const consulProvider = this.createConsulProvider();
        return {
            global: true,
            imports: options.imports || [],
            module: ConsulModule,
            providers: [
                { provide: CONSUL_OPTIONS_PROVIDER, ...provider },
                consulProvider,
            ],
            exports: [consulProvider],
        };
    }

    private static createConsulProvider(): Provider {
        return {
            provide: CONSUL_PROVIDER,
            useFactory: (options: Consul.ConsulOptions) => {
                return new Consul({ ...options, promisify: true });
            },
            inject: [CONSUL_OPTIONS_PROVIDER],
        };
    }
}
