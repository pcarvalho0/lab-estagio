# Semana 07 — Disponibilidade e Incidentes

## Objetivo

Configurar triggers e alertas no Zabbix e integrá-los aos dashboards do Grafana, permitindo acompanhar situações de utilização elevada de recursos e analisar eventos de falha e recuperação.

## Atividades realizadas

- Criação de triggers personalizadas no Zabbix.
- Correção de erros durante a configuração das triggers.
- Criação de cards de alerta nos dashboards do Grafana.
- Utilização de triggers personalizadas e triggers padrão do template Linux by Zabbix Agent.
- Realização de teste de estresse de CPU utilizando `stress-ng`.
- Análise dos dados coletados durante o teste.
- Cálculo aproximado do MTTR da CPU.
- Consulta ao histórico de problemas do Zabbix para análise dos eventos.

## Procedimentos

1. Foram iniciadas as configurações de triggers no Zabbix para identificar situações que exigissem atenção no ambiente monitorado.
2. Após a criação das triggers, foram aproveitados os dashboards existentes no Grafana para adicionar cards de alerta.
3. Para CPU e conectividade, foram utilizadas as triggers personalizadas criadas durante a atividade.
4. Para disco e memória, foram utilizadas as triggers padrão disponibilizadas pelo template **Linux by Zabbix Agent**.
5. Após a configuração das consultas, foram realizados testes de estresse de CPU utilizando a ferramenta `stress-ng`.
6. Durante os testes, foram acompanhados os dados coletados pelo Zabbix para identificar o momento em que a utilização da CPU ultrapassou o limite estabelecido e quando retornou à normalidade.
7. Com base nos dados coletados, foi realizada uma estimativa do MTTR da CPU.
8. Posteriormente, foi consultado o histórico de problemas do Zabbix para obter informações mais precisas sobre os horários de início e recuperação dos eventos.

### Análise do teste de estresse de CPU

Durante o teste, a CPU ultrapassou o limite de 90% aproximadamente às 08:55 e retornou à normalidade por volta das 09:00.

**Estimativa inicial:**

| Evento | Horário |
|---|---|
| Início da falha | 08:55 |
| Recuperação | 09:00 |
| MTTR aproximado | 5 minutos |

**Dados identificados no histórico de problemas do Zabbix:**

| Evento | Início | Recuperação | Duração |
|---|---|---|---|
| Linux: High CPU utilization (over 90% for 5m) | 08:59:28 | 09:00:28 | 1 minuto |
| Utilização de CPU (trigger personalizada) | 08:59:28 | 09:00:28 | 1 minuto |

## Problemas encontrados e soluções

### 1. Erro durante a criação das triggers

**Problema:** Durante a configuração inicial das triggers no Zabbix, ocorreram falhas relacionadas à identificação e escrita do nome utilizado na configuração.

**Solução:** Após revisar a configuração, foi identificado que uma letra estava faltando no nome informado. Com a correção da escrita, foi possível prosseguir com a criação das triggers.

### 2. Análise do tempo de recuperação

**Problema:** A primeira estimativa do MTTR foi realizada com base na observação dos gráficos de utilização da CPU, apresentando um intervalo aproximado de cinco minutos.

**Solução:** Para obter informações mais precisas, foi consultado o histórico de problemas do Zabbix, que permitiu identificar os horários exatos de início e recuperação dos eventos registrados.

## Resultados

Foram configuradas triggers personalizadas e adicionados cards de alerta aos dashboards do Grafana, permitindo acompanhar eventos relacionados à CPU, memória, disco e conectividade.

Também foi realizado um teste de estresse de CPU com `stress-ng`, possibilitando observar o comportamento do monitoramento diante de uma situação de alta utilização do processador.

A análise do histórico de problemas do Zabbix permitiu identificar a duração dos eventos e realizar uma estimativa do MTTR.

**Observação:** Para calcular o MTBF com maior precisão, seria necessário registrar mais de um incidente, permitindo analisar o intervalo médio entre as falhas.

---

[← Voltar ao README principal](../README.md) | [Próxima semana →](semana-08-metricas-de-confiabilidade.md)
