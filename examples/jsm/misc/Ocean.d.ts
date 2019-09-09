import {
  OrthographicCamera,
  Mesh,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from '../../../src/Three';

export class Ocean {
  constructor( renderer: WebGLRenderer, camera?: OrthographicCamera, scene?: Scene, options?: object );

	changed: boolean;
	initial: boolean;

	oceanCamera: OrthographicCamera
	renderer: WebGLRenderer;
  scene: Scene;

  clearColor: number[];
	geometryOrigin: number[];
	sunDirectionX: number;
	sunDirectionY: number;
	sunDirectionZ: number;
	oceanColor: Vector3;
	skyColor: Vector3;
	exposure: number;
	geometryResolution: number;
	geometrySize: number;
	resolution: number;
	floatSize: number;
	windX: number;
	windY: number;
	size: number;
  choppiness: number;

  initialSpectrumFramebuffer: WebGLRenderTarget;
	spectrumFramebuffer: WebGLRenderTarget;
	pingPhaseFramebuffer: WebGLRenderTarget;
	pongPhaseFramebuffer: WebGLRenderTarget;
	pingTransformFramebuffer: WebGLRenderTarget;
	pongTransformFramebuffer: WebGLRenderTarget;
	displacementMapFramebuffer: WebGLRenderTarget;
	normalMapFramebuffer: WebGLRenderTarget;

  matrixNeedsUpdate: boolean;

  materialOceanHorizontal: ShaderMaterial;
  materialOceanVertical: ShaderMaterial;
  materialInitialSpectrum: ShaderMaterial;
  materialPhase: ShaderMaterial;
  materialSpectrum: ShaderMaterial;
  materialNormal: ShaderMaterial;
  materialOcean: ShaderMaterial;

  screenQuad: Mesh;

  generateSeedPhaseTexture(): void;
	generateMesh(): void;
  render(): void;
  renderInitialSpectrum(): void;
  renderWavePhase(): void;
  renderSpectrum(): void;
  renderSpectrumFFT(): void;
  renderNormalMap(): void;

}
