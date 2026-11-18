const series = data?.series ?? [];

function getPoints(refId) {
  const s = series.find(item => item.refId === refId);
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
  const points = getPoints(refId);
  return points.length ? points[points.length - 1].value : null;
}

function setText(id, value) {
  const el = htmlNode.getElementById(id);
  if (el) el.textContent = value;
}

function formatBytes(bytes) {
  if (bytes == null) return "--";

  const abs = Math.abs(bytes);

  if (abs >= 1024 ** 3) {
    return (bytes / (1024 ** 3)).toLocaleString("pt-BR", {
      maximumFractionDigits: 2
    }) + " GB";
  }

  if (abs >= 1024 ** 2) {
    return (bytes / (1024 ** 2)).toLocaleString("pt-BR", {
      maximumFractionDigits: 2
    }) + " MB";
  }

  return bytes.toLocaleString("pt-BR", {
    maximumFractionDigits: 2
  }) + " B";
}

function formatRate(value) {
  if (value == null) return "--";

  const abs = Math.abs(value);

  if (abs >= 1024 ** 2) {
    return (value / (1024 ** 2)).toLocaleString("pt-BR", {
      maximumFractionDigits: 2
    }) + " MB/s";
  }

  if (abs >= 1024) {
    return (value / 1024).toLocaleString("pt-BR", {
      maximumFractionDigits: 2
    }) + " KB/s";
  }

  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: 2
  }) + " B/s";
}

/* ATIVIDADE E ARMAZENAMENTO */

const activity = latest("A");
const used = latest("B");
const available = latest("C");
const total = latest("D");

if (activity != null) {
  const value = Math.max(0, Math.min(100, activity));

  setText(
    "diskActivityValue",
    value.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%"
  );

  const arc = htmlNode.getElementById("diskGaugeArc");
  if (arc) arc.style.strokeDashoffset = String(100 - value);
}

setText("diskTotal", formatBytes(total));
setText("diskUsed", formatBytes(used));
setText("diskAvailable", formatBytes(available));

let storagePercent = null;

if (used != null && total != null && total > 0) {
  storagePercent = Math.max(0, Math.min(100, used / total * 100));
} else if (available != null && total != null && total > 0) {
  storagePercent = Math.max(
    0, Math.min(100, (total - available) / total * 100)
  );
}

if (storagePercent != null) {
  setText(
    "diskCapacityPercent",
    storagePercent.toLocaleString("pt-BR", {
      maximumFractionDigits: 1
    }) + "%"
  );

  const bar = htmlNode.getElementById("diskCapacityBar");
  if (bar) bar.style.width = storagePercent + "%";
}

/* STATUS DO GAUGE */

const statusDot = htmlNode.querySelector(".disk-status-dot");
const gaugeArc = htmlNode.getElementById("diskGaugeArc");

if (activity != null) {
  let label = "Atividade normal";
  let color = "#22d3ee";

  if (activity >= 95) {
    label = "Atividade muito elevada";
    color = "#f87171";
  } else if (activity >= 80) {
    label = "Atividade elevada";
    color = "#fbbf24";
  }

  setText("diskStatusText", label);

  if (statusDot) statusDot.style.background = color;
  if (gaugeArc) gaugeArc.style.stroke = color;
}

/* LEITURA E ESCRITA */

const readPoints = getPoints("E").slice(-60);
const writePoints = getPoints("F").slice(-60);

setText(
  "diskReadCurrent",
  formatRate(readPoints.length
    ? readPoints[readPoints.length - 1].value : null)
);

setText(
  "diskWriteCurrent",
  formatRate(writePoints.length
    ? writePoints[writePoints.length - 1].value : null)
);

const lineRead = htmlNode.getElementById("diskReadLine");
const lineWrite = htmlNode.getElementById("diskWriteLine");
const areaRead = htmlNode.getElementById("diskReadArea");
const areaWrite = htmlNode.getElementById("diskWriteArea");
const chartEmpty = htmlNode.getElementById("diskChartEmpty");

