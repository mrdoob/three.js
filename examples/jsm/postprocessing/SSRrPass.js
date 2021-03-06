import {
	AddEquation,
	Color,
	NormalBlending,
	DepthTexture,
	SrcAlphaFactor,
	OneMinusSrcAlphaFactor,
	LinearFilter,
	MeshNormalMaterial,
	MeshBasicMaterial,
	NearestFilter,
	NoBlending,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	UnsignedShortType,
	WebGLRenderTarget,
	HalfFloatType,
} from '../../../build/three.module.js';
import { Pass } from '../postprocessing/Pass.js';
import { SSRrShader } from '../shaders/SSRrShader.js';
import { SSRrDepthShader } from '../shaders/SSRrShader.js';
import { CopyShader } from '../shaders/CopyShader.js';

var SSRrPass = function ( { renderer, scene, camera, width, height, selects, encoding, isPerspectiveCamera = true, morphTargets = false } ) {

	Pass.call( this );

	this.width = ( width !== undefined ) ? width : 512;
	this.height = ( height !== undefined ) ? height : 512;

	this.clear = true;

	this.renderer = renderer;
	this.scene = scene;
	this.camera = camera;

	this.output = 0;
	// this.output = 1;

	this.ior = SSRrShader.uniforms.ior.value;
	this.surfDist = SSRrShader.uniforms.surfDist.value;

	this.encoding = encoding;

	this.tempColor = new Color();

	this._selects = selects;
	this.isSelective = Array.isArray( this._selects );
	Object.defineProperty( this, 'selects', {
		get() {

			return this._selects;

		},
		set( val ) {

			if ( this._selects === val ) return;
			this._selects = val;
			if ( Array.isArray( val ) ) {

				this.isSelective = true;
				this.ssrrMaterial.defines.isSelective = true;
				this.ssrrMaterial.needsUpdate = true;

			} else {

				this.isSelective = false;
				this.ssrrMaterial.defines.isSelective = false;
				this.ssrrMaterial.needsUpdate = true;

			}

		}
	});

	this._isDistanceAttenuation = SSRrShader.defines.isDistanceAttenuation;
	Object.defineProperty( this, 'isDistanceAttenuation', {
		get() {

			return this._isDistanceAttenuation;

		},
		set( val ) {

			if ( this._isDistanceAttenuation === val ) return;
			this._isDistanceAttenuation = val;
			this.ssrrMaterial.defines.isDistanceAttenuation = val;
			this.ssrrMaterial.needsUpdate = true;

		}
	} );


	this._isFresnel = SSRrShader.defines.isFresnel;
	Object.defineProperty( this, 'isFresnel', {
		get() {

			return this._isFresnel;

		},
		set( val ) {

			if ( this._isFresnel === val ) return;
			this._isFresnel = val;
			this.ssrrMaterial.defines.isFresnel = val;
			this.ssrrMaterial.needsUpdate = true;

		}
	} );

	this._isInfiniteThick = SSRrShader.defines.isInfiniteThick;
	Object.defineProperty( this, 'isInfiniteThick', {
		get() {

			return this._isInfiniteThick;

		},
		set( val ) {

			if ( this._isInfiniteThick === val ) return;
			this._isInfiniteThick = val;
			this.ssrrMaterial.defines.isInfiniteThick = val;
			this.ssrrMaterial.needsUpdate = true;

		}
	} );
	this.thickTolerance = SSRrShader.uniforms.thickTolerance.value;

	// beauty render target with depth buffer

	var depthTexture = new DepthTexture();
	depthTexture.type = UnsignedShortType;
	depthTexture.minFilter = NearestFilter;
	depthTexture.maxFilter = NearestFilter;

	this.beautyRenderTarget = new WebGLRenderTarget( this.width, this.height, {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBAFormat,
		depthTexture: depthTexture,
		depthBuffer: true
	} );

	// normal render target

	this.normalRenderTarget = new WebGLRenderTarget( this.width, this.height, {
		minFilter: NearestFilter,
		magFilter: NearestFilter,
		format: RGBAFormat,
		type: HalfFloatType,
	} );

	// metalness render target

	this.metalnessRenderTarget = new WebGLRenderTarget( this.width, this.height, {
		minFilter: NearestFilter,
		magFilter: NearestFilter,
		format: RGBAFormat
	} );

	// ssrr render target

	this.ssrrRenderTarget = new WebGLRenderTarget( this.width, this.height, {
		minFilter: LinearFilter,
		magFilter: LinearFilter,
		format: RGBAFormat
	} );

	// ssrr material

	if ( SSRrShader === undefined ) {

		console.error( 'THREE.SSRrPass: The pass relies on SSRrShader.' );

	}

	this.ssrrMaterial = new ShaderMaterial( {
		defines: Object.assign( {}, SSRrShader.defines, {
			MAX_STEP: Math.sqrt( this.width * this.width + this.height * this.height )
		} ),
		uniforms: UniformsUtils.clone( SSRrShader.uniforms ),
		vertexShader: SSRrShader.vertexShader,
		fragmentShader: SSRrShader.fragmentShader,
		blending: NoBlending
	} );
	if ( ! isPerspectiveCamera ) {

		this.ssrrMaterial.defines.isPerspectiveCamera = isPerspectiveCamera;
		this.ssrrMaterial.needsUpdate = true;

	}

	this.ssrrMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
	this.ssrrMaterial.uniforms[ 'tNormal' ].value = this.normalRenderTarget.texture;
	// if (this.isSelective) {
	this.ssrrMaterial.defines.isSelective = this.isSelective;
	this.ssrrMaterial.needsUpdate = true;
	this.ssrrMaterial.uniforms[ 'tMetalness' ].value = this.metalnessRenderTarget.texture;
	// }
	this.ssrrMaterial.uniforms[ 'tDepth' ].value = this.beautyRenderTarget.depthTexture;
	this.ssrrMaterial.uniforms[ 'tDepthBunny' ].value = this.normalRenderTarget.depthTexture;
	this.ssrrMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
	this.ssrrMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
	this.ssrrMaterial.uniforms[ 'surfDist' ].value = this.surfDist;
	this.ssrrMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );
	this.ssrrMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
	this.ssrrMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );

	// normal material

	this.normalMaterial = new MeshNormalMaterial( { morphTargets } );
	this.normalMaterial.blending = NoBlending;

	// metalnessOn material

	this.metalnessOnMaterial = new MeshBasicMaterial( {
		color: 'white'
	} );

	// metalnessOff material

	this.metalnessOffMaterial = new MeshBasicMaterial( {
		color: 'black'
	} );

	// material for rendering the depth

	this.depthRenderMaterial = new ShaderMaterial( {
		defines: Object.assign( {}, SSRrDepthShader.defines ),
		uniforms: UniformsUtils.clone( SSRrDepthShader.uniforms ),
		vertexShader: SSRrDepthShader.vertexShader,
		fragmentShader: SSRrDepthShader.fragmentShader,
		blending: NoBlending
	} );
	this.depthRenderMaterial.uniforms[ 'tDepth' ].value = this.beautyRenderTarget.depthTexture;
	this.depthRenderMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
	this.depthRenderMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;

	// material for rendering the content of a render target

	this.copyMaterial = new ShaderMaterial( {
		uniforms: UniformsUtils.clone( CopyShader.uniforms ),
		vertexShader: CopyShader.vertexShader,
		fragmentShader: CopyShader.fragmentShader,
		transparent: true,
		depthTest: false,
		depthWrite: false,
		blendSrc: SrcAlphaFactor,
		blendDst: OneMinusSrcAlphaFactor,
		blendEquation: AddEquation,
		blendSrcAlpha: SrcAlphaFactor,
		blendDstAlpha: OneMinusSrcAlphaFactor,
		blendEquationAlpha: AddEquation,
		// premultipliedAlpha:true,
	} );

	this.fsQuad = new Pass.FullScreenQuad( null );

	this.originalClearColor = new Color();

};

SSRrPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: SSRrPass,

	dispose: function () {

		// dispose render targets

		this.beautyRenderTarget.dispose();
		this.normalRenderTarget.dispose();
		this.metalnessRenderTarget.dispose();
		this.ssrrRenderTarget.dispose();

		// dispose materials

		this.normalMaterial.dispose();
		this.metalnessOnMaterial.dispose();
		this.metalnessOffMaterial.dispose();
		this.copyMaterial.dispose();
		this.depthRenderMaterial.dispose();

		// dipsose full screen quad

		this.fsQuad.dispose();

	},

	render: function ( renderer, writeBuffer /*, readBuffer, deltaTime, maskActive */ ) {

		// render beauty and depth

		if ( this.encoding ) this.beautyRenderTarget.texture.encoding = this.encoding;
		renderer.setRenderTarget( this.beautyRenderTarget );
		renderer.clear();

		// this.scene.traverse(child => {
		// 	if (this.selects.includes(child)) {
		// 		child.visible=false
		// 	} else {
		// 		child.visible=true
		// 	}
		// })
		// this.scene.children.forEach(child => {
		// 	if (this.selects.includes(child)) {
		// 		child.visible=false
		// 	} else {
		// 		child.visible = true
		// 	}
		// 	// console.log(child.name,child.visible)
		// })
		// debugger
		mesh_bunny.visible=false
		mesh_sphere.visible=true
		mesh_box.visible=true
		mesh_cone.visible=true
		mesh_plane.visible=true
		renderer.render( this.scene, this.camera );

		// render normals

		/* // TODO: Why this not work?
			this.scene.traverse(child => {
				if (this.selects.includes(child)) {
					child.visible=true
				} else {
					child.visible = false
				}
			})
		*/
		// this.scene.children.forEach(child => {
		// 	if (this.selects.includes(child)) {
		// 		child.visible=true
		// 	} else {
		// 		child.visible = false
		// 	}
		// })

		mesh_bunny.visible=true
		mesh_sphere.visible=false
		mesh_box.visible=false
		mesh_cone.visible=false
		mesh_plane.visible=false
		this.renderOverride(renderer, this.normalMaterial, this.normalRenderTarget, 0, 0);

		this.renderMetalness( renderer, this.metalnessOnMaterial, this.metalnessRenderTarget, 0, 0 );

		// render SSRr

		this.ssrrMaterial.uniforms[ 'ior' ].value = this.ior;
		this.ssrrMaterial.uniforms[ 'surfDist' ].value = this.surfDist;
		this.ssrrMaterial.uniforms[ 'thickTolerance' ].value = this.thickTolerance;
		this.renderPass( renderer, this.ssrrMaterial, this.ssrrRenderTarget );

		// output result to screen

		switch ( this.output ) {

			case SSRrPass.OUTPUT.Default:


				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrrRenderTarget.texture;
				this.copyMaterial.blending = NormalBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;
			case SSRrPass.OUTPUT.SSRr:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssrrRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRrPass.OUTPUT.Beauty:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRrPass.OUTPUT.Depth:

				this.renderPass( renderer, this.depthRenderMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRrPass.OUTPUT.Normal:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.normalRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			case SSRrPass.OUTPUT.Metalness:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.metalnessRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			default:
				console.warn( 'THREE.SSRrPass: Unknown output type.' );

		}

	},

	renderPass: function ( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

		// save original state
		this.originalClearColor.copy( renderer.getClearColor( this.tempColor ) );
		var originalClearAlpha = renderer.getClearAlpha( this.tempColor );
		var originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );

		// setup pass state
		renderer.autoClear = false;
		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.fsQuad.material = passMaterial;
		this.fsQuad.render( renderer );

		// restore original state
		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	},

	renderOverride: function ( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

		this.originalClearColor.copy( renderer.getClearColor( this.tempColor ) );
		var originalClearAlpha = renderer.getClearAlpha( this.tempColor );
		var originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = false;

		clearColor = overrideMaterial.clearColor || clearColor;
		clearAlpha = overrideMaterial.clearAlpha || clearAlpha;

		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.scene.overrideMaterial = overrideMaterial;
		renderer.render( this.scene, this.camera );
		this.scene.overrideMaterial = null;

		// restore original state

		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	},


	renderMetalness: function ( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

		this.originalClearColor.copy( renderer.getClearColor( this.tempColor ) );
		var originalClearAlpha = renderer.getClearAlpha( this.tempColor );
		var originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = false;

		clearColor = overrideMaterial.clearColor || clearColor;
		clearAlpha = overrideMaterial.clearAlpha || clearAlpha;

		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}


		mesh_bunny.visible=true
		mesh_sphere.visible=true
		mesh_box.visible=true
		mesh_cone.visible=true
		mesh_plane.visible=true
		this.scene.traverse( child => {

			child._SSRPassMaterialBack = child.material;
			if ( this._selects.includes( child ) ) {

				child.material = this.metalnessOnMaterial;

			} else {

				child.material = this.metalnessOffMaterial;

			}

		});
		this.scene._fog=this.scene.fog // TODO: Formal writing.
		this.scene.fog=null
		renderer.render(this.scene, this.camera);
		this.scene.fog=this.scene._fog
		this.scene.traverse( child => {

			child.material = child._SSRPassMaterialBack;

		} );

		// restore original state

		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	},

	setSize: function ( width, height ) {

		this.width = width;
		this.height = height;

		this.ssrrMaterial.defines.MAX_STEP = Math.sqrt( width * width + height * height );
		this.ssrrMaterial.needsUpdate = true;
		this.beautyRenderTarget.setSize( width, height );
		this.ssrrRenderTarget.setSize( width, height );
		this.normalRenderTarget.setSize( width, height );

		this.ssrrMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.ssrrMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssrrMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );

	},

} );

SSRrPass.OUTPUT = {
	'Default': 0,
	'SSRr': 1,
	'Beauty': 3,
	'Depth': 4,
	'Normal': 5,
	'Metalness': 7,
};

export { SSRrPass };
