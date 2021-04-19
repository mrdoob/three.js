import {
	FrontSide,
	LessEqualDepth,
	NoColors,
	NormalBlending,
	ShaderMaterial
} from '../../../../build/three.module.js';

import { NodeBuilder } from '../core/NodeBuilder.js';
import { ColorNode } from '../inputs/ColorNode.js';
import { PositionNode } from '../accessors/PositionNode.js';
import { RawNode } from './nodes/RawNode.js';

class NodeMaterial extends ShaderMaterial {

	constructor( vertex, fragment ) {

		super();

		this.vertex = vertex || new RawNode( new PositionNode( PositionNode.PROJECTION ) );
		this.fragment = fragment || new RawNode( new ColorNode( 0xFF0000 ) );

		this.updaters = [];

		this.type = 'NodeMaterial';

	}

	get properties() {

		return this.fragment.properties;

	}

	get needsUpdate() {

		return this.needsCompile;

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;
		this.needsCompile = value;

	}

	onBeforeCompile( shader, renderer ) {

		this.build( { renderer: renderer } );

		shader.defines = this.defines;
		shader.uniforms = this.uniforms;
		shader.vertexShader = this.vertexShader;
		shader.fragmentShader = this.fragmentShader;

		shader.extensionDerivatives = ( this.extensions.derivatives === true );
		shader.extensionFragDepth = ( this.extensions.fragDepth === true );
		shader.extensionDrawBuffers = ( this.extensions.drawBuffers === true );
		shader.extensionShaderTextureLOD = ( this.extensions.shaderTextureLOD === true );

	}

	customProgramCacheKey() {

		const hash = this.getHash();

		return hash;

	}

	getHash() {

		let hash = '{';

		hash += '"vertex":' + this.vertex.getHash() + ',';
		hash += '"fragment":' + this.fragment.getHash();

		hash += '}';

		return hash;

	}

	updateFrame( frame ) {

		for ( let i = 0; i < this.updaters.length; ++ i ) {

			frame.updateNode( this.updaters[ i ] );

		}

	}

	build( params = {} ) {

		const builder = params.builder || new NodeBuilder();

		builder.setMaterial( this, params.renderer );
		builder.build( this.vertex, this.fragment );

		this.vertexShader = builder.getCode( 'vertex' );
		this.fragmentShader = builder.getCode( 'fragment' );

		this.defines = builder.defines;
		this.uniforms = builder.uniforms;
		this.extensions = builder.extensions;
		this.updaters = builder.updaters;

		this.fog = builder.requires.fog;
		this.lights = builder.requires.lights;

		this.transparent = builder.requires.transparent || this.blending > NormalBlending;

		return this;

	}

	copy( source ) {

		const uuid = this.uuid;

		for ( const name in source ) {

			this[ name ] = source[ name ];

		}

		this.uuid = uuid;

		if ( source.userData !== undefined ) {

			this.userData = JSON.parse( JSON.stringify( source.userData ) );

		}

		return this;

	}

	toJSON( meta ) {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( isRootObject ) {

			meta = {
				nodes: {}
			};

		}

		if ( meta && ! meta.materials ) meta.materials = {};

		if ( ! meta.materials[ this.uuid ] ) {

			const data = {};

			data.uuid = this.uuid;
			data.type = this.type;

			meta.materials[ data.uuid ] = data;

			if ( this.name !== '' ) data.name = this.name;

			if ( this.size !== undefined ) data.size = this.size;
			if ( this.sizeAttenuation !== undefined ) data.sizeAttenuation = this.sizeAttenuation;

			if ( this.blending !== NormalBlending ) data.blending = this.blending;
			if ( this.flatShading === true ) data.flatShading = this.flatShading;
			if ( this.side !== FrontSide ) data.side = this.side;
			if ( this.vertexColors !== NoColors ) data.vertexColors = this.vertexColors;

			if ( this.depthFunc !== LessEqualDepth ) data.depthFunc = this.depthFunc;
			if ( this.depthTest === false ) data.depthTest = this.depthTest;
			if ( this.depthWrite === false ) data.depthWrite = this.depthWrite;

			if ( this.linewidth !== 1 ) data.linewidth = this.linewidth;
			if ( this.dashSize !== undefined ) data.dashSize = this.dashSize;
			if ( this.gapSize !== undefined ) data.gapSize = this.gapSize;
			if ( this.scale !== undefined ) data.scale = this.scale;

			if ( this.dithering === true ) data.dithering = true;

			if ( this.wireframe === true ) data.wireframe = this.wireframe;
			if ( this.wireframeLinewidth > 1 ) data.wireframeLinewidth = this.wireframeLinewidth;
			if ( this.wireframeLinecap !== 'round' ) data.wireframeLinecap = this.wireframeLinecap;
			if ( this.wireframeLinejoin !== 'round' ) data.wireframeLinejoin = this.wireframeLinejoin;

			if ( this.alphaTest > 0 ) data.alphaTest = this.alphaTest;
			if ( this.premultipliedAlpha === true ) data.premultipliedAlpha = this.premultipliedAlpha;

			if ( this.morphTargets === true ) data.morphTargets = true;
			if ( this.skinning === true ) data.skinning = true;

			if ( this.visible === false ) data.visible = false;
			if ( JSON.stringify( this.userData ) !== '{}' ) data.userData = this.userData;

			data.fog = this.fog;
			data.lights = this.lights;

			data.vertex = this.vertex.toJSON( meta ).uuid;
			data.fragment = this.fragment.toJSON( meta ).uuid;

		}

		meta.material = this.uuid;

		return meta;

	}

}

NodeMaterial.prototype.isNodeMaterial = true;

export { NodeMaterial };
