import { IServiceNode } from './registry.interface';

export interface ILoadBalance<T extends IServiceNode> {
    select(items: T[]): T;
}
