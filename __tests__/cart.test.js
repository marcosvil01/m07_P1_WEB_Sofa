const fs = require('fs');
const path = require('path');

// JSDOM environment is provided by Jest by default.

describe('agregarAlCarrito', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="cart-count"></div>
      <div id="cart-items-container"></div>
      <span id="total-price"></span>
      <button id="add-to-cart-btn"></button>
      <div id="productModal"></div>
      <span id="modal-product-name"></span>
      <span id="modal-product-price"></span>
      <img id="modal-product-image">
      <input id="modal-cantidad" value="1" />
    `;

    global.fetch = jest.fn(() => Promise.resolve({
      text: () => Promise.resolve(''),
      json: () => Promise.resolve([])
    }));

    global.bootstrap = { Modal: jest.fn().mockImplementation(() => ({ show: jest.fn(), hide: jest.fn() })) };

    jest.isolateModules(() => {
      require('../styles/js/script.js');
      document.dispatchEvent(new Event('DOMContentLoaded'));
    });
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('adds a new item to the cart', () => {
    window.agregarAlCarrito('Sofa', 100, 'img.png', 2);
    const items = window.__getCartItems();
    expect(items.length).toBe(1);
    expect(items[0].cantidad).toBe(2);
  });

  test('increases quantity for existing items', () => {
    window.agregarAlCarrito('Sofa', 100, 'img.png', 2);
    window.agregarAlCarrito('Sofa', 100, 'img.png', 3);
    const items = window.__getCartItems();
    expect(items.length).toBe(1);
    expect(items[0].cantidad).toBe(5);
  });
});
