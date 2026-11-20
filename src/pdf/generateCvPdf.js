// Builds the CV as a PDF entirely in the browser from cv.json and triggers a download.
// Nothing is uploaded or stored; jsPDF is loaded on demand so it doesn't weigh down the page.

const PAGE = { w: 210, h: 297, margin: 18 }; // A4, mm
const COLORS = {
  text: [33, 41, 48],
  muted: [105, 115, 125],
  accent: [46, 140, 110], // green
  accent2: [52, 130, 190], // blue
  rule: [215, 225, 230],
  tagBg: [232, 246, 240],
};

export async function generateCvPdf(cv) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const contentW = PAGE.w - PAGE.margin * 2;
  let y = PAGE.margin;

  const setColor = (c) => doc.setTextColor(...c);
  const ensureSpace = (needed) => {
    if (y + needed > PAGE.h - PAGE.margin) {
      doc.addPage();
      y = PAGE.margin;
    }
  };
  const lineHeight = (size) => size * 0.42;

  const paragraph = (text, { size = 10, style = 'normal', color = COLORS.text, x = PAGE.margin, width = contentW, gap = 1.5 } = {}) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    setColor(color);
    const lines = doc.splitTextToSize(text, width);
    const lh = lineHeight(size);
    lines.forEach((line) => {
      ensureSpace(lh);
      doc.text(line, x, y + lh * 0.8);
      y += lh;
    });
    y += gap;
  };

  const bullet = (text, x = PAGE.margin + 2, width = contentW - 2) => {
    doc.setFontSize(9.5);
    ensureSpace(lineHeight(9.5));
    doc.setFillColor(...COLORS.accent);
    doc.circle(x + 0.8, y + 2.1, 0.6, 'F');
    paragraph(text, { size: 9.5, x: x + 3.5, width: width - 3.5, gap: 0.6 });
  };

  const sectionTitle = (title) => {
    ensureSpace(14);
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    setColor(COLORS.accent2);
    doc.text(title.toUpperCase(), PAGE.margin, y + 4);
    y += 6;
    doc.setDrawColor(...COLORS.rule);
    doc.setLineWidth(0.3);
    doc.line(PAGE.margin, y, PAGE.w - PAGE.margin, y);
    y += 3;
  };

  const tags = (items, x = PAGE.margin) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const h = 4.6;
    let cx = x;
    ensureSpace(h + 1);
    items.forEach((t) => {
      const w = doc.getTextWidth(t) + 3.2;
      if (cx + w > PAGE.w - PAGE.margin) {
        cx = x;
        y += h + 1.2;
        ensureSpace(h + 1);
      }
      doc.setFillColor(...COLORS.tagBg);
      doc.roundedRect(cx, y, w, h, 1, 1, 'F');
      setColor(COLORS.accent);
      doc.text(t, cx + 1.6, y + 3.2);
      cx += w + 1.5;
    });
    y += h + 2;
  };

  // ---- Header
  const { profile, contact } = cv;
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, PAGE.w / 2, 2.5, 'F');
  doc.setFillColor(...COLORS.accent2);
  doc.rect(PAGE.w / 2, 0, PAGE.w / 2, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setColor(COLORS.text);
  doc.text(profile.name, PAGE.margin, y + 7);
  y += 10;
  paragraph(profile.title, { size: 11.5, color: COLORS.accent, style: 'bold', gap: 1 });
  const contactLine = [
    profile.location,
    contact.email,
    contact.phone,
    contact.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
    contact.github.replace(/^https?:\/\//, ''),
  ].join('  ·  ');
  paragraph(contactLine, { size: 8.5, color: COLORS.muted, gap: 2 });

  // ---- Summary
  sectionTitle('Professional Summary');
  paragraph(profile.summary, { size: 9.5 });

  // ---- Skills
  sectionTitle('Technical Skills');
  cv.skills.forEach((s) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    const label = `${s.category}: `;
    const labelW = doc.getTextWidth(label);
    ensureSpace(lineHeight(9.5));
    setColor(COLORS.text);
    doc.text(label, PAGE.margin, y + lineHeight(9.5) * 0.8);
    paragraph(s.items.join(', '), { size: 9.5, x: PAGE.margin + labelW, width: contentW - labelW, gap: 0.8 });
  });

  // ---- Languages
  sectionTitle('Languages');
  paragraph(cv.languages.map((l) => `${l.name} — ${l.level}`).join('   ·   '), { size: 9.5 });

  // ---- Experience
  sectionTitle('Professional Experience');
  // Rough height of a job block, so short jobs aren't split across pages
  const jobHeight = (job) => {
    doc.setFontSize(9.5);
    const bulletLines = job.highlights.reduce((n, h) => n + doc.splitTextToSize(h, contentW - 5.5).length, 0);
    return 11 + bulletLines * lineHeight(9.5) + job.highlights.length * 0.6 + 8;
  };

  cv.experience.forEach((job, i) => {
    ensureSpace(Math.min(jobHeight(job), PAGE.h / 2));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    setColor(COLORS.text);
    doc.text(job.role, PAGE.margin, y + 4);
    const roleW = doc.getTextWidth(job.role);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.accent2);
    const company = ` · ${job.company}`;
    doc.text(company, PAGE.margin + roleW, y + 4);
    if (job.client) {
      const companyW = doc.getTextWidth(company);
      setColor(COLORS.muted);
      doc.setFontSize(9.5);
      doc.text(` · Client: ${job.client}`, PAGE.margin + roleW + companyW, y + 4);
    }
    const dates = job.start === job.end ? job.start : `${job.start} – ${job.end}`;
    setColor(COLORS.muted);
    doc.setFontSize(9);
    doc.text(dates, PAGE.w - PAGE.margin, y + 4, { align: 'right' });
    y += 5.5;
    paragraph(job.location, { size: 8.5, style: 'italic', color: COLORS.muted, gap: 1 });
    job.highlights.forEach((h) => bullet(h));
    y += 0.8;
    tags(job.tech);
    if (i < cv.experience.length - 1) y += 2;
  });

  // ---- Education
  sectionTitle('Education');
  cv.education.forEach((e, i) => {
    if (i > 0) y += 2.5;
    ensureSpace(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    setColor(COLORS.text);
    doc.text(e.institution, PAGE.margin, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(COLORS.muted);
    doc.text([e.start, e.end].filter(Boolean).join(' – '), PAGE.w - PAGE.margin, y + 4, { align: 'right' });
    y += 5.5;
    paragraph(e.location, { size: 8.5, style: 'italic', color: COLORS.muted, gap: 1 });
    e.degrees.forEach((d) => bullet(d));
  });

  // ---- Volunteer
  if (cv.volunteer?.length) {
    sectionTitle('Volunteer Work');
    cv.volunteer.forEach((v) => bullet(`${v.description} (${v.year})`));
  }

  // ---- Footer page numbers
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(COLORS.muted);
    doc.text(`${profile.name} · ${p}/${pages}`, PAGE.w - PAGE.margin, PAGE.h - 8, { align: 'right' });
  }

  doc.save(`${profile.name.replace(/\s+/g, '_')}_CV.pdf`);
}
