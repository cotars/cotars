import { ConsulRegistry } from './consul.registry';
import { retry } from '@cotars/core';
import {
    IRegistered,
    IRegisterService,
} from '../interfaces/registry.interface';

export class ConsulRegistered implements IRegistered {
    constructor(
        readonly node: IRegisterService,
        readonly registry: ConsulRegistry,
    ) {}
    health(): Promise<unknown> {
        this.registry.logger.debug(
            `health:${this.node.name}(${this.node.address}:${this.node.port}), id:${this.node.id}`,
        );
        return retry(
            this.registry.consul.instance.agent.check.pass.bind(
                this,
                `service:${this.node.id}`,
            ),
        );
    }
    deregister(): Promise<unknown> {
        this.registry.logger.debug(
            `deregister:${this.node.name}(${this.node.address}:${this.node.port}), id:${this.node.id}`,
        );
        return retry(
            this.registry.consul.instance.agent.service.deregister.bind(
                this,
                this.node.id,
            ),
        );
    }
}
