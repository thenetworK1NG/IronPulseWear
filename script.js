// Initialize Stripe
const stripe = Stripe('your_publishable_key'); // Replace with your actual Stripe publishable key

// Cart functionality
let cart = [];
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');

// Product database (in reality, this would come from a backend)
const products = {
    't-shirt-001': {
        name: 'Performance T-Shirt (XS-XL)',
        price: 350,
        image: 'https://via.placeholder.com/300'
    },
    't-shirt-002': {
        name: 'Performance T-Shirt (2XL-3XL)',
        price: 380,
        image: 'https://via.placeholder.com/300'
    },
    'shorts-001': {
        name: 'Training Shorts',
        price: 39.99,
        image: 'https://via.placeholder.com/300'
    },
    'leggings-001': {
        name: 'Compression Leggings',
        price: 59.99,
        image: 'https://via.placeholder.com/300'
    }
};

// Add event listeners to all buy buttons
document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', () => {
        const productId = button.getAttribute('data-item-id');
        addToCart(productId);
    });
});

// Cart icon click handler
document.querySelector('.cart-icon').addEventListener('click', (e) => {
    e.preventDefault();
    toggleCart();
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// Add to cart function
function addToCart(productId) {
    const product = products[productId];
    if (product) {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price
        });
        updateCart();
        showNotification(`Added ${product.name} to cart!`);
    }
}

// Update cart display
function updateCart() {
    // Update cart count
    cartCount.textContent = cart.length;

    // Update cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name}</span>
            <span>$${item.price.toFixed(2)}</span>
            <button onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
    `).join('');

    // Update total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = total.toFixed(2);

    // Enable/disable checkout button
    checkoutButton.disabled = cart.length === 0;
}

// Remove from cart function
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart.splice(index, 1);
        updateCart();
    }
}

// Toggle cart modal
function toggleCart() {
    cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Handle checkout
checkoutButton.addEventListener('click', async () => {
    try {
        // In a real application, you would make an API call to your server to create a Stripe session
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cart
            })
        });

        const session = await response.json();

        // Redirect to Stripe checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            alert(result.error.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error processing your payment. Please try again.');
    }
});

// Add scroll handling for header
let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('header-hidden');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('header-hidden')) {
        // Scrolling down
        header.classList.add('header-hidden');
    } else if (currentScroll < lastScroll && header.classList.contains('header-hidden')) {
        // Scrolling up
        header.classList.remove('header-hidden');
    }
    
    lastScroll = currentScroll;
});

// Mobile menu functionality
const hamburgerMenu = document.querySelector('.hamburger-menu');
const navLinks = document.querySelector('.nav-links');

hamburgerMenu.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburgerMenu.contains(e.target) && !navLinks.contains(e.target)) {
        hamburgerMenu.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        navLinks.classList.remove('active');
    });
}); 