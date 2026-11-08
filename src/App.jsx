import { useEffect, useRef, useState } from "react";
import products from "../data.json";

const STORAGE_KEY = "product-list-with-cart";
const productsByName = new Map(products.map((product) => [product.name, product]));
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatPrice(cents) {
  return currency.format(cents / 100);
}

function getAssetPath(path) {
  return path.replace("./assets/", "/");
}

function readSavedCart() {
  try {
    const savedCart = window.localStorage.getItem(STORAGE_KEY);

    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      throw new TypeError("Saved cart must be an array.");
    }

    const quantities = new Map();

    parsedCart.forEach((item) => {
      if (
        item &&
        productsByName.has(item.name) &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0
      ) {
        quantities.set(
          item.name,
          (quantities.get(item.name) ?? 0) + item.quantity,
        );
      }
    });

    return Array.from(quantities, ([name, quantity]) => ({ name, quantity }));
  } catch (error) {
    console.warn("Could not read the saved cart. Starting with an empty cart.", error);
    return [];
  }
}

function getTotalCents(items) {
  return items.reduce((total, item) => {
    const product = productsByName.get(item.name);
    return total + Math.round(product.price * 100) * item.quantity;
  }, 0);
}

function AddToCartButton({ onClick, productName }) {
  return (
    <button
      className="add-button"
      type="button"
      onClick={onClick}
      aria-label={`Add ${productName} to cart`}
    >
      <img src="/images/icon-add-to-cart.svg" alt="" aria-hidden="true" />
      <span>Add to Cart</span>
    </button>
  );
}

function QuantityControl({ productName, quantity, onDecrease, onIncrease }) {
  return (
    <div className="quantity-control" role="group" aria-label={`${productName} quantity`}>
      <button
        className="quantity-button"
        type="button"
        onClick={onDecrease}
        aria-label={`Decrease ${productName} quantity`}
      >
        <img src="/images/icon-decrement-quantity.svg" alt="" aria-hidden="true" />
      </button>
      <span aria-live="polite" aria-atomic="true">{quantity}</span>
      <button
        className="quantity-button"
        type="button"
        onClick={onIncrease}
        aria-label={`Increase ${productName} quantity`}
      >
        <img src="/images/icon-increment-quantity.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  );
}

function ProductCard({ product, quantity, onAdd, onDecrease, onIncrease }) {
  const isSelected = quantity > 0;

  return (
    <article className="product-card">
      <div className={`product-image${isSelected ? " is-selected" : ""}`}>
        <picture>
          <source
            media="(max-width: 600px)"
            srcSet={getAssetPath(product.image.mobile)}
          />
          <source
            media="(max-width: 1024px)"
            srcSet={getAssetPath(product.image.tablet)}
          />
          <img
            src={getAssetPath(product.image.desktop)}
            alt={product.name}
            loading="lazy"
          />
        </picture>
        <div className="product-action">
          {isSelected ? (
            <QuantityControl
              productName={product.name}
              quantity={quantity}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
            />
          ) : (
            <AddToCartButton productName={product.name} onClick={onAdd} />
          )}
        </div>
      </div>
      <div className="product-details">
        <p className="product-category">{product.category}</p>
        <h2 className="product-name">{product.name}</h2>
        <p className="product-price">{formatPrice(Math.round(product.price * 100))}</p>
      </div>
    </article>
  );
}

function CartItem({ item, onRemove }) {
  const product = productsByName.get(item.name);
  const lineTotal = Math.round(product.price * 100) * item.quantity;

  return (
    <li className="cart-item">
      <div className="cart-item-details">
        <h3>{product.name}</h3>
        <div className="cart-item-pricing">
          <span className="cart-quantity">{item.quantity}x</span>
          <span className="cart-unit-price">@ {formatPrice(Math.round(product.price * 100))}</span>
          <span className="cart-line-total">{formatPrice(lineTotal)}</span>
        </div>
      </div>
      <button
        className="remove-button"
        type="button"
        onClick={() => onRemove(item.name)}
        aria-label={`Remove ${product.name} from cart`}
      >
        <img src="/images/icon-remove-item.svg" alt="" aria-hidden="true" />
      </button>
    </li>
  );
}

function Cart({ items, itemCount, totalCents, onRemove, onConfirm }) {
  const isEmpty = items.length === 0;

  return (
    <aside className="cart-panel" aria-labelledby="cart-title">
      <h2 className="cart-title" id="cart-title">
        Your Cart <span aria-live="polite">({itemCount})</span>
      </h2>

      {isEmpty ? (
        <div className="empty-cart">
          <img src="/images/illustration-empty-cart.svg" alt="" aria-hidden="true" />
          <p>Your added items will appear here</p>
        </div>
      ) : (
        <>
          <ul className="cart-items" aria-label="Items in your cart">
            {items.map((item) => (
              <CartItem key={item.name} item={item} onRemove={onRemove} />
            ))}
          </ul>
          <div className="order-total">
            <span>Order Total</span>
            <strong>{formatPrice(totalCents)}</strong>
          </div>
          <p className="delivery-note">
            <img src="/images/icon-carbon-neutral.svg" alt="" aria-hidden="true" />
            <span>
              This is a <strong>carbon-neutral</strong> delivery
            </span>
          </p>
          <button className="primary-button" type="button" onClick={onConfirm}>
            Confirm Order
          </button>
        </>
      )}
    </aside>
  );
}

function ConfirmationModal({ items, totalCents, isOpen, onClose, onStartNewOrder }) {
  const dialogRef = useRef(null);
  const startNewOrderRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      startNewOrderRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      className="confirmation-dialog"
      ref={dialogRef}
      aria-labelledby="confirmation-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (isOpen) onClose();
      }}
    >
      <img
        className="confirmation-icon"
        src="/images/icon-order-confirmed.svg"
        alt=""
        aria-hidden="true"
      />
      <h2 id="confirmation-title">Order Confirmed</h2>
      <p className="confirmation-subtitle">We hope you enjoy your food!</p>
      <ul className="confirmation-items" aria-label="Confirmed order">
        {items.map((item) => {
          const product = productsByName.get(item.name);
          const lineTotal = Math.round(product.price * 100) * item.quantity;

          return (
            <li className="confirmation-item" key={item.name}>
              <img
                className="confirmation-thumbnail"
                src={getAssetPath(product.image.thumbnail)}
                alt=""
              />
              <div className="confirmation-item-details">
                <h3>{product.name}</h3>
                <div className="cart-item-pricing">
                  <span className="cart-quantity">{item.quantity}x</span>
                  <span className="cart-unit-price">
                    @ {formatPrice(Math.round(product.price * 100))}
                  </span>
                </div>
              </div>
              <strong className="confirmation-line-total">{formatPrice(lineTotal)}</strong>
            </li>
          );
        })}
        <li className="confirmation-total">
          <span>Order Total</span>
          <strong>{formatPrice(totalCents)}</strong>
        </li>
      </ul>
      <button
        className="primary-button"
        type="button"
        ref={startNewOrderRef}
        onClick={onStartNewOrder}
      >
        Start New Order
      </button>
    </dialog>
  );
}

