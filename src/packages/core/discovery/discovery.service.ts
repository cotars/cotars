import { flatten, Injectable } from '@nestjs/common';
import { Controller } from '@nestjs/common/interfaces';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import {
    DiscoveredComponent,
    DiscoveredMethod,
    FilterModule,
    MetaKey,
    MethodMetedataExplored,
} from './discovery.interfaces';

@Injectable()
export class DiscoveryService {
    constructor(
        protected readonly modulesContainer: ModulesContainer,
        protected readonly metadataScanner: MetadataScanner,
    ) {}

    getComponentMetadata<T>(
        key: MetaKey,
        component: InstanceWrapper,
    ): T | undefined {
        const dependencyMeta = Reflect.getMetadata(
            key,
            component.instance?.constructor,
        ) as T;
        if (dependencyMeta) {
            return dependencyMeta;
        }
        if (component.metatype != null) {
            return Reflect.getMetadata(key, component.metatype) as T;
        }
    }

    scanMetadata<T>(metaKey: MetaKey, instance: object, prototype?: object) {
        const instancePrototype = isUndefined(prototype)
            ? Object.getPrototypeOf(instance)
            : prototype;
        return this.metadataScanner.scanFromPrototype<
            Controller,
            MethodMetedataExplored<T>
        >(instance, instancePrototype, (method) =>
            this.exploreMethodMetadata<T>(metaKey, instancePrototype, method),
        );
    }

    protected exploreMethodMetadata<T>(
        metaKey: MetaKey,
        prototype: object,
        method: string,
    ): MethodMetedataExplored {
        const targetCallback = prototype[method];
        const metedata: T = Reflect.getMetadata(metaKey, targetCallback);
        return isUndefined(metedata)
            ? null
            : { targetCallback, method, metedata };
    }

    getMethodsWithMetadata<T>(
        metaKey: MetaKey,
        wrappers: InstanceWrapper[],
    ): DiscoveredMethod<T>[] {
        const methods: DiscoveredMethod[][] = wrappers.map((wrapper) =>
            this.scanMetadata<T>(
                metaKey,
                wrapper.instance,
            ).map((expolered) => ({ ...expolered, wrapper })),
        );
        return flatten(methods);
    }

    getControllerMethodsWithMetadata<T = any>(
        metaKey: MetaKey,
        filter?: FilterModule,
    ): DiscoveredMethod<T>[] {
        return this.getMethodsWithMetadata<T>(
            metaKey,
            this.getControllers(filter),
        );
    }

    getProviderMethodsWithMetadata<T = any>(
        metaKey: MetaKey,
        filter?: FilterModule,
    ): DiscoveredMethod<T>[] {
        return this.getMethodsWithMetadata<T>(
            metaKey,
            this.getProviders(filter),
        );
    }

    getComponentMethodsWithMetadata<T = any>(
        metaKey: MetaKey,
        filter?: FilterModule,
    ): DiscoveredMethod<T>[] {
        return this.getMethodsWithMetadata<T>(
            metaKey,
            this.getComponents(filter),
        );
    }

    protected toDiscoveredComponents<T>(
        metaKey: MetaKey,
        wrappers: InstanceWrapper[],
    ): DiscoveredComponent<T>[] {
        return wrappers.map((v) => ({
            metadata: this.getComponentMetadata(metaKey, v),
            wrapper: v,
        }));
    }

    getComponentsWithMetadata<T = any>(
        metaKey: MetaKey,
        filter?: FilterModule,
    ): DiscoveredComponent<T>[] {
        const components = this.getComponents(filter);
        return this.toDiscoveredComponents<T>(metaKey, components);
    }

    getProvidersWithMetadata<T = any>(
        metaKey: MetaKey,
        filter?: FilterModule,
    ): DiscoveredComponent<T>[] {
        const providers = this.getProviders(filter);
        return this.toDiscoveredComponents<T>(metaKey, providers);
    }

    getControllersWithMetadata<T = any>(
        metaKey: MetaKey,
        filter?: FilterModule,
    ): DiscoveredComponent<T>[] {
        const controllers = this.getControllers(filter);
        return this.toDiscoveredComponents<T>(metaKey, controllers);
    }

    getComponents(filter?: FilterModule): InstanceWrapper[] {
        const providers = this.getModules(filter).map((item) => [
            ...item.controllers.values(),
            ...item.providers.values(),
        ]);
        return flatten(providers);
    }

    getProviders(filter?: FilterModule): InstanceWrapper[] {
        const providers = this.getModules(filter).map((item) => [
            ...item.providers.values(),
        ]);
        return flatten(providers);
    }

    getControllers(filter?: FilterModule): InstanceWrapper[] {
        const controllers = this.getModules(filter).map((item) => [
            ...item.controllers.values(),
        ]);
        return flatten(controllers);
    }

    protected getModules(filter?: FilterModule): Module[] {
        const moduleRefs = [...this.modulesContainer.values()];
        if (filter) {
            return moduleRefs.filter(filter);
        }
        return moduleRefs;
    }
}
