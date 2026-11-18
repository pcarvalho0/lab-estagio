
const root = htmlNode;
if (!root) return;

const series = data?.series || [];

/* =========================
   FUNÇÕES GERAIS
========================= */

function getSeries(ref) {
  return series.find(s =>
    String(s.refId || s.meta?.custom?.refId || "").toUpperCase() === ref
  );
}

function toArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v.toArray === "function") return v.toArray();

  try {
    return Array.from(v);
  } catch {
    return [];
  }
}

function getField(s) {
  const fields = s?.fields || [];

  return fields.find(f =>
    String(f.name).toLowerCase() === "value"
  ) || fields.find(f =>
    f.type !== "time" && f.type !== "string"
  );
}

function latest(ref) {
  const values = toArray(getField(getSeries(ref))?.values);

  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] === null || values[i] === "") continue;

    const n = Number(values[i]);
    if (Number.isFinite(n)) return n;
  }

  return null;
}

function put(id, value) {
  const el = root.querySelector("#" + id);
  if (el) el.textContent = value;
}

function format(value, suffix = "") {
  return value === null
    ? "--"
    : value.toLocaleString("pt-BR", {
        maximumFractionDigits: 2
      }) + suffix;
}

function colorFor(value) {
  if (value === null) return "#83b5e5";
  if (value >= 90) return "#ff7185";
  if (value >= 75) return "#ffca65";
  return "#48e0c4";
}

function setBar(id, value) {
  const el = root.querySelector("#" + id);

  if (el) {
    el.style.width = value === null
      ? "0%"
      : `${Math.max(0, Math.min(100, value))}%`;
  }
}

/* =========================
   CONSULTA A - CPU
========================= */

const cpu = latest("A");

put("cpuUtilValue", format(cpu, "%"));

const gauge = root.querySelector("#cpuGaugeArc");

if (gauge) {
  const percent = cpu === null
    ? 0
    : Math.max(0, Math.min(100, cpu));

  gauge.style.strokeDashoffset =
    String(267.04 * (1 - percent / 100));

  gauge.style.stroke = colorFor(cpu);
}

const healthDot = root.querySelector("#cpuHealthDot");

if (healthDot) {
  healthDot.style.background = colorFor(cpu);
  healthDot.style.boxShadow =
    `0 0 10px ${colorFor(cpu)}55`;
}

put(
  "cpuHealthText",
  cpu === null
    ? "Sem dados"
    : cpu >= 90
      ? "Utilização crítica"
      : cpu >= 75
        ? "Utilização elevada"
        : "Utilização normal"
);

put(
  "cpuUpdated",
  cpu === null
    ? "Aguardando telemetria"
    : "Último valor recebido"
);

/* =========================
   CONSULTAS B E C
========================= */

const user = latest("B");
const system = latest("C");

put("cpuUserValue", format(user));
put("cpuSystemValue", format(system));

setBar(
  "cpuUserBar",
  user === null ? null : Math.min(100, Math.max(0, user))
);

setBar(
  "cpuSystemBar",
  system === null ? null : Math.min(100, Math.max(0, system))
);

/* =========================
   CONSULTA D - LOAD
========================= */

const load = latest("D");

put("cpuLoadValue", format(load));

put(
  "cpuLoadStatus",
  load === null ? "Sem dados" : "Carga média recebida"
);

const loadDot = root.querySelector("#cpuLoadDot");

if (loadDot) {
  loadDot.style.background =
    load === null ? "#83b5e5" : "#48e0c4";
}

/* =========================
   CONSULTA E - ZABBIX PROBLEMS
========================= */

function getProblemRows(ref) {
  const s = getSeries(ref);

  if (!s?.fields?.length) {
    console.log("Consulta E sem campos:", s);
    return [];
  }

  const fields = s.fields.map(f => ({
    name: String(f.name || "").toLowerCase(),
    values: toArray(f.values)
  }));

  const rowCount = Math.max(
    ...fields.map(f => f.values.length)
  );

  const rows = [];

  for (let i = 0; i < rowCount; i++) {
    const row = {};

    fields.forEach(field => {
      row[field.name] = field.values[i];
    });

    rows.push(row);
  }

  console.log("Zabbix Problems - Consulta E:", rows);

  return rows;
}

function normalizeValue(value) {
  if (value === null || value === undefined) return "";

  if (typeof value !== "object") {
    return String(value);
  }

  const candidates = [
    "name",
    "text",
    "value",
    "description",
    "label",
    "title",
    "severity",
    "priority",
    "clock"
  ];

  for (const key of candidates) {
    if (
      value[key] !== undefined &&
      value[key] !== null &&
      typeof value[key] !== "object"
    ) {
      return String(value[key]);
    }
  }

  return JSON.stringify(value);
}

function findFieldValue(row, candidates) {
  for (const candidate of candidates) {
    const key = Object.keys(row).find(k =>
      k.includes(candidate)
    );

    if (
      key &&
      row[key] !== undefined &&
      row[key] !== null &&
      row[key] !== ""
    ) {
      return normalizeValue(row[key]);
    }
  }

  return "";
}

