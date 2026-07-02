'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Contact Us</h1>
      <p className="text-sm text-neutral-500 mt-2">
        We reply within one business day, Mon–Sat 9:30 AM – 6:30 PM.
      </p>

      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-neutral-200 rounded-xl text-center">
          <p className="text-2xl">📞</p>
          <p className="text-sm font-semibold mt-1">Call Us</p>
          <a href="tel:18001234567" className="text-sm text-primary-600 hover:underline">1800 123 4567</a>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-xl text-center">
          <p className="text-2xl">✉️</p>
          <p className="text-sm font-semibold mt-1">Email</p>
          <a href="mailto:support@akrelectronics.com" className="text-sm text-primary-600 hover:underline">
            support@akrelectronics.com
          </a>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-xl text-center">
          <p className="text-2xl">🏢</p>
          <p className="text-sm font-semibold mt-1">Bulk Orders</p>
          <a href="mailto:sales@akrelectronics.com" className="text-sm text-primary-600 hover:underline">
            sales@akrelectronics.com
          </a>
        </div>
      </div>

      {sent ? (
        <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <p className="font-semibold text-emerald-800">✓ Message sent!</p>
          <p className="text-sm text-emerald-700 mt-1">Our team will get back to you shortly.</p>
        </div>
      ) : (
        <form
          onSubmit={e => {
            e.preventDefault();
            setSent(true);
          }}
          className="mt-8 bg-white border border-neutral-200 rounded-xl p-6 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              required
              placeholder="Your name"
              className="h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              required
              type="email"
              placeholder="Your email"
              className="h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <input
            required
            placeholder="Subject"
            className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <textarea
            required
            rows={5}
            placeholder="How can we help?"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="h-10 px-6 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
