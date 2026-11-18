
const root = htmlNode;
if (!root) return;

const $ = (id) => root.querySelector("#" + id);

const series = data?.series || [];

/* ==========================================
   HELPERS
   ========================================== */

function valuesOf(field) {
  const v = field?.values;

  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v.toArray === "function") return v.toArray();
  if (v.buffer && Array.isArray(v.buffer)) return v.buffer;

  try {
    return Array.from(v);
  } catch {
    return [];
  }
}

function getRefId(s) {
  return String(
    s?.refId ||
    s?.meta?.custom?.refId ||
    ""
  ).toUpperCase();
}

function getField(s, candidates = ["Value"]) {
  const fields = s?.fields || [];

  return fields.find(f =>
    candidates.some(c =>
      String(f.name || "").toLowerCase() === c.toLowerCase()
    )
  ) || fields.find(f =>
    f.type !== "time" && f.type !== "string"
  );
}

function getSeries(refId, nameHints = []) {
  const byRef = series.find(s => getRefId(s) === refId);

  if (byRef) return byRef;

  return series.find(s => {
    const label = String(
      s?.name || s?.refId || ""
    ).toLowerCase();

    return nameHints.some(h =>
      label.includes(h.toLowerCase())
    );
  });
}

function numericValues(s) {
  const field = getField(s);

  return valuesOf(field).map(v => {
    if (v == null || v === "") return null;

    const n = Number(v);

    return Number.isFinite(n) ? n : null;
  });
}

function latestNumber(s) {
  const vals = numericValues(s);

  for (let i = vals.length - 1; i >= 0; i--) {
    if (vals[i] !== null) return vals[i];
  }

  return null;
}

/* LEITURA DE CAMPOS SQL */

function getFieldNumber(s, fieldName) {
  if (!s?.fields) return null;

  const field = s.fields.find(f =>
    String(f.name).toLowerCase() === fieldName.toLowerCase()
  );

  if (!field) return null;

  const vals = valuesOf(field);

  for (let i = vals.length - 1; i >= 0; i--) {
    if (vals[i] === null || vals[i] === "") continue;

    const n = Number(vals[i]);

    if (Number.isFinite(n)) return n;
  }

  return null;
}

function setText(id, value) {
  const el = $(id);

  if (el) el.textContent = value;
}

function setColor(el, color) {
  if (el) el.style.background = color;
}

/* ==========================================
   STATUS / SEVERITY
   ========================================== */

function severity(value) {
  if (value === null) {
    return {
      label: "NO DATA",
      color: "#83b5e5"
    };
  }

  if (value >= 90) {
    return {
      label: "CRITICAL",
      color: "#ff7185"
    };
  }

  if (value >= 75) {
    return {
      label: "WARNING",
      color: "#ffca65"
    };
  }

  return {
    label: "NORMAL",
    color: "#48e0c4"
  };
}

/* ==========================================
   UPDATE METRIC CARDS
   ========================================== */

function updateMetric(prefix, value, options = {}) {
  const shown = value === null
    ? "--%"
    : `${value.toFixed(1)}%`;

  setText(prefix + "Value", shown);

  const bar = $(prefix + "Progress");

  if (bar) {
    bar.style.width = value === null
      ? "0%"
      : `${Math.max(0, Math.min(100, value))}%`;

    const status = severity(value);

    setColor(bar, status.color);
  }

  const state = severity(value);

  setText(prefix + "State", state.label);

  setText(
    prefix + "Description",
    value === null
      ? "Sem dados recebidos"
      : options.description || state.label
  );
}

/* ==========================================
   DATA SERIES
   A = CPU
   B = RAM
   C = DISK
   D = AGENT CONNECTIVITY
   E = ICMP AVAILABILITY
   F = MTTR MYSQL
   G = MTBF MYSQL
   ========================================== */

const cpuSeries = getSeries("A", [
  "cpu utilization"
]);

const ramSeries = getSeries("B", [
  "available memory in %",
  "memory"
]);

const diskSeries = getSeries("C", [
  "disk utilization"
]);

const networkSeries = getSeries("D", [
  "zabbix agent availability",
  "agent ping"
]);

const icmpSeries = getSeries("E", [
  "icmp ping",
  "disponibilidade"
]);

const mttrSeries = getSeries("F");
const mtbfSeries = getSeries("G");

const cpuRaw = latestNumber(cpuSeries);
const ramAvailableRaw = latestNumber(ramSeries);
const diskRaw = latestNumber(diskSeries);
const networkRaw = latestNumber(networkSeries);

/* ==========================================
   CPU / RAM / DISK
   ========================================== */

const cpu = cpuRaw === null
  ? null
  : Math.max(0, Math.min(100, cpuRaw));

const disk = diskRaw === null
  ? null
  : Math.max(0, Math.min(100, diskRaw));

const ram = ramAvailableRaw === null
  ? null
  : Math.max(0, Math.min(100, 100 - ramAvailableRaw));

updateMetric("cpu", cpu, {
  description: "CPU utilization"
});

updateMetric("ram", ram, {
  description: "RAM em uso"
});

updateMetric("disk", disk, {
  description: "Utilização do disco sda"
});

