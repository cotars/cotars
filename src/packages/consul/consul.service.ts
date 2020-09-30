import { InjectConsul } from './decorators/inject-consul.decorator';
import * as Consul from 'consul';
import {
    Injectable,
    Logger,
    OnApplicationShutdown,
    OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class ConsulService implements OnApplicationShutdown, OnModuleInit {
    protected watchs: Set<Consul.Watch> = new Set();
    protected logger = new Logger('Consul');

    constructor(@InjectConsul() readonly instance: Consul.Consul) {}

    async onModuleInit() {}

    async onApplicationShutdown() {
        this.watchs.forEach((w) => w.end());
    }

    watch<T = unknown>(
        options: Consul.Watch.Options,
        change: (response: T) => unknown,
        err?: (e: Error) => unknown,
    ): () => void {
        const watch = this.instance.watch(options);
        watch.on('change', response => change(response));
        if (err) {
            watch.on('error', err);
        }  else {
            watch.on('error', (err: Error) => {
                this.logger.error(err.message, err.stack);
            });
        }
        return () => {
            watch.end();
            this.watchs.delete(watch);
        };
    }
}
