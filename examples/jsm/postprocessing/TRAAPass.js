import {
	Color,
	LinearFilter,
	Object3D,
	Matrix4,
	Mesh,
	PlaneGeometry,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget,
	Vector2,
	Vector3,
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { CopyShader } from '../shaders/CopyShader.js';
import { TRAASuperSampleShader } from '../shaders/TRAASuperSampleShader.js';

class TexturePass extends Pass {
	constructor(scene, camera, resolution) {
		THREE.Pass.call(this);

		this.scene = scene;
		this.camera = camera;


		this.orthoScene = new THREE.Scene();
		this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -0.01, 1000);

		this.superSampleTRAAMaterial = new TRAASuperSampleShader();
		this.velocityMaterial = new MeshVelocityMaterial();

		this.currentMaterial = this.superSampleTRAAMaterial;

		var quad = new PlaneGeometry(2, 2);
		var quadMesh = new Mesh(quad, this.currentMaterial);
		this.orthoScene.add(quadMesh);
		this.oldClearColor = new THREE.Color();
		this.oldClearAlpha = 1;
		this.needsSwap = false;

		var copyShader = CopyShader;
		this.copyUniforms = UniformsUtils.clone(copyShader.uniforms);

		this.copyMaterial = new ShaderMaterial({
			uniforms: this.copyUniforms,
			vertexShader: copyShader.vertexShader,
			fragmentShader: copyShader.fragmentShader,
			transparent: true,
			depthWrite: false,
		});

		var params = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			stencilBuffer: true,
		};
		this.accumulatedBeautyRenderTarget = new WebGLRenderTarget(
			256,
			256,
			params
		);

		this.previousProjectionViewMatrix = new Matrix4();
		this.currentProjectionViewMatrix = new Matrix4();

		this.projectionMatrix = new Matrix4();
		this.projectionMatrix.copy(this.camera.projectionMatrix);

		this.numSamplesPerAccumulation = 16;
		this.staticMode = false;

		this.depthTexture = null;
	}

	dispose() {
		if (this.accumulatedBeautyRenderTarget)
			this.accumulatedBeautyRenderTarget.dispose();
	}

	setSize(width, height) {
		if (this.accumulatedBeautyRenderTarget)
			this.accumulatedBeautyRenderTarget.setSize(width, height);
		if (this.velocityRenderTarget)
			this.velocityRenderTarget.setSize(width, height);
		this.projectionMatrix.copy(this.camera.projectionMatrix);

		this.resetPending = true;
	},

	renderOverride(
		renderer,
		overrideMaterial,
		renderTarget,
		clearColor,
		clearAlpha
	) {
		var originalClearColor = renderer.getClearColor().getHex();
		var originalClearAlpha = renderer.getClearAlpha();
		var originalAutoClear = renderer.autoClear;

		renderer.autoClear = false;

		clearColor = overrideMaterial.clearColor || clearColor;
		clearAlpha = overrideMaterial.clearAlpha || clearAlpha;
		var clearNeeded = clearColor !== undefined && clearColor !== null;
		if (clearNeeded) {
			renderer.setClearColor(clearColor);
			renderer.setClearAlpha(clearAlpha || 0.0);
		}

		this.scene.overrideMaterial = overrideMaterial;
		// if ( this.camera.clearViewOffset ) this.camera.clearViewOffset();

		renderer.render(
			this.scene,
			this.camera,
			renderTarget,
			clearNeeded,
			this.visibilityFunc
		);
		this.scene.overrideMaterial = null;

		// restore original state
		renderer.autoClear = originalAutoClear;
		renderer.setClearColor(originalClearColor);
		renderer.setClearAlpha(originalClearAlpha);
	},

	render(
		renderer,
		writeBuffer,
		readBuffer,
		delta,
		maskActive,
		overrideCamera
	) {
		var camera = overrideCamera || this.camera;

		this.oldClearColor = renderer.getClearColor().getHex();
		this.oldClearAlpha = renderer.getClearAlpha();
		var oldAutoClear = renderer.autoClear;
		var oldAutoClearDepth = renderer.autoClearDepth;

		var width = writeBuffer.width,
			height = writeBuffer.height;

		if (!this.velocityRenderTarget) {
			var params = {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				format: RGBAFormat,
			};
			this.velocityRenderTarget = new WebGLRenderTarget(
				width,
				height,
				params
			);
		}

		this.currentMaterial = this.superSampleTRAAMaterial;
		this.currentProjectionViewMatrix.multiplyMatrices(
			this.projectionMatrix,
			camera.matrixWorldInverse
		);

		this.oldClearColor = renderer.getClearColor().getHex();
		this.oldClearAlpha = renderer.getClearAlpha();
		var oldAutoClear = renderer.autoClear;
		var oldAutoClearDepth = renderer.autoClearDepth;
		var oldAutoClearColor = renderer.autoClearColor;

		renderer.autoClear = false;

		renderer.setClearColor(new Color(0, 0, 0), 0);

		this.velocityMaterial.currentProjectionViewMatrix.copy(
			this.currentProjectionViewMatrix
		);
		this.velocityMaterial.previousProjectionViewMatrix.copy(
			this.previousProjectionViewMatrix
		);

		//renderer.autoClearColor = true;
		this.scene.overrideMaterial = this.velocityMaterial;
		renderer.render(
			this.scene,
			camera,
			this.velocityRenderTarget,
			true,
			this.visibilityFunc
		);
		this.scene.overrideMaterial = null;
		this.scene.traverse(function (obj) {
			if (obj instanceof Object3D) {
				obj.matrixWorldPrevious.copy(obj.matrixWorld);
			}
		});

		if (camera.view) {
			this.currentMaterial.uniforms["jitterOffset"].value.set(
				camera.view.offsetX,
				camera.view.offsetY
			);
		}

		this.currentMaterial.uniforms["currentBeauty"].value = readBuffer.texture;
		this.currentMaterial.uniforms["previousBeauty"].value =
			this.accumulatedBeautyRenderTarget.texture;

		this.currentMaterial.defines["DEPTH_PACKING"] =
			this.depthTexture.depthPacking;
		this.currentMaterial.uniforms["tDepth"].value = this.depthTexture;
		this.currentMaterial.uniforms["tVelocity"].value =
			this.velocityRenderTarget.texture;
		if (this.resetPending) {
			this.currentMaterial.uniforms["mode"].value = 2;
			this.resetPending = false;
		} else if (this.staticMode) {
			this.currentMaterial.uniforms["mode"].value = 1;
		} else {
			this.currentMaterial.uniforms["mode"].value = 0;
		}
		this.currentMaterial.uniforms[
			"cameraInverseProjectionMatrix"
		].value.getInverse(this.projectionMatrix);
		this.currentMaterial.uniforms["cameraProjectionMatrix"].value.copy(
			this.projectionMatrix
		);
		this.currentMaterial.uniforms["cameraInverseViewMatrix"].value.copy(
			camera.matrixWorld
		);
		this.currentMaterial.uniforms["cameraNearFar"].value.copy(
			new Vector2(camera.near, camera.far)
		);
		this.currentMaterial.uniforms["textureSize"].value.copy(
			new Vector2(width, height)
		);
		this.currentMaterial.uniforms["minSampleWeight"].value =
			1.0 / this.numSamplesPerAccumulation;

		//renderer.autoClearColor = true;
		//renderer.autoClearDepth = false;
		this.orthoScene.overrideMaterial = this.currentMaterial;
		renderer.autoClearDepth = false;
		renderer.render(this.orthoScene, this.orthoCamera, writeBuffer, true);
		this.orthoScene.overrideMaterial = null;

		this.copyUniforms["tDiffuse"].value = writeBuffer.texture;
		this.copyUniforms["opacity"].value = 1;
		this.orthoScene.overrideMaterial = this.copyMaterial;
		renderer.render(
			this.orthoScene,
			this.orthoCamera,
			this.accumulatedBeautyRenderTarget,
			true
		);
		renderer.render(this.orthoScene, this.orthoCamera, readBuffer, true);
		this.orthoScene.overrideMaterial = null;

		renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
		renderer.autoClear = oldAutoClear;
		renderer.autoClearColor = oldAutoClearColor;
		renderer.autoClearDepth = oldAutoClearDepth;
		this.previousProjectionViewMatrix.copy(this.currentProjectionViewMatrix);
	}

}


export { TexturePass };
