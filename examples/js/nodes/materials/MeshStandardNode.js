/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.MeshStandardNode = function () {

	THREE.StandardNode.call( this );

	this.properties = {
		color: new THREE.ColorNode( 0xffffff ),
		roughness: new THREE.FloatNode( 0.5 ),
		metalness: new THREE.FloatNode( 0.5 ),
		normalScale: new THREE.Vector2Node( 1, 1 )
	};

};

THREE.MeshStandardNode.prototype = Object.create( THREE.StandardNode.prototype );
THREE.MeshStandardNode.prototype.constructor = THREE.MeshStandardNode;

THREE.MeshStandardNode.prototype.build = function ( builder ) {

	var material = builder.material,
		props = this.properties;

	if ( builder.isShader('fragment') ) {
		
		// slots
		// * color
		// * map
		
		var color = builder.resolve( props.color.value, props.color ),
			map = builder.resolve( props.map );
		
		this.color = map ? new THREE.OperatorNode( color, map, THREE.OperatorNode.MUL ) : color;
		
		// slots
		// * roughness
		// * roughnessMap
		
		var roughness = builder.resolve( props.roughness.value, props.roughness ),
			roughnessMap = builder.resolve( props.roughnessMap );
		
		this.roughness = roughnessMap ? new THREE.OperatorNode( roughness, new THREE.SwitchNode( roughnessMap, "g" ), THREE.OperatorNode.MUL ) : roughness;
		
		// slots
		// * metalness
		// * metalnessMap
		
		var metalness = builder.resolve( props.metalness.value, props.metalness ),
			metalnessMap = builder.resolve( props.metalnessMap );
		
		this.metalness = metalnessMap ? new THREE.OperatorNode( metalness, new THREE.SwitchNode( metalnessMap, "b" ), THREE.OperatorNode.MUL ) : metalness;

		// slots
		// * normalMap
		// * normalScale
		
		if ( props.normalMap ) {
			
			this.normal = new THREE.NormalMapNode( builder.resolve( props.normalMap ) );
			this.normal.scale = builder.resolve( props.normalScale );

		}

		// slots
		// * envMap
		
		this.environment = builder.resolve( props.envMap );
		
	}
	
	// build code

	return THREE.StandardNode.prototype.build.call( this, builder );

};
