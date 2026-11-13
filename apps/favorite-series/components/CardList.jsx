import React from 'react';
import seriesData from '../data';
import Card from './Card';

class CardList extends React.Component {
  state = {
    data: seriesData,
    onlyFavorites: false,
  };

  handleFavorite = (id) => {
    this.setState(({ data }) => ({
      data: data.map((serie) => (
        serie.id === id ? { ...serie, favorite: !serie.favorite } : serie
      )),
    }));
  };

  toggleFilter = () => {
    this.setState(({ onlyFavorites }) => ({ onlyFavorites: !onlyFavorites }));
  };

  render() {
    const { data, onlyFavorites } = this.state;
    const favoritesCount = data.filter((serie) => serie.favorite).length;
    const visibleSeries = onlyFavorites ? data.filter((serie) => serie.favorite) : data;

    return (
      <>
        <p className="favorites-summary" role="status">
          {`${favoritesCount} de ${data.length} séries favoritadas`}
        </p>
        <div className="filter">
          <label htmlFor="only-favorites">
            <input
              id="only-favorites"
              type="checkbox"
              checked={ onlyFavorites }
              onChange={ this.toggleFilter }
            />
            {' Mostrar só as favoritas'}
          </label>
        </div>
        <div className="Series__container">
          {visibleSeries.map((serie) => (
            <Card
              key={ serie.id }
              name={ serie.name }
              categoria={ serie.genre }
              personagens={ serie.characters }
              rating={ serie.nota }
              release={ serie.release }
              favorite={ serie.favorite }
              handleFavorite={ () => this.handleFavorite(serie.id) }
            />
          ))}
        </div>
      </>
    );
  }
}

export default CardList;
