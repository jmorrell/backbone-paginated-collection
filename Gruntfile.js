module.exports = function (grunt) {
  grunt.initConfig({

    browserify: {
      basic: {
        src: [],
        dest: './backbone-paginated-collection.js',
        options: {
          external: [ 'underscore', 'backbone' ],
          alias: ['./index.js:backbone-paginated-collection']
        }
      }
    },

    umd: {
      default: {
        src: './backbone-paginated-collection.js',
        template: './templates/umd.hbs',
        objectToExport: "require('backbone-paginated-collection')",
        globalAlias: 'PaginatedCollection',
        deps: {
          'default': ['_', 'Backbone'],
          amd: ['underscore', 'backbone'],
          cjs: ['underscore', 'backbone'],
          global: ['_', 'Backbone']
        },
        browserifyMapping: '{"backbone":Backbone,"underscore":_}'
      }
    }

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-umd');

  grunt.registerTask('default', ['browserify', 'umd']);
};
