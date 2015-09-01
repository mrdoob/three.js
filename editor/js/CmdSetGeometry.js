/**
 * Created by Daniel on 21.07.15.
 */

CmdSetGeometry = function ( object, newGeometry ) {

	Cmd.call( this );

	this.type = 'CmdSetGeometry';
	this.updatable = true;

	this.object = object;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

	this.newGeometry = newGeometry;	// only needed for update(cmd)

	this.oldGeometryJSON = object !== undefined ? object.geometry.toJSON() : undefined;
	this.newGeometryJSON = newGeometry !== undefined ? newGeometry.toJSON() : undefined;


};

CmdSetGeometry.prototype = {

	execute: function () {

		this.object.geometry.dispose();
		this.object.geometry = this.parseGeometry( this.newGeometryJSON );
		this.object.geometry.computeBoundingSphere();

		this.editor.signals.geometryChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		this.object.geometry.dispose();
		this.object.geometry = this.parseGeometry( this.oldGeometryJSON );
		this.object.geometry.computeBoundingSphere();

		this.editor.signals.geometryChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	update: function ( cmd ) {

		this.newGeometryJSON = cmd.newGeometry.toJSON();

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.oldGeometryJSON = this.oldGeometryJSON;
		output.newGeometryJSON = this.newGeometryJSON;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.objectUuid = json.objectUuid;

		this.oldGeometryJSON = json.oldGeometryJSON;
		this.newGeometryJSON = json.newGeometryJSON;

	},

	parseGeometry: function ( data ) {

		var geometryLoader = new THREE.JSONLoader();
		var bufferGeometryLoader = new THREE.BufferGeometryLoader();

		var geometry;

		switch ( data.type ) {

			case 'PlaneGeometry':
			case 'PlaneBufferGeometry':

				geometry = new THREE[ data.type ](
					data.width,
					data.height,
					data.widthSegments,
					data.heightSegments
				);

				break;

			case 'BoxGeometry':
			case 'CubeGeometry': // backwards compatible

				geometry = new THREE.BoxGeometry(
					data.width,
					data.height,
					data.depth,
					data.widthSegments,
					data.heightSegments,
					data.depthSegments
				);

				break;

			case 'CircleGeometry':

				geometry = new THREE.CircleGeometry(
					data.radius,
					data.segments
				);

				break;

			case 'CylinderGeometry':

				geometry = new THREE.CylinderGeometry(
					data.radiusTop,
					data.radiusBottom,
					data.height,
					data.radialSegments,
					data.heightSegments,
					data.openEnded
				);

				break;

			case 'SphereGeometry':

				geometry = new THREE.SphereGeometry(
					data.radius,
					data.widthSegments,
					data.heightSegments,
					data.phiStart,
					data.phiLength,
					data.thetaStart,
					data.thetaLength
				);

				break;

			case 'IcosahedronGeometry':

				geometry = new THREE.IcosahedronGeometry(
					data.radius,
					data.detail
				);

				break;

			case 'TorusGeometry':

				geometry = new THREE.TorusGeometry(
					data.radius,
					data.tube,
					data.radialSegments,
					data.tubularSegments,
					data.arc
				);

				break;

			case 'TorusKnotGeometry':

				geometry = new THREE.TorusKnotGeometry(
					data.radius,
					data.tube,
					data.radialSegments,
					data.tubularSegments,
					data.p,
					data.q,
					data.heightScale
				);

				break;

			case 'BufferGeometry':

				geometry = bufferGeometryLoader.parse( data );

				break;

			case 'Geometry':

				geometry = geometryLoader.parse( data.data ).geometry;

				break;

		}
		geometry.uuid = data.uuid;
		geometry.name = data.name !== undefined ? data.name : '';
		return geometry;

	}

};
