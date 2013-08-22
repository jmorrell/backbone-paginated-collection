/*! backbone-paginated-collection */
;(function (root) { function moduleDefinition(Backbone, _) {

function recalculatePagination() {
  var length = this._superset.length;
  var perPage = this._perPage;

  // If the # of objects can be exactly divided by the number
  // of pages, it would leave an empty last page if we took
  // the floor.
  var totalPages = length % perPage === 0 ?
    (length / perPage) : Math.floor(length / perPage) + 1;

  this._page = 0;
  this._totalPages = totalPages;

  updatePagination.call(this);
}

function updatePagination() {
  var start = this._page * this._perPage;
  var end = start + this._perPage;

  this._collection.reset(this._superset.toArray().slice(start, end));

  // A drawback is that we will have to update the length ourselves
  // every time we modify this collection.
  this.length = this._collection.length;
}

function onModelAdd() {
  console.log('add');
}

function onModelRemove() {
  console.log('remove');
}

function onReset() {
  console.log('reset');
}

function Paginated(superset, options) {
  // Save a reference to the original collection
  this._superset = superset;

  // The idea is to keep an internal backbone collection with the paginated
  // set, and expose limited functionality.
  this._collection = new Backbone.Collection(superset.toArray());
  this._perPage = options ? options.perPage: this._defaultPerPage;

  recalculatePagination.call(this);
  this._superset.on('add', onModelAdd, this);
  this._superset.on('remove', onModelRemove, this);
  this._superset.on('reset', onReset, this);
}

var methods = {

  _defaultPerPage: 20,

  setPerPage: function(perPage) {
    this._perPage = perPage;
    recalculatePagination.call(this);
  },

  getPerPage: function() {
    return this._perPage;
  },

  getNumPages: function() {
    return this._totalPages;
  },

  setPage: function(page) {
    if (page >= 0 && page < this.getNumPages()) {
      this._page = page;
      updatePagination.call(this);
    }
  },

  getPage: function() {
    return this._page;
  },

  hasNextPage: function() {
    return this.getPage() < this.getNumPages();
  },

  hasPrevPage: function() {
    return this.getPage > 0;
  },

  nextPage: function() {
    this.movePage(1);
  },

  prevPage: function() {
    this.movePage(-1);
  },

  movePage: function(delta) {
    this.setPage(this.getPage + delta);
  },

  superset: function() {
    return this._superset;
  }

};

// Methods on `this._collection` we will expose to the outside world
var collectionMethods = [
  'toJSON', 'first', 'last', 'at', 'get', 'map',
  'each', 'slice', 'where', 'findWhere', 'contains',
  'indexOf', 'toArray', 'pluck'
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
