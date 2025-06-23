// Initialize Stripe
const stripe = Stripe('your_publishable_key'); // Replace with your actual Stripe publishable key

// Initialize cart elements
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartCountDesktop = document.getElementById('cart-count-desktop');
const checkoutButton = document.getElementById('checkout-button');

// Product data
const products = {
    'classic-black': 'Classic Black Performance T-Shirt',
    'navy-blue': 'Navy Blue Performance T-Shirt',
    'athletic-gray': 'Athletic Gray Performance T-Shirt',
    'forest-green': 'Forest Green Performance T-Shirt',
    'deep-red': 'Deep Red Performance T-Shirt',
    'arctic-white': 'Arctic White Performance T-Shirt'
};

// Initialize all size dropdowns and buy buttons
document.querySelectorAll('.product-card').forEach(card => {
    const sizeDropdown = card.querySelector('.size-dropdown');
    const buyButton = card.querySelector('.buy-button');
    const priceElement = card.querySelector('.product-price');

    // Disable buy button initially
    buyButton.disabled = true;

    // Add size change handler
    sizeDropdown.addEventListener('change', function() {
        const selectedSize = this.value;
        if (!selectedSize) {
            buyButton.disabled = true;
            return;
        }
        
        buyButton.disabled = false;
        const price = (selectedSize === '2XL' || selectedSize === '3XL') ? 380 : 350;
        priceElement.textContent = price;
    });

    // Add click handler for buy button
    buyButton.addEventListener('click', function() {
        const productId = this.getAttribute('data-item-id');
        const selectedSize = card.querySelector('.size-dropdown').value;
        addToCart(productId, selectedSize);
    });
});

// Cart icon click handlers
document.querySelectorAll('.cart-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
        e.preventDefault();
        toggleCart();
    });
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
        // Restore cart view (with checkout button) next time
        document.querySelector('.cart-total').style.display = '';
        updateCart();
    }
});

// Toggle cart display
function toggleCart() {
    cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
    if (cartModal.style.display === 'block') {
        updateCart();
    }
}

