import PropTypes from 'prop-types';
import { Component } from 'react';
import './Carousel.css';
import { fetchImages } from '../services/api';

export const SLIDE_INTERVAL_MS = 4000;

class Carousel extends Component {
  state = {
    images: [],
    isLoading: true,
    hasError: false,
    currentImageIndex: 0,
  };

  componentDidMount() {
    this.isComponentMounted = true;
    this.getImages();
  }

  componentDidUpdate(prevProps) {
    const { category } = this.props;
    if (prevProps.category !== category) {
      this.getImages();
    }
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
    clearInterval(this.timeID);
  }

  getImages = async () => {
    const { category } = this.props;
    // BUG-02 (corrigido): ao trocar de categoria, um novo setInterval era criado
    // sem limpar o anterior, e o slideshow passava a avançar cada vez mais rápido.
    clearInterval(this.timeID);
    this.setState({ isLoading: true, hasError: false });

    try {
      const images = await fetchImages(category);
      if (!this.isComponentMounted) return;
      this.setState({ isLoading: false, images, currentImageIndex: 0 });
      this.startAutoPlay();
    } catch {
      // BUG-17 (corrigido): em caso de erro o carrossel ficava em "Carregando" para sempre.
      if (this.isComponentMounted) this.setState({ isLoading: false, hasError: true });
    }
  };

  startAutoPlay = () => {
    clearInterval(this.timeID);
    this.timeID = setInterval(this.nextImage, SLIDE_INTERVAL_MS);
  };

  nextImage = () => {
    this.setState(({ images, currentImageIndex }) => ({
      currentImageIndex: (currentImageIndex + 1) % images.length,
    }));
  };

  previousImage = () => {
    // BUG-01 (corrigido): (0 - 1) % 5 resulta em -1 em JavaScript, então voltar
    // a partir da primeira imagem deixava o carrossel sem imagem.
    this.setState(({ images, currentImageIndex }) => ({
      currentImageIndex: (currentImageIndex - 1 + images.length) % images.length,
    }));
  };

  handleManualNavigation = (move) => {
    move();
    this.startAutoPlay();
  };

  render() {
    const { isLoading, hasError, images, currentImageIndex } = this.state;

    if (isLoading) {
      return <p className="wrapper">Carregando...</p>;
    }

    if (hasError) {
      return (
        <div className="wrapper" role="alert">
          <p>Não foi possível carregar as imagens.</p>
          <button type="button" onClick={ this.getImages }>Tentar novamente</button>
        </div>
      );
    }

    const image = images[currentImageIndex];

    return (
      <section className="carousel" aria-label="Carrossel de imagens">
        <button
          type="button"
          aria-label="Imagem anterior"
          className="carousel-button carousel-button-left"
          onClick={ () => this.handleManualNavigation(this.previousImage) }
        >
          &#8249;
        </button>

        <img
          className="carousel-image"
          src={ image.src }
          alt={ `Foto de ${image.author}` }
          data-testid="carousel-image"
        />
        <p className="carousel-counter">
          {`${currentImageIndex + 1} / ${images.length}`}
        </p>

        <button
          type="button"
          aria-label="Próxima imagem"
          className="carousel-button carousel-button-right"
          onClick={ () => this.handleManualNavigation(this.nextImage) }
        >
          &#8250;
        </button>
      </section>
    );
  }
}

Carousel.propTypes = {
  category: PropTypes.string.isRequired,
};

export default Carousel;
