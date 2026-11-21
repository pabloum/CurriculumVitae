// Builds the CV as a PDF entirely in the browser from the CV data (in the selected language) and triggers a download.
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

export async function generateCvPdf(cv, labels, lang) {
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
  sectionTitle(labels.summary);
  paragraph(profile.summary, { size: 9.5 });

  // ---- Skills
  sectionTitle(labels.skills);
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
  sectionTitle(labels.languages);
  paragraph(cv.languages.map((l) => `${l.name} — ${l.level}`).join('   ·   '), { size: 9.5 });

  // ---- Experience
  sectionTitle(labels.experience);
  const dateRange = (start, end) => (start === end ? start : [start, end].filter(Boolean).join(' – '));
  const rightText = (text, size = 9) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    setColor(COLORS.muted);
    doc.text(text, PAGE.w - PAGE.margin, y + 4, { align: 'right' });
  };
  // Rough height of a block of bullets + tags, so short jobs aren't split across pages
  const blockHeight = (highlights) => {
    doc.setFontSize(9.5);
    const lines = highlights.reduce((n, h) => n + doc.splitTextToSize(h, contentW - 5.5).length, 0);
    return lines * lineHeight(9.5) + highlights.length * 0.6 + 8;
  };
  const highlights = (pos) => {
    pos.highlights.forEach((h) => bullet(h));
    y += 0.8;
    tags(pos.tech);
  };

  cv.experience.forEach((job, i) => {
    // Every company: name + dates, location, then each position (same layout as the web page)
    const positions = job.positions ?? [job];
    const multiple = positions.length > 1;
    ensureSpace(Math.min(17 + blockHeight(positions[0].highlights), PAGE.h / 2));

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    setColor(COLORS.accent2);
    doc.text(job.company, PAGE.margin, y + 4);
    rightText(dateRange(job.start, job.end));
    y += 5.5;
    paragraph(job.location, { size: 8.5, style: 'italic', color: COLORS.muted, gap: 1.2 });

    positions.forEach((pos, j) => {
      if (j > 0) {
        y += 1.5;
        ensureSpace(Math.min(6 + blockHeight(pos.highlights), PAGE.h / 2));
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      setColor(COLORS.text);
      doc.text(pos.role, PAGE.margin, y + 4);
      if (multiple) rightText(dateRange(pos.start, pos.end), 8.5);
      y += 5.5;
      if (pos.client) paragraph(`${labels.client}: ${pos.client}`, { size: 8.5, style: 'bold', color: COLORS.accent2, gap: 0.8 });
      highlights(pos);
    });
    if (i < cv.experience.length - 1) y += 2;
  });

  // ---- Education
  sectionTitle(labels.education);
  cv.education.forEach((e, i) => {
    if (i > 0) y += 2.5;
    ensureSpace(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    setColor(COLORS.text);
    doc.text(e.institution, PAGE.margin, y + 4);
    rightText(dateRange(e.start, e.end));
    y += 5.5;
    paragraph(e.location, { size: 8.5, style: 'italic', color: COLORS.muted, gap: 1 });
    e.degrees.forEach((d) => bullet(d));
  });

  // ---- Volunteer
  if (cv.volunteer?.length) {
    sectionTitle(labels.volunteer);
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

  doc.save(`${profile.name.replace(/\s+/g, '_')}_CV_${lang.toUpperCase()}.pdf`);
}
