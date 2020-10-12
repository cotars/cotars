import { REGISTRY_PROVIDER } from './constants';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as ip from 'ip';
import { v4 } from 'uuid';
import {
    IRegistered,
    IRegistry,
    IServiceNode,
} from './interfaces/registry.interface';

@Injectable()
export class NodeService
    implements OnApplicationBootstrap, OnApplicationBootstrap {
    protected registereds: Map<IRegistered, NodeJS.Timer> = new Map;
    constructor(
        @Inject(REGISTRY_PROVIDER) protected readonly registry: IRegistry,
    ) {}

    onApplicationBootstrap() {}

    async register(node: Partial<IServiceNode>) {
        if (!node.name) {
            throw new Error('service name is Empty!');
        }
        const address = node.address || ip.address();
        let host = ip.fromLong(ip.toLong(address));
        if (ip.isPrivate(host) || host == '0.0.0.0') {
            host = ip.address();
        }
        if (!node.port) {
            throw new Error('service name is Empty!');
        }
        const id = node.id || v4();
        const registered = await this.registry.register({
            ...node,
            address,
            id,
            ttl: 180,
        });
        this.registereds.set(
            registered,
            setInterval(registered.health.bind(registered), 180000),
        );
    }

    onApplicationShutdown() {
        [...this.registereds.values()].forEach((v) => clearInterval(v));
        return Promise.all(
            [...this.registereds.keys()].map((v) => v.deregister()),
        );
    }
}
