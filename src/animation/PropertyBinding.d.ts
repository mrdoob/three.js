export interface ParseTrackNameResults {
    nodeName: string;
    objectName: string;
    objectIndex: string;
    propertyName: string;
    propertyIndex: string;
}

export class PropertyBinding {
    constructor(rootNode: any, path: string, parsedPath?: any);

    path: string;
    parsedPath: any;
    node: any;
    rootNode: any;

    getValue(targetArray: any, offset: number): any;
    setValue(sourceArray: any, offset: number): void;
    bind(): void;
    unbind(): void;

    BindingType: { [bindingType: string]: number };
    Versioning: { [versioning: string]: number };

    GetterByBindingType: Array<() => void>;
    SetterByBindingTypeAndVersioning: Array<Array<() => void>>;

    static create(root: any, path: any, parsedPath?: any): PropertyBinding | PropertyBinding.Composite;
    static sanitizeNodeName(name: string): string;
    static parseTrackName(trackName: string): ParseTrackNameResults;
    static findNode(root: any, nodeName: string): any;
}

export namespace PropertyBinding {
    class Composite {
        constructor(targetGroup: any, path: any, parsedPath?: any);

        getValue(array: any, offset: number): any;
        setValue(array: any, offset: number): void;
        bind(): void;
        unbind(): void;
    }
}
