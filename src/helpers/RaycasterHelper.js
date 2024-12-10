import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { InstancedMesh } from '../objects/InstancedMesh.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Line } from '../objects/Line.js';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { Mesh } from '../objects/Mesh.js';
import { Object3D } from '../core/Object3D.js';
import { SphereGeometry } from '../geometries/SphereGeometry.js';
import { Vector3 } from '../math/Vector3.js';

const _o = /*@__PURE__*/ new Object3D();
const _v = /*@__PURE__*/ new Vector3();

class RaycasterHelper extends Object3D {

	constructor( raycaster, numberOfHitsToVisualize = 20, sphereRadius = .04, nearFarSize = .1, colors = {
		near: 0xffffff,
		far: 0xffffff,
		originToNear: 0x333333,
		nearToFar: 0xffffff,
		origin: [ 0x0eec82, 0xff005b ],
	} ) {

		super();
		this.raycaster = raycaster;
		this.numberOfHitsToVisualize = numberOfHitsToVisualize;

		this.hits = [];

		this.colors = colors;

		this.origin = new Mesh(
			new SphereGeometry( sphereRadius, 32 ),
			new MeshBasicMaterial()
		);
		this.origin.name = 'RaycasterHelper_origin';
		this.origin.raycast = () => null;

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( [
			- nearFarSize, nearFarSize, 0,
			nearFarSize, nearFarSize, 0,
			nearFarSize, - nearFarSize, 0,
			- nearFarSize, - nearFarSize, 0,
			- nearFarSize, nearFarSize, 0
		], 3 ) );

		this.near = new Line( geometry, new LineBasicMaterial() );
		this.near.name = 'RaycasterHelper_near';
		this.near.raycast = () => null;

		this.far = new Line( geometry, new LineBasicMaterial() );
		this.far.name = 'RaycasterHelper_far';
		this.far.raycast = () => null;

		this.nearToFar = new Line( new BufferGeometry(), new LineBasicMaterial() );
		this.nearToFar.name = 'RaycasterHelper_nearToFar';
		this.nearToFar.raycast = () => null;

		this.nearToFar.geometry.setFromPoints( [ _v, _v ] );

		this.originToNear = new Line(
			this.nearToFar.geometry.clone(),
			new LineBasicMaterial()
		);
		this.originToNear.name = 'RaycasterHelper_originToNear';
		this.originToNear.raycast = () => null;

		this.hitPoints = new InstancedMesh(
			new SphereGeometry( sphereRadius ),
			new MeshBasicMaterial(),
			this.numberOfHitsToVisualize
		);
		this.hitPoints.name = 'RaycasterHelper_hits';
		this.hitPoints.raycast = () => null;

		this.add( this.nearToFar );
		this.add( this.originToNear );

		this.add( this.near );
		this.add( this.far );

		this.add( this.origin );
		this.add( this.hitPoints );

		this.setColors();

	}

	setColors( colors ) {

		const _colors = {
			...this.colors,
			...colors,
		};

		this.near.material.color.set( _colors.near );
		this.far.material.color.set( _colors.far );
		this.nearToFar.material.color.set( _colors.nearToFar );
		this.originToNear.material.color.set( _colors.originToNear );

	}

	update() {

		const origin = this.raycaster.ray.origin;
		const direction = this.raycaster.ray.direction;

		this.origin.position.copy( origin );

		this.near.position
			.copy( origin )
			.add( direction.clone().multiplyScalar( this.raycaster.near ) );

		this.far.position
			.copy( origin )
			.add( direction.clone().multiplyScalar( this.raycaster.far ) );

		this.far.lookAt( origin );
		this.near.lookAt( origin );

		let pos = this.nearToFar.geometry.getAttribute( 'position' );
		pos.set( [ ...this.near.position, ...this.far.position ] );
		pos.needsUpdate = true;

		pos = this.originToNear.geometry.getAttribute( 'position' );
		pos.set( [ ...origin, ...this.near.position ] );
		pos.needsUpdate = true;

		/**
		 * Update hit points visualization
		 */

		const hits = Array.isArray( this.hits ) ? this.hits : [];

		for ( let i = 0; i < this.numberOfHitsToVisualize; i ++ ) {

			const hit = hits[ i ];

			if ( hit ) {

				const { point } = hit;
				_o.position.copy( point );
				_o.scale.setScalar( 1 );

			} else {

				_o.scale.setScalar( 0 );

			}

			_o.updateMatrix();

			this.hitPoints.setMatrixAt( i, _o.matrix );

		}

		this.hitPoints.instanceMatrix.needsUpdate = true;

		/**
		 * Update the color of the origin based on wether there are hits.
		 */
		this.origin.material.color.set(
			this.hits.length > 0 ? this.colors.origin[ 0 ] : this.colors.origin[ 1 ]
		);

	}

	dispose() {

		this.origin.geometry.dispose();
		this.origin.material.dispose();
		this.near.geometry.dispose();
		this.near.material.dispose();
		this.far.geometry.dispose();
		this.far.material.dispose();
		this.nearToFar.geometry.dispose();
		this.nearToFar.material.dispose();
		this.originToNear.geometry.dispose();
		this.originToNear.material.dispose();
		this.hitPoints.dispose();

	}

}

export { RaycasterHelper };
