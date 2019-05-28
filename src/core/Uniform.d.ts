export class Uniform {

	constructor( value: any );
	/**
   * @deprecated
   */
	constructor( type: string, value: any );
  /**
   * @deprecated
   */
  type: string;
  value: any;
  /**
   * @deprecated Use {@link Object3D#onBeforeRender object.onBeforeRender()} instead.
   */
  dynamic: boolean;
  onUpdateCallback: Function;

  /**
   * @deprecated Use {@link Object3D#onBeforeRender object.onBeforeRender()} instead.
   */
  onUpdate( callback: Function ): Uniform;

}
