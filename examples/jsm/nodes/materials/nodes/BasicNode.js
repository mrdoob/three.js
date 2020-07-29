import { Node } from '../../core/Node.js';
import { ColorNode } from '../../inputs/ColorNode.js';

function BasicNode() {

	Node.call( this );

	this.color = new ColorNode( 0xFFFFFF );

}

BasicNode.prototype = Object.create( Node.prototype );
BasicNode.prototype.constructor = BasicNode;
BasicNode.prototype.nodeType = "Basic";

BasicNode.prototype.generate = function ( builder ) {

	var code;

	if ( builder.isShader( 'vertex' ) ) {

		var position = this.position ? this.position.analyzeAndFlow( builder, 'v3', { cache: 'position' } ) : undefined;

		var output = [
			"vec3 transformed = position;"
		];

		if ( position ) {

			output.push(
				position.code,
				position.result ? "gl_Position = projectionMatrix * modelViewMatrix * vec4(" + position.result + ", 1.0);" : ''
			);

		} else {

			output.push( "gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);" );

		}

		code = output.join( "\n" );

	} else {

		// Analyze all nodes to reuse generate codes
		this.color.analyze( builder, { slot: 'color' } );

		if ( this.alpha ) this.alpha.analyze( builder );
		if ( this.mask ) this.mask.analyze( builder );

		// Build code
		var color = this.color.flow( builder, 'c', { slot: 'color' } );
		var alpha = this.alpha ? this.alpha.flow( builder, 'f' ) : undefined;
		var mask = this.mask ? this.mask.flow( builder, 'b' ) : undefined;

		builder.requires.transparent = alpha !== undefined;

		var output = [
			color.code,
		];

		if ( mask ) {

			output.push(
				mask.code,
				'if ( ! ' + mask.result + ' ) discard;'
			);

		}

		if ( alpha ) {

			output.push(
				alpha.code,
				'#ifdef ALPHATEST',

				' if ( ' + alpha.result + ' <= ALPHATEST ) discard;',

				'#endif'
			);

		}

		if ( alpha ) {

			output.push( "gl_FragColor = vec4(" + color.result + ", " + alpha.result + " );" );

		} else {

			output.push( "gl_FragColor = vec4(" + color.result + ", 1.0 );" );

		}

		code = output.join( "\n" );

	}

	return code;

};

BasicNode.prototype.copy = function ( source ) {

	Node.prototype.copy.call( this, source );

	this.color = source.color;

	if ( source.position ) this.position = source.position;
	if ( source.alpha ) this.alpha = source.alpha;
	if ( source.mask ) this.mask = source.mask;

	return this;

};

BasicNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.color = this.color.toJSON( meta ).uuid;

		if ( this.position ) data.position = this.position.toJSON( meta ).uuid;
		if ( this.alpha ) data.alpha = this.alpha.toJSON( meta ).uuid;
		if ( this.mask ) data.mask = this.mask.toJSON( meta ).uuid;

	}

	return data;

};

export { BasicNode };
