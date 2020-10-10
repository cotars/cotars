import { ConsulRegistered } from './consul.registered';
import { AbstractRegistry } from '../abstract.registry';
import { CheckStatus } from '../enums';
import { IRegistered, IRegisterService, IServiceNode } from '../interfaces/registry.interface';
import { retry } from '@cotars/core';
import { Injectable, OnModuleInit } from '@nestjs/common';
import {
    ConsulService,
    ICatalogServicesResponse,
    ICheck,
    IHealthServiceResponse,
    Status,
} from '@cotars/consul';

@Injectable()
export class ConsulRegistry extends AbstractRegistry implements OnModuleInit {
    protected watchedService: Set<string> = new Set();
    constructor(readonly consul: ConsulService) {
        super();
    }

    async register(node: IRegisterService): Promise<IRegistered> {
        const check = {
            ttl: `${node.ttl || 300}s`,
            deregistercriticalserviceafter: `${node.timeout || 600}s`,
            status: 'passing',
        };
        await retry(
            this.consul.instance.agent.service.register.bind(this, {
                ...node,
                check,
            }),
            { err: (e) => this.logger.error(e.message, e.stack) },
        );
        this.logger.debug(`register:${node.name}(${node.address}:${node.port}), id:${node.id}`);
        return new ConsulRegistered(node, this);
    }

    async onModuleInit() {
        await this.init();
        this.logger.debug('registry realy');
    }

    protected async init() {
        const services = await retry<ICatalogServicesResponse>(
            this.consul.instance.catalog.service.list.bind(this),
            { err: (e) => this.logger.error(e.message, e.stack) },
        );
        this.consul.watch(
            {
                method: this.consul.instance.catalog.service.list,
            },
            this.handleServices.bind(this),
        );
        return this.handleServices(services);
    }

    protected handleServices(response: ICatalogServicesResponse) {
        const services = Object.keys(response).filter((v) => v != 'consul');
        return Promise.all(
            services.map((service) => this.handleService(service)),
        );
    }

    protected async handleService(service: string) {
        const options: Object = { service };
        const response = await retry<IHealthServiceResponse>(
            this.consul.instance.health.service.bind(this, options),
            { err: (e) => this.logger.error(e.message, e.stack) },
        );
        if (!this.watchedService.has(service)) {
            this.consul.watch(
                {
                    method: this.consul.instance.health.service,
                    options,
                },
                this.handleNodes.bind(this, service),
            );
            this.watchedService.add(service);
        }
        return this.handleNodes(service, response);
    }

    protected handleNodes(service: string, response: IHealthServiceResponse) {
        const getStatus = (checks: ICheck[]): CheckStatus => {
            if (
                !checks ||
                !checks.length ||
                checks.some((v) => v.Status == Status.Critical)
            ) {
                return CheckStatus.CRITICAL;
            }
            if (checks.some((v) => v.Status == Status.Warning)) {
                return CheckStatus.WARNING;
            }
            return CheckStatus.PASSING;
        };
        const nodes = response.map<IServiceNode>((node) => ({
            id: node.Node.ID,
            name: node.Node.Node,
            service: node.Service.Service,
            address: node.Service.Address,
            port: node.Service.Port,
            status: getStatus(node.Checks),
        }));
        this.setNodes(service, nodes);
    }
}