export default function App() {
  const [cart, setCart] = useState(readSavedCart);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Could not save the cart to local storage.", error);
    }
  }, [cart]);

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCents = getTotalCents(cart);
  const quantities = new Map(cart.map((item) => [item.name, item.quantity]));

  function updateQuantity(productName, change) {
    setCart((currentCart) => {
      const currentItem = currentCart.find((item) => item.name === productName);
      const nextQuantity = (currentItem?.quantity ?? 0) + change;

      if (nextQuantity <= 0) {
        return currentCart.filter((item) => item.name !== productName);
      }

      if (!currentItem) {
        return [...currentCart, { name: productName, quantity: nextQuantity }];
      }

      return currentCart.map((item) =>
        item.name === productName ? { ...item, quantity: nextQuantity } : item,
      );
    });
  }

  function removeFromCart(productName) {
    setCart((currentCart) => currentCart.filter((item) => item.name !== productName));
  }

  function startNewOrder() {
    setCart([]);
    setIsConfirmationOpen(false);
  }

  return (
    <main className="page-shell">
      <section className="product-section" aria-labelledby="page-title">
        <h1 id="page-title">Desserts</h1>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.name}
              product={product}
              quantity={quantities.get(product.name) ?? 0}
              onAdd={() => updateQuantity(product.name, 1)}
              onDecrease={() => updateQuantity(product.name, -1)}
              onIncrease={() => updateQuantity(product.name, 1)}
            />
          ))}
        </div>
      </section>
      <Cart
        items={cart}
        itemCount={itemCount}
        totalCents={totalCents}
        onRemove={removeFromCart}
        onConfirm={() => setIsConfirmationOpen(true)}
      />
      <ConfirmationModal
        items={cart}
        totalCents={totalCents}
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onStartNewOrder={startNewOrder}
      />
    </main>
  );
}
