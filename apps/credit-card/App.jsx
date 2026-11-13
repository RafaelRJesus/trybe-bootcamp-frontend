import './App.css';
import React from 'react';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import Form from './components/Form';
import { isCardValid, maskCardNumber } from './validators';

const emptyCard = {
  name: '',
  cvc: '',
  expiry: '',
  number: '',
  focus: '',
};

class App extends React.Component {
  state = {
    cardInfo: emptyCard,
    savedCards: [],
    successMessage: '',
  };

  handleInputFocus = (e) => {
    const { name } = e.target;
    this.setState((prev) => ({ cardInfo: { ...prev.cardInfo, focus: name } }));
  };

  handleSaveCard = (event) => {
    event.preventDefault();
    const { cardInfo } = this.state;
    if (!isCardValid(cardInfo)) return;

    // Antes, um alert() bloqueava a tela a cada cadastro.
    this.setState((prev) => ({
      savedCards: [...prev.savedCards, { ...cardInfo, id: Date.now() }],
      cardInfo: emptyCard,
      successMessage: 'Cartão cadastrado com sucesso!',
    }));
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState((prev) => ({
      cardInfo: { ...prev.cardInfo, [name]: value },
      successMessage: '',
    }));
  };

  render() {
    const { cardInfo, savedCards, successMessage } = this.state;
    const { cvc, expiry, name, number, focus } = cardInfo;
    return (
      <main className="grid">
        <section className="left">
          <div className="wrapper">
            <h1>Cadastro de cartão</h1>
            <Form
              cardInfo={ cardInfo }
              handleChange={ this.handleChange }
              handleSaveCard={ this.handleSaveCard }
              handleInputFocus={ this.handleInputFocus }
            />
            <p role="status" className="success-message">{successMessage}</p>
          </div>
        </section>
        <section className="right">
          <div className="wrapper">
            <h2>Pré-visualização</h2>
            <Cards
              cvc={ cvc }
              expiry={ expiry }
              name={ name }
              number={ number }
              focused={ focus }
            />
            {savedCards.length > 0 && (
              <>
                <h2>Cartões cadastrados</h2>
                <ul aria-label="Cartões cadastrados" className="saved-cards">
                  {savedCards.map((card) => (
                    <li key={ card.id }>
                      {`${maskCardNumber(card.number)} - ${card.name}`}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      </main>
    );
  }
}

export default App;
