import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { GitHubIcon, InstagramIcon, LinkedInIcon, MailIcon, PhoneIcon, XIcon } from './Icons.jsx';

const handleFromUrl = (url) => url.replace(/\/+$/, '').split('/').pop();

// Contact options + click handler shared by the header icons and the bottom bar
function useContactItems() {
  const { cv, t } = useI18n();
  const { contact } = cv;
  const [copied, setCopied] = useState('');

  const items = [
    { key: 'email', label: t.email, value: contact.email, href: `mailto:${contact.email}`, icon: <MailIcon />, copy: true },
    { key: 'phone', label: t.phone, value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, '')}`, icon: <PhoneIcon />, copy: true },
    { key: 'linkedin', label: 'LinkedIn', value: handleFromUrl(contact.linkedin), href: contact.linkedin, icon: <LinkedInIcon /> },
    { key: 'github', label: 'GitHub', value: `@${handleFromUrl(contact.github)}`, href: contact.github, icon: <GitHubIcon /> },
    { key: 'instagram', label: 'Instagram', value: `@${handleFromUrl(contact.instagram)}`, href: contact.instagram, icon: <InstagramIcon /> },
    { key: 'x', label: 'X', value: `@${handleFromUrl(contact.x)}`, href: contact.x, icon: <XIcon /> },
  ];

  const onClick = async (item) => {
    if (!item.copy || !navigator.clipboard) return;
    // Let mailto/tel open normally, but also copy so it works on desktop without a handler
    try {
      await navigator.clipboard.writeText(item.value);
      setCopied(item.key);
      setTimeout(() => setCopied(''), 1600);
    } catch { /* clipboard blocked – link still works */ }
  };

  const linkProps = (item) => ({
    href: item.href,
    target: item.copy ? undefined : '_blank',
    rel: 'noreferrer',
    onClick: () => onClick(item),
  });

  return { items, copied, linkProps, t };
}

// Icon-only round buttons, used in the header
export function ContactIcons() {
  const { items, copied, linkProps, t } = useContactItems();
  return (
    <ul className="contact-icons" aria-label={t.contactMe}>
      {items.map((item) => {
        const tip = copied === item.key ? t.copied : `${item.label}: ${item.value}`;
        return (
          <li key={item.key}>
            <a className="contact-icon" aria-label={tip} title={tip} {...linkProps(item)}>
              {item.icon}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// Contact bar shown at the end of the page
export function ContactBar() {
  const { items, copied, linkProps, t } = useContactItems();
  return (
    <aside className="contact-bar" aria-label={t.contactMe}>
      <div className="contact-bar__inner">
        <span className="contact-bar__title">{t.contactMe}</span>
        <ul className="contact-bar__list">
          {items.map((item) => (
            <li key={item.key}>
              <a className="contact-bar__btn" title={`${item.label}: ${item.value}`} {...linkProps(item)}>
                <span className="contact-bar__icon">{item.icon}</span>
                <span className="contact-bar__value">{copied === item.key ? t.copied : item.value}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
