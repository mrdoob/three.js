import { ObjectNode, LabelElement } from '../../libs/flow.module.js';
import { MeshStandardNodeMaterial, ColorNode, FloatNode } from '../../renderers/nodes/Nodes.js';
import * as THREE from 'three';

const NULL_COLOR = new ColorNode();
const NULL_FLOAT = new FloatNode();

export class StandardMaterialEditor extends ObjectNode {

	constructor() {

		const material = new MeshStandardNodeMaterial();

		super( 'Standard Material', 0, material );

		this.title.setStyle( 'blue' );

		this.setWidth( 300 );

		const color = new LabelElement( 'color' ).setInput( 3 );
		const opacity = new LabelElement( 'opacity' ).setInput( 1 );
		const metalness = new LabelElement( 'metalness' ).setInput( 1 );
		const roughness = new LabelElement( 'roughness' ).setInput( 1 );

		color.onConnect( () => this.update(), true );
		opacity.onConnect( () => this.update(), true );
		metalness.onConnect( () => this.update(), true );
		roughness.onConnect( () => this.update(), true );

		this.add( color )
			.add( opacity )
			.add( metalness )
			.add( roughness );

		this.color = color;
		this.opacity = opacity;
		this.metalness = metalness;
		this.roughness = roughness;

		this.material = material;

		this.update();

	}

	update() {

		const { material, color, opacity, roughness, metalness } = this;

		material.colorNode = color.linkedExtra || NULL_COLOR;

		material.opacityNode = opacity.linkedExtra || null;
		material.transparent = opacity.linkedExtra ? true : false;

		material.metalnessNode = metalness.linkedExtra || NULL_FLOAT;
		material.roughnessNode = roughness.linkedExtra || NULL_FLOAT;

		material.dispose();

		// TODO: Fix on NodeMaterial System
		material.customProgramCacheKey = () => {

			return THREE.MathUtils.generateUUID();

		};

	}

}
