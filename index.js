
var _ = require('underscore');
var Backbone = require('backbone');
var proxyCollection = require('backbone-collection-proxy');

function getPageLimits() {
  var start = this.getPage() * this.getPerPage();
  var end = start + this.getPerPage();
  return [start, end];
}

function updatePagination() {
  var pages = getPageLimits.call(this);
  this._collection.reset(this.superset().slice(pages[0], pages[1]));
}

function updateNumPages() {
  var length = this.superset().length;
  var perPage = this.getPerPage();

  // If the # of objects can be exactly divided by the number
  // of pages, it would leave an empty last page if we took
  // the floor.
  var totalPages = length % perPage === 0 ?
    (length / perPage) : Math.floor(length / perPage) + 1;

  this._totalPages = totalPages;

  // Test to see if we are past the last page, and if so,
  // move back. Return true so that we can test to see if
  // this happened.
  if (this.getPage() >= totalPages) {
    this.setPage(totalPages - 1);
    return true;
  }
}

function recalculatePagination() {
  if (updateNumPages.call(this)) { return; }
  updatePagination.call(this);
}

function onAddRemove(model, collection, options) {
  if (updateNumPages.call(this)) { return; }

  var pages = getPageLimits.call(this);
  var start = pages[0], end = pages[1];

  // We are only adding and removing at most one model at a time,
  // so we can use _.difference to find just those two models
  var toAdd = _.difference(this.superset().slice(start, end), this._collection.toArray())[0];
  var toRemove = _.difference(this._collection.toArray(), this.superset().slice(start, end))[0];

  if (toRemove) {
    this._collection.remove(toRemove);
  }

  if (toAdd) {
    this._collection.add(toAdd, {
      at: this.superset().indexOf(toAdd) - start
    });
  }
}

function Paginated(superset, options) {
  // Save a reference to the original collection
  this._superset = superset;

  // The idea is to keep an internal backbone collection with the paginated
  // set, and expose limited functionality.
  this._collection = new Backbone.Collection(superset.toArray());
  this.setPerPage(options ? options.perPage: this._defaultPerPage);

  proxyCollection(this._collection, this);

  this.listenTo(this._superset, 'add remove', onAddRemove);
  this.listenTo(this._superset, 'reset', recalculatePagination);
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

// Build up the prototype
_.extend(Paginated.prototype, methods, Backbone.Events);

module.exports =  Paginated;

