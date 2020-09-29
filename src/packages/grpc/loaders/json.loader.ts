import { Loader } from './loader';
import * as PB from 'protobufjs';

export class JSONLoader extends Loader {
    public readonly root: PB.Root;
    constructor(json: PB.INamespace) {
        super();
        this.root = PB.Root.fromJSON(json);
        this.root.resolveAll();
    }
}