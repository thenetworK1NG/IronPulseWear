// Initialize Stripe
const stripe = Stripe('your_publishable_key'); // Replace with your actual Stripe publishable key

// Cart functionality
let cart = [];
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartCountDesktop = document.getElementById('cart-count-desktop');
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
    const sizeButton = document.querySelector(`[data-item-id="${productId}"]`)
        .closest('.product-card')
        .querySelector('.size-btn.selected');

    if (!sizeButton) {
        showToast('Please select a size first');
        return;
    }

    const size = sizeButton.dataset.size;
    
    if (product) {
        cart.push({
            id: productId,
            name: `${product.name} - Size ${size}`,
            price: product.price
        });
        updateCart();
        showToast(`Added ${product.name} (${size}) to cart!`);
    }
}

// Update cart display
function updateCart() {
    // Show cart total
    document.querySelector('.cart-total').style.display = 'block';
    // Update cart count for both mobile and desktop
    cartCount.textContent = cart.length;
    cartCountDesktop.textContent = cart.length;

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

// Show checkout form in cart modal
function showCheckoutForm() {
    // Hide cart total
    document.querySelector('.cart-total').style.display = 'none';
    // Show modal if not already
    cartModal.style.display = 'block';
    const formHtml = `
        <form id="order-form">
            <label>Name*<br><input type="text" name="name" required></label><br>
            <label>Email*<br><input type="email" name="email" required></label><br>
            <label>Phone<br><input type="tel" name="phone"></label><br>
            <label>Order Details<br><textarea name="orderDetails" rows="4" required>${cart.map(item => item.name + ' (R' + item.price + ')').join(', ')}</textarea></label><br>
            <button type="submit">Submit Order</button>
        </form>
        <div id="order-success" style="display:none;color:green;margin-top:1rem;">Order sent! Thank you.</div>
    `;
    cartItems.innerHTML = formHtml;
    document.getElementById('cart-total').textContent = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
    document.getElementById('order-form').addEventListener('submit', submitOrder);
}

// Replace checkout button event
checkoutButton.removeEventListener('click', checkoutButton._listener || (()=>{}));
checkoutButton.addEventListener('click', showCheckoutForm);
checkoutButton._listener = showCheckoutForm;

// Submit order to Firebase
function submitOrder(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        orderDetails: form.orderDetails.value,
        timestamp: new Date().toISOString()
    };
    fetch('https://ironpulse-a4055-default-rtdb.firebaseio.com/orders.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(() => {
        document.getElementById('order-success').style.display = 'block';
        form.reset();
        cart.length = 0;
        updateCart();
    })
    .catch(() => {
        alert('There was an error sending your order. Please try again.');
    });
}

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

// Product Image Gallery
document.querySelectorAll('.product-images').forEach(gallery => {
    const images = gallery.querySelectorAll('.product-image');
    const dotsContainer = gallery.querySelector('.image-dots');
    
    // Create dots for each image
    images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => showImage(index));
        dotsContainer.appendChild(dot);
    });

    // Show image function
    function showImage(index) {
        images.forEach(img => img.classList.remove('active'));
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach(dot => dot.classList.remove('active'));
        
        images[index].classList.add('active');
        dots[index].classList.add('active');
    }

    // Swipe functionality
    let touchStartX = 0;
    let touchEndX = 0;
    
    gallery.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    gallery.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
        if (touchEndX < touchStartX && currentIndex < images.length - 1) {
            // Swipe left
            showImage(currentIndex + 1);
        } else if (touchEndX > touchStartX && currentIndex > 0) {
            // Swipe right
            showImage(currentIndex - 1);
        }
    }
});

// Size Selector
document.querySelectorAll('.size-selector').forEach(selector => {
    const buttons = selector.querySelectorAll('.size-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        });
    });
});

// Back to Top Button
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('add-to-cart-toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
} 