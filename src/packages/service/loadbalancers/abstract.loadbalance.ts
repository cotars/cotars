import { ILoadBalance } from '../interfaces/load-balance.interface';
import { IServiceNode } from '../interfaces/registry.interface';

export abstract class AbstractLoadBalance<T extends IServiceNode> implements ILoadBalance<T> {
    select(items: T[], metadata?: any): T {
        if (!items || !items.length) {
            return null;
        }
        if (items.length == 1) {
            return items[0];
        }
        return this.doSelect(items);
    }

    abstract doSelect(items: T[], metadata?: any): T;

    protected getWeight(item: T & {}, metadata?: any): number {
        return item['#LOADBALANCE_WEIGHT'] || 1;
    }
}
