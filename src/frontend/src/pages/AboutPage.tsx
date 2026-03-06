import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Package,
  Users,
} from "lucide-react";

const WHY_CHOOSE_US = [
  {
    icon: Award,
    title: "Licensed Pharmacists",
    desc: "All our pharmacists are government-certified and highly experienced.",
  },
  {
    icon: Package,
    title: "500+ Products",
    desc: "Wide range of medicines, supplements, and healthcare products.",
  },
  {
    icon: CheckCircle,
    title: "Genuine Brands",
    desc: "We stock only authentic products from trusted manufacturers.",
  },
  {
    icon: Clock,
    title: "Same-Day Delivery",
    desc: "Order before 5 PM and receive your medicines the same day.",
  },
  {
    icon: Users,
    title: "Expert Advice",
    desc: "Free consultation with our in-store pharmacists anytime.",
  },
];

const MILESTONES = [
  { year: "2005", event: "Founded by Mr. Venkateshwara Rao in Hyderabad" },
  { year: "2010", event: "Expanded to a larger store with 300+ products" },
  { year: "2015", event: "Launched home delivery services" },
  { year: "2020", event: "Crossed 10,000 satisfied customers" },
  { year: "2024", event: "Launched online ordering platform" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16" style={{ backgroundColor: "#1a6b3c" }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl text-white mb-4">
            About Us
          </h1>
          <p className="font-body text-green-100 max-w-2xl mx-auto text-lg leading-relaxed">
            Serving the community with trusted healthcare products and expert
            pharmaceutical advice since 2005.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading font-bold text-3xl text-foreground mb-4">
                Our Story
              </h2>
              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                <p>
                  Venkateshwara Medicals was founded in 2005 by Mr.
                  Venkateshwara Rao, a passionate pharmacist with a vision to
                  provide affordable, genuine healthcare products to the people
                  of Hyderabad.
                </p>
                <p>
                  Starting as a small neighborhood pharmacy near City Hospital,
                  we have grown into one of the most trusted medical stores in
                  the region, serving thousands of families every year.
                </p>
                <p>
                  Our commitment to quality, authenticity, and customer care has
                  been the cornerstone of our success. Every product on our
                  shelves is carefully sourced from certified manufacturers and
                  distributors.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {MILESTONES.map((m) => (
                <div key={m.year} className="flex gap-4 items-start">
                  <div
                    className="w-14 h-8 rounded-full flex items-center justify-center shrink-0 font-body font-bold text-xs"
                    style={{ backgroundColor: "#c8a84b", color: "#0f4526" }}
                  >
                    {m.year}
                  </div>
                  <p className="font-body text-sm text-foreground pt-1">
                    {m.event}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16" style={{ backgroundColor: "#f0f9f4" }}>
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-heading font-bold text-3xl text-foreground mb-6">
            Our Mission
          </h2>
          <blockquote
            className="font-heading text-xl italic leading-relaxed text-foreground border-l-4 pl-6 text-left"
            style={{ borderColor: "#c8a84b" }}
          >
            "To provide every individual with access to genuine, affordable
            healthcare products and expert pharmaceutical guidance — because
            good health is not a privilege, it's a right."
          </blockquote>
          <p className="font-body text-muted-foreground mt-6 leading-relaxed">
            We believe that a healthy community starts with a trusted pharmacy.
            Our mission drives every decision we make — from the products we
            stock to the way we serve our customers.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-foreground mb-2">
              Why Choose Us?
            </h2>
            <p className="font-body text-muted-foreground">
              What sets Venkateshwara Medicals apart
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {WHY_CHOOSE_US.map((item) => (
              <div
                key={item.title}
                className="bg-card rounded-xl border border-border p-6 shadow-xs hover:shadow-card transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#f0f9f4" }}
                >
                  <item.icon className="w-6 h-6" style={{ color: "#1a6b3c" }} />
                </div>
                <h3 className="font-heading font-semibold text-base text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14" style={{ backgroundColor: "#1a6b3c" }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-2xl text-white mb-3">
            Ready to Shop?
          </h2>
          <p className="font-body text-green-100 mb-6">
            Browse our complete range of healthcare products
          </p>
          <Link to="/products">
            <Button
              size="lg"
              className="font-body font-semibold gap-2"
              style={{ backgroundColor: "#c8a84b", color: "#0f4526" }}
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
