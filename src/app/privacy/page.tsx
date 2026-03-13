export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Privacy Policy</h1>
      <div className="space-y-4">
        <p className="text-sm text-muted leading-relaxed">Last updated: March 2026</p>
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Information We Collect</h2>
          <p className="text-sm text-muted leading-relaxed">We collect information you provide during registration (email, username), payment processing (handled by Stripe), and shipping address data.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold">How We Use Your Information</h2>
          <p className="text-sm text-muted leading-relaxed">To process transactions, deliver physical cards, improve our services, and communicate with you about your account.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Data Security</h2>
          <p className="text-sm text-muted leading-relaxed">We implement industry-standard security measures. Payment information is processed by Stripe and never stored on our servers.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Cookies</h2>
          <p className="text-sm text-muted leading-relaxed">We use essential cookies for authentication and analytics cookies (Google Analytics) to understand usage patterns.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Contact</h2>
          <p className="text-sm text-muted leading-relaxed">For privacy inquiries: privacy@collectorsrepublic.com</p>
        </section>
      </div>
    </div>
  );
}
