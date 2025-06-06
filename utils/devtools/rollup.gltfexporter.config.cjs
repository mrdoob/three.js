const resolve = require('@rollup/plugin-node-resolve');

module.exports = {
  input: 'devtools/panel/exporters/GLTFExporter.js',
  output: {
    file: 'devtools/panel/exporters/GLTFExporter.umd.js',
    format: 'umd',
    name: 'GLTFExporter', // Expose as global GLTFExporter
    exports: 'default',
  },
  plugins: [ resolve.nodeResolve() ],
};
