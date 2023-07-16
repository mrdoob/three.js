let vector2 = null;
let vector4 = null;

import { Vector2, Vector4 } from 'three';

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

	needsUpdate( renderObject ) { } // return Boolean ( fast test )

	getCacheKey( renderObject ) { } // return String

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

	updateSize() { }

	// utils

	hasFeature( name ) { } // return Boolean

	getInstanceCount( renderObject ) {

		const { object, geometry } = renderObject;

		return geometry.isInstancedBufferGeometry ? geometry.instanceCount : ( object.isInstancedMesh ? object.count : 1 );

	}

	getDrawingBufferSize() {

		vector2 = vector2 || new Vector2();

		return this.renderer.getDrawingBufferSize( vector2 );

	}

	getScissor() {

		vector4 = vector4 || new Vector4();

		return this.renderer.getScissor( vector4 );

	}

	getDomElement() {

		let domElement = this.domElement;

		if ( domElement === null ) {

			this.domElement = domElement = ( this.parameters.canvas !== undefined ) ? this.parameters.canvas : this.createCanvasElement();

		}

		return domElement;

	}

	createCanvasElement() {

		const canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );
		canvas.style.display = 'block';
		return canvas;

	}

	// resource properties

	get( object ) {

		let map = this.data.get( object );

		if ( map === undefined ) {

			map = {};
			this.data.set( object, map );

		}

		return map;

	}

	delete( object ) {

		this.data.delete( object );

	}

}

export default Backend;
