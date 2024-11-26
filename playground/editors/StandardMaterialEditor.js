import { ColorInput, SliderInput, LabelElement } from 'flow';
import { MaterialEditor } from './MaterialEditor.js';
import { MeshStandardNodeMaterial } from 'three/webgpu';
import { setInputAestheticsFromType } from '../DataTypeLib.js';

export class StandardMaterialEditor extends MaterialEditor {

	constructor() {

		const material = new MeshStandardNodeMaterial();

		super( 'Standard Material', material );

		const color = setInputAestheticsFromType( new LabelElement( 'color' ), 'Color' );
		const opacity = setInputAestheticsFromType( new LabelElement( 'opacity' ), 'Number' );
		const metalness = setInputAestheticsFromType( new LabelElement( 'metalness' ), 'Number' );
		const roughness = setInputAestheticsFromType( new LabelElement( 'roughness' ), 'Number' );
		const emissive = setInputAestheticsFromType( new LabelElement( 'emissive' ), 'Color' );
		const normal = setInputAestheticsFromType( new LabelElement( 'normal' ), 'Vector3' );
		const position = setInputAestheticsFromType( new LabelElement( 'position' ), 'Vector3' );

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
		emissive.onConnect( () => this.update(), true );
		normal.onConnect( () => this.update(), true );
		position.onConnect( () => this.update(), true );

		this.add( color )
			.add( opacity )
			.add( metalness )
			.add( roughness )
			.add( emissive )
			.add( normal )
			.add( position );

		this.color = color;
		this.opacity = opacity;
		this.metalness = metalness;
		this.roughness = roughness;
		this.emissive = emissive;
		this.normal = normal;
		this.position = position;

		this.update();

	}

	update() {

		const { material, color, opacity, emissive, roughness, metalness, normal, position } = this;

		color.setEnabledInputs( ! color.getLinkedObject() );
		opacity.setEnabledInputs( ! opacity.getLinkedObject() );
		roughness.setEnabledInputs( ! roughness.getLinkedObject() );
		metalness.setEnabledInputs( ! metalness.getLinkedObject() );

		material.colorNode = color.getLinkedObject();
		material.opacityNode = opacity.getLinkedObject();
		material.metalnessNode = metalness.getLinkedObject();
		material.roughnessNode = roughness.getLinkedObject();
		material.emissiveNode = emissive.getLinkedObject();
		material.normalNode = normal.getLinkedObject();

		material.positionNode = position.getLinkedObject();

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
