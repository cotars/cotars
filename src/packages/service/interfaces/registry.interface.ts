import { CheckStatus } from '../enums';

export interface IRegistry {
    register(node: IRegisterService): Promise<IRegistered>;
    services(): string[];
    nodes(service?: string): IServiceNode[];
}

export interface IRegisterService extends IServiceNode {
    ttl: number;
    timeout?: number;
}

export interface IRegistered {
    readonly node: IRegisterService
    readonly registry: IRegistry;
    health(): Promise<unknown>;
    deregister(): Promise<unknown>;
}

export interface IServiceNode {
    readonly id?: string;
    readonly name?: string;
    readonly address?: string;
    readonly port?: number;
    readonly tags?: string[];
    readonly metadata?: { [index: string]: string };
    readonly status?: CheckStatus;
}

