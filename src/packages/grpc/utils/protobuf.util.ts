import * as PB from 'protobufjs';

export function isHandledReflectionObject(
    obj: PB.ReflectionObject,
): obj is PB.Service | PB.Type | PB.Enum {
    return (
        obj instanceof PB.Service ||
        obj instanceof PB.Type ||
        obj instanceof PB.Enum
    );
}

export function isNamespaceBase(
    obj: PB.ReflectionObject,
): obj is PB.NamespaceBase {
    return obj instanceof PB.Namespace || obj instanceof PB.Root;
}

export function getAllHandledReflectionObjects(
    obj: PB.ReflectionObject,
    parentName: string,
): Array<{ path: string; obj: PB.Service | PB.Type | PB.Enum }> {
    const ns = parentName ? parentName + '.' : '';
    const objects = [];
    const path = `${ns}${obj.name}`;
    if (isHandledReflectionObject(obj)) {
        return [{ path, obj }];
    } else if (isNamespaceBase(obj) && typeof obj.nested !== 'undefined') {
        return Object.keys(obj.nested!)
            .map((name) => {
                return getAllHandledReflectionObjects(obj.nested![name], path);
            })
            .flat();
    }
    return objects;
}
