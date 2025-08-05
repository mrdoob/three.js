import { LineSegments } from '../objects/LineSegments.js';
import { Matrix4 } from '../math/Matrix4.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Color } from '../math/Color.js';
import { Vector3 } from '../math/Vector3.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';

const _vector = /*@__PURE__*/ new Vector3();
const _boneMatrix = /*@__PURE__*/ new Matrix4();
const _matrixWorldInv = /*@__PURE__*/ new Matrix4();

/**
 * A helper object to assist with visualizing a {@link Skeleton}.
 *
 * ```js
 * const helper = new THREE.SkeletonHelper( skinnedMesh );
 * scene.add( helper );
 * ```
 *
 * @augments LineSegments
 */
class SkeletonHelper extends LineSegments {

	/**
	 * Constructs a new skeleton helper.
	 *
	 * @param {Object3D} object -  Usually an instance of {@link SkinnedMesh}. However, any 3D object
	 * can be used if it represents a hierarchy of bones (see {@link Bone}).
	 */
	constructor( object ) {

		const bones = getBoneList( object );

		const geometry = new BufferGeometry();

		const vertices = [];
		const colors = [];

		for ( let i = 0; i < bones.length; i ++ ) {

			const bone = bones[ i ];

			if ( bone.parent && bone.parent.isBone ) {

				vertices.push( 0, 0, 0 );
				vertices.push( 0, 0, 0 );
				colors.push( 0, 0, 0 );
				colors.push( 0, 0, 0 );

			}

		}

		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		const material = new LineBasicMaterial( { vertexColors: true, depthTest: false, depthWrite: false, toneMapped: false, transparent: true } );

		super( geometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSkeletonHelper = true;

		this.type = 'SkeletonHelper';

		/**
		 * The object being visualized.
		 *
		 * @type {Object3D}
		 */
		this.root = object;

		/**
		 * The list of bones that the helper visualizes.
		 *
		 * @type {Array<Bone>}
		 */
		this.bones = bones;

		this.matrix = object.matrixWorld;
		this.matrixAutoUpdate = false;

		// colors

		const color1 = new Color( 0x0000ff );
		const color2 = new Color( 0x00ff00 );

		this.setColors( color1, color2 );

	}

	updateMatrixWorld( force ) {

		const bones = this.bones;

		const geometry = this.geometry;
		const position = geometry.getAttribute( 'position' );

		_matrixWorldInv.copy( this.root.matrixWorld ).invert();

		for ( let i = 0, j = 0; i < bones.length; i ++ ) {

			const bone = bones[ i ];

			if ( bone.parent && bone.parent.isBone ) {

				_boneMatrix.multiplyMatrices( _matrixWorldInv, bone.matrixWorld );
				_vector.setFromMatrixPosition( _boneMatrix );
				position.setXYZ( j, _vector.x, _vector.y, _vector.z );

				_boneMatrix.multiplyMatrices( _matrixWorldInv, bone.parent.matrixWorld );
				_vector.setFromMatrixPosition( _boneMatrix );
				position.setXYZ( j + 1, _vector.x, _vector.y, _vector.z );

				j += 2;

			}

		}

		geometry.getAttribute( 'position' ).needsUpdate = true;

		super.updateMatrixWorld( force );

	}

	/**
	 * Defines the colors of the helper.
	 *
	 * @param {Color} color1 - The first line color for each bone.
	 * @param {Color} color2 - The second line color for each bone.
	 * @return {SkeletonHelper} A reference to this helper.
	 */
	setColors( color1, color2 ) {

		const geometry = this.geometry;
		const colorAttribute = geometry.getAttribute( 'color' );

		for ( let i = 0; i < colorAttribute.count; i += 2 ) {

			colorAttribute.setXYZ( i, color1.r, color1.g, color1.b );
			colorAttribute.setXYZ( i + 1, color2.r, color2.g, color2.b );

		}

		colorAttribute.needsUpdate = true;

		return this;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}


function getBoneList( object ) {

	const boneList = [];

	if ( object.isBone === true ) {

		boneList.push( object );

	}

	for ( let i = 0; i < object.children.length; i ++ ) {

		boneList.push( ...getBoneList( object.children[ i ] ) );

	}

	return boneList;

}


export { SkeletonHelper };
