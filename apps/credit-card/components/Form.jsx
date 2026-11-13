import PropTypes from 'prop-types';
import React, { Component } from 'react';
import './Form.css';
import { validateCard } from '../validators';

const fields = [
  { name: 'number', label: 'Número do cartão', type: 'tel', placeholder: '1234 5678 9012 3456', maxLength: 23, error: 'Número de cartão inválido.' },
  { name: 'name', label: 'Nome do titular', type: 'text', placeholder: 'Nome e sobrenome', error: 'Informe nome e sobrenome.' },
  { name: 'expiry', label: 'Data de validade', type: 'text', placeholder: 'MM/AA', maxLength: 5, error: 'Use MM/AA com uma data futura.' },
  { name: 'cvc', label: 'CVC', type: 'tel', placeholder: '123', maxLength: 3, error: 'O CVC tem 3 números.' },
];

export default class Form extends Component {
  render() {
    const { cardInfo, handleChange, handleSaveCard, handleInputFocus } = this.props;
    const validation = validateCard(cardInfo);
    const isValid = Object.values(validation).every(Boolean);

    return (
      <form className="credit-card-form" onSubmit={ handleSaveCard } noValidate>
        {fields.map((field) => {
          const value = cardInfo[field.name];
          const showError = value !== '' && !validation[field.name];
          const errorId = `${field.name}-error`;
          return (
            <div className="field" key={ field.name }>
              <label htmlFor={ field.name }>{`${field.label}:`}</label>
              <input
                onChange={ handleChange }
                onFocus={ handleInputFocus }
                value={ value }
                type={ field.type }
                id={ field.name }
                name={ field.name }
                placeholder={ field.placeholder }
                maxLength={ field.maxLength }
                required
                aria-invalid={ showError }
                aria-describedby={ showError ? errorId : undefined }
              />
              {showError && <small id={ errorId } className="field-error">{field.error}</small>}
            </div>
          );
        })}

        <button type="submit" disabled={ !isValid }>
          Cadastrar
        </button>
      </form>
    );
  }
}

Form.propTypes = {
  cardInfo: PropTypes.shape({
    cvc: PropTypes.string,
    expiry: PropTypes.string,
    name: PropTypes.string,
    number: PropTypes.string,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleInputFocus: PropTypes.func.isRequired,
  handleSaveCard: PropTypes.func.isRequired,
};
