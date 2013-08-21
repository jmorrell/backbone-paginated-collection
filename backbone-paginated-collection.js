/*! backbone-paginated-collection */
;(function (root) { function moduleDefinition(Backbone, _) {










function Paginated(superset) {
  // Save a reference to the original collection
  this._superset = superset;

  // The idea is to keep an internal backbone collection with the paginated
  // set, and expose limited functionality.
  this._collection = new Backbone.Collection(superset.toArray());

  // A drawback is that we will have to update the length ourselves
  // every time we modify this collection.
  this.length = this._collection.length;
}

var methods = {

  _defaultPerPage: 20,

  setPerPage: function(perPage) {

  },

  getPerPage: function() {

  },

  setPage: function(page) {

  },

  numPages: function() {

  },

  currentPage: function() {

  },

  hasNextPage: function() {

  },

  hasPrevPage: function() {

  },

  nextPage: function() {

  },

  prevPage: function() {

  },

  movePage: function(delta) {

  }

};

// Methods on `this._collection` we will expose to the outside world
var collectionMethods = [
  'toJSON', 'first', 'last', 'at', 'get', 'map',
  'each', 'slice', 'where', 'findWhere', 'contains',
  'indexOf', 'toArray'
];

_.each(collectionMethods, function(method) {
  methods[method] = function() {
    return Backbone.Collection.prototype[method].apply(this._collection, arguments);
  };
});

// Build up the prototype
_.extend(Paginated.prototype, methods, Backbone.Events);

return Paginated;

// ---------------------------------------------------------------------------
} if (typeof exports === 'object') {
  // node export
  module.exports = moduleDefinition(require('backbone'), require('underscore'));
} else if (typeof define === 'function' && define.amd) {
  // amd anonymous module registration
  define(['backbone', 'underscore'], moduleDefinition);
} else {
  // browser global
  root.PaginatedCollection = moduleDefinition(root.Backbone, root._);
}}(this));
