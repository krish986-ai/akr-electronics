export const metadata = {
  title: 'About Us - A.K.R Electronics',
  description: 'A.K.R Electronics — premium IoT components and kits for India\'s makers, students and startups.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">About A.K.R Electronics</h1>
      <div className="mt-6 space-y-4 text-sm text-neutral-700 leading-relaxed">
        <p>
          A.K.R Electronics is an Indian e-commerce platform for IoT components and maker
          hardware. We supply genuine development boards, sensors, motors, displays and
          complete project kits to students, hobbyists, educators and startups across India.
        </p>
        <p>
          Every product we list is quality-checked, backed by a clear warranty, billed with a
          proper GST invoice, and shipped fast from our warehouse. No grey-market parts, no
          guesswork — just components that work the first time.
        </p>
        <h2 className="text-lg font-semibold text-neutral-900 pt-2">What we stand for</h2>
        <ul className="space-y-2">
          <li>🔬 <strong>Genuine parts</strong> — sourced from official channels and tested batches</li>
          <li>⚡ <strong>Fast dispatch</strong> — orders packed and shipped quickly, pan-India</li>
          <li>🎓 <strong>Maker education</strong> — kits and guides that turn beginners into builders</li>
          <li>🤝 <strong>Real support</strong> — humans who understand electronics, not scripts</li>
        </ul>
      </div>
    </div>
  );
}
