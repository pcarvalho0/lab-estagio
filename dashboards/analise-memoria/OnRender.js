const series = data?.series ?? [];

function getSeries(refId) {
  return series.find(s => s.refId === refId);
}

function getValues(refId) {
  const s = getSeries(refId);
  if (!s) return [];

  const timeField = s.fields?.find(f => f.type === "time");
  const valueField = s.fields?.find(
    f => f.type === "number" && f !== timeField
  );

  if (!valueField?.values) return [];

  const values = Array.from(valueField.values);
  const times = timeField?.values
    ? Array.from(timeField.values)
    : values.map((_, i) => i);

  return values.map((value, i) => ({
    value: Number(value),
    time: times[i]
  })).filter(p => Number.isFinite(p.value));
}

function latest(refId) {
  const points = getValues(refId);
  return points.length ? points[points.length - 1].value : null;
}

function formatBytes(value) {
  if (value == null) return "--";

  const gb = value / (1024 ** 3);

  return gb.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " GB";
}

function setText(id, value) {
  const el = htmlNode.getElementById(id);
  if (el) el.textContent = value;
}

function setAlertStyle(type) {
  const badge = htmlNode.getElementById("memAlertBadge");
  const icon = htmlNode.getElementById("memAlertIcon");

  if (!badge || !icon) return;

  badge.className = "mem-alert-badge";
  icon.style.color = "";
  icon.style.background = "";

  if (type === "warning") {
    badge.classList.add("mem-alert-warning");
    badge.textContent = "WARNING";

    icon.textContent = "!";
    icon.style.color = "#fbbf24";
    icon.style.background = "rgba(251,191,36,.12)";
  } else if (type === "critical") {
    badge.classList.add("mem-alert-critical");
    badge.textContent = "CRÍTICO";

    icon.textContent = "!";
    icon.style.color = "#f87171";
    icon.style.background = "rgba(248,113,113,.12)";
  } else {
    badge.classList.add("mem-alert-normal");
    badge.textContent = "NORMAL";

    icon.textContent = "✓";
    icon.style.color = "#34d399";
    icon.style.background = "rgba(16,185,129,.12)";
  }
}

/* MÉTRICAS DE MEMÓRIA */

const usage = latest("A");
const availablePercent = latest("B");
const availableBytes = latest("C");
const totalBytes = latest("D");

if (usage != null) {
  const percent = Math.max(0, Math.min(100, usage));

  setText("memUsage", percent.toFixed(1).replace(".", ",") + "%");
  setText("memCapacityPercent", percent.toFixed(1).replace(".", ",") + "%");

  const arc = htmlNode.getElementById("memGaugeArc");

  if (arc) {
    arc.style.strokeDashoffset = String(100 - percent);
  }

  const bar = htmlNode.getElementById("memCapacityUsed");

  if (bar) {
    bar.style.width = percent + "%";
  }
}

if (totalBytes != null) {
  setText("memTotal", formatBytes(totalBytes));
}

if (availableBytes != null) {
  setText("memAvailable", formatBytes(availableBytes));
}

if (totalBytes != null && availableBytes != null) {
  setText(
    "memUsed",
    formatBytes(Math.max(0, totalBytes - availableBytes))
  );
} else if (usage != null && totalBytes != null) {
  setText("memUsed", formatBytes(totalBytes * usage / 100));
}

/* STATUS DO GAUGE */

const status = htmlNode.getElementById("memStatus");
const dot = status?.querySelector(".mem-status-dot");

if (usage != null) {
  let label = "Normal";
  let color = "#29b6f6";

  if (usage >= 90) {
    label = "Uso crítico";
    color = "#f87171";
  } else if (usage >= 80) {
    label = "Uso elevado";
    color = "#fbbf24";
  }

  setText("memStatusText", label);

  if (dot) {
    dot.style.background = color;
  }

  const arc = htmlNode.getElementById("memGaugeArc");

  if (arc) {
    arc.style.stroke = color;
  }
}

/* ALERTA ZABBIX - QUERY E */

const alertSeries = getSeries("E");

function getAlertFields() {
  if (!alertSeries?.fields) return [];

  return alertSeries.fields.map(field => ({
    name: String(field.name ?? "").toLowerCase(),
    values: field.values ? Array.from(field.values) : []
  }));
}

const alertFields = getAlertFields();

function findAlertField(keywords) {
  return alertFields.find(field =>
    keywords.some(keyword => field.name.includes(keyword))
  );
}

const alertNameField = findAlertField([
  "problem",
  "name",
  "message",
  "event"
]);

const alertSeverityField = findAlertField([
  "severity",
  "priority"
]);

const alertTimeField = findAlertField([
  "time",
  "clock",
  "timestamp"
]);

const alertName = alertNameField?.values?.[0];
const alertSeverity = alertSeverityField?.values?.[0];
const alertTime = alertTimeField?.values?.[0];

const hasAlertData =
  alertSeries &&
  alertSeries.fields?.some(field =>
    field.values && Array.from(field.values).length > 0
  );

if (hasAlertData) {
  const name = String(alertName ?? "High memory utilization");
  const severity = String(alertSeverity ?? "Warning").toLowerCase();

  setText("memAlertTitle", name);
  setText(
    "memAlertDescription",
    "O Zabbix retornou um problema de memória para este host."
  );

  let alertType = "warning";

  if (
    severity.includes("disaster") ||
    severity.includes("high") ||
    severity.includes("critical") ||
    severity === "5" ||
    severity === "4"
  ) {
    alertType = "critical";
  }

  setAlertStyle(alertType);

  if (alertTime != null) {
    const date = new Date(Number(alertTime) * 1000);

    setText(
      "memAlertTime",
      "Horário do evento: " +
      (Number.isNaN(date.getTime())
        ? String(alertTime)
        : date.toLocaleString("pt-BR"))
    );
  } else {
    setText("memAlertTime", "Problema retornado pela query E do Zabbix");
  }
} else {
  setAlertStyle("normal");

  setText("memAlertTitle", "Nenhum alerta ativo");
  setText(
    "memAlertDescription",
    "A trigger High memory utilization não está reportando problemas."
  );

  setText(
    "memAlertTime",
    "Última verificação: " + new Date().toLocaleTimeString("pt-BR")
  );
}

/* HISTÓRICO DE UTILIZAÇÃO */

const history = getValues("A").slice(-60);

const line = htmlNode.getElementById("memHistoryLine");
const area = htmlNode.getElementById("memHistoryArea");
const empty = htmlNode.getElementById("memChartEmpty");

if (history.length >= 2 && line && area) {
  const left = 35;
  const right = 590;
  const top = 20;
  const bottom = 150;

  const points = history.map((p, i) => {
    const x = left + (i / (history.length - 1)) * (right - left);

    const y = bottom -
      (Math.max(0, Math.min(100, p.value)) / 100) *
      (bottom - top);

    return [x, y];
  });

  const path = points.map((p, i) =>
    `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`
  ).join(" ");

  line.setAttribute("d", path);

  area.setAttribute(
    "d",
    path + ` L ${right} ${bottom} L ${left} ${bottom} Z`
  );

  if (empty) {
    empty.style.display = "none";
  }
} else if (empty) {
  empty.style.display = "grid";
}

/* ATUALIZAÇÃO */

setText(
  "memUpdated",
  "Atualizado: " + new Date().toLocaleTimeString("pt-BR")
);
