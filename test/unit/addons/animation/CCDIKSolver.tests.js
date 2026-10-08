import { CCDIKSolver } from '../../../../examples/jsm/animation/CCDIKSolver.js';
import { Bone, BufferGeometry, Float32BufferAttribute, MeshBasicMaterial, Quaternion, Skeleton, SkinnedMesh, Uint16BufferAttribute, Vector3 } from 'three';

const EPS = 1e-6;
const PI = Math.PI;

function createChain( { axis = 'x', order = 'XYZ', initial = PI - 0.1, target = PI - 0.2, min, max, blendFactor = 1, limitation } = {} ) {

	const direction = new Vector3();
	direction[ axis ] = 1;
	const position = axis === 'z' ? new Vector3( 1, 0, 0 ) : new Vector3( 0, 0, 1 );
	const link = new Bone();
	const effector = new Bone();
	const targetBone = new Bone();
	link.rotation.order = order;
	link.rotation[ axis ] = initial;
	effector.position.copy( position );
	link.add( effector );
	targetBone.position.copy( position ).applyAxisAngle( direction, target );
	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( position.clone().applyAxisAngle( direction, initial ).toArray(), 3 ) );
	geometry.setAttribute( 'skinIndex', new Uint16BufferAttribute( [ 1, 0, 0, 0 ], 4 ) );
	geometry.setAttribute( 'skinWeight', new Float32BufferAttribute( [ 1, 0, 0, 0 ], 4 ) );
	const mesh = new SkinnedMesh( geometry, new MeshBasicMaterial() );
	mesh.add( link, targetBone );
	mesh.bind( new Skeleton( [ targetBone, link, effector ] ) );
	mesh.updateMatrixWorld( true );
	const rotationMin = min === undefined ? undefined : new Vector3();
	const rotationMax = max === undefined ? undefined : new Vector3();
	if ( rotationMin ) rotationMin[ axis ] = min;
	if ( rotationMax ) rotationMax[ axis ] = max;
	const ik = { target: 0, effector: 2, links: [ { index: 1, rotationMin, rotationMax, limitation } ], blendFactor };
	const solver = new CCDIKSolver( mesh, [ ik ] );
	return { solver, mesh, link, effector, direction, position };

}

function checkPose( assert, chain, angle, message ) {

	const expected = chain.position.clone().applyAxisAngle( chain.direction, angle );
	const actual = chain.effector.getWorldPosition( new Vector3() );
	assert.ok( actual.distanceTo( expected ) < EPS, `${ message }: effector reaches the expected pose` );
	const expectedQuaternion = new Quaternion().setFromAxisAngle( chain.direction, angle );
	assert.ok( chain.link.quaternion.angleTo( expectedQuaternion ) < EPS, `${ message }: rotation matches the expected quaternion` );
	const vertex = new Vector3().fromBufferAttribute( chain.mesh.geometry.attributes.position, 0 );
	chain.mesh.applyBoneTransform( 0, vertex );
	assert.ok( vertex.distanceTo( expected ) < EPS, `${ message }: skinning agrees with the effector` );

}

function disposeChain( chain ) {

	chain.mesh.geometry.dispose();
	chain.mesh.material.dispose();
	chain.mesh.skeleton.dispose();

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Animation', () => {

		QUnit.module( 'CCDIKSolver', () => {

			QUnit.test( 'wrapped limits on outer Euler axes', ( assert ) => {

				for ( const order of [ 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX' ] ) {

					for ( const axis of [ order[ 0 ].toLowerCase(), order[ 2 ].toLowerCase() ] ) {

						for ( const sign of [ - 1, 1 ] ) {

							const min = sign < 0 ? - 5 * PI / 4 : 3 * PI / 4;
							const max = min + PI / 2;
							const target = sign * ( PI + 0.2 );
							const chain = createChain( { axis, order, initial: sign * ( PI - 0.1 ), target, min, max } );
							chain.solver.update();
							checkPose( assert, chain, target, `${ order } ${ axis } ${ sign }` );
							disposeChain( chain );

						}

					}

				}

			} );

			QUnit.test( 'clamp to the nearer wrapped boundary', ( assert ) => {

				for ( const min of [ - 5 * PI / 4, 3 * PI / 4 ] ) {

					for ( const target of [ PI / 2, - PI / 2 ] ) {

						const chain = createChain( { target, min, max: min + PI / 2 } );
						const expected = target > 0 ? 3 * PI / 4 : - 3 * PI / 4;
						for ( let i = 0; i < 3; i ++ ) {

							chain.solver.update();
							checkPose( assert, chain, expected, `target ${ target }, update ${ i }` );

						}

						disposeChain( chain );

					}

				}

			} );

			QUnit.test( 'equivalent limits shifted by a full turn', ( assert ) => {

				const chain = createChain( { target: PI - 0.2, min: 11 * PI / 4, max: 13 * PI / 4 } );
				chain.solver.update();
				checkPose( assert, chain, PI - 0.2, 'shifted limits' );
				disposeChain( chain );

			} );

			QUnit.test( 'ordinary limits retain linear clamping', ( assert ) => {

				for ( const target of [ - 0.2, 0.2, - 1, 1, - 3 ] ) {

					const min = 0;
					const max = PI / 4;
					const chain = createChain( { initial: 0.1, target, min, max } );
					chain.solver.update();
					checkPose( assert, chain, Math.max( min, Math.min( max, target ) ), `ordinary target ${ target }` );
					disposeChain( chain );

				}

			} );

			QUnit.test( 'unbounded and single-sided limits', ( assert ) => {

				for ( const limits of [ {}, { min: - Infinity, max: Infinity }, { min: - 5 * PI / 4 }, { max: 5 * PI / 4 } ] ) {

					const chain = createChain( { initial: 0.1, target: 0.2, ...limits } );
					chain.solver.update();
					checkPose( assert, chain, 0.2, 'unbounded or single-sided' );
					disposeChain( chain );

				}

			} );

			QUnit.test( 'inverted limits retain the maximum', ( assert ) => {

				const chain = createChain( { initial: 0.1, target: 0.2, min: 5, max: - 5 } );
				chain.solver.update();
				checkPose( assert, chain, - 5, 'inverted limits' );
				disposeChain( chain );

			} );

			QUnit.test( 'blending a wrapped result', ( assert ) => {

				const chain = createChain( { min: - 5 * PI / 4, max: - 3 * PI / 4, blendFactor: 0.5 } );
				chain.solver.update();
				checkPose( assert, chain, PI - 0.15, 'half blend' );
				disposeChain( chain );

			} );

			QUnit.test( 'limitation preserves negative rotations', ( assert ) => {

				const chain = createChain( { initial: 0.1, target: - 0.2, min: - PI / 4, max: PI / 4, limitation: new Vector3( 1, 0, 0 ) } );
				chain.solver.update();
				checkPose( assert, chain, - 0.2, 'negative limitation' );
				disposeChain( chain );

			} );

		} );

	} );

} );
