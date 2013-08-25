# backbone-paginated-collection

[![Build Status](https://secure.travis-ci.org/user/backbone-paginated-collection.png?branch=master)](http://travis-ci.org/user/backbone-paginated-collection)

Create a read-only paginated version of a backbone collection that stays in sync.

```javascript
var superset = new Backbone.Collection(/* ... */);

// By default there are 20 models per page, but you can configure this
var paginated = new PaginatedCollection(superset, { perPage: 100 });

// Assuming superset.length === 401
assert(paginated.getNumPages() === 4);
assert(paginated.getPage() === 0);
assert(paginated.length === 100);
assert(paginated.hasNextPage());
assert(!paginated.hasPrevPage());

// Go to the next page
paginated.nextPage();
assert(paginated.getPage() === 1);

// Move to the last page
paginated.setPage(3);
assert(paginated.length === 1);
```

## Installation

### Usage with Bower

Install with [Bower](http://bower.io):

```
bower install backbone-paginated-collection
```

The component can be used as a Common JS module, an AMD module, or a global.

### Usage with Browserify

Install with npm, use with [Browserify](http://browserify.org/)

```
> npm install backbone-paginated-collection
```

and in your code

```javascript
var PaginatedCollection = require('backbone-paginated-collection');
```

### Usage as browser global

You can include `backbone-paginated-collection.js` directly in a script tag. Make 
sure that it is loaded after underscore and backbone. It's exported as `PaginatedCollection`
on the global object.

```HTML
<script src="underscore.js"></script>
<script src="backbone.js"></script>
<script src="backbone-paginated-collection.js"></script>
```

## Methods

### new PaginatedCollection

### paginated.setPerPage(perPage)
### paginated.setPage(page)
### paginated.getPerPage()
### paginated.getNumPages()
### paginated.getPage()
### paginated.hasNextPage()
### paginated.hasPrevPage()
### paginated.nextPage()
### paginated.prevPage()
### paginated.movePage()
### paginated.superset()

## Events

`add`, `remove`, `change`, `reset` should fire as you expect.



## Testing

Install [Node](http://nodejs.org) (comes with npm) and Bower.

From the repo root, install the project's development dependencies:

```
npm install
bower install
```

Testing relies on the Karma test-runner. If you'd like to use Karma to
automatically watch and re-run the test file during development, it's easiest
to globally install Karma and run it from the CLI.

```
npm install -g karma
karma start
```

To run the tests in Firefox, just once, as CI would:

```
npm test
```

## License

MIT
