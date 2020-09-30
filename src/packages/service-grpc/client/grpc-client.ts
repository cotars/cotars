import { IGRPCServiceOptions } from '../interfaces/grpc.options';
import { ClientGrpc } from '@cotars/grpc';
import { CheckStatus, IRegistry, IServiceNode } from '@cotars/service';

export class GRPCClient {
    protected proxys: Map<string, ClientGrpc> = new Map();

    constructor(
        protected readonly service: string,
        protected readonly options: IGRPCServiceOptions,
        protected readonly registry: IRegistry,
    ) {}

    get<T extends Object>(provider: string): T {
        const node = this.options.loadBalance.select(
            this.registry
                .nodes(this.service)
                .filter((v) => v.status != CheckStatus.CRITICAL),
        );
        if (!node) {
            throw new Error('service not registed!');
        }
        if (!this.proxys.has(node.id)) {
            this.proxys.set(node.id, this.createGRPCProxy(node));
        }
        return this.proxys.get(node.id).getService(provider);
    }

    protected createGRPCProxy(node: IServiceNode) {
        const url = `${node.address}:${node.port}`;
        return new ClientGrpc({
            package: this.service,
            ...this.options,
            url,
        });
    }
}