/* ==========================================
   AGENT CONNECTIVITY
   ========================================== */

const network = networkRaw;
const online = network === 1;

setText(
  "networkValue",
  network === null
    ? "NO DATA"
    : online
      ? "ONLINE"
      : "OFFLINE"
);

setText(
  "networkDescription",
  network === null
    ? "Sem dados de conectividade"
    : online
      ? "AGENT AVAILABLE"
      : "AGENT UNAVAILABLE"
);

setText(
  "networkState",
  network === null
    ? "--"
    : `VALUE: ${network}`
);

const networkColor = network === null
  ? "#83b5e5"
  : online
    ? "#48e0c4"
    : "#ff7185";

const networkDot = $("networkDot");

setColor(networkDot, networkColor);

if (networkDot) {
  networkDot.style.boxShadow =
    `0 0 10px ${networkColor}55`;
}

setText(
  "systemStatus",
  network === null
    ? "NO DATA"
    : online
      ? "SYSTEM ONLINE"
      : "AGENT OFFLINE"
);

setColor($("systemDot"), networkColor);

if ($("systemDot")) {
  $("systemDot").style.boxShadow =
    `0 0 10px ${networkColor}55`;
}

/* ==========================================
   AVAILABILITY — ICMP QUERY E
   ========================================== */

function calculateAvailability(s) {
  if (!s?.fields) return null;

  const valueField = getField(s);

  if (!valueField) return null;

  const vals = valuesOf(valueField)
    .map(v => {
      if (v === null || v === "") return null;

      const n = Number(v);

      return Number.isFinite(n) ? n : null;
    })
    .filter(v => v !== null);

  if (vals.length === 0) return null;

  const allIcmpValues = vals.every(
    v => v >= 0 && v <= 1
  );

  if (allIcmpValues) {
    const mean =
      vals.reduce((sum, value) => sum + value, 0) /
      vals.length;

    return mean * 100;
  }

  const allPercentValues = vals.every(
    v => v >= 0 && v <= 100
  );

  if (allPercentValues) {
    return vals.reduce((sum, value) => sum + value, 0) /
      vals.length;
  }

  return null;
}

const availability = calculateAvailability(icmpSeries);

setText(
  "availabilityValue",
  availability === null
    ? "--%"
    : `${availability.toFixed(2)}%`
);

let availabilityLabel;
let availabilityColor;

if (availability === null) {
  availabilityLabel = "SEM DADOS";
  availabilityColor = "#83b5e5";
} else if (availability >= 100) {
  availabilityLabel = "DISPONIBILIDADE NORMAL";
  availabilityColor = "#48e0c4";
} else if (availability > 0) {
  availabilityLabel = "DISPONIBILIDADE EM RISCO";
  availabilityColor = "#ffca65";
} else {
  availabilityLabel = "VM INDISPONÍVEL";
  availabilityColor = "#ff7185";
}

const availabilityState = $("availabilityState");

setText("availabilityState", availabilityLabel);

if (availabilityState) {
  availabilityState.style.color = availabilityColor;
}

const availabilityDot = $("availabilityDot");

setColor(availabilityDot, availabilityColor);

if (availabilityDot) {
  availabilityDot.style.boxShadow =
    `0 0 12px ${availabilityColor}99`;
}

setText(
  "availabilityDescription",
  availability === null
    ? "Aguardando histórico ICMP"
    : "Disponibilidade média no período selecionado"
);

/* ==========================================
   MTTR / MTBF — MYSQL QUERIES
   F = MTTR
   G = MTBF
   ========================================== */

const mttrHours = getFieldNumber(
  mttrSeries,
  "mttr_horas"
);

const mttrOccurrences = getFieldNumber(
  mttrSeries,
  "total_ocorrencias"
);

const mtbfHours = getFieldNumber(
  mtbfSeries,
  "mtbf_horas"
);

const mtbfIntervals = getFieldNumber(
  mtbfSeries,
  "total_intervalos"
);

/* VALORES */

setText(
  "mttrValue",
  mttrHours === null
    ? "--"
    : `${mttrHours.toFixed(2)} h`
);

setText(
  "mttrDescription",
  mttrHours === null
    ? "Sem dados de recuperação"
    : `Média de reparo · ${mttrOccurrences ?? 0} ocorrências`
);

setText(
  "mtbfValue",
  mtbfHours === null
    ? "--"
    : `${mtbfHours.toFixed(2)} h`
);

setText(
  "mtbfDescription",
  mtbfHours === null
    ? "Sem dados entre falhas"
    : `Intervalo médio · ${mtbfIntervals ?? 0} intervalos`
);

/* CLASSIFICAÇÃO VISUAL */

