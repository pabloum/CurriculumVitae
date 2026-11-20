import { useId } from 'react';
import { ChevronIcon } from './Icons.jsx';

export default function AccordionSection({ id, title, icon, open, onToggle, children }) {
  const panelId = useId();

  return (
    <section className={`acc ${open ? 'acc--open' : ''}`} id={id}>
      <h2 className="acc__heading">
        <button
          type="button"
          className="acc__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="acc__icon" aria-hidden="true">{icon}</span>
          <span className="acc__title">{title}</span>
          <span className="acc__chevron"><ChevronIcon /></span>
        </button>
      </h2>
      {/* grid-template-rows trick gives a smooth height animation without measuring */}
      <div className="acc__panel" id={panelId} role="region" aria-hidden={!open}>
        <div className="acc__inner">
          <div className="acc__content">{children}</div>
        </div>
      </div>
    </section>
  );
}
