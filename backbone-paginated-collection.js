/*! backbone-paginated-collection */
;(function (root) { function moduleDefinition(Backbone, _) {

function recalculatePagination() {
  var length = this.superset().length;
  var perPage = this.getPerPage();

  // If the # of objects can be exactly divided by the number
  // of pages, it would leave an empty last page if we took
  // the floor.
  var totalPages = length % perPage === 0 ?
    (length / perPage) : Math.floor(length / perPage) + 1;

  this._totalPages = totalPages;

  // If the current page no longer exists, switch to the last
  // existing page in the set.
  if (this.getPage() >= totalPages) {
    this.setPage(totalPages - 1);
  } else {
    updatePagination.call(this);
  }
}

function updatePagination() {
  var start = this.getPage() * this.getPerPage();
  var end = start + this.getPerPage();

  this._collection.reset(this.superset().toArray().slice(start, end));
  this.length = this._collection.length;
}

function pipeEvents() {
  var args = _.toArray(arguments);

  // replace any references to `this._collection` with `this`
  for (var i = 1; i < args.length; i++) {
    // Is there a better way to check for this?
    // List all of the possible events?
    if (args[i].models && args[i].models.length === this._collection.models.length) {
      args[i] = this;
    }
  }

  this.trigger.apply(this, args);
}

function Paginated(superset, options) {
  // Save a reference to the original collection
  this._superset = superset;

  // The idea is to keep an internal backbone collection with the paginated
  // set, and expose limited functionality.
  this._collection = new Backbone.Collection(superset.toArray());
  this.setPerPage(options ? options.perPage: this._defaultPerPage);

  this.listenTo(this._superset, 'add', recalculatePagination);
  this.listenTo(this._superset, 'remove', recalculatePagination);
  this.listenTo(this._superset, 'reset', recalculatePagination);
  this.listenTo(this._collection, 'all', pipeEvents);
}

var methods = {

  _defaultPerPage: 20,

  setPerPage: function(perPage) {
    this._perPage = perPage;
    recalculatePagination.call(this);
    this.setPage(0);

    this.trigger('paginated:change:perPage', {
      perPage: perPage,
      numPages: this.getNumPages()
    });
  },

  setPage: function(page) {
    // The lowest page we could set
    var lowerLimit = 0;
    // The highest page we could set
    var upperLimit = this.getNumPages() - 1;

    // If the page is higher or lower than these limits,
    // set it to the limit.
    page = page > lowerLimit ? page : lowerLimit;
    page = page < upperLimit ? page : upperLimit;

    this._page = page;
    updatePagination.call(this);

    this.trigger('paginated:change:page', { page: page });
  },

  getPerPage: function() {
    return this._perPage;
  },

  getNumPages: function() {
    return this._totalPages;
  },

  getPage: function() {
    return this._page;
  },

  hasNextPage: function() {
    return this.getPage() < this.getNumPages() - 1;
  },

  hasPrevPage: function() {
    return this.getPage() > 0;
  },

  nextPage: function() {
    this.movePage(1);
  },

  prevPage: function() {
    this.movePage(-1);
  },

  movePage: function(delta) {
    this.setPage(this.getPage() + delta);
  },

  superset: function() {
    return this._superset;
  }

};

// Methods on `this._collection` we will expose to the outside world
var collectionMethods = [
  'toJSON', 'forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
  'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
  'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
  'max', 'min', 'groupBy', 'sortedIndex', 'shuffle', 'toArray', 'size',
  'first', 'head', 'take', 'initial', 'rest', 'tail', 'drop', 'last',
  'without', 'indexOf', 'lastIndexOf', 'isEmpty', 'chain', 'pluck',
  'findWhere', 'get', 'at', 'slice', 'where', 'findWhere'
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
