import { colorCopy, colorCreate, colorSet } from '../math/ColorFunctions.js';
import { vec3Create, vec3Negate, vec3SetFromMatrixPosition } from '../math/Vector3Functions.js';
import { Object3D } from '../core/Object3D.js';
import { Mesh } from '../objects/Mesh.js';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { OctahedronGeometry } from '../geometries/OctahedronGeometry.js';
import { BufferAttribute } from '../core/BufferAttribute.js';

const _vector = /*@__PURE__*/ vec3Create();
const _color1 = /*@__PURE__*/ colorCreate();
const _color2 = /*@__PURE__*/ colorCreate();

/**
 * Creates a visual aid consisting of a spherical mesh for a
 * given {@link HemisphereLight}.
 *
 * When the hemisphere light is transformed or its light properties are changed,
 * it's necessary to call the `update()` method of the respective helper.
 *
 * ```js
 * const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
 * const helper = new THREE.HemisphereLightHelper( light, 5 );
 * scene.add( helper );
 * ```
 *
 * @augments Object3D
 */
class HemisphereLightHelper extends Object3D {

	/**
	 * Constructs a new hemisphere light helper.
	 *
	 * @param {HemisphereLight} light - The light to be visualized.
	 * @param {number} [size=1] - The size of the mesh used to visualize the light.
	 * @param {number|Color|string} [color] - The helper's color. If not set, the helper will take
	 * the color of the light.
	 */
	constructor( light, size, color ) {

		super();

		/**
		 * The light being visualized.
		 *
		 * @type {HemisphereLight}
		 */
		this.light = light;

		this.matrix = light.matrixWorld;
		this.matrixAutoUpdate = false;

		/**
		 * The color parameter passed in the constructor.
		 * If not set, the helper will take the color of the light.
		 *
		 * @type {number|Color|string}
		 */
		this.color = color;

		this.type = 'HemisphereLightHelper';

		const geometry = new OctahedronGeometry( size );
		geometry.rotateY( Math.PI * 0.5 );

		this.material = new MeshBasicMaterial( { wireframe: true, fog: false, toneMapped: false } );
		if ( this.color === undefined ) this.material.vertexColors = true;

		const position = geometry.getAttribute( 'position' );
		const colors = new Float32Array( position.count * 3 );

		geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) );

		this.add( new Mesh( geometry, this.material ) );

		this.update();

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		super.dispose();

		this.children[ 0 ].geometry.dispose();
		this.children[ 0 ].material.dispose();

	}

	/**
	 * Updates the helper to match the position and direction of the
	 * light being visualized.
	 */
	update() {

		const mesh = this.children[ 0 ];

		if ( this.color !== undefined ) {

			colorSet( this.color, undefined, undefined, this.material.color );

		} else {

			const colors = mesh.geometry.getAttribute( 'color' );

			colorCopy( this.light.color, _color1 );
			colorCopy( this.light.groundColor, _color2 );

			for ( let i = 0, l = colors.count; i < l; i ++ ) {

				const color = ( i < ( l / 2 ) ) ? _color1 : _color2;

				colors.setXYZ( i, color.r, color.g, color.b );

			}

			colors.needsUpdate = true;

		}

		this.matrixWorldNeedsUpdate = true;

		this.light.updateWorldMatrix( true, false );

		vec3SetFromMatrixPosition( this.light.matrixWorld, _vector );
		vec3Negate( _vector, _vector );
		mesh.lookAt( _vector.x, _vector.y, _vector.z );

	}

}


export { HemisphereLightHelper };
