export default function LegalPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Legal Disclosures</h1>
      <div className="space-y-4">
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Company Information</h2>
          <p className="text-sm text-muted leading-relaxed">CollectorsRepublic is operated by CR Holdings Ltd.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Gambling Disclaimer</h2>
          <p className="text-sm text-muted leading-relaxed">CollectorsRepublic is a collectible card trading platform. While outcomes are random, all items received have real-world value and can be physically shipped. This is not a gambling service.</p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Intellectual Property</h2>
          <p className="text-sm text-muted leading-relaxed">Trading cards featured on this platform are authentic physical products. All trademarks belong to their respective owners. CollectorsRepublic is an independent reseller.</p>
        </section>
      </div>
    </div>
  );
}
