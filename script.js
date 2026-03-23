const API_KEY = '68e094699525b18a70bab2f86b1fa706';
const API_URL = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`;
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let movies = [];
let cart = [];

// DOM Elements
const moviesGrid = document.getElementById('movies-grid');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// Fetch movies
async function fetchMovies() {
    try {
        // Show skeletons
        moviesGrid.innerHTML = Array(8).fill(0).map(() => `
            <div class="movie-card skeleton" style="height: 480px;"></div>
        `).join('');

        const response = await fetch(API_URL);
        const data = await response.json();
        
        movies = data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            poster: movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : null,
            // Generate fake price based on rating
            price: Math.max(9.99, (movie.vote_average * 2.5)).toFixed(2)
        })).filter(movie => movie.poster); // only keep ones with posters

        renderMovies();
        
    } catch (error) {
        console.error('Error fetching movies:', error);
        moviesGrid.innerHTML = '<p>Failed to load movies. Please check your connection.</p>';
    }
}

// Render movies to grid
function renderMovies() {
    moviesGrid.innerHTML = movies.map(movie => `
        <div class="movie-card" id="movie-${movie.id}">
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
            <div class="movie-info">
                <h4 class="movie-title">${movie.title}</h4>
                <div class="movie-price">$${movie.price}</div>
                <button class="add-to-cart" onclick="addToCart(${movie.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Cart Logic
window.addToCart = function(id) {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    // Check if already in cart
    if (cart.find(item => item.id === id)) {
        return; // Already in cart
    }

    cart.push(movie);
    updateCartUI();
    
    // Animate button
    const btn = document.querySelector(`#movie-${id} .add-to-cart`);
    if(btn) {
        btn.textContent = 'Added';
        btn.classList.add('added');
        setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.classList.remove('added');
        }, 2000);
    }
};

window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
};

function updateCartUI() {
    // Update count
    cartCount.textContent = cart.length;
    
    // Update total
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
    cartTotal.textContent = total.toFixed(2);
    
    // Render items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #a0a0a0; margin-top: 2rem;">Your cart is empty.</p>';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.poster}" alt="${item.title}">
            <div class="item-info">
                <div class="item-title">${item.title}</div>
                <div class="item-price">$${item.price}</div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');
}

// Event Listeners
cartBtn.addEventListener('click', () => {
    cartOverlay.classList.add('open');
});

closeCartBtn.addEventListener('click', () => {
    cartOverlay.classList.remove('open');
});

// Close cart when clicking outside panel
cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) {
        cartOverlay.classList.remove('open');
    }
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    alert(`Thank you for your purchase of $${cartTotal.textContent}!`);
    cart = [];
    updateCartUI();
    cartOverlay.classList.remove('open');
});

// Init
fetchMovies();
updateCartUI();
