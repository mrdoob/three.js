import { Mesh } from './Mesh.js';

/**
 * @author simon paris / https://github.com/simon-paris
 */

function OcclusionQueryMesh() {

	Mesh.apply( this, arguments );

	this.type = 'OcclusionQueryMesh';

	this.occlusionQueryCallback = null;
	this.cameraFilter = null;
	this.maxAliveQueries = 1;

}

OcclusionQueryMesh.prototype = Object.assign( Object.create( Mesh.prototype ), {

	constructor: OcclusionQueryMesh,

	isOcclusionQueryMesh: true,

	pollQueries: function () {

		this.dispatchEvent( { type: 'pollQueries' } );

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	},

} );


export { OcclusionQueryMesh };
