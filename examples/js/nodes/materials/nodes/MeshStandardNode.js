/**
 * @author sunag / http://www.sunag.com.br/
 */

import { StandardNode } from './StandardNode.js';
import { FloatNode } from '../../inputs/FloatNode.js';
import { ColorNode } from '../../inputs/ColorNode.js';
import { Vector2Node } from '../../inputs/Vector2Node.js';
import { OperatorNode } from '../../math/OperatorNode.js';
import { SwitchNode } from '../../utils/SwitchNode.js';
import { NormalMapNode } from '../../misc/NormalMapNode.js';

function MeshStandardNode() {

	StandardNode.call( this );

	this.properties = {
		color: new ColorNode( 0xffffff ),
		roughness: new FloatNode( 0.5 ),
		metalness: new FloatNode( 0.5 ),
		normalScale: new Vector2Node( 1, 1 )
	};

};

MeshStandardNode.prototype = Object.create( StandardNode.prototype );
MeshStandardNode.prototype.constructor = MeshStandardNode;

MeshStandardNode.prototype.build = function ( builder ) {

	var material = builder.material,
		props = this.properties;

	if ( builder.isShader('fragment') ) {
		
		// slots
		// * color
		// * map
		
		var color = builder.resolve( props.color.value, props.color ),
			map = builder.resolve( props.map );
		
		this.color = map ? new OperatorNode( color, map, OperatorNode.MUL ) : color;
		
		// slots
		// * roughness
		// * roughnessMap
		
		var roughness = builder.resolve( props.roughness.value, props.roughness ),
			roughnessMap = builder.resolve( props.roughnessMap );
		
		this.roughness = roughnessMap ? new OperatorNode( roughness, new SwitchNode( roughnessMap, "g" ), OperatorNode.MUL ) : roughness;
		
		// slots
		// * metalness
		// * metalnessMap
		
		var metalness = builder.resolve( props.metalness.value, props.metalness ),
			metalnessMap = builder.resolve( props.metalnessMap );
		
		this.metalness = metalnessMap ? new OperatorNode( metalness, new SwitchNode( metalnessMap, "b" ), OperatorNode.MUL ) : metalness;

		// slots
		// * normalMap
		// * normalScale
		
		if ( props.normalMap ) {
			
			this.normal = new NormalMapNode( builder.resolve( props.normalMap ) );
			this.normal.scale = builder.resolve( props.normalScale );

		}

		// slots
		// * envMap
		
		this.environment = builder.resolve( props.envMap );
		
	}
	
	// build code

	return StandardNode.prototype.build.call( this, builder );

};

export { MeshStandardNode };
