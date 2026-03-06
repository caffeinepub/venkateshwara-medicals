import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Address",
    value: "12, MG Road, Near City Hospital,\nHyderabad, Telangana – 500001",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@venkateshwaramedicals.in",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon–Sat: 8:00 AM – 9:00 PM\nSunday: 9:00 AM – 6:00 PM",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<ContactForm> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email";
    if (!form.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16" style={{ backgroundColor: "#1a6b3c" }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl text-white mb-4">
            Contact Us
          </h1>
          <p className="font-body text-green-100 max-w-xl mx-auto">
            Have a question or need assistance? We're here to help.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
              Get in Touch
            </h2>
            <div className="space-y-5 mb-8">
              {CONTACT_INFO.map((info) => (
                <div key={info.label} className="flex gap-4 items-start">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#f0f9f4" }}
                  >
                    <info.icon
                      className="w-5 h-5"
                      style={{ color: "#1a6b3c" }}
                    />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-sm text-foreground">
                      {info.label}
                    </p>
                    <p className="font-body text-sm text-muted-foreground whitespace-pre-line">
                      {info.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div
              className="rounded-xl overflow-hidden border border-border h-48 flex items-center justify-center"
              style={{ backgroundColor: "#f0f9f4" }}
            >
              <div className="text-center">
                <MapPin
                  className="w-8 h-8 mx-auto mb-2"
                  style={{ color: "#1a6b3c" }}
                />
                <p className="font-body text-sm font-medium text-foreground">
                  Venkateshwara Medicals
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  12, MG Road, Hyderabad
                </p>
                <a
                  href="https://maps.google.com/?q=MG+Road+Hyderabad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs mt-2 inline-block underline"
                  style={{ color: "#1a6b3c" }}
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name" className="font-body text-sm font-medium">
                  Your Name *
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your name"
                  className={`mt-1 font-body ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && (
                  <p className="font-body text-xs text-destructive mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="font-body text-sm font-medium"
                >
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="your@email.com"
                  className={`mt-1 font-body ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="font-body text-xs text-destructive mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="message"
                  className="font-body text-sm font-medium"
                >
                  Message *
                </Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="How can we help you?"
                  className={`mt-1 font-body resize-none ${errors.message ? "border-destructive" : ""}`}
                  rows={5}
                />
                {errors.message && (
                  <p className="font-body text-xs text-destructive mt-1">
                    {errors.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-body font-semibold gap-2"
                style={{ backgroundColor: "#1a6b3c", color: "#fff" }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
