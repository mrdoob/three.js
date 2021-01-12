export class MaterialHandler {
    logging: {
        enabled: boolean;
        debug: boolean;
    };
    callbacks: {
        onLoadMaterials: any;
    };
    materials: {};
    setLogging(enabled: boolean, debug: boolean): void;
    _setCallbacks(onLoadMaterials: any): void;
    createDefaultMaterials(overrideExisting: any): void;
    addPayloadMaterials(materialPayload: any): any;
    addMaterials(materials: any, overrideExisting: any, newMaterials: any): any;
    getMaterials(): any;
    getMaterial(materialName: string): any;
    getMaterialsJSON(): any;
    clearMaterials(): void;
}
