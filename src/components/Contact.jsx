import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { GitHubIcon, InstagramIcon, LinkedInIcon, MailIcon, PhoneIcon, XIcon } from './Icons.jsx';

const handleFromUrl = (url) => url.replace(/\/+$/, '').split('/').pop();

export default function Contact({ contact }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState('');

  const items = [
    { key: 'email', label: t.email, value: contact.email, href: `mailto:${contact.email}`, icon: <MailIcon />, copy: true },
    { key: 'phone', label: t.phone, value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, '')}`, icon: <PhoneIcon />, copy: true },
    { key: 'linkedin', label: 'LinkedIn', value: handleFromUrl(contact.linkedin), href: contact.linkedin, icon: <LinkedInIcon /> },
    { key: 'github', label: 'GitHub', value: `@${handleFromUrl(contact.github)}`, href: contact.github, icon: <GitHubIcon /> },
    { key: 'instagram', label: 'Instagram', value: `@${handleFromUrl(contact.instagram)}`, href: contact.instagram, icon: <InstagramIcon /> },
    { key: 'x', label: 'X', value: `@${handleFromUrl(contact.x)}`, href: contact.x, icon: <XIcon /> },
  ];

  const copy = async (item) => {
    if (!item.copy || !navigator.clipboard) return;
    // Let mailto/tel open normally, but also copy so it works on desktop without a handler
    try {
      await navigator.clipboard.writeText(item.value);
      setCopied(item.key);
      setTimeout(() => setCopied(''), 1600);
    } catch { /* clipboard blocked – link still works */ }
  };

  return (
    <div className="contact">
      {items.map((item) => (
        <a
          key={item.key}
          className={`contact__btn contact__btn--${item.key}`}
          href={item.href}
          target={item.copy ? undefined : '_blank'}
          rel="noreferrer"
          onClick={() => copy(item)}
        >
          <span className="contact__icon">{item.icon}</span>
          <span className="contact__text">
            <span className="contact__label">{copied === item.key ? t.copied : item.label}</span>
            <span className="contact__value">{item.value}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
