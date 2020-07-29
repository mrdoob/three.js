import {
	Color,
	Vector2
} from '../../../../../build/three.module.js';

import { StandardNode } from './StandardNode.js';
import { PropertyNode } from '../../inputs/PropertyNode.js';
import { OperatorNode } from '../../math/OperatorNode.js';
import { SwitchNode } from '../../utils/SwitchNode.js';
import { NormalMapNode } from '../../misc/NormalMapNode.js';

function MeshStandardNode() {

	StandardNode.call( this );

	this.properties = {
		color: new Color( 0xffffff ),
		roughness: 0.5,
		metalness: 0.5,
		normalScale: new Vector2( 1, 1 )
	};

	this.inputs = {
		color: new PropertyNode( this.properties, 'color', 'c' ),
		roughness: new PropertyNode( this.properties, 'roughness', 'f' ),
		metalness: new PropertyNode( this.properties, 'metalness', 'f' ),
		normalScale: new PropertyNode( this.properties, 'normalScale', 'v2' )
	};

}

MeshStandardNode.prototype = Object.create( StandardNode.prototype );
MeshStandardNode.prototype.constructor = MeshStandardNode;
MeshStandardNode.prototype.nodeType = "MeshStandard";

MeshStandardNode.prototype.build = function ( builder ) {

	var props = this.properties,
		inputs = this.inputs;

	if ( builder.isShader( 'fragment' ) ) {

		// slots
		// * color
		// * map

		var color = builder.findNode( props.color, inputs.color ),
			map = builder.resolve( props.map );

		this.color = map ? new OperatorNode( color, map, OperatorNode.MUL ) : color;

		// slots
		// * roughness
		// * roughnessMap

		var roughness = builder.findNode( props.roughness, inputs.roughness ),
			roughnessMap = builder.resolve( props.roughnessMap );

		this.roughness = roughnessMap ? new OperatorNode( roughness, new SwitchNode( roughnessMap, "g" ), OperatorNode.MUL ) : roughness;

		// slots
		// * metalness
		// * metalnessMap

		var metalness = builder.findNode( props.metalness, inputs.metalness ),
			metalnessMap = builder.resolve( props.metalnessMap );

		this.metalness = metalnessMap ? new OperatorNode( metalness, new SwitchNode( metalnessMap, "b" ), OperatorNode.MUL ) : metalness;

		// slots
		// * normalMap
		// * normalScale

		if ( props.normalMap ) {

			this.normal = new NormalMapNode( builder.resolve( props.normalMap ) );
			this.normal.scale = builder.findNode( props.normalScale, inputs.normalScale );

		} else {

			this.normal = undefined;

		}

		// slots
		// * envMap

		this.environment = builder.resolve( props.envMap );

	}

	// build code

	return StandardNode.prototype.build.call( this, builder );

};

MeshStandardNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		console.warn( ".toJSON not implemented in", this );

	}

	return data;

};

export { MeshStandardNode };
