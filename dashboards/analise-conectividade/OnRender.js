
const series = data?.series ?? [];

function getSeries(refId) {
  return series.find(
    item => String(item.refId).toUpperCase() === refId
  );
}

function getPoints(refId) {
  const s = getSeries(refId);
  if (!s) return [];

  const timeField = s.fields?.find(f => f.type === "time");
  const valueField = s.fields?.find(f => f.type === "number");

  if (!valueField?.values) return [];

  const values = Array.from(valueField.values);
  const times = timeField?.values
    ? Array.from(timeField.values)
    : values.map((_, i) => i);

  return values.map((value, i) => ({
    value: value == null ? null : Number(value),
    time: times[i]
  })).filter(p => p.value !== null && Number.isFinite(p.value));
}

function latest(refId) {
  const points = getPoints(refId);
  return points.length ? points[points.length - 1].value : null;
}

function setText(id, value) {
  const el = htmlNode.getElementById(id);
  if (el) el.textContent = value;
}

function setDot(id, color) {
  const el = htmlNode.getElementById(id);
  if (el) el.style.background = color;
}

function formatNumber(value) {
  return value == null ? "--" :
    value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function formatRate(value) {
  if (value == null) return "--";

  const abs = Math.abs(value);

  if (abs >= 1e9)
    return (value / 1e9).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " Gb/s";

  if (abs >= 1e6)
    return (value / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " Mb/s";

  if (abs >= 1e3)
    return (value / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " Kb/s";

  return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " b/s";
}

function formatUptime(seconds) {
  if (seconds == null || seconds < 0) return "--";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${days}d ${hours}h ${minutes}m`;
}

// A: ICMP Ping — 1 = online, 0 = sem resposta
const ping = latest("A");

if (ping === 1) {
  setText("netMachineStatus", "ONLINE");
  setText("netMachineDetail", "Máquina responde ao ping ICMP");
  setDot("netMachineDot", "#22d3ee");
} else if (ping === 0) {
  setText("netMachineStatus", "OFFLINE");
  setText("netMachineDetail", "Máquina não responde ao ping");
  setDot("netMachineDot", "#f87171");
} else {
  setText("netMachineStatus", "--");
  setText("netMachineDetail", "Sem dados ICMP");
  setDot("netMachineDot", "#64748b");
}

// H: zabbix[host,agent,available]
// 0 = desconhecido, 1 = disponível, 2 = indisponível
const agentAvailability = latest("H");

if (agentAvailability === 1) {
  setText("netAgentStatus", "ONLINE");
  setText("netAgentDetail", "Agente Zabbix respondendo");
  setDot("netAgentDot", "#22d3ee");
} else if (agentAvailability === 2) {
  setText("netAgentStatus", "INDISPONÍVEL");
  setText("netAgentDetail", "Agente Zabbix sem resposta");
  setDot("netAgentDot", "#f87171");
} else {
  setText("netAgentStatus", "DESCONHECIDO");
  setText("netAgentDetail", "Estado de disponibilidade desconhecido");
  setDot("netAgentDot", "#fbbf24");
}

// B: System uptime
setText("netUptime", formatUptime(latest("B")));

// Estado geral de conectividade
const overall = htmlNode.getElementById("netOverallStatus");
const overallDot = overall?.querySelector(".net-status-dot");

if (ping === 1) {
  setText("netOverallText", "Máquina online");
  if (overallDot) overallDot.style.background = "#22d3ee";
  if (overall) overall.style.color = "#22d3ee";
} else if (ping === 0) {
  setText("netOverallText", "Máquina offline");
  if (overallDot) overallDot.style.background = "#f87171";
  if (overall) overall.style.color = "#f87171";
} else {
  setText("netOverallText", "Sem dados de conectividade");
  if (overallDot) overallDot.style.background = "#fbbf24";
  if (overall) overall.style.color = "#fbbf24";
}

// C: Erros de entrada
// D: Erros de saída
// E: Pacotes descartados
const inboundErrors = latest("C");
const outboundErrors = latest("D");
const outboundDiscards = latest("E");

setText("netInboundErrors", formatNumber(inboundErrors));
setText("netOutboundErrors", formatNumber(outboundErrors));
setText("netOutboundDiscards", formatNumber(outboundDiscards));

function setErrorIndicator(id, value) {
  setDot(id,
    value == null ? "#64748b" :
    value > 0 ? "#fbbf24" : "#22d3ee"
  );
}

setErrorIndicator("netInboundIndicator", inboundErrors);
setErrorIndicator("netOutboundIndicator", outboundErrors);
setErrorIndicator("netDiscardIndicator", outboundDiscards);

// F: Bits received
// G: Bits sent
const receivedPoints = getPoints("F").slice(-60);
const sentPoints = getPoints("G").slice(-60);

const received = receivedPoints.length
  ? receivedPoints[receivedPoints.length - 1].value : null;

const sent = sentPoints.length
  ? sentPoints[sentPoints.length - 1].value : null;

setText("netReceived", formatRate(received));
setText("netSent", formatRate(sent));

// Gráfico histórico de tráfego
const lineReceive = htmlNode.getElementById("netReceiveLine");
const lineSend = htmlNode.getElementById("netSendLine");
const areaReceive = htmlNode.getElementById("netReceiveArea");
const areaSend = htmlNode.getElementById("netSendArea");
const chartEmpty = htmlNode.getElementById("netChartEmpty");

if (
  receivedPoints.length >= 2 &&
  sentPoints.length >= 2 &&
  lineReceive && lineSend && areaReceive && areaSend
) {
  const left = 55;
  const right = 590;
  const top = 20;
  const bottom = 155;

  const maxValue = Math.max(
    1,
    ...receivedPoints.map(p => Math.max(0, p.value)),
    ...sentPoints.map(p => Math.max(0, p.value))
  );

  function makePoints(points) {
    return points.map((p, i) => ({
      x: left + i / (points.length - 1) * (right - left),
      y: bottom - Math.max(0, p.value) / maxValue * (bottom - top)
    }));
  }

  function makePath(points) {
    return points.map((p, i) =>
      `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`
    ).join(" ");
  }

  function makeArea(points) {
    return makePath(points) +
      ` L ${right} ${bottom} L ${left} ${bottom} Z`;
  }

  const receiveXY = makePoints(receivedPoints);
  const sendXY = makePoints(sentPoints);

  lineReceive.setAttribute("d", makePath(receiveXY));
  lineSend.setAttribute("d", makePath(sendXY));
  areaReceive.setAttribute("d", makeArea(receiveXY));
  areaSend.setAttribute("d", makeArea(sendXY));

  setText("netAxisTop", formatRate(maxValue));
  setText("netAxisMid1", formatRate(maxValue * 2 / 3));
  setText("netAxisMid2", formatRate(maxValue / 3));

  if (chartEmpty) chartEmpty.style.display = "none";
} else if (chartEmpty) {
  chartEmpty.style.display = "grid";
  chartEmpty.textContent = "Aguardando histórico de tráfego...";
}

// I: Problems — trigger "Zabbix agent sem comunicação"
function getProblemRows(refId) {
  const s = getSeries(refId);
  if (!s?.fields?.length) return [];

  const fields = s.fields;
  const length = Math.max(
    0,
    ...fields.map(f => f.values?.length ?? 0)
  );

  const rows = [];

  for (let i = 0; i < length; i++) {
    const row = {};

    fields.forEach(field => {
      const name = String(field.name ?? "").toLowerCase();
      const value = field.values?.[i];

      row[name] = value;
    });

    rows.push(row);
  }

  return rows;
}

function getProblemText(row) {
  return Object.values(row)
    .filter(value => value != null)
    .map(value => String(value))
    .join(" ")
    .toLowerCase();
}

const problemRows = getProblemRows("I");

// Se a query Problems I estiver filtrada pela trigger,
// qualquer registro retornado indica problema ativo.
const hasAgentProblem = problemRows.some(row => {
  const text = getProblemText(row);

  return (
    text.includes("agent") ||
    text.includes("zabbix agent") ||
    text.includes("comunic")
  );
});

const alertPanel = htmlNode.getElementById("netAgentAlertPanel");
const alertIcon = htmlNode.getElementById("netAgentAlertIcon");
const alertBadge = htmlNode.getElementById("netAgentAlertBadge");

if (alertPanel) {
  alertPanel.classList.remove(
    "net-alert-ok",
    "net-alert-warning",
    "net-alert-critical"
  );
}

if (!getSeries("I")) {
  setText("netAgentAlertTitle", "Query I não encontrada");
  setText("netAgentAlertDescription", "Verifique se a consulta Problems está configurada com RefID I.");
  setText("netAgentAlertBadge", "SEM QUERY");
} else if (hasAgentProblem) {
  if (alertPanel) alertPanel.classList.add("net-alert-critical");

  setText("netAgentAlertTitle", "Agente Zabbix sem comunicação");
  setText("netAgentAlertDescription", "A trigger de indisponibilidade do agente está retornando um problema ativo.");
  setText("netAgentAlertBadge", "PROBLEMA ATIVO");

  if (alertIcon) alertIcon.textContent = "!";
  if (alertBadge) alertBadge.style.color = "#f87171";
} else {
  if (alertPanel) alertPanel.classList.add("net-alert-ok");

  setText("netAgentAlertTitle", "Nenhum problema ativo detectado");
  setText("netAgentAlertDescription", "A consulta Problems não retornou alerta para o agente Zabbix.");
  setText("netAgentAlertBadge", "NORMAL");

  if (alertIcon) alertIcon.textContent = "✓";
  if (alertBadge) alertBadge.style.color = "#22d3ee";
}

setText(
  "netUpdated",
  "Atualizado: " + new Date().toLocaleTimeString("pt-BR")
);
