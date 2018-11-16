const SearchMoviesCollection = Backbone.Collection.extend({
  model: MovieModel
});

const SavedMoviesCollection = Backbone.Collection.extend({
  model: MovieModel,
  localStorage: new Backbone.LocalStorage("movies-backbone")
});
