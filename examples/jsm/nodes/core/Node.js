/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Math as _Math } from '../../../../build/three.module.js';

function Node( type ) {

	this.uuid = _Math.generateUUID();

	this.name = "";

	this.type = type;

	this.userData = {};

}

Node.prototype = {

	constructor: Node,

	isNode: true,

	analyze: function ( builder, settings ) {

		settings = settings || {};

		builder.analyzing = true;

		this.build( builder.addFlow( settings.slot, settings.cache, settings.context ), 'v4' );

		builder.clearVertexNodeCode();
		builder.clearFragmentNodeCode();

		builder.removeFlow();

		builder.analyzing = false;

	},

	analyzeAndFlow: function ( builder, output, settings ) {

		settings = settings || {};

		this.analyze( builder, settings );

		return this.flow( builder, output, settings );

	},

	flow: function ( builder, output, settings ) {

		settings = settings || {};

		builder.addFlow( settings.slot, settings.cache, settings.context );

		var flow = {};
		flow.result = this.build( builder, output );
		flow.code = builder.clearNodeCode();
		flow.extra = builder.context.extra;

		builder.removeFlow();

		return flow;

	},

	build: function ( builder, output, uuid ) {

		output = output || this.getType( builder, output );

		var data = builder.getNodeData( uuid || this );

		if ( builder.analyzing ) {

			this.appendDepsNode( builder, data, output );

		}

		if ( builder.nodes.indexOf( this ) === - 1 ) {

			builder.nodes.push( this );

		}

		if ( this.updateFrame !== undefined && builder.updaters.indexOf( this ) === - 1 ) {

			builder.updaters.push( this );

		}

		return this.generate( builder, output, uuid );

	},

	appendDepsNode: function ( builder, data, output ) {

		data.deps = ( data.deps || 0 ) + 1;

		var outputLen = builder.getTypeLength( output );

		if ( outputLen > ( data.outputMax || 0 ) || this.getType( builder, output ) ) {

			data.outputMax = outputLen;
			data.output = output;

		}

	},

	setName: function ( name ) {

		this.name = name;

		return this;

	},

	getName: function ( /* builder */ ) {

		return this.name;

	},

	getType: function ( builder, output ) {

		return output === 'sampler2D' || output === 'samplerCube' ? output : this.type;

	},

	getJSONNode: function ( meta ) {

		var isRootObject = ( meta === undefined || typeof meta === 'string' );

		if ( ! isRootObject && meta.nodes[ this.uuid ] !== undefined ) {

			return meta.nodes[ this.uuid ];

		}

	},

	copy: function ( source ) {

		if ( source.name !== undefined ) this.name = source.name;

		if ( source.userData !== undefined ) this.userData = JSON.parse( JSON.stringify( source.userData ) );

		return this;

	},

	createJSONNode: function ( meta ) {

		var isRootObject = ( meta === undefined || typeof meta === 'string' );

		var data = {};

		if ( typeof this.nodeType !== "string" ) throw new Error( "Node does not allow serialization." );

		data.uuid = this.uuid;
		data.nodeType = this.nodeType;

		if ( this.name !== "" ) data.name = this.name;

		if ( JSON.stringify( this.userData ) !== '{}' ) data.userData = this.userData;

		if ( ! isRootObject ) {

			meta.nodes[ this.uuid ] = data;

		}

		return data;

	},

	toJSON: function ( meta ) {

		return this.getJSONNode( meta ) || this.createJSONNode( meta );

	}

};

export { Node };
