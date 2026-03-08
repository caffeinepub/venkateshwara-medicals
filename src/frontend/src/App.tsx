import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AboutPage from "./pages/AboutPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import PaymentPage from "./pages/PaymentPage";
import ProductsPage from "./pages/ProductsPage";
import ShopkeeperApp from "./pages/shopkeeper/ShopkeeperApp";

// ─── Customer store layout ────────────────────────────────────────────────────

function CustomerLayout() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <CartDrawer />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

// ─── Shopkeeper route wrapper ─────────────────────────────────────────────────

function ShopkeeperRoute() {
  return <ShopkeeperApp />;
}

// ─── Router setup ─────────────────────────────────────────────────────────────

const rootRoute = createRootRoute();

// Customer routes (nested under CustomerLayout)
const customerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "customer-layout",
  component: CustomerLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/",
  component: HomePage,
});

const productsRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/products",
  component: ProductsPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/about",
  component: AboutPage,
});

const contactRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/contact",
  component: ContactPage,
});

const cartRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/cart",
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/checkout",
  component: CheckoutPage,
});

const paymentRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/payment",
  component: PaymentPage,
});

const paymentWithIdRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/payment/$orderId",
  component: PaymentPage,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/order-confirmation",
  component: OrderConfirmationPage,
});

const orderConfirmationWithIdRoute = createRoute({
  getParentRoute: () => customerLayoutRoute,
  path: "/order-confirmation/$orderId",
  component: OrderConfirmationPage,
});

// Shopkeeper route (top-level, standalone — no customer layout)
const shopkeeperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shopkeeper",
  component: ShopkeeperRoute,
});

// Also keep /shopkeeper/* wildcard for sub-routes inside ShopkeeperApp
const shopkeeperWildRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shopkeeper/$",
  component: ShopkeeperRoute,
});

const routeTree = rootRoute.addChildren([
  customerLayoutRoute.addChildren([
    homeRoute,
    productsRoute,
    aboutRoute,
    contactRoute,
    cartRoute,
    checkoutRoute,
    paymentRoute,
    paymentWithIdRoute,
    orderConfirmationRoute,
    orderConfirmationWithIdRoute,
  ]),
  shopkeeperRoute,
  shopkeeperWildRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
