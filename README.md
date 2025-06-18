# IronPulseWear - Fitness Clothing Store

A modern e-commerce website for IronPulseWear, featuring a responsive design and Stripe payment integration.

## Features

- Responsive design that works on desktop and mobile
- Shopping cart functionality
- Stripe payment integration
- Product catalog with dynamic pricing
- Modern UI with smooth animations

## Setup Instructions

1. Clone this repository
2. Replace the Stripe publishable key in `script.js` with your actual key:
   ```javascript
   const stripe = Stripe('your_publishable_key');
   ```

3. Set up a server to handle Stripe checkout sessions (required for processing payments)
   - You'll need to implement the `/create-checkout-session` endpoint
   - This endpoint should create a Stripe session and return the session ID
   - See Stripe's documentation for detailed implementation instructions

4. Host the website on a web server
   - The site requires HTTPS for Stripe integration
   - You can use services like Netlify, Vercel, or any traditional web hosting

## Stripe Integration

To complete the Stripe integration:

1. Sign up for a Stripe account at https://stripe.com
2. Get your publishable key from the Stripe dashboard
3. Implement the server-side checkout session creation
4. Test the integration using Stripe's test card numbers

## Development

The project consists of three main files:

- `index.html` - Main structure and content
- `styles.css` - All styling and animations
- `script.js` - Cart functionality and Stripe integration

## Customization

You can customize the following:

- Colors in `styles.css`
- Product information in `script.js`
- Images and content in `index.html`
- Add more products by updating the products object in `script.js`

## Security Notes

- Never expose your Stripe secret key in the frontend code
- Always process payments through a secure backend
- Keep your dependencies updated
- Use HTTPS in production

## License

MIT License - Feel free to use this code for your own projects

## Support

For any questions or issues, please open an issue in the repository. 