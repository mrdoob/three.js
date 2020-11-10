import { KeyframeTrack } from './../KeyframeTrack';

export class BooleanKeyframeTrack extends KeyframeTrack {

	constructor( name: string, times: any[], values: any[] );

	/**
	 * @default 'bool'
	 */
	ValueTypeName: string;

}
