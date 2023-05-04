import { ColorInput, SliderInput, LabelElement } from 'flow';
import { MaterialEditor } from './MaterialEditor.js';
import { MeshBasicNodeMaterial } from 'three/nodes';

export class BasicMaterialEditor extends MaterialEditor {

	constructor() {

		const material = new MeshBasicNodeMaterial();

		super( 'Basic Material', material );

		const color = new LabelElement( 'color' ).setInput( 3 );
		const opacity = new LabelElement( 'opacity' ).setInput( 1 );
		const position = new LabelElement( 'position' ).setInput( 3 );

		color.add( new ColorInput( material.color.getHex() ).onChange( ( input ) => {

			material.color.setHex( input.getValue() );

		} ) );

		opacity.add( new SliderInput( material.opacity, 0, 1 ).onChange( ( input ) => {

			material.opacity = input.getValue();

			this.updateTransparent();

		} ) );

		color.onConnect( () => this.update(), true );
		opacity.onConnect( () => this.update(), true );
		position.onConnect( () => this.update(), true );

		this.add( color )
			.add( opacity )
			.add( position );

		this.color = color;
		this.opacity = opacity;
		this.position = position;

		this.update();

	}

	update() {

		const { material, color, opacity, position } = this;

		color.setEnabledInputs( ! color.getLinkedObject() );
		opacity.setEnabledInputs( ! opacity.getLinkedObject() );

		material.colorNode = color.getLinkedObject();
		material.opacityNode = opacity.getLinkedObject() || null;

		material.positionNode = position.getLinkedObject() || null;

		material.dispose();

		this.updateTransparent();

	}

	updateTransparent() {

		const { material, opacity } = this;

		const transparent = opacity.getLinkedObject() || material.opacity < 1 ? true : false;
		const needsUpdate = transparent !== material.transparent;

		material.transparent = transparent;

		opacity.setIcon( material.transparent ? 'ti ti-layers-intersect' : 'ti ti-layers-subtract' );

		if ( needsUpdate === true ) material.dispose();

	}

}
