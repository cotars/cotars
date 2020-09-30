import { CONSUL_WATCH_KV } from '../constants';
import { ExtendMetadata } from '@cotars/common';
import { applyDecorators } from '@nestjs/common';
export function WatchKV<T extends object = any>(key: string, defaults?: T): PropertyDecorator {
    return applyDecorators(ExtendMetadata(CONSUL_WATCH_KV, { key, defaults }));
}
