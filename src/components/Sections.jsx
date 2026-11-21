import {
  CheckIcon, CloudIcon, CodeIcon, DatabaseIcon, ExternalIcon, GitHubIcon, LayersIcon,
  PinIcon, ServerIcon, SignalIcon, SparkIcon, ToolIcon,
} from './Icons.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

const dateRange = (start, end) => [start, end].filter(Boolean).join(' – ');

const Tags = ({ items }) => (
  <ul className="tags">
    {items.map((t) => <li key={t} className="tag">{t}</li>)}
  </ul>
);

export function Summary({ text }) {
  return <p className="summary">{text}</p>;
}

// Icon per skill category, chosen by the "icon" key in the CV data
const SKILL_ICONS = {
  code: CodeIcon,
  server: ServerIcon,
  cloud: CloudIcon,
  database: DatabaseIcon,
  layers: LayersIcon,
  check: CheckIcon,
  signal: SignalIcon,
  tool: ToolIcon,
  spark: SparkIcon,
};

export function Skills({ skills }) {
  return (
    <ul className="skills">
      {skills.map((group, i) => {
        const Icon = SKILL_ICONS[group.icon] ?? CodeIcon;
        return (
          <li key={group.category} className={`skills__row ${i % 2 ? 'skills__row--blue' : ''}`}>
            <div className="skills__head">
              <span className="skills__icon"><Icon /></span>
              <h3 className="skills__cat">{group.category}</h3>
            </div>
            <ul className="skills__chips">
              {group.items.map((t) => <li key={t} className="chip-skill">{t}</li>)}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

function Highlights({ position }) {
  return (
    <>
      <ul className="bullets">
        {position.highlights.map((h) => <li key={h}>{h}</li>)}
      </ul>
      <Tags items={position.tech} />
    </>
  );
}

export function Experience({ jobs }) {
  const { t } = useI18n();
  return (
    <ol className="timeline">
      {jobs.map((job) => {
        // Every company shows the same way: name, location, then one card per position
        const positions = job.positions ?? [job];
        const multiple = positions.length > 1;
        return (
          <li key={`${job.company}-${job.start}`} className="timeline__item">
            <div className="timeline__dates">
              <span>{job.start}</span>
              {job.end !== job.start && <span className="muted">{job.end}</span>}
            </div>
            <div className="timeline__body">
              <h3 className="job__title job__company-head">{job.company}</h3>
              <p className="meta"><PinIcon /> {job.location}</p>
              <ol className="positions">
                {positions.map((p) => (
                  <li key={`${p.role}-${p.start}`} className="position">
                    <div className="position__head">
                      <h4 className="position__role">{p.role}</h4>
                      {multiple && <span className="position__dates">{dateRange(p.start, p.end)}</span>}
                    </div>
                    {p.client && <p className="position__client">{t.client}: {p.client}</p>}
                    <Highlights position={p} />
                  </li>
                ))}
              </ol>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Languages({ languages }) {
  return (
    <ul className="langs">
      {languages.map((l) => (
        <li key={l.name} className="lang">
          <div className="lang__row">
            <span className="lang__name">{l.name}</span>
            <span className="lang__level">{l.level}</span>
          </div>
          <div className="lang__bar"><span style={{ '--w': `${l.score}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

export function Education({ education, volunteer }) {
  const { t } = useI18n();
  return (
    <div className="edu">
      {education.map((e) => (
        <div key={e.institution} className="edu__item">
          <h3 className="job__title">{e.institution}</h3>
          <p className="meta"><PinIcon /> {e.location} · {dateRange(e.start, e.end)}</p>
          <ul className="bullets">
            {e.degrees.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>
      ))}
      {volunteer.length > 0 && (
        <div className="edu__item">
          <h3 className="job__title">{t.volunteerWork}</h3>
          <ul className="bullets">
            {volunteer.map((v) => <li key={v.description}>{v.description} ({v.year})</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Portfolio({ projects }) {
  const { t } = useI18n();
  return (
    <div className="portfolio">
      {projects.map((p) => (
        <article key={p.title} className={`card ${p.highlights?.length ? 'card--wide' : ''}`}>
          <h3 className="card__title">{p.title}</h3>
          {p.client && <p className="card__client">{t.client}: {p.client}</p>}
          <p className="card__desc">{p.description}</p>
          {p.highlights?.length > 0 && (
            <ul className="bullets card__bullets">
              {p.highlights.map((h) => <li key={h}>{h}</li>)}
            </ul>
          )}
          <Tags items={p.tech} />
          <div className="card__links">
            {p.url && (
              <a href={p.url} target="_blank" rel="noreferrer" className="link-btn">
                {t.liveDemo} <ExternalIcon />
              </a>
            )}
            {p.repo && (
              <a href={p.repo} target="_blank" rel="noreferrer" className="link-btn">
                <GitHubIcon /> {t.code}
              </a>
            )}
            {!p.url && !p.repo && <span className="muted small">{t.privateProject}</span>}
          </div>
        </article>
      ))}
      <article className="card card--placeholder" aria-label={t.moreSoon}>
        <span className="plus">+</span>
        <p>{t.moreSoon}</p>
      </article>
  </div>
  );
}
