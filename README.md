# Flyt Landing Page

A modern, flashy landing page for Flyt - the revolutionary gesture control system for Mac.

## Features

- **Modern Design**: Cutting-edge UI with gradients, animations, and smooth transitions
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Email Waitlist**: Functional email submission form for waiting list
- **Smooth Animations**: Scroll-triggered animations and parallax effects
- **Brand Integration**: Uses Flyt logo and brand colors

## Structure

```
flyt-landing/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # JavaScript for interactions
├── assets/
│   └── FlytLogo.png   # Flyt logo
└── README.md          # This file
```

## Setup

1. Open `index.html` in a web browser
2. Or serve it with a local server:
   ```bash
   # Python
   python3 -m http.server 8000
   
   # Node.js
   npx serve
   ```

## Customization

### Email Submission

The waitlist form currently shows a success message. To connect it to a backend:

1. Update the `waitlistForm` submit handler in `script.js`
2. Replace the console.log with your API endpoint:
   ```javascript
   const response = await fetch('/api/waitlist', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email })
   });
   ```

### Colors

Edit the CSS variables in `styles.css`:
```css
:root {
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    /* ... */
}
```

## Sections

1. **Hero**: Main headline with CTA
2. **Features**: 6 key features with icons
3. **How It Works**: 4-step process
4. **Use Cases**: Perfect for different workflows
5. **Waitlist**: Email submission form
6. **Footer**: Links and copyright

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Notes

- Logo should be placed in `assets/FlytLogo.png`
- All animations use CSS and vanilla JavaScript (no dependencies)
- Form validation is basic - add server-side validation for production

