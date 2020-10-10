import { ModuleAsyncOptions } from '../interfaces/module.interface';
import { Provider, Type } from '@nestjs/common';

export function createAsyncOptionsProvider<T>(
    provide: string | symbol | Type<any>,
    options: ModuleAsyncOptions<T>,
): Provider {
    const { imports, ...provider } = options;
    return { provide, ...provider };
}
