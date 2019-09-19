import {
	BufferGeometry,
	Color,
	Clock,
	DataTexture,
	Mesh,
	OrthographicCamera,
	PlaneBufferGeometry,
	Scene,
	ShaderMaterial,
	Texture,
	Uniform,
	WebGLRenderer,
	WebGLRenderTarget
} from '../../../src/Three';

export interface FireOptions {
	textureWidth?: number;
	textureHeight?: number;
	debug?: boolean;
	color1?: Color;
	color2?: Color;
	color3?: Color;
	colorBias?: number;
	diffuse?: number;
	viscosity?: number;
	expansion?: number;
	swirl?: number;
	burnRate?: number;
	drag?: number;
	airSpeed?: number;
	windVector?: number;
	speed?: number;
	massConservation?: boolean;
}

export class Fire extends Mesh {

	constructor( geometry: BufferGeometry, options: FireOptions );
	clock: Clock;
	color1: Color;
	color2: Color;
	color3: Color;
	colorBias: number;
	diffuse: number;
	viscosity: number;
	expansion: number;
	swirl: number;
	burnRate: number;
	drag: number;
	airSpeed: number;
	windVector: number;
	speed: number;
	massConservation: boolean;

	sourceData: Uint8Array;

	field0: WebGLRenderTarget;
	field1: WebGLRenderTarget;
	fieldProj: WebGLRenderTarget;
	fieldScene: Scene;
	orthoCamera: OrthographicCamera;
	fieldGeometry: PlaneBufferGeometry;
	internalSource: DataTexture;
	sourceMaterial: ShaderMaterial;
	sourceMesh: Mesh;
	diffuseMaterial: ShaderMaterial;
	driftMaterial: ShaderMaterial;
	projMaterial1: ShaderMaterial;
	projMaterial2: ShaderMaterial;
	projMaterial3: ShaderMaterial;
	material: ShaderMaterial;

	addSource( u: number, v: number, radius: number, density?: number, windX?: number, windY?: number ): Uint8Array;
	clearDiffuse(): void;
	clearSources(): Uint8Array;
	configShaders( dt: number ): void;
	renderDiffuse( renderer: WebGLRenderer ): void;
	renderDrift( renderer: WebGLRenderer ): void;
	renderProject( renderer: WebGLRenderer ): void;
	renderSource( renderer: WebGLRenderer ): void;
	restoreRenderState( renderer: WebGLRenderer ): void;
	saveRenderState( renderer: WebGLRenderer ): void;
	setSourceMap( texture: Texture ): void;
	swapTextures(): void;

	static SourceShader: SourceShader;
	static DiffuseShader: DiffuseShader;
	static DriftShader: DriftShader;
	static ProjectionShader1: ProjectionShader1;
	static ProjectionShader2: ProjectionShader2;
	static ProjectionShader3: ProjectionShader3;
	static ColorShader: ColorShader;
	static DebugShader: DebugShader;

}

declare interface SourceShader {
	uniforms: {
		sourceMap: Uniform;
		densityMap: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
}

declare interface DiffuseShader {
	uniforms: {
		oneOverWidth: Uniform;
		oneOverHeight: Uniform;
		diffuse: Uniform;
		viscosity: Uniform;
		expansion: Uniform;
		swirl: Uniform;
		drag: Uniform;
		burnRate: Uniform;
		densityMap: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
}

declare interface DriftShader {
	uniforms: {
		oneOverWidth: Uniform;
		oneOverHeight: Uniform;
		windVector: Uniform;
		airSpeed: Uniform;
		densityMap: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
}

declare interface ProjectionShader1 {
	uniforms: {
		oneOverWidth: Uniform;
		oneOverHeight: Uniform;
		densityMap: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
}

declare interface ProjectionShader2 {
	uniforms: {
		oneOverWidth: Uniform;
		oneOverHeight: Uniform;
		densityMap: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
}

declare interface ProjectionShader3 {
	uniforms: {
		oneOverWidth: Uniform;
		oneOverHeight: Uniform;
		densityMap: Uniform;
		projMap: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
}

declare interface ColorShader {
	uniforms: {
		color1: Uniform;
		color2: Uniform;
		color3: Uniform;
		colorBias: Uniform;
		densityMap: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
}

declare interface DebugShader {
	uniforms: {
		color1: Uniform;
		color2: Uniform;
		color3: Uniform;
		colorBias: Uniform;
		densityMap: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
}
