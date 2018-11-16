'use strict';

const SearchMovieView = Backbone.View.extend({
  tagName: 'div',
  className: 'search_movie_item card horizontal',
  template: Handlebars.compile(document.getElementById("search_movie_template").innerHTML),
  events: {
    "click .add_movie_btn": "saveMovie",
  },

  initialize: function() {
    this.model.on('destroy', this.removeView, this);
  },
  destroyModel: function() {
    this.model.destroy();
  },
  removeView: function() {
    this.$el.remove();
  },
  saveMovie: function(){
    App.Collections.saved.create(this.model.attributes);
    this.destroyModel();
    M.toast({ html: "Saved \"" + this.model.get("Title") + "\" Successfully!" });
  },
  render: function() {
    let html = this.template(this.model.toJSON());
    this.$el.html(html);
    return this;
  }
});

const SavedMovieView = Backbone.View.extend({
  tagName: 'div',
  className: 'saved_movie_item card horizontal',
  template: Handlebars.compile(document.getElementById("saved_movie_template").innerHTML),
  events: {
    "click .remove_movie_btn": "removeSavedMovie"
  },

  initialize: function() {
    this.model.on('destroy', this.removeView, this);
  },
  destroyModel: function() {
    this.model.destroy();
  },
  removeView: function() {
    this.$el.remove();
  },
  removeSavedMovie: function(e){
    let ask = window.confirm("Remove " + this.model.get("Title") + "?");
    if(!ask){ return; }
    this.destroyModel();
    M.toast({ html: "Removed \"" + this.model.get("Title") + "\" Successfully" });
  },
  render: function() {
    let html = this.template(this.model.toJSON());
    this.$el.html(html);
    return this;
  }
});

/* --- */

const AppView = Backbone.View.extend({
  el: "#backbone_app",
  events: {
    "click #search_btn": "searchMovies",
  },

  flash_search_msg: function(str){
    $('#search_msg').text(str);
    // setTimeout(function(){ $('#search_msg').val(''); },3000);
  },
  initialize: function() {
    this.saved_movie_imdbIDs = [];
    this.saved_movies_length_text = $('#saved_movies_length_text');

    App.Collections.search = new SearchMoviesCollection();
    App.Collections.saved = new SavedMoviesCollection();

    App.Collections.saved.fetch();
    App.Collections.saved.each(this.addSavedMovie, this);
    this.saved_movies_length_text.text(App.Collections.saved.length);

    App.Collections.search.on('add', this.addSearchMovie);
    App.Collections.saved.on('add', this.addSavedMovie, this);

    console.log(this);
  },
  addSearchMovie: function(movie){
    let movieView = new SearchMovieView({ model: movie });
    $('#search_movies_div').append(movieView.render().el);
  },
  addSavedMovie: function(movie){
    let movieView = new SavedMovieView({ model: movie });
    $('#saved_movies_div').append(movieView.render().el);
    this.saved_movie_imdbIDs.push(movie.get("imdbID"));
    this.saved_movies_length_text.text(App.Collections.saved.length);
  },

  searchMovies: function() {
    let self = this;
    let query = $('#movie_query').val();
    if(!query){ return; }
    let api_url = 'https://www.omdbapi.com/?s=' + query + '&apikey=65a36b6f';
    fetch(api_url)
    .then(function(resp){ return resp.json() })
    .then(function(json){
      console.log(json);
      $('#movie_query').val('');
      if(json.Error){
        M.toast({html: json.Error});
        return;
      }
      self.searchResults = json.Search;
      App.Collections.search.reset(null);
      $('#search_movies_div').html('');
      json.Search
      .filter(function(m){ return !self.saved_movie_imdbIDs.includes(m.imdbID) })
      .forEach(function(movie){
        App.Collections.search.add(movie);
      });
    })
  }
});
