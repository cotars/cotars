import { extendMetadata } from '../utils/metadata.util';

export const ExtendMetadata = <V = any>(
    metadataKey: string | symbol,
    ...metadataValue: V[]
): ClassDecorator | PropertyDecorator | MethodDecorator => (
    target: object,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
) => {
    if (descriptor) {
        extendMetadata(metadataKey, descriptor.value, ...metadataValue);
        return descriptor;
    } else {
        extendMetadata(metadataKey, target, ...metadataValue);
        return target;
    }
};
