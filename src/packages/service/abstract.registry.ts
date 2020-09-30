import { IRegistered, IRegistry, IServiceNode } from './interfaces/registry.interface';
import { Logger } from '@nestjs/common';

export abstract class AbstractRegistry implements IRegistry {
    public logger: Logger = new Logger('Registry');
    protected readonly watchs: Map<string, Set<Function>> = new Map();
    private readonly serviceNodes: Map<
        string,
        Map<string, IServiceNode>
    > = new Map();

    public watch(service: string, callback: (nodes: IServiceNode) => void) {
        const callbacks = this.watchs.get(service);
        if (!callbacks) {
            this.watchs.set(service, new Set());
        } else {
            callbacks.add(callback);
        }
        return () => this.watchs.get(service).delete(callback);
    }

    public services(): string[] {
        return [...this.serviceNodes.keys()];
    }

    public nodes(service?: string): IServiceNode[] {
        if (service) {
            if (this.serviceNodes.has(service)) {
                return [...this.serviceNodes.get(service)?.values()];
            } else {
                return [];
            }
        }
        const servicesNodes = [...this.serviceNodes.values()];
        return servicesNodes.map((v) => [...v?.values()]).flat();
    }

    protected setNodes(service: string, nodes: IServiceNode[]) {
        const nodeMap = new Map<string, IServiceNode>();
        const lastNodes = this.serviceNodes.get(service);
        this.serviceNodes.delete(service);
        for (const node of nodes) {
            const lastNode = lastNodes?.get(node.id) || node;
            if (lastNodes?.has(node.id)) {
                Object.assign(lastNode, node);
            }
            nodeMap.set(lastNode.id, lastNode);
        }
        this.serviceNodes.set(service, nodeMap);
        if (this.watchs.has(service)) {
            const callbacks = this.watchs.get(service);
            callbacks.forEach((cb) => cb(this.nodes(service)));
        }
    }

    abstract register(node: IServiceNode): Promise<IRegistered>;
}
