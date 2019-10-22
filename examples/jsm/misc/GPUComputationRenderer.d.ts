import {
	WebGLRenderer,
	RenderTarget,
	Texture,
	DataTexture,
	Material,
	ShaderMaterial,
	Wrapping,
	TextureFilter

} from '../../../src/Three';

export interface Variable {
	name: string;
	initialValueTexture: Texture;
	material: Material;
	dependencies: Variable[];
	renderTargets: RenderTarget[];
	wrapS: number;
	wrapT: number;
	minFilter: number;
	magFilter: number;
}

export class GPUComputationRenderer {

	constructor( sizeX: number, sizeY: number, renderer: WebGLRenderer );

	addVariable( variableName: string, computeFragmentShader: string, initialValueTexture: Texture ): Variable;
	setVariableDependencies( variable: Variable, dependencies: Variable[] | null ): void;

	init(): string | null;
	compute(): void;

	getCurrentRenderTarget( variable: Variable ): RenderTarget;
	getAlternateRenderTarget( variable: Variable ): RenderTarget;
	addResolutionDefine( materialShader: ShaderMaterial ): void;
	createRenderTarget( sizeXTexture: number, sizeYTexture: number, wrapS: Wrapping, wrapT: number, minFilter: TextureFilter, magFilter: TextureFilter ): RenderTarget;
	createTexture(): DataTexture;
	renderTexture( input: Texture, output: Texture ): void;
	doRenderTarget( material: Material, output: RenderTarget ): void;

}
