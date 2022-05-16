import { BufferGeometry, Loader, LoadingManager } from '../../../src/Three';

export interface PDB {
    geometryAtoms: BufferGeometry;
    geometryBonds: BufferGeometry;
    json: {
        atoms: any[][];
    };
}

export class PDBLoader extends Loader {
    constructor(manager?: LoadingManager);

    load(
        url: string,
        onLoad: (pdb: PDB) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<PDB>;
    parse(text: string): PDB;
}
