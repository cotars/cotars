export function extendMetadata<T extends any>(
    key: string | symbol,
    target: Object,
    ...metadata: T[]
) {
    const previousValue = Reflect.getMetadata(key, target) || [];
    const value = [...previousValue, ...metadata];
    Reflect.defineMetadata(key, value, target);
}
