/**
 * @author Bart McLeod, mcleod@spaceweb.nl
 * @since 2016-05-10
 *
 * The VrmlParser/Renderer/Console renders the node tree as text output to the console,
 * so that one can see what it is parsing.
 */

module.exports = {
  depth: 0,
  decoration: '',
  /**
   * Render method, that takes the output from the VrmlParser as input and
   * writes a textual representation of the node tree to the console.
   *
   * @param nodeTree
   */
  render: function (tree) {

    this.decoration = '';
    // determine decoration base on depth
    for (var j = 0; j < this.depth; j++) {
      this.decoration += '-';
    }

    for (var a in tree) {
      if ('string' === typeof a) {

        var value = tree[a];
        if ('object' === typeof value) {
          this.depth++;
          console.log(this.decoration + a);
          this.render(value);
          this.depth--;
        } else {
          console.log(this.decoration + a + ': ' + tree[a]);
        }
      }
    }
  }
};
