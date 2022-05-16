import {
    Material,
    LoadingManager,
    Mapping,
    Loader,
    BufferGeometry,
    Side,
    Texture,
    Vector2,
    Wrapping,
} from '../../../src/Three';

export interface MaterialCreatorOptions {
    /**
     * side: Which side to apply the material
     * THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
     */
    side?: Side | undefined;
    /*
     * wrap: What type of wrapping to apply for textures
     * THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
     */
    wrap?: Wrapping | undefined;
    /*
     * normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
     * Default: false, assumed to be already normalized
     */
    normalizeRGB?: boolean | undefined;
    /*
     * ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
     * Default: false
     */
    ignoreZeroRGBs?: boolean | undefined;
    /*
     * invertTrProperty: Use values 1 of Tr field for fully opaque. This option is useful for obj
     * exported from 3ds MAX, vcglib or meshlab.
     * Default: false
     */
    invertTrProperty?: boolean | undefined;
}

export class MTLLoader extends Loader {
    constructor(manager?: LoadingManager);
    materialOptions: MaterialCreatorOptions;

    load(
        url: string,
        onLoad: (materialCreator: MTLLoader.MaterialCreator) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void,
    ): void;
    parse(text: string, path: string): MTLLoader.MaterialCreator;
    setMaterialOptions(value: MaterialCreatorOptions): void;

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<MTLLoader.MaterialCreator>;
}

export interface MaterialInfo {
    ks?: number[] | undefined;
    kd?: number[] | undefined;
    ke?: number[] | undefined;
    map_kd?: string | undefined;
    map_ks?: string | undefined;
    map_ke?: string | undefined;
    norm?: string | undefined;
    map_bump?: string | undefined;
    bump?: string | undefined;
    map_d?: string | undefined;
    ns?: number | undefined;
    d?: number | undefined;
    tr?: number | undefined;
}

export interface TexParams {
    scale: Vector2;
    offset: Vector2;
    url: string;
}

export namespace MTLLoader {
    class MaterialCreator {
        constructor(baseUrl?: string, options?: MaterialCreatorOptions);

        baseUrl: string;
        options: MaterialCreatorOptions;
        materialsInfo: { [key: string]: MaterialInfo };
        materials: { [key: string]: Material };
        private materialsArray: Material[];
        nameLookup: { [key: string]: number };
        side: Side;
        wrap: Wrapping;
        crossOrigin: string;

        setCrossOrigin(value: string): this;
        setManager(value: LoadingManager): void;
        setMaterials(materialsInfo: { [key: string]: MaterialInfo }): void;
        convert(materialsInfo: { [key: string]: MaterialInfo }): { [key: string]: MaterialInfo };
        preload(): void;
        getIndex(materialName: string): number;
        getAsArray(): Material[];
        create(materialName: string): Material;
        createMaterial_(materialName: string): Material;
        getTextureParams(value: string, matParams: any): TexParams;
        loadTexture(
            url: string,
            mapping?: Mapping,
            onLoad?: (bufferGeometry: BufferGeometry) => void,
            onProgress?: (event: ProgressEvent) => void,
            onError?: (event: ErrorEvent) => void,
        ): Texture;
    }
}
