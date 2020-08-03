import { WebGLRenderer } from './../WebGLRenderer';
import { WebGLProgram } from './WebGLProgram';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLExtensions } from './WebGLExtensions';
import {
	TextureEncoding,
	Mapping,
	Combine,
	ToneMapping,
	ShadowMapType,
} from './../../constants';
import { Material } from './../../materials/Material';
import { Scene } from './../../scenes/Scene';

export interface WebGLProgramParameters {
	isWebGL2: boolean;

	shaderID: string;
	shaderName: string;

	vertexShader: string;
	fragmentShader: string;
	defines: any;

	isRawShaderMaterial: boolean;
	isShaderMaterial: boolean;

	precision: string;

	instancing: boolean;

	supportsVertexTextures: boolean;
	outputEncoding: TextureEncoding;
	map: boolean;
	mapEncoding: TextureEncoding;
	matcap: boolean;
	matcapEncoding: TextureEncoding;
	envMap: boolean;
	envMapMode: Mapping | undefined;
	envMapEncoding: TextureEncoding;
	envMapCubeUV: boolean;
	lightMap: boolean;
	lightMapEncoding: TextureEncoding;
	aoMap: boolean;
	emissiveMap: boolean;
	emissiveMapEncoding: TextureEncoding;
	bumpMap: boolean;
	normalMap: boolean;
	objectSpaceNormalMap: boolean;
	tangentSpaceNormalMap: boolean;
	clearcoatMap: boolean;
	clearcoatRoughnessMap: boolean;
	clearcoatNormalMap: boolean;
	displacementMap: boolean;
	roughnessMap: boolean;
	metalnessMap: boolean;
	specularMap: boolean;
	alphaMap: boolean;

	gradientMap: boolean;

	sheen: boolean;

	transmissionMap: boolean;

	combine?: Combine;

	vertexTangents: boolean;
	vertexColors: boolean;
	vertexUvs: boolean;
	uvsVertexOnly: boolean;

	fog: boolean;
	useFog: boolean;
	fogExp2: boolean;

	flatShading: boolean;

	sizeAttenuation?: boolean;
	logarithmicDepthBuffer: boolean;

	skinning: boolean;
	maxBones: number;
	useVertexTexture: boolean;

	morphTargets: boolean;
	morphNormals: boolean;
	maxMorphTargets: number;
	maxMorphNormals: number;

	numDirLights: number;
	numPointLights: number;
	numSpotLights: number;
	numRectAreaLights: number;
	numHemiLights: number;

	numDirLightShadows: number;
	numPointLightShadows: number;
	numSpotLightShadows: number;

	numClippingPlanes: number;
	numClipIntersection: number;

	dithering: boolean;

	shadowMapEnabled: boolean;
	shadowMapType: ShadowMapType;

	toneMapping: ToneMapping;
	physicallyCorrectLights: boolean;

	premultipliedAlpha: boolean;

	alphaTest: boolean;
	doubleSided: boolean;
	flipSided: boolean;

	depthPacking: boolean;

	index0AttributeName?: string;

	extensionDerivatives: boolean;
	extensionFragDepth: boolean;
	extensionDrawBuffers: boolean;
	extensionShaderTextureLOD: boolean;

	rendererExtensionFragDepth: boolean;
	rendererExtensionDrawBuffers: boolean;
	rendererExtensionShaderTextureLod: boolean;

	customProgramCacheKey: string;
}

export class WebGLPrograms {

	constructor(
		renderer: WebGLRenderer,
		extensions: WebGLExtensions,
		capabilities: WebGLCapabilities
	);

	programs: WebGLProgram[];

	getParameters(
		material: Material,
		lights: any,
		shadows: any[],
		scene: Scene,
		nClipPlanes: number,
		nClipIntersection: number,
		object: any
	): WebGLProgramParameters;
	getProgramCacheKey( parameters: WebGLProgramParameters ): string;
	getUniforms( material: Material ): any;
	acquireProgram(
		parameters: WebGLProgramParameters,
		cacheKey: string
	): WebGLProgram;
	releaseProgram( program: WebGLProgram ): void;

}
