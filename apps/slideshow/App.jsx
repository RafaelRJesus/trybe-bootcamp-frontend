import React from 'react';
import './App.css';
import Carousel from './components/Carousel';
import { CATEGORIES } from './services/api';

class App extends React.Component {
  state = {
    showCarousel: true,
    currentCategory: CATEGORIES[0],
  };

  toggleCarousel = () => {
    this.setState((prevState) => ({
      showCarousel: !prevState.showCarousel,
    }));
  };

  changeCategory = ({ target }) => {
    this.setState({ currentCategory: target.value });
  };

  render() {
    const { showCarousel, currentCategory } = this.state;
    return (
      <main>
        <div className="wrapper">
          <h1>Slideshow de Imagens</h1>
          <div className="controls">
            <label htmlFor="category">
              Categoria
              <select
                id="category"
                value={ currentCategory }
                onChange={ this.changeCategory }
              >
                {CATEGORIES.map((category) => (
                  <option key={ category } value={ category }>{category}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={ this.toggleCarousel }>
              {showCarousel ? 'Ocultar carrossel' : 'Mostrar carrossel'}
            </button>
          </div>
        </div>
        {showCarousel && <Carousel category={ currentCategory } />}
      </main>
    );
  }
}

export default App;
