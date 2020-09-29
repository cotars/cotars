import { PackageDefinition } from './types.interface';
import * as PB from 'protobufjs';
export interface ILoader {
    getDefinition(): { root: PB.Root; definition: PackageDefinition };
}
