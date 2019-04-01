/**
 * @author sunag / http://www.sunag.com.br/
 */

function Node( type ) {

	this.uuid = THREE.Math.generateUUID();

	this.name = "";

	this.type = type;

	this.userData = {};

}

Node.prototype = {

	constructor: Node,

	isNode: true,

	parse: function ( builder, settings ) {

		settings = settings || {};

		builder.parsing = true;

		this.build( builder.addFlow( settings.slot, settings.cache, settings.context ), 'v4' );

		builder.clearVertexNodeCode();
		builder.clearFragmentNodeCode();

		builder.removeFlow();

		builder.parsing = false;

	},

	parseAndBuildCode: function ( builder, output, settings ) {

		settings = settings || {};

		this.parse( builder, settings );

		return this.buildCode( builder, output, settings );

	},

	buildCode: function ( builder, output, settings ) {

		settings = settings || {};

		var data = { result: this.build( builder.addFlow( settings.slot, settings.cache, settings.context ), output ) };

		data.code = builder.clearNodeCode();

		builder.removeFlow();

		return data;

	},

	build: function ( builder, output, uuid ) {

		output = output || this.getType( builder, output );

		var data = builder.getNodeData( uuid || this );

		if ( builder.parsing ) {

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

	getName: function ( builder ) {

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
