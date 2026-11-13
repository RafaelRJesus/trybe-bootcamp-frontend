import PropTypes from 'prop-types';
import React from 'react';
import { AiFillDelete } from 'react-icons/ai';
import './Movie.css';

class Movie extends React.Component {
  state = { watched: false, editing: false, newTitle: this.props.title };

  handleEditChange = (event) => {
    this.setState({ newTitle: event.target.value });
  };

  editMovie = () => {
    this.setState({ editing: true, newTitle: this.props.title });
  };

  removeMovie = () => {
    this.props.removeMovie(this.props.id);
  };

  toggleWatched = () => {
    this.setState((prevState) => ({ watched: !prevState.watched }));
  };

  saveEdit = (event) => {
    event.preventDefault();
    // BUG-07 (corrigido): salvar a edição com o campo vazio apagava o título do filme.
    const newTitle = this.state.newTitle.trim();
    if (newTitle) this.props.editMovie(this.props.id, newTitle);
    this.setState({ editing: false });
  };

  render() {
    const { watched, editing, newTitle } = this.state;
    const { title } = this.props;

    return (
      <li className="movie-item">
        {editing ? (
          <form className="movie-edit" onSubmit={ this.saveEdit }>
            <input
              type="text"
              aria-label={ `Novo título para ${title}` }
              value={ newTitle }
              onChange={ this.handleEditChange }
            />
            <button type="submit">Salvar</button>
          </form>
        ) : (
          <div className="movie-info">
            {/* BUG-08 (corrigido): título, status e lixeira eram <span> e <svg> com
                onClick e aria-hidden. Não dava para usar pelo teclado nem por leitor de tela. */}
            <div>
              <button
                type="button"
                className="movie-title"
                onClick={ this.editMovie }
                title="Clique para editar"
              >
                {title}
              </button>
              <button
                type="button"
                className="movie-status"
                onClick={ this.toggleWatched }
                aria-pressed={ watched }
              >
                {watched ? '(assistido)' : '(desejo assistir)'}
              </button>
            </div>
            <button
              type="button"
              className="delete-button"
              onClick={ this.removeMovie }
              aria-label={ `Remover ${title}` }
            >
              <AiFillDelete className="delete-icon" aria-hidden="true" />
            </button>
          </div>
        )}
      </li>
    );
  }
}

Movie.propTypes = {
  id: PropTypes.number.isRequired,
  editMovie: PropTypes.func.isRequired,
  removeMovie: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default Movie;
