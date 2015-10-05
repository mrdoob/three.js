/**
 * Created by Daniel on 20.07.15.
 */

Cmd = function ( editorRef ) {

	this.id = -1;
	this.serialized = false;
	this.updatable = false;
	this.type = '';
	this.name = '';

	if ( editorRef !== undefined ) {

		Cmd.editor = editorRef;

	}
	this.editor = Cmd.editor;


};

Cmd.prototype.toJSON = function () {

	var output = {};
	output.type = this.type;
	output.id = this.id;
	output.name = this.name;
	return output;

};

Cmd.prototype.fromJSON = function ( json ) {

	this.type = json.type;
	this.id = json.id;
	this.name = json.name;

};