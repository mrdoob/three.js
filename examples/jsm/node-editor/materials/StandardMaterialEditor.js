import { ColorInput, SliderInput, LabelElement } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { MeshStandardNodeMaterial } from '../../renderers/nodes/Nodes.js';
import * as THREE from 'three';

export class StandardMaterialEditor extends BaseNode {

	constructor() {

		const material = new MeshStandardNodeMaterial();

		super( 'Standard Material', 1, material );

		this.setWidth( 300 );

		const color = new LabelElement( 'color' ).setInput( 3 );
		const opacity = new LabelElement( 'opacity' ).setInput( 1 );
		const metalness = new LabelElement( 'metalness' ).setInput( 1 );
		const roughness = new LabelElement( 'roughness' ).setInput( 1 );
		const position = new LabelElement( 'position' ).setInput( 3 );

		color.add( new ColorInput( material.color.getHex() ).onChange( ( input ) => {

			material.color.setHex( input.getValue() );

		} ) );

		opacity.add( new SliderInput( material.opacity, 0, 1 ).onChange( ( input ) => {

			material.opacity = input.getValue();

			this.updateTransparent();

		} ) );

		metalness.add( new SliderInput( material.metalness, 0, 1 ).onChange( ( input ) => {

			material.metalness = input.getValue();

		} ) );

		roughness.add( new SliderInput( material.roughness, 0, 1 ).onChange( ( input ) => {

			material.roughness = input.getValue();

		} ) );

		color.onConnect( () => this.update(), true );
		opacity.onConnect( () => this.update(), true );
		metalness.onConnect( () => this.update(), true );
		roughness.onConnect( () => this.update(), true );
		position.onConnect(() => this.update(), true );

		this.add( color )
			.add( opacity )
			.add( metalness )
			.add( roughness )
			.add( position );

		this.color = color;
		this.opacity = opacity;
		this.metalness = metalness;
		this.roughness = roughness;
		this.position = position;

		this.material = material;

		this.update();

	}

	update() {

		const { material, color, opacity, roughness, metalness, position } = this;

		color.setEnabledInputs( ! color.getLinkedObject() );
		opacity.setEnabledInputs( ! opacity.getLinkedObject() );
		roughness.setEnabledInputs( ! roughness.getLinkedObject() );
		metalness.setEnabledInputs( ! metalness.getLinkedObject() );

		material.colorNode = color.getLinkedObject();
		material.opacityNode = opacity.getLinkedObject() || null;
		material.metalnessNode = metalness.getLinkedObject();
		material.roughnessNode = roughness.getLinkedObject();

		material.positionNode = position.getLinkedObject() || null;

		material.dispose();

		this.updateTransparent();

		// TODO: Fix on NodeMaterial System
		material.customProgramCacheKey = () => {

			return THREE.MathUtils.generateUUID();

		};

	}

	updateTransparent() {

		const { material, opacity } = this;

		material.transparent = opacity.getLinkedObject() || material.opacity < 1 ? true : false;

		opacity.setIcon( material.transparent ? 'ti ti-layers-intersect' : 'ti ti-layers-subtract' );

	}

}
