# Semana 05 — Instalação do Grafana

## Objetivo

Realizar a instalação do Grafana no servidor e integrá-lo ao Zabbix, permitindo a criação de dashboards para visualização e acompanhamento de métricas de monitoramento.

## Atividades realizadas

- Instalação do Grafana no servidor.
- Instalação do aplicativo de integração com o Zabbix.
- Criação de token de autenticação para conexão via API.
- Análise de logs para identificação de falhas na integração.
- Ajuste de versão do aplicativo de integração.
- Criação de dashboards para monitoramento de recursos.
- Instalação do plugin HTML Graphics.
- Criação de cards interativos com navegação entre dashboards.

## Procedimentos

1. Foi realizada a instalação do Grafana no servidor.
2. Em seguida, foi instalado o aplicativo de integração com o Zabbix, permitindo utilizar os dados da plataforma de monitoramento como fonte para os dashboards.
3. Para estabelecer a conexão via API, foi criado um token de verificação.
4. Após a configuração da integração, foram analisados os logs para identificar o motivo da falha de autenticação.
5. Depois da correção da incompatibilidade entre versões, foi iniciada a configuração e montagem dos dashboards.
6. Foi criado um painel contendo informações sobre:
   - Consumo de CPU.
   - Memória RAM disponível.
   - Utilização de cache.
   - Quantidade de processos em execução.
7. Posteriormente, foi instalado o plugin HTML Graphics, utilizado para desenvolver cards interativos.
8. Os cards foram configurados para direcionar o usuário aos dashboards específicos ao serem selecionados.

## Problemas encontrados e soluções

### 1. Falha na conexão entre Grafana e Zabbix

**Problema:** Após a criação do token de autenticação e a configuração da conexão via API, a integração não funcionou como esperado.

**Causa identificada:** A análise dos logs apresentou a mensagem `Invalid params. Not authorized`, indicando que o Grafana conseguia alcançar o plugin, mas a consulta ao Zabbix estava sendo recusada por autorização.

**Solução:** Durante a pesquisa da causa, foi identificada uma incompatibilidade relacionada à versão do Grafana 13.2.4 utilizada no ambiente. A orientação encontrada foi realizar um downgrade para a versão 6.3.0. Após a alteração, a integração passou a funcionar corretamente.

## Resultados

A instalação do Grafana e sua integração com o Zabbix foram concluídas com sucesso.

Foram desenvolvidos dashboards para acompanhar indicadores de CPU, memória RAM disponível, utilização de cache e quantidade de processos em execução.

Também foi instalado o plugin HTML Graphics, possibilitando a criação de cards interativos que direcionam para painéis específicos, melhorando a navegação e a organização das informações de monitoramento.

---

[← Voltar ao README principal](../README.md) | [Próxima semana →](semana-06-zabbix-agent-vm-desktop.md)
