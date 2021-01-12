export class MeshReceiver {
    constructor(materialHandler: any);
    logging: {
        enabled: boolean;
        debug: boolean;
    };
    callbacks: {
        onProgress: any;
        onMeshAlter: any;
    };
    materialHandler: any;
    setLogging(enabled: boolean, debug: boolean): void;
    private _setCallbacks;
    buildMeshes(meshPayload: any): Mesh[];
}
export class LoadedMeshUserOverride {
    constructor(disregardMesh: any, alteredMesh: any);
    disregardMesh: boolean;
    alteredMesh: boolean;
    meshes: any[];
    addMesh(mesh: Mesh): void;
    isDisregardMesh(): boolean;
    providesAlteredMeshes(): boolean;
}
import { Mesh } from "../../../../../build/three.module.js";