function updateReliabilityStatus(
  value,
  type,
  dotId,
  statusId
) {
  let label = "SEM DADOS";
  let color = "#83b5e5";

  if (value !== null) {

    if (type === "MTTR") {

      if (value <= 2.5) {
        label = "FAVORÁVEL";
        color = "#48e0c4";
      } else if (value <= 4) {
        label = "ATENÇÃO";
        color = "#ffca65";
      } else {
        label = "CRÍTICO";
        color = "#ff7185";
      }

    } else if (type === "MTBF") {

      if (value >= 4) {
        label = "FAVORÁVEL";
        color = "#48e0c4";
      } else if (value >= 1.5) {
        label = "ATENÇÃO";
        color = "#ffca65";
      } else {
        label = "CRÍTICO";
        color = "#ff7185";
      }
    }
  }

  const dot = $(dotId);
  const status = $(statusId);

  setText(statusId, label);
  setColor(dot, color);

  if (dot) {
    dot.style.boxShadow = `0 0 10px ${color}99`;
  }

  if (status) {
    status.style.color = color;
  }
}

updateReliabilityStatus(
  mttrHours,
  "MTTR",
  "mttrDot",
  "mttrStatus"
);

updateReliabilityStatus(
  mtbfHours,
  "MTBF",
  "mtbfDot",
  "mtbfStatus"
);

/* ==========================================
   UPDATE HEADER / DATA STATUS
   ========================================== */

setText(
  "lastUpdate",
  "Última renderização: " +
  new Date().toLocaleTimeString("pt-BR")
);

setText(
  "dataStatus",
  series.length
    ? `${series.length} SÉRIES RECEBIDAS`
    : "AGUARDANDO SÉRIES"
);

/* ==========================================
   HISTORICAL CHART
   ========================================== */

function chartPoints(s, transform = x => x) {
  if (!s?.fields) return [];

  const timeField = s.fields.find(f =>
    f.type === "time" ||
    String(f.name).toLowerCase() === "time"
  );

  const valueField = getField(s);

  if (!timeField || !valueField) return [];

  const times = valuesOf(timeField);
  const vals = valuesOf(valueField);

  const points = [];

  for (
    let i = 0;
    i < Math.min(times.length, vals.length);
    i++
  ) {
    const t = times[i] instanceof Date
      ? times[i].getTime()
      : Number(times[i]);

    const v = Number(vals[i]);

    if (Number.isFinite(t) && Number.isFinite(v)) {
      const y = transform(v);

      if (Number.isFinite(y)) {
        points.push({
          t,
          v: Math.max(0, Math.min(100, y))
        });
      }
    }
  }

  return points.sort((a, b) => a.t - b.t);
}

const cpuPoints = chartPoints(cpuSeries);

const ramPoints = chartPoints(
  ramSeries,
  v => 100 - v
);

function drawLine(id, points) {
  const el = $(id);

  if (!el || !points.length) {
    if (el) el.setAttribute("points", "");
    return;
  }

  const latestTime = points[points.length - 1].t;
  const cutoff = latestTime - 15 * 60 * 1000;

  let visible = points.filter(
    p => p.t >= cutoff
  );

  if (visible.length < 2) {
    visible = points.slice(-30);
  }

  if (visible.length === 1) {
    visible = [visible[0], visible[0]];
  }

  const minT = visible[0].t;
  const maxT = visible[visible.length - 1].t;
  const spanT = maxT - minT || 1;

  const coords = visible.map(p => {
    const x = ((p.t - minT) / spanT) * 900;

    const y =
      208 -
      (Math.max(0, Math.min(100, p.v)) / 100) * 188;

    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  el.setAttribute("points", coords.join(" "));
}

drawLine("cpuLine", cpuPoints);
drawLine("ramLine", ramPoints);

const chartHasData =
  cpuPoints.length > 0 ||
  ramPoints.length > 0;

const chartEmpty = $("chartEmpty");

if (chartEmpty) {
  chartEmpty.style.display =
    chartHasData ? "none" : "flex";

  chartEmpty.textContent =
    "Sem histórico de CPU/RAM no intervalo selecionado.";
}

setText(
  "chartSamples",
  `${cpuPoints.length} pontos CPU · ${ramPoints.length} pontos RAM`
);

/* ==========================================
   NAVEGAÇÃO ENTRE DASHBOARDS DO GRAFANA
   ========================================== */

const dashboardLinks = {
  cpuCard:
    "http://192.168.146.100:3000/d/adxtbh2/cpu-analytics?from=now-1h&to=now&timezone=browser",

  ramCard:
    "http://192.168.146.100:3000/d/adl7g6m/memory-analytics?from=now-1h&to=now&timezone=browser",

  diskCard:
    "http://192.168.146.100:3000/d/adwtcnl/disk-analytics?from=now-1h&to=now&timezone=browser",

  networkCard:
    "http://192.168.146.100:3000/d/adpfdn6/connectivity-analytics?from=now-1h&to=now&timezone=browser"
};

Object.entries(dashboardLinks).forEach(([cardId, url]) => {
  const card = root.querySelector("#" + cardId);

  if (!card) {
    console.warn("Card não encontrado:", cardId);
    return;
  }

  card.style.cursor = "pointer";
  card.title = "Clique para abrir o dashboard correspondente";
  card.setAttribute("role", "link");
  card.setAttribute("tabindex", "0");

  card.addEventListener("click", event => {
    if (window.getSelection()?.toString()) return;

    window.location.href = url;
  });

  card.addEventListener("keydown", event => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      window.location.href = url;
    }
  });
});