if (readPoints.length >= 2 && writePoints.length >= 2) {
  const left = 48;
  const right = 590;
  const top = 20;
  const bottom = 150;

  const maxValue = Math.max(
    1,
    ...readPoints.map(p => p.value),
    ...writePoints.map(p => p.value)
  );

  function makePoints(points) {
    return points.map((p, i) => ({
      x: left + i / (points.length - 1) * (right - left),
      y: bottom -
        Math.max(0, p.value) / maxValue * (bottom - top)
    }));
  }

  const readXY = makePoints(readPoints);
  const writeXY = makePoints(writePoints);

  function makePath(points) {
    return points.map((p, i) =>
      `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`
    ).join(" ");
  }

  function makeArea(points) {
    return makePath(points) +
      ` L ${right} ${bottom} L ${left} ${bottom} Z`;
  }

  lineRead.setAttribute("d", makePath(readXY));
  lineWrite.setAttribute("d", makePath(writeXY));
  areaRead.setAttribute("d", makeArea(readXY));
  areaWrite.setAttribute("d", makeArea(writeXY));

  setText("diskAxisTop", formatRate(maxValue));
  setText("diskAxisMid", formatRate(maxValue / 2));

  if (chartEmpty) chartEmpty.style.display = "none";
} else if (chartEmpty) {
  chartEmpty.style.display = "grid";
}

/* ALERTA ZABBIX - QUERY G */

const alertSeries = series.find(item => item.refId === "G");

function setDiskAlert(type, title, description, timeText) {
  const badge = htmlNode.getElementById("diskAlertBadge");
  const icon = htmlNode.getElementById("diskAlertIcon");

  if (!badge || !icon) return;

  badge.className = "disk-alert-badge";
  icon.style.color = "";
  icon.style.background = "";

  if (type === "warning") {
    badge.classList.add("disk-alert-warning");
    badge.textContent = "AVERAGE";

    icon.textContent = "!";
    icon.style.color = "#fbbf24";
    icon.style.background = "rgba(251,191,36,.12)";
  } else if (type === "critical") {
    badge.classList.add("disk-alert-critical");
    badge.textContent = "CRÍTICO";

    icon.textContent = "!";
    icon.style.color = "#f87171";
    icon.style.background = "rgba(248,113,113,.12)";
  } else {
    badge.classList.add("disk-alert-normal");
    badge.textContent = "NORMAL";

    icon.textContent = "✓";
    icon.style.color = "#34d399";
    icon.style.background = "rgba(16,185,129,.12)";
  }

  setText("diskAlertTitle", title);
  setText("diskAlertDescription", description);
  setText("diskAlertTime", timeText);
}

if (alertSeries?.fields) {
  const alertFields = alertSeries.fields.map(field => ({
    name: String(field.name ?? "").toLowerCase(),
    values: field.values ? Array.from(field.values) : []
  }));

  function findAlertField(keywords) {
    return alertFields.find(field =>
      keywords.some(keyword => field.name.includes(keyword))
    );
  }

  const nameField = findAlertField([
    "problem", "name", "message", "event"
  ]);

  const severityField = findAlertField([
    "severity", "priority"
  ]);

  const timeField = findAlertField([
    "time", "clock", "timestamp"
  ]);

  const alertName = nameField?.values?.[0];
  const alertSeverity = severityField?.values?.[0];
  const alertTime = timeField?.values?.[0];

  const hasAlert = alertFields.some(field => field.values.length > 0);

  if (hasAlert) {
    const severity = String(alertSeverity ?? "Average").toLowerCase();

    let type = "warning";

    if (
      severity.includes("disaster") ||
      severity.includes("high") ||
      severity.includes("critical") ||
      severity === "5" ||
      severity === "4"
    ) {
      type = "critical";
    }

    let timeText = "Problema retornado pela query G do Zabbix";

    if (alertTime != null) {
      const date = new Date(Number(alertTime) * 1000);

      timeText = "Horário do evento: " +
        (Number.isNaN(date.getTime())
          ? String(alertTime)
          : date.toLocaleString("pt-BR"));
    }

    setDiskAlert(
      type,
      String(alertName ?? "Space is critically low"),
      "O Zabbix identificou um problema relacionado ao espaço disponível em disco.",
      timeText
    );
  } else {
    setDiskAlert(
      "normal",
      "Nenhum alerta ativo",
      "A trigger Space is critically low não está reportando problemas.",
      "Última verificação: " + new Date().toLocaleTimeString("pt-BR")
    );
  }
} else {
  setDiskAlert(
    "normal",
    "Nenhum alerta ativo",
    "A trigger Space is critically low não está reportando problemas.",
    "Query G sem dados de problemas ativos."
  );
}

/* ATUALIZAÇÃO */

setText(
  "diskUpdated",
  "Atualizado: " + new Date().toLocaleTimeString("pt-BR")
);
