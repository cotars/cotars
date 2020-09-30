import { AbstractLoadBalance } from './abstract.loadbalance';
import { IServiceNode } from '../interfaces/registry.interface';
import * as random from 'random';
export class RandomLoadBalance<
    T extends IServiceNode = IServiceNode
> extends AbstractLoadBalance<T> {
    doSelect(items: T[], metadata?: any): T {
        const length = items.length;
        let totalWeight = 0;
        let sameWeight = true;
        // 下面这个循环有两个作用，第一是计算总权重 totalWeight，
        // 第二是检测每个服务提供者的权重是否相同
        for (let i = 0; i < length; i++) {
            const weight = this.getWeight(items[i], metadata);
            // 累加权重
            totalWeight += weight;
            // 检测当前服务提供者的权重与上一个服务提供者的权重是否相同，
            // 不相同的话，则将 sameWeight 置为 false。
            if (
                sameWeight &&
                i > 0 &&
                weight != this.getWeight(items[i - 1], metadata)
            ) {
                sameWeight = false;
            }
        }
        // 下面的 if 分支主要用于获取随机数，并计算随机数落在哪个区间上
        if (totalWeight > 0 && !sameWeight) {
            // 随机获取一个 [0, totalWeight) 区间内的数字
            let offset = random.int(0, totalWeight);
            for (let i = 0; i < length; i++) {
                // 让随机值 offset 减去权重值
                offset -= this.getWeight(items[i], metadata);
                if (offset < 0) {
                    return items[i];
                }
            }
        }
        // 如果所有服务提供者权重值相同，此时直接随机返回一个即可
        return items[random.int(0, length)];
    }
}
