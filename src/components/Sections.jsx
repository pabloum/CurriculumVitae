import { ExternalIcon, GitHubIcon, PinIcon } from './Icons.jsx';

const dateRange = (start, end) => [start, end].filter(Boolean).join(' – ');

const Tags = ({ items }) => (
  <ul className="tags">
    {items.map((t) => <li key={t} className="tag">{t}</li>)}
  </ul>
);

export function Summary({ text }) {
  return <p className="summary">{text}</p>;
}

export function Skills({ skills }) {
  return (
    <div className="skills">
      {skills.map((group) => (
        <div key={group.category} className="skills__group">
          <h3 className="skills__cat">{group.category}</h3>
          <Tags items={group.items} />
        </div>
      ))}
    </div>
  );
}

export function Experience({ jobs }) {
  return (
    <ol className="timeline">
      {jobs.map((job) => (
        <li key={`${job.company}-${job.role}-${job.start}`} className="timeline__item">
          <div className="timeline__dates">
            <span>{job.start}</span>
            {job.end !== job.start && <span className="muted">{job.end}</span>}
          </div>
          <div className="timeline__body">
            <h3 className="job__title">
              {job.role} <span className="job__company">· {job.company}</span>
              {job.client && <span className="job__client"> · Client: {job.client}</span>}
            </h3>
            <p className="meta"><PinIcon /> {job.location}</p>
            <ul className="bullets">
              {job.highlights.map((h) => <li key={h}>{h}</li>)}
            </ul>
            <Tags items={job.tech} />
          </div>
        </li>
      ))}
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
          <h3 className="job__title">Volunteer Work</h3>
          <ul className="bullets">
            {volunteer.map((v) => <li key={v.description}>{v.description} ({v.year})</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Portfolio({ projects }) {
  return (
    <div className="portfolio">
      {projects.map((p) => (
        <article key={p.title} className="card">
          <h3 className="card__title">{p.title}</h3>
          <p className="card__desc">{p.description}</p>
          <Tags items={p.tech} />
          <div className="card__links">
            {p.url && (
              <a href={p.url} target="_blank" rel="noreferrer" className="link-btn">
                Live demo <ExternalIcon />
              </a>
            )}
            {p.repo && (
              <a href={p.repo} target="_blank" rel="noreferrer" className="link-btn">
                <GitHubIcon /> Code
              </a>
            )}
            {!p.url && !p.repo && <span className="muted small">Private / client project</span>}
          </div>
        </article>
      ))}
      <article className="card card--placeholder" aria-label="More projects coming soon">
        <span className="plus">+</span>
        <p>More projects coming soon</p>
      </article>
  </div>
  );
}
