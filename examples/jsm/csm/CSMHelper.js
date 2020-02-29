import { Group, Mesh, LineSegments, BufferGeometry, LineBasicMaterial, Box3Helper, Box3, PlaneBufferGeometry, MeshBasicMaterial } from '../../../build/three.module.js';

class CSMHelper extends Group {

	constructor( csm ) {

		super();
		this.csm = csm;

		const indices = new Uint16Array( [ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ] );
		const positions = new Float32Array( 24 );
		const frustumGeometry = new BufferGeometry();
		frustumGeometry.setIndex( new BufferAttribute( indices, 1 ) );
		frustumGeometry.setAttribute( 'position', new BufferAttribute( positions, 3, false ) );
		this.add( frustumGeometry );

		this.frustumLines = new LineSegments( frustumGeometry, new LineBasicMaterial() );
		this.cascadeLines = [];
		this.cascadePlanes = [];
		this.shadowLines = [];

	}

	update() {

		const csm = this.csm;
		const cascades = csm.cascades;
		const mainFrustum = csm.mainFrustum;
		const mainFrustumPositions = mainFrustum.geometry.positions;
		const frustums = csm.frustums;
		const lights = csm.lights;

		const frustumLines = this.frustumLines;
		const cascadeLines = this.cascadeLines;
		const cascadePlanes = this.cascadePlanes;
		const shadowLines = this.shadowLines;

		while( cascadeLines.length > cascades ) {

			this.remove( cascadeLines.pop() );
			this.remove( cascadePlanes.pop() );
			this.remove( shadowLines.pop() );

		}

		while( cascadeLines.length < cascades ) {

			const cascadeLine = new Box3Helper( new Box3(), 0xffffff );
			const cascadePlane = new Mesh( new PlaneBufferGeometry(), new MeshBasicMaterial( { transparent: true, opacity: 0.1 } ) );
			const shadowLineGroup = new Group();
			const shadowLine = new Box3Helper( new Box3(), 0xffff00 );
			shadowLineGroup.add( shadowLine );

			this.add( cascadeLine );
			this.add( cascadePlane );
			this.add( shadowLine );

			cascadeLines.push( cascadeLine );
			cascadePlanes.push( cascadePlane );
			shadowLines.push( shadowLineGroup );

		}

		for ( let i = 0; i < cascades; i ++ ) {

			const frustum = frustums[ i ];
			const light = lights[ i ];
			const shadowCam = light.shadow.camera;
			const farVerts = frustum.vertices.far;

			const cascadeLine = cascadeLines[ i ];
			const cascadePlane = cascadePlanes[ i ];
			const shadowLineGroup = shadowLines[ i ];
			const shadowLine = shadowLineGroup.children[ 0 ];

			cascadeLine.box.min.copy( farVerts[ 2 ] );
			cascadeLine.box.max.copy( farVerts[ 0 ] );

			cascadePlane.position.addVectors( farVerts[ 0 ], farVerts[ 2 ] );
			cascadePlane.position.multiplyScalar( 0.5 );
			cascadePlane.scale.subVectors( farVerts[ 0 ], farVerts[ 2 ] );

			this.remove( shadowLineGroup );
			shadowCam.matrixWorld.decompose( shadowLineGroup.position, shadowLineGroup.quaternion, shadowLineGroup.scale );
			this.attach( shadowLineGroup );

			shadowLine.box.min.set( shadowCam.bottom, shadowCam.left, shadowCam.near );
			shadowLine.box.max.set( shadowCam.top, shadowCam.right, shadowCam.far );

			cascadeLine.update();
			shadowLine.update();

		}

		mainFrustumPositions.setXYZ( 0, farVerts[ 0 ] );
		mainFrustumPositions.setXYZ( 1, farVerts[ 3 ] );
		mainFrustumPositions.setXYZ( 2, farVerts[ 2 ] );
		mainFrustumPositions.setXYZ( 3, farVerts[ 1 ] );

		mainFrustumPositions.setXYZ( 4, nearVerts[ 0 ] );
		mainFrustumPositions.setXYZ( 5, nearVerts[ 3 ] );
		mainFrustumPositions.setXYZ( 6, nearVerts[ 2 ] );
		mainFrustumPositions.setXYZ( 7, nearVerts[ 1 ] );
		mainFrustumPositions.needsUpdate = true;

	}

}

export { CSMHelper };
