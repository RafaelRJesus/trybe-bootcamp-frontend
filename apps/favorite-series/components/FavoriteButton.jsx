import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { MdFavoriteBorder, MdFavorite } from 'react-icons/md';

class FavoriteButton extends Component {
  render() {
    const { isFavorite, handleFavorite, serieName } = this.props;
    // BUG-15 (corrigido): o botão só tinha um ícone, sem nome acessível.
    // Leitores de tela anunciavam apenas "botão", sem dizer o que ele faz.
    return (
      <button
        type="button"
        onClick={ handleFavorite }
        aria-pressed={ isFavorite }
        aria-label={ `Favoritar ${serieName}` }
      >
        { isFavorite ? <MdFavorite aria-hidden="true" /> : <MdFavoriteBorder aria-hidden="true" /> }
      </button>
    );
  }
}

FavoriteButton.propTypes = {
  isFavorite: PropTypes.bool.isRequired,
  handleFavorite: PropTypes.func.isRequired,
  serieName: PropTypes.string.isRequired,
};

export default FavoriteButton;
