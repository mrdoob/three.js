import { Loader, LoadingManager, Group, Material } from '../../../src/Three';

export class LDrawLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        onLoad: (data: Group) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Group>;
    setFileMap(fileMap: Record<string, string>): void;
    setMaterials(materials: Material[]): void;

    parse(text: string, path: string, onLoad: (data: Group) => void): void;

    addMaterial(material: Material): void;
    getMaterial(colourCode: string): Material | null;
}
