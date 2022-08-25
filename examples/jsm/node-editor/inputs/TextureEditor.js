import { LabelElement, ToggleInput, SelectInput } from '../../libs/flow.module.js';
import { BaseNode, onNodeValidElement } from '../core/BaseNode.js';
import { TextureNode, UVNode } from 'three/nodes';
import { Texture, TextureLoader, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping } from 'three';

const fileTexture = new WeakMap();
const fileURL = new WeakMap();
const textureLoader = new TextureLoader();
const defaultTexture = new Texture();
const defaultUV = new UVNode();

const getTexture = ( file ) => {

	let texture = fileTexture.get( file );

	if ( texture === undefined || file.getURL() !== fileURL.get( file ) ) {

		const url = file.getURL();

		if ( texture !== undefined ) {

			texture.dispose();

		}

		texture = textureLoader.load( url );

		fileTexture.set( file, texture );
		fileURL.set( file, url );

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

			if ( object && object.isDataFile !== true ) {

				if ( stage === 'dragged' ) {

					const name = target.node.getName();

					this.editor.tips.error( `"${name}" is not a File.` );

				}

				return false;

			}

		} ).onConnect( () => {

			const file = fileElement.getLinkedObject();
			const node = this.value;

			this.texture = file ? getTexture( file ) : null;

			node.value = this.texture || defaultTexture;

			this.update();

		}, true );

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

		this.flipYInput = new ToggleInput( false ).onChange( () => {

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
