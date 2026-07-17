import Link from 'next/link';
import { Instagram, Facebook, Youtube, Twitter, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-charcoal-100 bg-ivory-50">
      <div className="container-x grid gap-10 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <span className="font-serif text-3xl tracking-[0.3em]">SARWA</span>
          <p className="mt-4 max-w-sm text-sm leading-7 text-charcoal-300">
            SARWA celebrates the heritage of Indian craftsmanship and the modern woman who wears it.
            Curated sarees and fine jewellery — designed with intent, made to last.
          </p>
          <div className="mt-6 flex gap-3">
            <SocialIcon href="#" label="Instagram"><Instagram size={16} /></SocialIcon>
            <SocialIcon href="#" label="Facebook"><Facebook size={16} /></SocialIcon>
            <SocialIcon href="#" label="YouTube"><Youtube size={16} /></SocialIcon>
            <SocialIcon href="#" label="Twitter"><Twitter size={16} /></SocialIcon>
          </div>
        </div>

        <FooterCol
          title="Shop"
          links={[
            { label: 'Sarees', href: '/shop/sarees' },
            { label: 'Jewellery', href: '/shop/jewellery' },
            { label: 'New Arrivals', href: '/shop?new=true' },
            { label: 'Bridal Edit', href: '/collections/wedding-edit' },
            { label: 'Gift Cards', href: '/gift-cards' },
          ]}
        />
        <FooterCol
          title="Help"
          links={[
            { label: 'Contact', href: '/contact' },
            { label: 'Shipping', href: '/pages/shipping-policy' },
            { label: 'Returns', href: '/pages/return-policy' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Track Order', href: '/account/orders' },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { label: 'About', href: '/about' },
            { label: 'Journal', href: '/blog' },
            { label: 'Privacy', href: '/pages/privacy' },
            { label: 'Terms', href: '/pages/terms' },
            { label: 'Stores', href: '/stores' },
          ]}
        />
      </div>

      <div className="border-t border-charcoal-100/60">
        <div className="container-x flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 text-xs text-charcoal-300">
            <p className="flex items-center gap-2"><MapPin size={14} /> 21, Meherchand Market, Lodhi Colony, New Delhi 110003</p>
            <p className="flex items-center gap-2"><Mail size={14} /> hello@sarwa.in</p>
            <p className="flex items-center gap-2"><Phone size={14} /> +91 11 4567 1234</p>
          </div>

          <div className="md:w-96">
            <NewsletterForm />
          </div>
        </div>
        <div className="container-x flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-t border-charcoal-100/40 text-xs text-charcoal-300">
          <span>© {new Date().getFullYear()} SARWA. All rights reserved.</span>
          <span className="flex items-center gap-2">Crafted with care in India <span className="text-champagne">·</span> SARWA</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="eyebrow mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-charcoal hover:text-primary transition flex items-center gap-1 group">
              {l.label}
              <ArrowUpRight size={12} className="opacity-0 transition group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-ivory transition"
    >
      {children}
    </a>
  );
}
