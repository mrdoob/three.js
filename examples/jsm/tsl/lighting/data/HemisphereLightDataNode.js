import { Color, Node, Vector3 } from 'three/webgpu';
import { Loop, NodeUpdateType, mix, normalWorld, renderGroup, uniform, uniformArray } from 'three/tsl';

const warn = ( message ) => {

	console.warn( `THREE.HemisphereLightDataNode: ${ message }` );

};

/**
 * Batched data node for hemisphere lights in dynamic lighting mode.
 *
 * @augments Node
 */
class HemisphereLightDataNode extends Node {

	static get type() {

		return 'HemisphereLightDataNode';

	}

	constructor( maxCount = 4 ) {

		super();

		this.maxCount = maxCount;
		this._lights = [];
		this._skyColors = [];
		this._groundColors = [];
		this._directions = [];

		for ( let i = 0; i < maxCount; i ++ ) {

			this._skyColors.push( new Color() );
			this._groundColors.push( new Color() );
			this._directions.push( new Vector3() );

		}

		this.skyColorsNode = uniformArray( this._skyColors, 'color' ).setGroup( renderGroup );
		this.groundColorsNode = uniformArray( this._groundColors, 'color' ).setGroup( renderGroup );
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

	update() {

		const count = Math.min( this._lights.length, this.maxCount );

		this.countNode.value = count;

		for ( let i = 0; i < count; i ++ ) {

			const light = this._lights[ i ];

			this._skyColors[ i ].copy( light.color ).multiplyScalar( light.intensity );
			this._groundColors[ i ].copy( light.groundColor ).multiplyScalar( light.intensity );
			this._directions[ i ].setFromMatrixPosition( light.matrixWorld ).normalize();

		}

	}

	setup( builder ) {

		Loop( this.countNode, ( { i } ) => {

			const skyColor = this.skyColorsNode.element( i );
			const groundColor = this.groundColorsNode.element( i );
			const lightDirection = this.directionsNode.element( i );
			const hemiDiffuseWeight = normalWorld.dot( lightDirection ).mul( 0.5 ).add( 0.5 );
			const irradiance = mix( groundColor, skyColor, hemiDiffuseWeight );

			builder.context.irradiance.addAssign( irradiance );

		} );

	}

}

export default HemisphereLightDataNode;
