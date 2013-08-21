var assert = chai.assert;

var mockData = _.map(_.range(100), function(i) { return { n: i }; });

var superset, paginated;

describe('Backbone.Filtering.PaginatedCollection', function() {

  describe('With no options', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset);
    });

    it('perPage should be the same as defaultPerPage', function() {
      assert(paginated.length === paginated.defaultPerPage);
      assert(paginated.getPerPage() === paginated.defaultPerPage);
    });

    it('should be on page 0', function() {
      assert(paginated.getPage() === 0);
    });

  });

  describe('With perPage', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('perPage should be 15', function() {
      assert(paginated.length === 15);
      assert(paginated.getPerPage() === 15);
    });

    it('should be on page 0', function() {
      assert(paginated.getPage() === 0);
    });

    it('should have 7 pages', function() {
      assert(paginated.getNumPages() === 7);
    });

    it('first page should have items 0-14', function() {
      var pageValues = paginated.pluck('n');
      assert(_.isEqual(pageValues, _.range(15)));
    });

    it('last page should have items 90-99', function() {
      paginated.setPage(6);
      var pageValues = paginated.pluck('n');
      assert(_.isEqual(pageValues, _.range(90, 100)));
    });

    it('page count should be correct when divided evenly', function() {
      // 100 / 10 = 10 -> 10 pages
      paginated.setPerPage(10);
      assert(paginated.getNumPages() === 10);

      // 100 / 4  = 25 -> 25 pages
      paginated.setPerPage(4);
      assert(paginated.getNumPages() === 25);
    });

    it('page count should be correct when divided un-evenly', function() {
      assert(paginated.getNumPages() === 7);

      // N.B. We are treating 0 as a page so we must round down.
      // 100 / 11 + 1 = 10.090909090909092 -> 10 pages
      paginated.setPerPage(11);
      assert(paginated.getNumPages() === 10);

      // 100 / 3 + 1 = 33.333333333333336 + 1 -> 34 pages
      paginated.setPerPage(3);
      assert(paginated.getNumPages() === 34);
    });

    it('should not have a page prior to the first', function() {
      paginated.setPage(0);
      assert(!paginated.hasPrevPage());
      assert(paginated.hasNextPage());

      // Trying to go back should have no effect
      paginated.prevPage();
      assert(!paginated.hasPrevPage());
      assert(paginated.currentPage() === 0);
    });

    it('should not have another page after page 6', function() {
      paginated.setPage(6);
      assert(!paginated.hasNextPage());
      assert(paginated.hasPrevPage());

      // Going to the next page should have no effect since there
      // is no next page.
      paginated.nextPage();
      assert(paginated.currentPage() === 6);
      assert(!paginated.hasNextPage());
    });

    it('should be able to go back and forth between pages', function() {
      paginated.setPage(0);
      assert(paginated.currentPage() === 0);

      paginated.nextPage();
      assert(paginated.currentPage() === 1);

      paginated.prevPage();
      assert(paginated.currentPage() === 0);
    });

  });

  describe('removing a model in the superset', function() {

  });

  describe('adding a model in the superset', function() {

  });

  describe('destroying a model in the superset', function() {

  });

  describe('reseting the superset', function() {

  });

  describe('pipe events from the subset to the container', function() {

    it('add event', function() {

    });

    it('remove event', function() {

    });

    it('reset event', function() {

    });

    it('model change event', function() {

    });

    it('model change event: specific key', function() {

    });

  });

  describe('pagination-specific events', function() {

  });

});

