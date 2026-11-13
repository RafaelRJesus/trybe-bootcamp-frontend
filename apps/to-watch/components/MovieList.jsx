import React from 'react';
import Movie from './Movie';
import MovieForm from './MovieForm';

export const LOADING_DELAY_MS = 1000;

class MovieList extends React.Component {
  state = {
    movies: [],
    isLoading: true,
  };

  nextId = 1;

  componentDidMount() {
    // Simula o carregamento dos dados
    this.loadingTimer = setTimeout(() => {
      this.setState({ isLoading: false });
    }, LOADING_DELAY_MS);
  }

  componentWillUnmount() {
    clearTimeout(this.loadingTimer);
  }

  // BUG-04 e BUG-06 (corrigidos): os filmes eram identificados pelo título e
  // renderizados com key={index}. Com isso, títulos repetidos eram removidos ou
  // editados juntos, e o status "assistido" pulava para outro filme após uma remoção.
  addMovie = (title) => {
    const movie = { id: this.nextId, title };
    this.nextId += 1;
    this.setState((prevState) => ({ movies: [...prevState.movies, movie] }));
  };

  removeMovie = (id) => {
    this.setState((prevState) => ({
      movies: prevState.movies.filter((movie) => movie.id !== id),
    }));
  };

  editMovie = (id, newTitle) => {
    this.setState((prevState) => ({
      movies: prevState.movies.map((movie) => (
        movie.id === id ? { ...movie, title: newTitle } : movie
      )),
    }));
  };

  render() {
    const { isLoading, movies } = this.state;

    if (isLoading) {
      return <p>Carregando...</p>;
    }

    return (
      <div>
        <MovieForm addMovie={ this.addMovie } />
        {movies.length === 0 && (
          <p className="empty-list">Nenhum filme na lista ainda.</p>
        )}
        <ul aria-label="Lista de filmes">
          {movies.map((movie) => (
            <Movie
              key={ movie.id }
              id={ movie.id }
              title={ movie.title }
              removeMovie={ this.removeMovie }
              editMovie={ this.editMovie }
            />
          ))}
        </ul>
      </div>
    );
  }
}

export default MovieList;
