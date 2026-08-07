import {
	Node,
	colorCreate,
	colorCopy,
	colorMultiplyScalar,
	vec3Create,
	vec3SetFromMatrixPosition,
	vec3SubVectors,
	vec3TransformDirection
} from 'three/webgpu';
import { Loop, NodeUpdateType, renderGroup, uniform, uniformArray, vec3 } from 'three/tsl';

const _lightPosition = /*@__PURE__*/ vec3Create();
const _targetPosition = /*@__PURE__*/ vec3Create();

const warn = ( message ) => {

	console.warn( `THREE.DirectionalLightDataNode: ${ message }` );

};

/**
 * Batched data node for directional lights in dynamic lighting mode.
 *
 * @augments Node
 */
class DirectionalLightDataNode extends Node {

	static get type() {

		return 'DirectionalLightDataNode';

	}

	constructor( maxCount = 8 ) {

		super();

		this.maxCount = maxCount;
		this._lights = [];
		this._colors = [];
		this._directions = [];

		for ( let i = 0; i < maxCount; i ++ ) {

			this._colors.push( colorCreate() );
			this._directions.push( vec3Create() );

		}

		this.colorsNode = uniformArray( this._colors, 'color' ).setGroup( renderGroup );
		this.directionsNode = uniformArray( this._directions, 'vec3' ).setGroup( renderGroup );
		this.countNode = uniform( 0, 'int' ).setGroup( renderGroup );
		this.updateType = NodeUpdateType.RENDER;

	}

	setLights( lights ) {

		if ( lights.length > this.maxCount ) {

			warn( `${ lights.length } lights exceed the configured max of ${ this.maxCount }. Excess lights are ignored.` );

		}

		this._lights = lights;

		return this;

	}

	update( { camera } ) {

		const count = Math.min( this._lights.length, this.maxCount );

		this.countNode.value = count;

		for ( let i = 0; i < count; i ++ ) {

			const light = this._lights[ i ];

			colorCopy( light.color, this._colors[ i ] );
			colorMultiplyScalar( this._colors[ i ], light.intensity, this._colors[ i ] );

			vec3SetFromMatrixPosition( light.matrixWorld, _lightPosition );
			vec3SetFromMatrixPosition( light.target.matrixWorld, _targetPosition );

			vec3SubVectors( _lightPosition, _targetPosition, this._directions[ i ] );
			vec3TransformDirection( this._directions[ i ], camera.matrixWorldInverse, this._directions[ i ] );

		}

	}

	setup( builder ) {

		const { lightingModel, reflectedLight } = builder.context;
		const dynDiffuse = vec3( 0 ).toVar( 'dynDirectionalDiffuse' );
		const dynSpecular = vec3( 0 ).toVar( 'dynDirectionalSpecular' );

		Loop( this.countNode, ( { i } ) => {

			const lightColor = this.colorsNode.element( i ).toVar();
			const lightDirection = this.directionsNode.element( i ).normalize().toVar();

			lightingModel.direct( {
				lightDirection,
				lightColor,
				lightNode: { light: {}, shadowNode: null },
				reflectedLight: { directDiffuse: dynDiffuse, directSpecular: dynSpecular }
			}, builder );

		} );

		reflectedLight.directDiffuse.addAssign( dynDiffuse );
		reflectedLight.directSpecular.addAssign( dynSpecular );

	}

}

export default DirectionalLightDataNode;
