/**
 * Created by Daniel on 20.07.15.
 */

Cmd = function () {

	this.id = -1;
	this.serialized = false;
	this.updatable = false;
	this.type = '';

};

Cmd.prototype.toJSON = function () {

	var output = {};
	output.type = this.type;
	output.id = this.id;
	return output;

};

Cmd.prototype.fromJSON = function ( json ) {

	this.type = json.type;
	this.id = json.id;

};