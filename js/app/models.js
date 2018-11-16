const MovieModel = Backbone.Model.extend({
  validate: function(attrs, options) {
    if (!attrs.Title) {
      return "Title is required";
    }
  }
});
