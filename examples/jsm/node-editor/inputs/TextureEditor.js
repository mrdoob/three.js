import { LabelElement, ToggleInput, SelectInput } from '../../libs/flow.module.js';
import { BaseNode, onNodeValidElement } from '../core/BaseNode.js';
import { TextureNode, UVNode } from 'three-nodes/Nodes.js';
import { Texture, TextureLoader, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping } from 'three';

const fileTexture = new WeakMap();
const textureLoader = new TextureLoader();
const defaultTexture = new Texture();
const defaultUV = new UVNode();

const getTextureFromFile = ( file ) => {

	let texture = fileTexture.get( file );

	if ( texture === undefined ) {

		texture = textureLoader.load( URL.createObjectURL( file ) );

		fileTexture.set( file, texture );

	}

	return texture;

};

export class TextureEditor extends BaseNode {

	constructor() {

		const node = new TextureNode( defaultTexture );

		super( 'Texture', 4, node, 250 );

		this.texture = null;

		this._initFile();
		this._initParams();

		this.onValidElement = () => {};

	}

	_initFile() {

		const fileElement = new LabelElement( 'File' ).setInputColor( 'aqua' ).setInput( 1 );

		fileElement.onValid( ( source, target, stage ) => {

			const object = target.getObject();

			if ( object && ( object instanceof File ) === false ) {

				if ( stage === 'dragged' ) {

					const name = target.node.getName();

					this.editor.tips.error( `"${name}" is not a File.` );

				}

				return false;

			}

		} ).onConnect( () => {

			const file = fileElement.getLinkedObject();
			const node = this.value;

			this.texture = file ? getTextureFromFile( file ) : null;

			node.value = this.texture || defaultTexture;

			this.update();

		} );

		this.add( fileElement );

	}

	_initParams() {

		const uvField = new LabelElement( 'UV' ).setInput( 2 );

		uvField.onValid( onNodeValidElement ).onConnect( () => {

			const node = this.value;

			node.uvNode = uvField.getLinkedObject() || defaultUV;

		} );

		this.wrapSInput = new SelectInput( [
			{ name: 'Repeat Wrapping', value: RepeatWrapping },
			{ name: 'Clamp To Edge Wrapping', value: ClampToEdgeWrapping },
			{ name: 'Mirrored Repeat Wrapping', value: MirroredRepeatWrapping }
		], RepeatWrapping ).onChange( () => {

			this.update();

		} );

		this.wrapTInput = new SelectInput( [
			{ name: 'Repeat Wrapping', value: RepeatWrapping },
			{ name: 'Clamp To Edge Wrapping', value: ClampToEdgeWrapping },
			{ name: 'Mirrored Repeat Wrapping', value: MirroredRepeatWrapping }
		], RepeatWrapping ).onChange( () => {

			this.update();

		} );

		this.flipYInput = new ToggleInput( false ).onClick( () => {

			this.update();

		} );

		this.add( uvField )
			.add( new LabelElement( 'Wrap S' ).add( this.wrapSInput ) )
			.add( new LabelElement( 'Wrap T' ).add( this.wrapTInput ) )
			.add( new LabelElement( 'Flip Y' ).add( this.flipYInput ) );

	}

	update() {

		const texture = this.texture;

		if ( texture ) {

			texture.wrapS = Number( this.wrapSInput.getValue() );
			texture.wrapT = Number( this.wrapTInput.getValue() );
			texture.flipY = this.flipYInput.getValue();
			texture.dispose();

			this.invalidate();

		}

	}

}
