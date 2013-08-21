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
      assert(paginated.getPage() === 0);
    });

    it('should not have another page after page 6', function() {
      paginated.setPage(6);
      assert(!paginated.hasNextPage());
      assert(paginated.hasPrevPage());

      // Going to the next page should have no effect since there
      // is no next page.
      paginated.nextPage();
      assert(paginated.getPage() === 6);
      assert(!paginated.hasNextPage());
    });

    it('should be able to go back and forth between pages', function() {
      paginated.setPage(0);
      assert(paginated.getPage() === 0);

      paginated.nextPage();
      assert(paginated.getPage() === 1);

      paginated.prevPage();
      assert(paginated.getPage() === 0);
    });

  });

  describe('removing a model in the superset', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('should update the current page if the model was there', function() {
      // The first page should include models 0 - 14
      var current = paginated.pluck('n');
      assert(_.isEqual(current, _.range(15)));
      assert(paginated.length === 15);

      var firstModel = superset.first();
      assert(firstModel.get('n') === 0);
      superset.remove(firstModel);

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The first page should now include models 1 - 15
      var updated = paginated.pluck('n');
      assert(_.isEqual(updated, _.range(1, 16)));
      assert(paginated.length === 15);
    });

    it('should affect which pages other models fall on', function() {
      paginated.setPage(6);

      // The last page should include models 90 - 99
      var current = paginated.pluck('n');
      assert(paginated.length === 10);
      assert(_.isEqual(current, _.range(90, 100)));

      var firstModel = superset.first();
      assert(firstModel.get('n') === 0);
      superset.remove(firstModel);

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The last page should now include models 91 - 99
      var updated = paginated.pluck('n');
      assert(paginated.length === 9);
      assert(_.isEqual(updated, _.range(91, 100)));
    });

    it('should change the number of pages when necessary', function() {
      // We can evenly divide the number of pages with 10 models on each
      paginated.setPerPage(10);

      assert(paginated.getNumPages() === 10);

      // The last page has 10 models, so removing 9 should keep us
      // with 10 pages
      for (var i = 0; i < 9; i++) {
        superset.remove(superset.last());
        assert(paginated.getNumPages() === 10);
      }

      // Now removing one more should update us to only 9 pages
      superset.remove(superset.last());
      assert(paginated.getNumPages === 9);
    });

  });

  describe('adding a model in the superset', function() {

    beforeEach(function() {
      superset = new Backbone.Collection(mockData);
      paginated = new PaginatedCollection(superset, { perPage: 15 });
    });

    it('should update the current page if the model was there', function() {
      // The first page should include models 0 - 14
      var current = paginated.pluck('n');
      assert(_.isEqual(current, _.range(15)));
      assert(paginated.length === 15);

      var model = new Backbone.Model({ n: -1 });
      superset.unshift(firstModel);

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The first page should now include models -1 - 13
      var updated = paginated.pluck('n');
      assert(_.isEqual(updated, _.range(-1, 14)));
      assert(paginated.length === 15);
    });

    it('should affect which pages other models fall on', function() {
      paginated.setPage(6);

      // The last page should include models 90 - 99
      var current = paginated.pluck('n');
      assert(paginated.length === 10);
      assert(_.isEqual(current, _.range(90, 100)));

      var model = new Backbone.Model({ n: -1 });
      superset.unshift(firstModel);

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The last page should now include models 89 - 99
      var updated = paginated.pluck('n');
      assert(paginated.length === 11);
      assert(_.isEqual(updated, _.range(89, 100)));
    });

    it('should change the number of pages when necessary', function() {
      // We can evenly divide the number of pages with 10 models on each
      paginated.setPerPage(10);

      assert(paginated.getNumPages() === 10);

      // The last page has 10 models, so adding one should move us
      // to 11 pages
      superset.add({ n: 100 });
      assert(paginated.getNumPages() === 11);

      // Adding another 9 models should not change the number of pages
      for (var i = 0; i < 9; i++) {
        superset.add({ n: i });
        assert(paginated.getNumPages() === 11);
      }

      // And adding one more should get us to 12
      superset.add({ n: 100 });
      assert(paginated.getNumPages() === 12);
    });

  });

  describe('destroying a model in the superset', function() {

    it('should update the current page if the model was there', function() {
      // The first page should include models 0 - 14
      var current = paginated.pluck('n');
      assert(_.isEqual(current, _.range(15)));
      assert(paginated.length === 15);

      var firstModel = superset.first();
      assert(firstModel.get('n') === 0);

      // Now we *destroy it!*
      firstModel.destroy();

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The first page should now include models 1 - 15
      var updated = paginated.pluck('n');
      assert(_.isEqual(updated, _.range(1, 16)));
      assert(paginated.length === 15);
    });

    it('should affect which pages other models fall on', function() {
      paginated.setPage(6);

      // The last page should include models 90 - 99
      var current = paginated.pluck('n');
      assert(paginated.length === 10);
      assert(_.isEqual(current, _.range(90, 100)));

      var firstModel = superset.first();
      assert(firstModel.get('n') === 0);

      // Now we *destroy it!*
      firstModel.destroy();

      // We should still have 7 pages
      assert(paginated.getNumPages() === 7);

      // The last page should now include models 91 - 99
      var updated = paginated.pluck('n');
      assert(paginated.length === 9);
      assert(_.isEqual(updated, _.range(91, 100)));
    });

    it('should change the number of pages when necessary', function() {
      // We can evenly divide the number of pages with 10 models on each
      paginated.setPerPage(10);

      assert(paginated.getNumPages() === 10);

      // The last page has 10 models, so removing 9 should keep us
      // with 10 pages
      for (var i = 0; i < 9; i++) {
        superset.last().destroy();
        assert(paginated.getNumPages() === 10);
      }

      // Now removing one more should update us to only 9 pages
      superset.last().destroy();
      assert(paginated.getNumPages === 9);
    });

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

