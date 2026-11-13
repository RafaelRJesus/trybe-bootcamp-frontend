import PropTypes from 'prop-types';
import React from 'react';

class MovieForm extends React.Component {
  state = { title: '', error: '' };

  handleChange = (event) => {
    this.setState({ title: event.target.value, error: '' });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    // BUG-05 (corrigido): era possível adicionar filmes sem título ou só com espaços.
    const title = this.state.title.trim();
    if (!title) {
      this.setState({ error: 'Digite o título do filme.' });
      return;
    }
    this.props.addMovie(title);
    this.setState({ title: '' });
  };

  render() {
    const { title, error } = this.state;
    return (
      <form onSubmit={ this.handleSubmit } noValidate>
        <label htmlFor="movie-title">
          Título do Filme:
          <input
            id="movie-title"
            type="text"
            value={ title }
            onChange={ this.handleChange }
            aria-invalid={ Boolean(error) }
            aria-describedby={ error ? 'movie-title-error' : undefined }
          />
        </label>
        {error && <p id="movie-title-error" className="form-error" role="alert">{error}</p>}
        <input type="submit" value="Adicionar Filme" />
      </form>
    );
  }
}

MovieForm.propTypes = {
  addMovie: PropTypes.func.isRequired,
};

export default MovieForm;
