import { Camera } from '../cameras/Camera.js';
import { Vector3 } from '../math/Vector3.js';
import { LineSegments } from '../objects/LineSegments.js';
import { Color } from '../math/Color.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';

const _vector = /*@__PURE__*/ new Vector3();
const _camera = /*@__PURE__*/ new Camera();

/**
 *	- shows frustum, line of sight and up of the camera
 *	- suitable for fast updates
 * 	- based on frustum visualization in lightgl.js shadowmap example
 *		https://github.com/evanw/lightgl.js/blob/master/tests/shadowmap.html
 */

class CameraHelper extends LineSegments {

	constructor( camera, {
        colorNearFrustum = new Color( 0xffaa00 ),
        colorFarFrustum = new Color( 0xffaa00 ),
        colorSideFrustum = new Color( 0xffaa00 ),
        colorCone = new Color( 0xff0000 ),
        colorUp = new Color( 0x00aaff ),
        colorTarget = new Color( 0xffffff ),
        colorCross = new Color( 0x333333 ),
    } = {} ) {

		const geometry = new BufferGeometry();
		const material = new LineBasicMaterial( { color: 0xffffff, vertexColors: true, toneMapped: false } );

		const vertices = [];
		const colors = [];

		const pointMap = {};

		// near

		if (colorNearFrustum) {
            addLine( 'n1', 'n2', colorNearFrustum );
		    addLine( 'n2', 'n4', colorNearFrustum );
		    addLine( 'n4', 'n3', colorNearFrustum );
		    addLine( 'n3', 'n1', colorNearFrustum );
        }

		// far

        if (colorFarFrustum) {
		addLine( 'f1', 'f2', colorFarFrustum );
		addLine( 'f2', 'f4', colorFarFrustum );
		addLine( 'f4', 'f3', colorFarFrustum );
		addLine( 'f3', 'f1', colorFarFrustum );
        }

		// sides

        if (colorSideFrustum) {
		addLine( 'n1', 'f1', colorSideFrustum );
		addLine( 'n2', 'f2', colorSideFrustum );
		addLine( 'n3', 'f3', colorSideFrustum );
		addLine( 'n4', 'f4', colorSideFrustum );
        }

		// cone

        if (colorCone) {
		addLine( 'p', 'n1', colorCone );
		addLine( 'p', 'n2', colorCone );
		addLine( 'p', 'n3', colorCone );
		addLine( 'p', 'n4', colorCone );
        }

		// up

        if (colorUp) {
		addLine( 'u1', 'u2', colorUp );
		addLine( 'u2', 'u3', colorUp );
		addLine( 'u3', 'u1', colorUp );
        }

		// target

		if (colorTarget) {
        addLine( 'c', 't', colorTarget );
		addLine( 'p', 'c', colorTarget );
        }

		// cross

        if (colorCross) {
		addLine( 'cn1', 'cn2', colorCross );
		addLine( 'cn3', 'cn4', colorCross );

		addLine( 'cf1', 'cf2', colorCross );
		addLine( 'cf3', 'cf4', colorCross );
        }

		function addLine( a, b, color ) {

			addPoint( a, color );
			addPoint( b, color );

		}

		function addPoint( id, color ) {

			vertices.push( 0, 0, 0 );
			colors.push( color.r, color.g, color.b );

			if ( pointMap[ id ] === undefined ) {

				pointMap[ id ] = [];

			}

			pointMap[ id ].push( ( vertices.length / 3 ) - 1 );

		}

		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		super( geometry, material );

        this.colorOptions = {
            colorNearFrustum,
            colorFarFrustum,
            colorSideFrustum,
            colorCone,
            colorUp,
            colorTarget,
            colorCross,
        }

		this.type = 'CameraHelper';

		this.camera = camera;
		if ( this.camera.updateProjectionMatrix ) this.camera.updateProjectionMatrix();

		this.matrix = camera.matrixWorld;
		this.matrixAutoUpdate = false;

		this.pointMap = pointMap;

		this.update();

	}

	update() {

		const geometry = this.geometry;
		const pointMap = this.pointMap;

		const w = 1, h = 1;

		// we need just camera projection matrix inverse
		// world matrix must be identity

		_camera.projectionMatrixInverse.copy( this.camera.projectionMatrixInverse );

		// center / target

        if (this.colorOptions.colorTarget) {
		setPoint( 'c', pointMap, geometry, _camera, 0, 0, - 1 );
		setPoint( 't', pointMap, geometry, _camera, 0, 0, 1 );
        }

		// near

        if (this.colorOptions.colorNearFrustum) {
		setPoint( 'n1', pointMap, geometry, _camera, - w, - h, - 1 );
		setPoint( 'n2', pointMap, geometry, _camera, w, - h, - 1 );
		setPoint( 'n3', pointMap, geometry, _camera, - w, h, - 1 );
		setPoint( 'n4', pointMap, geometry, _camera, w, h, - 1 );
        }

		// far

        if (this.colorOptions.colorFarFrustum) {
		setPoint( 'f1', pointMap, geometry, _camera, - w, - h, 1 );
		setPoint( 'f2', pointMap, geometry, _camera, w, - h, 1 );
		setPoint( 'f3', pointMap, geometry, _camera, - w, h, 1 );
		setPoint( 'f4', pointMap, geometry, _camera, w, h, 1 );
        }

		// up
        if (this.colorOptions.colorUp) {
		setPoint( 'u1', pointMap, geometry, _camera, w * 0.7, h * 1.1, - 1 );
		setPoint( 'u2', pointMap, geometry, _camera, - w * 0.7, h * 1.1, - 1 );
		setPoint( 'u3', pointMap, geometry, _camera, 0, h * 2, - 1 );
        }

		// cross
        if (this.colorOptions.colorCross) {
		setPoint( 'cf1', pointMap, geometry, _camera, - w, 0, 1 );
		setPoint( 'cf2', pointMap, geometry, _camera, w, 0, 1 );
		setPoint( 'cf3', pointMap, geometry, _camera, 0, - h, 1 );
		setPoint( 'cf4', pointMap, geometry, _camera, 0, h, 1 );

		setPoint( 'cn1', pointMap, geometry, _camera, - w, 0, - 1 );
		setPoint( 'cn2', pointMap, geometry, _camera, w, 0, - 1 );
		setPoint( 'cn3', pointMap, geometry, _camera, 0, - h, - 1 );
		setPoint( 'cn4', pointMap, geometry, _camera, 0, h, - 1 );
        }

		geometry.getAttribute( 'position' ).needsUpdate = true;

	}

	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}


function setPoint( point, pointMap, geometry, camera, x, y, z ) {

	_vector.set( x, y, z ).unproject( camera );

	const points = pointMap[ point ];

	if ( points !== undefined ) {

		const position = geometry.getAttribute( 'position' );

		for ( let i = 0, l = points.length; i < l; i ++ ) {

			position.setXYZ( points[ i ], _vector.x, _vector.y, _vector.z );

		}

	}

}

export { CameraHelper };
