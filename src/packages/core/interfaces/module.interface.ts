import {
    ClassProvider,
    ExistingProvider,
    FactoryProvider,
    ModuleMetadata,
    ValueProvider,
} from '@nestjs/common';

export type ProviderOptions<T> =
    | Pick<ExistingProvider<T>, 'useExisting'>
    | Pick<FactoryProvider<T>, 'inject' | 'useFactory' | 'scope'>
    | Pick<ClassProvider<T>, 'useClass' | 'scope'>
    | Pick<ValueProvider<T>, 'useValue'>;

export type ModuleAsyncOptions<T> = ProviderOptions<T> & Pick<ModuleMetadata, 'imports'>;
export type ModuleOptions<T> = T | ModuleAsyncOptions<T>;
