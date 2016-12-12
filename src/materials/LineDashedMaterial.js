import { Material } from './Material';
import { Color } from '../math/Color';

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  linewidth: <float>,
 *
 *  scale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>
 * }
 */

function LineDashedMaterial( parameters ) {

	Material.call( this );

	this.type = 'LineDashedMaterial';

	this.addParameter( 'color', new Color( 0xffffff ), 'diffuse' );

	this.linewidth = 1;

	this.addParameter( 'scale', 1 );
	this.addParameter( 'dashSize', 3 );

	this.gapSize = 1;

	this.addParameter( 'totalSize', 4, 'totalSize', function ( parent, value ) { return parent.dashSize + parent.gapSize} );

	this.lights = false;

	this.setValues( parameters );

}

LineDashedMaterial.prototype = Object.create( Material.prototype );
LineDashedMaterial.prototype.constructor = LineDashedMaterial;

LineDashedMaterial.prototype.isLineDashedMaterial = true;
LineDashedMaterial.prototype.isExperimentalMaterial = true;

LineDashedMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.linewidth = source.linewidth;

	this.scale = source.scale;
	this.dashSize = source.dashSize;
	this.gapSize = source.gapSize;

	return this;

};


export { LineDashedMaterial };
