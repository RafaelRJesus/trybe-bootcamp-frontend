import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';
import FavoriteButton from './FavoriteButton';

const MAX_RATING = 5;

class Card extends React.Component {
  render() {
    const { name, categoria, personagens, rating,
      release, favorite, handleFavorite } = this.props;
    const initials = name.split(' ').slice(0, 2).map((word) => word[0]).join('');

    return (
      <article className="Card" aria-label={ name }>
        <div className="Card__thumbnail" aria-hidden="true">{initials}</div>
        <div className="Card__body">
          <div className="title">
            <h2>{name}</h2>
            <FavoriteButton
              isFavorite={ favorite }
              handleFavorite={ handleFavorite }
              serieName={ name }
            />
          </div>
          <p>
            <small>{release}</small>
            <small>{categoria}</small>
          </p>
          <p className="stars" role="img" aria-label={ `Nota ${rating} de ${MAX_RATING}` }>
            {'⭐️ '.repeat(rating)}
          </p>

          <h3>Personagens</h3>
          <ul>
            {personagens.map((person) => <li key={ person }>{person}</li>)}
          </ul>
        </div>
      </article>
    );
  }
}

Card.propTypes = {
  name: PropTypes.string.isRequired,
  favorite: PropTypes.bool.isRequired,
  personagens: PropTypes.arrayOf(PropTypes.string).isRequired,
  categoria: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
  release: PropTypes.number.isRequired,
  handleFavorite: PropTypes.func.isRequired,
};
export default Card;