// Add to cart function
function addToCart(itemId, selectedSize) {
    if (!selectedSize) {
        showToast('Please select a size first', 'error');
        return;
    }

    const price = (selectedSize === '2XL' || selectedSize === '3XL') ? 380 : 350;
    const item = {
        id: itemId,
        name: `${products[itemId]} - Size ${selectedSize}`,
        size: selectedSize,
        price: price,
        quantity: 1
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item with same size already exists
    const existingItemIndex = cart.findIndex(cartItem => 
        cartItem.id === itemId && cartItem.size === selectedSize
    );

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push(item);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCart();
    showToast('Item added to cart', 'success');
}

// Update cart display
function updateCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        document.getElementById('cart-total').textContent = '0.00';
        checkoutButton.disabled = true;
        return;
    }
    
    // Update cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name} (x${item.quantity})</span>
            <span>R${(item.price * item.quantity).toFixed(2)}</span>
            <button onclick="removeFromCart('${item.id}', '${item.size}')">Remove</button>
        </div>
    `).join('');

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = total.toFixed(2);

    // Enable checkout button
    checkoutButton.disabled = false;
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCountDesktop.textContent = totalItems;
}

// Remove from cart
function removeFromCart(itemId, size) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => !(item.id === itemId && item.size === size));
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    updateCartCount();
    showToast('Item removed from cart', 'success');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('add-to-cart-toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show checkout form in cart modal
function showCheckoutForm() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Hide cart total
    document.querySelector('.cart-total').style.display = 'none';
    // Show modal if not already
    cartModal.style.display = 'block';
    const formHtml = `
        <form id="order-form">
            <label>Name*<br><input type="text" name="name" required></label><br>
            <label>Email*<br><input type="email" name="email" required></label><br>
            <label>Phone<br><input type="tel" name="phone"></label><br>
            <div class="order-details-area">
              <label>Order Details</label>
              <textarea name="orderDetails" rows="4" required>${cart.map(item => `${item.name} (x${item.quantity}) - R${(item.price * item.quantity).toFixed(2)}`).join('\n')}</textarea>
            </div>
            <button type="submit">Submit Order</button>
        </form>
        <div id="order-success" style="display:none;color:green;margin-top:1rem;">Order sent! Thank you.</div>
    `;
    cartItems.innerHTML = formHtml;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = total.toFixed(2);
    
    const form = document.getElementById('order-form');
    if (form) {
        form.addEventListener('submit', submitOrder);
    }
}

// Submit order to Firebase
function submitOrder(e) {
    e.preventDefault();
    const form = e.target;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const data = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        orderDetails: form.orderDetails.value,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString()
    };
    
    fetch('https://ironpulse-a4055-default-rtdb.firebaseio.com/orders.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(() => {
        // Hide the cart modal
        cartModal.style.display = 'none';
        // Show checkout animation
        showCheckoutAnimation();
        // Show success message
        showToast("Thanks for the order request! We'll get back to you in a flash! 🚀");
        // Reset form and cart
        form.reset();
        localStorage.removeItem('cart');
        updateCart();
        updateCartCount();
    })
    .catch(() => {
        alert('There was an error sending your order. Please try again.');
    });
}

// Add checkout button event listener
checkoutButton.addEventListener('click', showCheckoutForm);

// Initialize cart count on page load
updateCartCount();
updateCart();

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

// Add this function at the end of the file
function showCheckoutAnimation() {
    const anim = document.getElementById('checkout-animation');
    if (!anim) return;
    anim.classList.add('active');
    anim.style.display = 'flex';
    setTimeout(() => {
        anim.classList.remove('active');
        anim.style.display = 'none';
    }, 1500);
}

// Add this at the end of the file
(function gymHeroWaveAnimation() {
    const container = document.getElementById('hero-bg-animation');
    if (!container) return;
    container.innerHTML = `
      <svg id="gym-waves" width="100%" height="100%" viewBox="0 0 1440 400" preserveAspectRatio="none" style="position:absolute;top:0;left:0;z-index:0;">
        <defs>
          <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#232526"/>
            <stop offset="100%" stop-color="#414345"/>
          </linearGradient>
        </defs>
        <path id="wave1" fill="url(#waveGradient)" fill-opacity="0.7" d="M0,320 C360,400 1080,200 1440,320 L1440,400 L0,400 Z"></path>
        <path id="wave2" fill="#ff4d4d" fill-opacity="0.15" d="M0,340 C400,300 1040,420 1440,340 L1440,400 L0,400 Z"></path>
      </svg>
    `;
    // Animate the waves
    let t = 0;
    function animate() {
      t += 0.016;
      // Animate wave1
      const wave1 = document.getElementById('wave1');
      const wave2 = document.getElementById('wave2');
      if (wave1 && wave2) {
        const wave1Y = 320 + Math.sin(t) * 10;
        const wave2Y = 340 + Math.cos(t/1.5) * 12;
        wave1.setAttribute('d', `M0,${wave1Y} C360,${400+Math.sin(t)*10} 1080,${200+Math.cos(t/2)*20} 1440,${wave1Y} L1440,400 L0,400 Z`);
        wave2.setAttribute('d', `M0,${wave2Y} C400,${300+Math.cos(t/2)*18} 1040,${420+Math.sin(t/1.2)*15} 1440,${wave2Y} L1440,400 L0,400 Z`);
      }
      requestAnimationFrame(animate);
    }
    animate();
})();

// Hide scroll-indicator after 5 seconds
window.addEventListener('DOMContentLoaded', function() {
  var scrollInd = document.getElementById('scroll-indicator');
  if (scrollInd) {
    setTimeout(function() {
      scrollInd.style.transition = 'opacity 0.6s';
      scrollInd.style.opacity = '0';
      setTimeout(function() { scrollInd.style.display = 'none'; }, 700);
    }, 5000);
  }
});

// Fade-in animation for product cards on scroll
(function fadeInProductCardsOnScroll() {
  const cards = document.querySelectorAll('.product-card');
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all
    cards.forEach(card => card.classList.add('fade-in'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  cards.forEach(card => observer.observe(card));
})();

// Add .touch-device class to body if on a touch device
(function detectTouchDevice() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add('touch-device');
  }
})(); 