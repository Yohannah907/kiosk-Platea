import fs from 'node:fs';
import path from 'node:path';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function generateReports(results, meta) {
  const reportsDir = path.resolve(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  const total = results.length;
  const passed = results.filter((r) => r.status === 'Pass').length;
  const failed = total - passed;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const grouped = [];
  const moduleMap = new Map();
  for (const r of results) {
    if (!moduleMap.has(r.module)) {
      const entry = { module: r.module, cases: [] };
      moduleMap.set(r.module, entry);
      grouped.push(entry);
    }
    moduleMap.get(r.module).cases.push(r);
  }

  const jsonPayload = {
    projectTitle: 'PLATEA – Campus Food-Ordering Kiosk Interface',
    testingType: 'Automated Functional Testing (Selenium WebDriver)',
    baseUrl: meta.baseUrl,
    browser: meta.browser,
    executedAt: meta.executedAt,
    durationMs: meta.durationMs,
    summary: { total, passed, failed, passRate },
    modules: grouped,
  };

  fs.writeFileSync(
    path.join(reportsDir, 'test-execution-report.json'),
    JSON.stringify(jsonPayload, null, 2),
    'utf-8',
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PLATEA – Automated Test Execution Report</title>
<style>
  :root{
    --green-900:#064e2b; --green-700:#0b7a3f; --green-100:#e6f6ec; --green-50:#f3fbf6;
    --red-700:#b42318; --red-100:#fde8e6;
    --ink:#1b2b22; --muted:#5b6b62; --line:#d6e4db; --bg:#f7faf8; --card:#fff;
  }
  *{box-sizing:border-box}
  body{margin:0;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--ink);line-height:1.5}
  header{background:linear-gradient(135deg,var(--green-900),var(--green-700));color:#fff;padding:36px 24px}
  header .wrap{max-width:1000px;margin:auto}
  header h1{margin:0 0 4px;font-size:2rem;letter-spacing:.08em}
  header h2{margin:0 0 18px;font-weight:500;font-size:1.1rem;opacity:.92}
  .meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px 24px;font-size:.9rem}
  .meta b{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;opacity:.75}
  main{max-width:1000px;margin:auto;padding:24px}
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:24px}
  .stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;text-align:center}
  .stat .n{font-size:2rem;font-weight:700;font-variant-numeric:tabular-nums}
  .stat .l{font-size:.8rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
  .stat.pass .n{color:var(--green-700)} .stat.fail .n{color:var(--red-700)}
  section.module{background:var(--card);border:1px solid var(--line);border-radius:14px;margin-bottom:20px;overflow:hidden}
  section.module>h3{margin:0;padding:14px 20px;background:var(--green-50);border-bottom:1px solid var(--line);font-size:1.05rem;color:var(--green-900);display:flex;justify-content:space-between;align-items:center}
  table{width:100%;border-collapse:collapse;font-size:.9rem}
  th,td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--line);vertical-align:top}
  th{background:var(--green-50);font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
  td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
  .badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:.78rem;font-weight:700}
  .badge.Pass{background:var(--green-100);color:var(--green-700)}
  .badge.Fail{background:var(--red-100);color:var(--red-700)}
  footer{text-align:center;color:var(--muted);font-size:.8rem;padding:24px}
</style>
</head>
<body>
<header><div class="wrap">
  <h1>PLATEA</h1>
  <h2>Automated Selenium Test Execution Report</h2>
  <div class="meta">
    <div><b>Project</b>PLATEA – Campus Food-Ordering Kiosk</div>
    <div><b>Target URL</b>${escapeHtml(meta.baseUrl)}</div>
    <div><b>Browser</b>${escapeHtml(meta.browser)}</div>
    <div><b>Executed At</b>${escapeHtml(meta.executedAt)}</div>
  </div>
</div></header>
<main>
  <div class="stats">
    <div class="stat"><div class="n">${total}</div><div class="l">Total Tests</div></div>
    <div class="stat pass"><div class="n">${passed}</div><div class="l">Passed</div></div>
    <div class="stat fail"><div class="n">${failed}</div><div class="l">Failed</div></div>
    <div class="stat"><div class="n">${passRate}%</div><div class="l">Pass Rate</div></div>
  </div>
  ${grouped
    .map(
      (g, idx) => `
  <section class="module">
    <h3>Module ${idx + 1}: ${escapeHtml(g.module)} <span>${g.cases.length} test case(s)</span></h3>
    <table>
      <tr><th>ID</th><th>Description</th><th>Actual Result</th><th class="num">Duration</th><th>Status</th></tr>
      ${g.cases
        .map(
          (c) => `
      <tr>
        <td>${escapeHtml(c.id)}</td>
        <td>${escapeHtml(c.description)}</td>
        <td>${escapeHtml(c.actual)}</td>
        <td class="num">${c.durationMs} ms</td>
        <td><span class="badge ${c.status}">${c.status}</span></td>
      </tr>`,
        )
        .join('')}
    </table>
  </section>`,
    )
    .join('')}
</main>
<footer>Generated automatically by Platea Selenium WebDriver Runner (${meta.durationMs} ms)</footer>
</body>
</html>`;

  const htmlPath = path.join(reportsDir, 'test-execution-report.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  return { htmlPath, jsonPath: path.join(reportsDir, 'test-execution-report.json') };
}
