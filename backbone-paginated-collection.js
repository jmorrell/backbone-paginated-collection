(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory(require('underscore'), require('backbone'));
    }
    else if(typeof define === 'function' && define.amd) {
        define(['underscore', 'backbone'], factory);
    }
    else {
        root.PaginatedCollection = factory(root._, root.Backbone);
    }
}(this, function(_, Backbone) {
var require=function(name){return {"backbone":Backbone,"underscore":_}[name];};
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"PxKHrf":[function(require,module,exports){

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


},{"backbone":false,"backbone-collection-proxy":2,"underscore":false}],2:[function(require,module,exports){

var _ = require('underscore');
var Backbone = require('backbone');

// Methods in the collection prototype that we won't expose
var blacklistedMethods = [
  "_onModelEvent", "_prepareModel", "_removeReference", "_reset", "add",
  "initialize", "sync", "remove", "reset", "set", "push", "pop", "unshift",
  "shift", "sort", "parse", "fetch", "create", "model", "off", "on",
  "listenTo", "listenToOnce", "bind", "trigger", "once", "stopListening"
];

function proxyCollection(from, target) {

  function updateLength() {
    target.length = from.length;
  }

  function pipeEvents() {
    var args = _.toArray(arguments);

    // replace any references to `from` with `this`
    for (var i = 1; i < args.length; i++) {
      if (args[i] && args[i].length && args[i].length === from.length) {
        args[i] = this;
      }
    }

    this.trigger.apply(this, args);
  }

  var methods = {};

  _.each(_.functions(Backbone.Collection.prototype), function(method) {
    if (!_.contains(blacklistedMethods, method)) {
      methods[method] = function() {
        return from[method].apply(from, arguments);
      };
    }
  });

  _.extend(target, Backbone.Events, methods);

  target.listenTo(from, 'all', updateLength);
  target.listenTo(from, 'all', pipeEvents);

  updateLength();
  return target;
}

module.exports = proxyCollection;


},{"backbone":false,"underscore":false}],"backbone-paginated-collection":[function(require,module,exports){
module.exports=require('PxKHrf');
},{}]},{},[])
;
return require('backbone-paginated-collection');

}));
