import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Vector3 } from '../math/Vector3.js';

const _cameraWorldPosition = /*@__PURE__*/ new Vector3();

function createCirclesGeometry() {

	const geometry = new BufferGeometry();
	const positions = [];
	const segments = 32;

	for ( let i = 0, j = 1; i < segments; i ++, j ++ ) {

		const p1 = ( i / segments ) * Math.PI * 2;
		const p2 = ( j / segments ) * Math.PI * 2;

		// XY plane circle
		positions.push( Math.cos( p1 ), Math.sin( p1 ), 0 );
		positions.push( Math.cos( p2 ), Math.sin( p2 ), 0 );

		// XZ plane circle
		positions.push( Math.cos( p1 ), 0, Math.sin( p1 ) );
		positions.push( Math.cos( p2 ), 0, Math.sin( p2 ) );

		// YZ plane circle
		positions.push( 0, Math.cos( p1 ), Math.sin( p1 ) );
		positions.push( 0, Math.cos( p2 ), Math.sin( p2 ) );

	}

	geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

	return geometry;

}

/**
 * This displays a helper object consisting of three orthogonal circles
 * for visualizing an instance of {@link PointLight}.
 * The circles maintain constant screen-space size regardless of distance.
 *
 * ```js
 * const pointLight = new THREE.PointLight( 0xff0000, 1 );
 * pointLight.position.set( 10, 10, 10 );
 * scene.add( pointLight );
 *
 * const pointLightHelper = new THREE.PointLightHelper( pointLight );
 * scene.add( pointLightHelper );
 * ```
 *
 * @augments LineSegments
 */
class PointLightHelper extends LineSegments {

	/**
	 * Constructs a new point light helper.
	 *
	 * @param {PointLight} light - The light to be visualized.
	 * @param {number} [size=1] - The size of the helper.
	 */
	constructor( light, size = 1 ) {

		const geometry = createCirclesGeometry();
		const material = new LineBasicMaterial( { fog: false, toneMapped: false } );

		super( geometry, material );

		// Range/distance circles
		const rangeGeometry = createCirclesGeometry();
		const rangeMaterial = new LineBasicMaterial( { fog: false, toneMapped: false, opacity: 0.5, transparent: true } );
		this.range = new LineSegments( rangeGeometry, rangeMaterial );
		this.add( this.range );

		/**
		 * The light being visualized.
		 *
		 * @type {PointLight}
		 */
		this.light = light;

		/**
		 * The size of the helper.
		 *
		 * @type {number}
		 */
		this.size = size;

		/** @private */
		this._showRange = false;

		this.range.visible = false;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPointLightHelper = true;

		this.type = 'PointLightHelper';

		this.matrixAutoUpdate = false;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

		this.range.geometry.dispose();
		this.range.material.dispose();

	}

	/**
	 * Whether to show the range circles indicating the light's distance.
	 *
	 * @type {boolean}
	 * @default false
	 */
	get showRange() {

		return this._showRange;

	}

	set showRange( value ) {

		this._showRange = value;
		this.range.visible = value && this.light.distance > 0;

	}

	/**
	 * Updates the helper.
	 */
	update() {

	}

	onBeforeRender( renderer, scene, camera ) {

		this.light.updateWorldMatrix( true, false );
		this.position.setFromMatrixPosition( this.light.matrixWorld );

		// Calculate scale for constant screen-space size

		_cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );
		const distance = this.position.distanceTo( _cameraWorldPosition );

		if ( camera.isPerspectiveCamera ) {

			const fov = camera.fov * ( Math.PI / 180 );
			const scale = distance * Math.tan( fov / 2 ) * this.size * 0.04;
			this.scale.setScalar( scale );

		} else {

			const scale = this.size * 2 / camera.zoom;
			this.scale.setScalar( scale );

		}

		this.updateMatrix();
		this.matrixWorld.copy( this.matrix );

		// Update range circles based on light distance

		if ( this.range.visible ) {

			const lightDistance = this.light.distance;
			this.range.scale.setScalar( lightDistance / this.scale.x );
			this.range.updateMatrix();
			this.range.matrixWorld.multiplyMatrices( this.matrixWorld, this.range.matrix );

		}

	}

}


export { PointLightHelper };
