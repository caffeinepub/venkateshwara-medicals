# VM Shopkeeper Portal

## Current State
This is currently the Venkateshwara Medicals customer-facing store. It has a full backend with products, orders, payments, and a shopkeeper panel embedded at /shopkeeper. The user wants this project to become a completely standalone Shopkeeper Management Portal — a separate website only for the shopkeeper and employees, with its own URL.

## Requested Changes (Diff)

### Add
- A full standalone Shopkeeper Management Portal as the root app (no customer store)
- Landing page with store branding, feature highlights, and "Enter Portal" button
- PIN-based login screen (PIN: admin123) with session persistence via sessionStorage
- Dashboard/Overview page: stats cards (Total Products, Out of Stock, Pending Payments, Confirmed Orders, Total Revenue)
- Products page: product table with stock toggle, featured indicator, delete (custom products); Add Product form
- Payments page: pending payment orders table with Confirm/Reject actions; UPI QR code display
- Orders page: confirmed orders table with revenue summary
- Sell page: quick in-person sale form (search product, set quantities, enter customer name/phone, place order)
- Navigation bar with tabs: Dashboard, Products, Payments, Orders, Sell; Logout button

### Modify
- App.tsx: Replace the customer store entirely with the standalone shopkeeper portal (no customer routes, no Navbar/Footer from customer site)
- Backend: Keep all existing backend functions (products, orders, payments) — same data model

### Remove
- All customer-facing pages (HomePage, ProductsPage, AboutPage, ContactPage, CartPage, CheckoutPage, OrderConfirmationPage, PaymentPage)
- Customer Navbar, Footer, CartDrawer components
- The /shopkeeper sub-path routing (portal is now at root "/")

## Implementation Plan
1. Rewrite App.tsx to render only the ShopkeeperApp portal (no customer layout)
2. Build ShopkeeperApp as a full standalone app with its own router at "/"
3. Implement Landing → PIN Gate → Dashboard flow
4. Build all 5 tabs: Overview, Products, Payments, Orders, Sell
5. Wire all backend API calls using existing hooks
6. Validate and deploy as draft
