import { ColorInput, ToggleInput, SliderInput, LabelElement } from 'flow';
import { MaterialEditor } from './MaterialEditor.js';
import { PointsNodeMaterial } from 'three/nodes';
import * as THREE from 'three';

export class PointsMaterialEditor extends MaterialEditor {

	constructor() {

		const material = new PointsNodeMaterial();

		super( 'Points Material', material );

		const color = new LabelElement( 'color' ).setInput( 3 );
		const opacity = new LabelElement( 'opacity' ).setInput( 1 );
		const size = new LabelElement( 'size' ).setInput( 1 );
		const position = new LabelElement( 'position' ).setInput( 3 );
		const sizeAttenuation = new LabelElement( 'Size Attenuation' );

		color.add( new ColorInput( material.color.getHex() ).onChange( ( input ) => {

			material.color.setHex( input.getValue() );

		} ) );

		opacity.add( new SliderInput( material.opacity, 0, 1 ).onChange( ( input ) => {

			material.opacity = input.getValue();

			this.updateTransparent();

		} ) );

		sizeAttenuation.add( new ToggleInput( material.sizeAttenuation ).onClick( ( input ) => {

			material.sizeAttenuation = input.getValue();
			material.dispose();

		} ) );

		color.onConnect( () => this.update(), true );
		opacity.onConnect( () => this.update(), true );
		size.onConnect( () => this.update(), true );
		position.onConnect( () => this.update(), true );

		this.add( color )
			.add( opacity )
			.add( size )
			.add( position )
			.add( sizeAttenuation );

		this.color = color;
		this.opacity = opacity;
		this.size = size;
		this.position = position;
		this.sizeAttenuation = sizeAttenuation;

		this.update();

	}

	update() {

		const { material, color, opacity, size, position } = this;

		color.setEnabledInputs( ! color.getLinkedObject() );
		opacity.setEnabledInputs( ! opacity.getLinkedObject() );

		material.colorNode = color.getLinkedObject();
		material.opacityNode = opacity.getLinkedObject() || null;

		material.sizeNode = size.getLinkedObject() || null;
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
