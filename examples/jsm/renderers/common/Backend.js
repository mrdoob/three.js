let color4 = null;

import Color4 from './Color4.js';
import { REVISION, createCanvasElement } from 'three';

class Backend {

	constructor( parameters = {} ) {

		this.parameters = Object.assign( {}, parameters );
		this.data = new WeakMap();
		this.renderer = null;
		this.domElement = null;

	}

	async init( renderer ) {

		this.renderer = renderer;

	}

	// render context

	begin( renderContext ) { }

	finish( renderContext ) { }

	// render object

	draw( renderObject, info ) { }

	// program

	createProgram( program ) { }

	destroyProgram( program ) { }

	// bindings

	createBindings( renderObject ) { }

	updateBindings( renderObject ) { }

	// pipeline

	createRenderPipeline( renderObject ) { }

	createComputePipeline( computeNode, pipeline ) { }

	destroyPipeline( pipeline ) { }

	// cache key

	needsRenderUpdate( renderObject ) { } // return Boolean ( fast test )

	getRenderCacheKey( renderObject ) { } // return String

	// node builder

	createNodeBuilder( renderObject ) { } // return NodeBuilder (ADD IT)

	// textures

	createSampler( texture ) { }

	createDefaultTexture( texture ) { }

	createTexture( texture ) { }

	copyTextureToBuffer( texture, x, y, width, height ) {}

	// attributes

	createAttribute( attribute ) { }

	createIndexAttribute( attribute ) { }

	updateAttribute( attribute ) { }

	destroyAttribute( attribute ) { }

	// canvas

	getContext() { }

	// utils

	resolveTimestampAsync( renderContext, type ) { }

	hasFeatureAsync( name ) { } // return Boolean

	hasFeature( name ) { } // return Boolean

	getInstanceCount( renderObject ) {

		const { object, geometry } = renderObject;

		return geometry.isInstancedBufferGeometry ? geometry.instanceCount : ( object.isInstancedMesh ? object.count : 1 );

	}

	setScissorTest( boolean ) { }

	getClearColor() {

		const renderer = this.renderer;

		color4 = color4 || new Color4();

		renderer.getClearColor( color4 );

		color4.getRGB( color4, this.renderer.currentColorSpace );

		return color4;

	}

	getDomElement() {

		let domElement = this.domElement;

		if ( domElement === null ) {

			domElement = ( this.parameters.canvas !== undefined ) ? this.parameters.canvas : createCanvasElement();

			// OffscreenCanvas does not have setAttribute, see #22811
			if ( 'setAttribute' in domElement ) domElement.setAttribute( 'data-engine', `three.js r${REVISION} webgpu` );

			this.domElement = domElement;

		}

		return domElement;

	}

	// resource properties

	set( object, value ) {

		this.data.set( object, value );

	}

	get( object ) {

		let map = this.data.get( object );

		if ( map === undefined ) {

			map = {};
			this.data.set( object, map );

		}

		return map;

	}

	has( object ) {

		return this.data.has( object );

	}

	delete( object ) {

		this.data.delete( object );

	}

}

export default Backend;
