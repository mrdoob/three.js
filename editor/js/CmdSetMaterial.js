/**
 * Created by Daniel on 21.07.15.
 */

CmdSetMaterial = function ( object, newMaterial ) {

	Cmd.call( this );

	this.type = 'CmdSetMaterial';
	this.updatable = true;

	this.object = object;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

	this.newMaterial = newMaterial;	// only needed for update(cmd)

	this.oldMaterialJSON = object !== undefined ? object.material.toJSON() : undefined;
	this.newMaterialJSON = newMaterial !== undefined ? newMaterial.toJSON() : undefined;


};

CmdSetMaterial.prototype = {

	execute: function () {

		this.object.geometry.dispose();
		this.object.geometry = this.parseGeometry( this.newMaterialJSON );
		this.object.geometry.computeBoundingSphere();

		this.editor.signals.geometryChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	undo: function () {

		this.object.geometry.dispose();
		this.object.geometry = this.parseGeometry( this.oldMaterialJSON );
		this.object.geometry.computeBoundingSphere();

		this.editor.signals.geometryChanged.dispatch( this.object );
		this.editor.signals.sceneGraphChanged.dispatch();

	},

	update: function ( cmd ) {

		this.newMaterialJSON = cmd.newGeometry.toJSON();

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.oldMaterialJSON = this.oldMaterialJSON;
		output.newMaterialJSON = this.newMaterialJSON;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.objectUuid = json.objectUuid;

		this.oldMaterialJSON = json.oldMaterialJSON;
		this.newMaterialJSON = json.newMaterialJSON;

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
