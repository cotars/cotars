import { GRPC_NODE_SERVICE_OPTIONS, GRPC_NODE_SERVICES } from './constants';
import { GRPCNodeOptions } from './interfaces/grpc.options';
import { NodeService } from '@cotars/service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GRPCNodeService {
    constructor(
        @Inject(GRPC_NODE_SERVICE_OPTIONS) readonly options: GRPCNodeOptions,
        @Inject(GRPC_NODE_SERVICES) services: GRPCNodeService[],
        protected readonly node: NodeService
    ) {
        services.push(this);
    }

    callback(port: number) {
        this.node.register({
            name: this.options.name,
            port,
        });
    }
}
