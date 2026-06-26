const products = [
  {
    id: 1,
    name: 'Eco Luxe Sneakers',
    category: 'Footwear',
    price: 84.99,
    rating: 4.7,
    description: 'Lightweight sneaker with breathable mesh and recycled materials.',
    image: 'https://images.unsplash.com/photo-1528701800489-20e7c5f442a8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'Urban Leather Backpack',
    category: 'Accessories',
    price: 119.00,
    rating: 4.5,
    description: 'Structured backpack with laptop sleeve and waterproof finish.',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'Classic Denim Jacket',
    category: 'Apparel',
    price: 69.50,
    rating: 4.6,
    description: 'Timeless denim jacket with relaxed fit and soft fabric.',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    name: 'Minimalist Watch',
    category: 'Accessories',
    price: 145.00,
    rating: 4.9,
    description: 'Sleek watch with stainless steel case and leather strap.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    name: 'Sporty Jacket',
    category: 'Apparel',
    price: 99.99,
    rating: 4.4,
    description: 'Water-resistant jacket with hidden pockets and flexible fit.',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    name: 'Everyday Slip-On Shoes',
    category: 'Footwear',
    price: 64.00,
    rating: 4.3,
    description: 'Comfort-driven slip-on shoes for daily city wear.',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80'
  }
];

const state = {
  cart: {},
  category: 'All',
  query: '',
  sort: 'default'
};

const productGrid = document.getElementById('productGrid');
const categoryList = document.getElementById('categoryList');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartFeedback = document.getElementById('cartFeedback');

function formatCurrency(value) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function getUniqueCategories() {
  return ['All', ...new Set(products.map((product) => product.category))];
}

function setActiveCategory(category) {
  state.category = category;
  renderCategoryFilters();
  renderProducts();
}

function handleSearch(event) {
  state.query = event.target.value.trim().toLowerCase();
  renderProducts();
}

function handleSort(event) {
  state.sort = event.target.value;
  renderProducts();
}

function filterProducts() {
  return products
    .filter((product) => {
      const matchesCategory = state.category === 'All' || product.category === state.category;
      const matchesQuery = product.name.toLowerCase().includes(state.query) || product.description.toLowerCase().includes(state.query);
      return matchesCategory && matchesQuery;
    })
    .sort((a, b) => {
      if (state.sort === 'low') return a.price - b.price;
      if (state.sort === 'high') return b.price - a.price;
      return a.id - b.id;
    });
}

function renderCategoryFilters() {
  const categories = getUniqueCategories();
  categoryList.innerHTML = categories.map((category) => {
    const activeClass = category === state.category ? 'active' : 'text-muted';
    return `
      <button type="button" class="btn btn-sm btn-outline-secondary filter-pill ${activeClass}" onclick="setActiveCategory('${category}')">
        ${category}
      </button>
    `;
  }).join(' ');
}

function renderProducts() {
  const visibleProducts = filterProducts();

  if (visibleProducts.length === 0) {
    productGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <h5>No products found</h5>
        <p class="text-muted">Try adjusting your search or category filter.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = visibleProducts.map((product) => `
    <div class="col-md-4 mb-4">
      <div class="card card-product h-100 shadow-sm">
        <div class="position-relative overflow-hidden" style="height: 260px;">
          <img src="${product.image}" class="card-img-top product-img" alt="${product.name}" />
          <span class="badge badge-category bg-primary">${product.category}</span>
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text text-muted small">${product.description}</p>
          <div class="mt-auto">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <strong>${formatCurrency(product.price)}</strong>
              <div class="product-rating" title="Rating: ${product.rating}">
                ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}
              </div>
            </div>
            <button class="btn btn-sm btn-outline-primary w-100" onclick="addToCart(${product.id})">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function updateCartCount() {
  const totalQuantity = Object.values(state.cart).reduce((sum, item) => sum + item.quantity, 0);
  cartCount.innerText = totalQuantity;
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  if (state.cart[productId]) {
    state.cart[productId].quantity += 1;
  } else {
    state.cart[productId] = { ...product, quantity: 1 };
  }
  renderCart();
  updateCartCount();
  showCartToast(`${product.name} added to cart.`);
}

function removeFromCart(productId) {
  delete state.cart[productId];
  renderCart();
  updateCartCount();
}

function changeQuantity(productId, delta) {
  const item = state.cart[productId];
  if (!item) return;
  item.quantity += delta;
  if (item.quantity < 1) {
    removeFromCart(productId);
    return;
  }
  renderCart();
  updateCartCount();
}

function getCartTotal() {
  return Object.values(state.cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCart() {
  const items = Object.values(state.cart);

  if (items.length === 0) {
    cartItems.innerHTML = `<p class="cart-empty">Your cart is empty. Browse products and add items to the cart.</p>`;
    cartTotal.innerText = '$0.00';
    return;
  }

  cartItems.innerHTML = items.map((item) => `
    <div class="d-flex align-items-start mb-3">
      <img src="${item.image}" alt="${item.name}" class="rounded" width="64" height="64" style="object-fit: cover;" />
      <div class="ms-3 flex-grow-1">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="mb-1">${item.name}</h6>
            <p class="mb-1 text-muted small">${formatCurrency(item.price)}</p>
          </div>
          <button class="btn btn-sm btn-link text-danger p-0" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
        <div class="btn-group btn-group-sm" role="group">
          <button type="button" class="btn btn-outline-secondary" onclick="changeQuantity(${item.id}, -1)">-</button>
          <button type="button" class="btn btn-outline-secondary disabled">${item.quantity}</button>
          <button type="button" class="btn btn-outline-secondary" onclick="changeQuantity(${item.id}, 1)">+</button>
        </div>
      </div>
    </div>
  `).join('');

  cartTotal.innerText = formatCurrency(getCartTotal());
}

function showCartToast(message) {
  const toastElement = document.getElementById('cartToast');
  const toastBody = document.getElementById('cartToastBody');
  toastBody.textContent = message;
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

function init() {
  renderCategoryFilters();
  renderProducts();
  renderCart();
  updateCartCount();

  searchInput.addEventListener('input', handleSearch);
  sortSelect.addEventListener('change', handleSort);
}

window.setActiveCategory = setActiveCategory;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.changeQuantity = changeQuantity;

window.addEventListener('DOMContentLoaded', init);
