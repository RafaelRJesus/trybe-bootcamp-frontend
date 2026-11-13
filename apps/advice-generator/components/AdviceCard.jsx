import React, { Component } from 'react';
import styles from './AdviceCard.module.css';
import mobileDivider from '../assets/images/divider-mobile.svg';
import desktopDivider from '../assets/images/divider-desktop.svg';
import dice from '../assets/images/icon-dice.svg';
import { fetchData } from '../services/advice-api';

class AdviceCard extends Component {
  state = {
    data: null,
    loading: true,
    error: false,
  };

  componentDidMount() {
    this.isComponentMounted = true;
    this.fetchAdvice();
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  fetchAdvice = async () => {
    this.setState({ loading: true, error: false });
    try {
      const response = await fetchData();
      if (this.isComponentMounted) this.setState({ data: response, loading: false });
    } catch {
      // BUG-09 (corrigido): sem try/catch, uma falha na API deixava a tela
      // presa em "Loading..." e gerava um erro não tratado no console.
      if (this.isComponentMounted) this.setState({ loading: false, error: true });
    }
  };

  render() {
    const { data, loading, error } = this.state;

    return (
      <div className={ styles.container }>
        <div className={ styles.card__content } aria-live="polite" aria-busy={ loading }>
          {loading && <p className={ styles.loading }>Loading...</p>}
          {!loading && error && (
            <p className={ styles.advice } role="alert">
              Could not load an advice. Please try again.
            </p>
          )}
          {!loading && !error && (
            <>
              <p className={ styles.advice__id }>{`advice #${data.slip.id}`}</p>
              <h1 className={ styles.advice }>{`"${data.slip.advice}"`}</h1>
            </>
          )}
          <picture>
            <source media="(max-width: 540px)" srcSet={ mobileDivider } />
            <img src={ desktopDivider } alt="" />
          </picture>
          {/* BUG-10 (corrigido): o botão não tinha nome acessível e podia ser
              clicado várias vezes durante o carregamento. */}
          <button
            type="button"
            className={ styles.dice }
            onClick={ this.fetchAdvice }
            disabled={ loading }
            aria-label="Gerar novo conselho"
          >
            <img src={ dice } alt="" />
          </button>
        </div>
      </div>
    );
  }
}

export default AdviceCard;