function renderCpuAlerts() {
  const container = root.querySelector("#cpuAlertContainer");
  if (!container) return;

  const rows = getProblemRows("E");

  const validRows = rows.filter(row =>
    Object.values(row).some(value =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    )
  );

  if (!validRows.length) {
    container.innerHTML = `
      <div class="cpu-alert-empty">
        <span class="cpu-alert-icon">✓</span>
        <div>
          <strong>CPU normal</strong>
          <p>Nenhum alerta ativo de utilização da CPU.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  validRows.forEach(row => {
    const problem =
      findFieldValue(row, [
        "problem",
        "name",
        "description",
        "title",
        "event"
      ]) || "Problema ativo no Zabbix";

    const severity =
      findFieldValue(row, [
        "severity",
        "priority"
      ]) || "Alerta";

    const time =
      findFieldValue(row, [
        "time",
        "clock",
        "timestamp"
      ]);

    const severityText = String(severity);

    const isCritical =
      severityText.toLowerCase().includes("high") ||
      severityText.toLowerCase().includes("disaster") ||
      severityText.toLowerCase().includes("critical") ||
      severityText === "4" ||
      severityText === "5";

    const alert = document.createElement("div");

    alert.className =
      "cpu-alert-item" +
      (isCritical ? " critical" : "");

    const icon = document.createElement("span");
    icon.className = "cpu-alert-icon";
    icon.textContent = "!";

    const content = document.createElement("div");
    content.className = "cpu-alert-content";

    const title = document.createElement("strong");
    title.textContent = problem;

    const description = document.createElement("p");
    description.textContent = time
      ? `Problema ativo · ${time}`
      : "Problema ativo recebido do Zabbix";

    const badge = document.createElement("span");
    badge.className = "cpu-alert-badge";
    badge.textContent = severityText;

    content.appendChild(title);
    content.appendChild(description);

    alert.appendChild(icon);
    alert.appendChild(content);
    alert.appendChild(badge);

    container.appendChild(alert);
  });
}

renderCpuAlerts();

/* =========================
   CLIQUE NO CARD DE ALERTAS
   REDIRECIONAMENTO
========================= */

const alertPanel = root.querySelector(".cpu-alert-panel");

if (alertPanel) {
  const targetDashboard =
    "http://192.168.146.100:3000/d/adfgxvc/rastreabilidade-de-cpu?from=2026-11-10T14:10:41.347Z&to=2026-11-14T14:10:41.347Z&timezone=browser";

  alertPanel.style.cursor = "pointer";
  alertPanel.title = "Clique para acessar a Rastreabilidade de CPU";
  alertPanel.setAttribute("role", "link");
  alertPanel.setAttribute("tabindex", "0");

  alertPanel.onclick = () => {
    window.location.href = targetDashboard;
  };

  alertPanel.onkeydown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = targetDashboard;
    }
  };
}

/* =========================
   HISTÓRICO CPU
========================= */

function drawHistory(ref, lineId) {
  const s = getSeries(ref);
  const fields = s?.fields || [];

  const timeField = fields.find(f =>
    f.type === "time" ||
    String(f.name).toLowerCase() === "time"
  );

  const valueField = getField(s);
  const line = root.querySelector("#" + lineId);

  if (!timeField || !valueField || !line) {
    if (line) line.setAttribute("points", "");
    return 0;
  }

  const times = toArray(timeField.values);
  const values = toArray(valueField.values);
  const points = [];

  for (
    let i = 0;
    i < Math.min(times.length, values.length);
    i++
  ) {
    const t = times[i] instanceof Date
      ? times[i].getTime()
      : Number(times[i]);

    const v = Number(values[i]);

    if (Number.isFinite(t) && Number.isFinite(v)) {
      points.push({ t, v });
    }
  }

  points.sort((a, b) => a.t - b.t);

  if (!points.length) {
    line.setAttribute("points", "");
    return 0;
  }

  const end = points[points.length - 1].t;

  let visible = points.filter(
    p => p.t >= end - 15 * 60 * 1000
  );

  if (visible.length < 2) {
    visible = points.slice(-2);
  }

  const minT = visible[0].t;
  const maxT = visible[visible.length - 1].t;
  const spanT = maxT - minT || 1;

  const coords = visible.map(p => {
    const x = ((p.t - minT) / spanT) * 900;

    const y =
      225 -
      (Math.max(0, Math.min(100, p.v)) / 100) * 200;

    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  line.setAttribute("points", coords.join(" "));

  return points.length;
}

const countA = drawHistory("A", "cpuHistoryA");
const countB = drawHistory("B", "cpuHistoryB");
const countC = drawHistory("C", "cpuHistoryC");

const totalPoints = countA + countB + countC;

put(
  "cpuHistoryCount",
  `${totalPoints} amostras históricas`
);

const empty = root.querySelector("#cpuChartEmpty");

if (empty) {
  empty.style.display = totalPoints ? "none" : "flex";
}

/* =========================
   STATUS GERAL
========================= */

put(
  "cpuLiveStatus",
  series.length ? "MONITORANDO" : "SEM DADOS"
);

put(
  "cpuDataStatus",
  series.length
    ? `${series.length} SÉRIES RECEBIDAS`
    : "AGUARDANDO DADOS"
);
