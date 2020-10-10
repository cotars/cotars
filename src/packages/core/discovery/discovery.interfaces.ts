import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
export type MetaKey = string | number | symbol;
export type Filter<T> = (item: T) => boolean;
export type FilterModule = Filter<Module>;
export type FilterClass = Filter<InstanceWrapper>;
export type DiscoveredComponent<T = any> = {
    wrapper: InstanceWrapper;
    metadata: T;
};

export interface MethodMetedataExplored<T = any> {
    targetCallback: any;
    method: string;
    metedata: T;
}

export interface DiscoveredMethod<T = any> extends MethodMetedataExplored<T> {
    wrapper: InstanceWrapper;
}

