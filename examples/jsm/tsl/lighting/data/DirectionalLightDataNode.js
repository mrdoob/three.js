import { Color, Node, Vector3 } from 'three/webgpu';
import { Loop, NodeUpdateType, renderGroup, uniform, uniformArray, vec3 } from 'three/tsl';

const _lightPosition = /*@__PURE__*/ new Vector3();
const _targetPosition = /*@__PURE__*/ new Vector3();

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

			this._colors.push( new Color() );
			this._directions.push( new Vector3() );

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

			this._colors[ i ].copy( light.color ).multiplyScalar( light.intensity );

			_lightPosition.setFromMatrixPosition( light.matrixWorld );
			_targetPosition.setFromMatrixPosition( light.target.matrixWorld );

			this._directions[ i ].subVectors( _lightPosition, _targetPosition ).transformDirection( camera.matrixWorldInverse );

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
