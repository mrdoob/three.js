import {
    WebGLRenderer,
    WebGLRenderTarget,
    Texture,
    DataTexture,
    Material,
    ShaderMaterial,
    Wrapping,
    TextureFilter,
    TextureDataType,
    IUniform,
} from '../../../src/Three';

export interface Variable {
    name: string;
    initialValueTexture: Texture;
    material: ShaderMaterial;
    dependencies: Variable[];
    renderTargets: WebGLRenderTarget[];
    wrapS: number;
    wrapT: number;
    minFilter: number;
    magFilter: number;
}

export class GPUComputationRenderer {
    constructor(sizeX: number, sizeY: number, renderer: WebGLRenderer);

    setDataType(type: TextureDataType): void;

    addVariable(variableName: string, computeFragmentShader: string, initialValueTexture: Texture): Variable;
    setVariableDependencies(variable: Variable, dependencies: Variable[] | null): void;

    init(): string | null;
    compute(): void;

    getCurrentRenderTarget(variable: Variable): WebGLRenderTarget;
    getAlternateRenderTarget(variable: Variable): WebGLRenderTarget;
    addResolutionDefine(materialShader: ShaderMaterial): void;
    createShaderMaterial(computeFragmentShader: string, uniforms?: { [uniform: string]: IUniform }): ShaderMaterial;
    createRenderTarget(
        sizeXTexture: number,
        sizeYTexture: number,
        wrapS: Wrapping,
        wrapT: number,
        minFilter: TextureFilter,
        magFilter: TextureFilter,
    ): WebGLRenderTarget;
    createTexture(): DataTexture;
    renderTexture(input: Texture, output: Texture): void;
    doRenderTarget(material: Material, output: WebGLRenderTarget): void;
}
