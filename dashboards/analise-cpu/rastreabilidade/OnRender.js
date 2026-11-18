
const root = htmlNode.querySelector(".cpu-trace");

if (root) {

  // ==========================================
  // 1. RECEBIMENTO DAS CONSULTAS
  // ==========================================

  const frames = data?.series || [];

  console.log("========== RASTREABILIDADE CPU ==========");
  console.log("Séries recebidas:", frames.length);

  function getFrame(refId) {
    return frames.find(frame => frame.refId === refId) || null;
  }

  function getValues(field) {
    if (!field?.values) return [];

    return typeof field.values.toArray === "function"
      ? field.values.toArray()
      : Array.from(field.values);
  }

  function getField(frame, name) {
    if (!frame) return null;

    return frame.fields?.find(field =>
      field.name?.toLowerCase() === name.toLowerCase()
    ) || null;
  }

  // ==========================================
  // 2. LEITURA DA ÚLTIMA AMOSTRA
  // ==========================================

  function getLastSample(refId) {

    const frame = getFrame(refId);

    if (!frame) return null;

    const valueField = getField(frame, "Value");
    const timeField = getField(frame, "Time");

    if (!valueField) return null;

    const values = getValues(valueField);
    const times = getValues(timeField);

    for (let i = values.length - 1; i >= 0; i--) {

      if (values[i] === null || values[i] === undefined) {
        continue;
      }

      const value = Number(values[i]);

      if (!Number.isFinite(value)) continue;

      let timestamp = times[i] != null
        ? Number(times[i])
        : null;

      if (
        timestamp !== null &&
        timestamp > 0 &&
        timestamp < 1000000000000
      ) {
        timestamp *= 1000;
      }

      return {
        value,
        timestamp:
          Number.isFinite(timestamp) && timestamp > 0
            ? timestamp
            : null
      };
    }

    return null;
  }

  // ==========================================
  // 3. CONSULTAS
  // ==========================================

  // A = CPU utilization
  // B = Zabbix Agent availability
  // C = ICMP Ping
  // D = Zabbix Server - Process Status
  // E = MySQL - Process Status
  // F = Zabbix API - Availability

  const cpu = getLastSample("A");
  const agent = getLastSample("B");
  const network = getLastSample("C");
  const server = getLastSample("D");
  const mysql = getLastSample("E");
  const api = getLastSample("F");

  // ==========================================
  // 4. DEBUG DAS CONSULTAS
  // ==========================================

  console.log("CONSULTAS IDENTIFICADAS:", {
    A_CPU: !!getFrame("A"),
    B_AGENT: !!getFrame("B"),
    C_ICMP: !!getFrame("C"),
    D_SERVER: !!getFrame("D"),
    E_MYSQL: !!getFrame("E"),
    F_API: !!getFrame("F")
  });

  console.log("ÚLTIMAS AMOSTRAS:", {
    cpu,
    agent,
    network,
    server,
    mysql,
    api
  });

  // ==========================================
  // 5. ESTADOS INICIAIS
  // ==========================================

  const states = {
    vm: "unknown",
    agent: "unknown",
    network: "unknown",
    server: "unknown",
    database: "unknown",
    api: "unknown",
    grafana: "normal"
  };

  // ==========================================
  // 6. MÁQUINA VIRTUAL / CPU
  // ==========================================

  if (cpu && agent) {

    if (agent.value === 1) {
      states.vm = "normal";
    } else if (agent.value === 2) {
      states.vm = "critical";
    }

  }

  // ==========================================
  // 7. ZABBIX AGENT
  // ==========================================

  if (agent) {

    if (agent.value === 1) {
      states.agent = "normal";
    } else if (agent.value === 2) {
      states.agent = "critical";
    }

  }

  // ==========================================
  // 8. REDE / ICMP
  // ==========================================

  if (network) {

    const availability = network.value;

    console.log(
      "Disponibilidade ICMP:",
      (availability * 100).toFixed(2) + "%"
    );

    if (availability >= 0.95) {
      states.network = "normal";
    } else if (availability >= 0.80) {
      states.network = "warning";
    } else {
      states.network = "critical";
    }

  }

  // ==========================================
  // 9. ZABBIX SERVER
  // ==========================================

  if (server) {

    console.log(
      "Processos Zabbix Server:",
      server.value
    );

    if (server.value > 0) {
      states.server = "normal";
    } else {
      states.server = "critical";
    }

  }

  // ==========================================
  // 10. MYSQL
  // ==========================================

  if (mysql) {

    console.log(
      "Processos MySQL:",
      mysql.value
    );

    if (mysql.value > 0) {
      states.database = "normal";
    } else {
      states.database = "critical";
    }

  }

  // ==========================================
  // 11. ZABBIX API
  // ==========================================

  if (api) {

    console.log(
      "Disponibilidade Zabbix API:",
      api.value
    );

    if (api.value === 1) {
      states.api = "normal";
    } else if (api.value === 0) {
      states.api = "critical";
    }

  }

  // ==========================================
  // 12. GRAFANA
  // ==========================================

  states.grafana = "normal";

  // ==========================================
  // 13. ATUALIZAÇÃO DOS CARDS
  // ==========================================

  const labels = {
    normal: "NORMAL",
    warning: "ATENÇÃO",
    critical: "CRÍTICO",
    unknown: "SEM DADOS"
  };

  Object.entries(states).forEach(([stage, status]) => {

    const node = root.querySelector(
      `.trace-node[data-stage="${stage}"]`
    );

    if (!node) {
      console.warn("Card não encontrado:", stage);
      return;
    }

    node.classList.remove(
      "normal",
      "warning",
      "critical",
      "unknown"
    );

    node.classList.add(status);

    const dot = node.querySelector(".trace-dot");
    const label = node.querySelector(".status-label");

    if (dot) {
      dot.className = "trace-dot " + status;
    }

    if (label) {
      label.textContent = labels[status];
    }

  });

  // ==========================================
  // 14. STATUS GERAL
  // ==========================================

  const allStatuses = Object.values(states);

  let overall = "unknown";
  let overallText = "DIAGNÓSTICO PARCIAL";

  if (allStatuses.includes("critical")) {

    overall = "critical";
    overallText = "FALHA IDENTIFICADA";

  } else if (allStatuses.includes("warning")) {

    overall = "warning";
    overallText = "ATENÇÃO";

  } else if (!allStatuses.includes("unknown")) {

    overall = "normal";
    overallText = "FLUXO NORMAL";

  }

  const overallDot = root.querySelector("#overallDot");
  const overallStatus = root.querySelector("#overallStatus");

  if (overallDot) {
    overallDot.className = "trace-dot " + overall;
  }

  if (overallStatus) {
    overallStatus.textContent = overallText;
  }

  // ==========================================
  // 15. INTERAÇÃO DOS CARDS
  // ==========================================

  root.querySelectorAll(".trace-node").forEach(node => {

    node.onclick = () => {

      root.querySelectorAll(".trace-node").forEach(item => {
        item.classList.remove("selected");
      });

      node.classList.add("selected");

    };

  });

  // ==========================================
  // 16. DIAGNÓSTICO FINAL
  // ==========================================

  console.log("CPU:", cpu?.value ?? "Sem dados");
  console.log("AGENT:", agent?.value ?? "Sem dados");
  console.log("ICMP:", network?.value ?? "Sem dados");
  console.log("ZABBIX SERVER:", server?.value ?? "Sem dados");
  console.log("MYSQL:", mysql?.value ?? "Sem dados");
  console.log("ZABBIX API:", api?.value ?? "Sem dados");

  console.log("ESTADOS FINAIS:", states);
  console.log("STATUS GERAL:", overallText);

  console.log("========== FIM DO DIAGNÓSTICO ==========");

}
