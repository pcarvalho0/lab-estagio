# Semana 06 — Zabbix Agent na VM Desktop

## Objetivo

Instalar e configurar o Zabbix Agent na máquina virtual Ubuntu Desktop, permitindo coletar métricas do sistema e disponibilizá-las no Zabbix para posterior visualização no Grafana.

## Atividades realizadas

- Instalação do Zabbix Agent na VM Ubuntu Desktop.
- Configuração do arquivo `zabbix_agent2.conf`.
- Definição dos parâmetros `Server`, `ServerActive` e `Hostname`.
- Criação do host no Zabbix.
- Verificação do status e recebimento de dados do agente.
- Integração das métricas com o Grafana.
- Criação de dashboard para monitoramento de recursos.
- Configuração de cards interativos para navegação entre painéis.

## Procedimentos

1. Foi realizada a instalação do Zabbix Agent na máquina virtual Ubuntu Desktop.
2. Após a instalação, foi editado o arquivo de configuração do agente:

```bash
sudo nano /etc/zabbix/zabbix_agent2.conf
```

3. Foram configurados os principais parâmetros:

   - `Server`: endereço do servidor Zabbix autorizado a consultar o agente.
   - `ServerActive`: endereço do servidor utilizado para verificações ativas.
   - `Hostname`: identificação do host que seria cadastrado no Zabbix.

4. Após a configuração do agente, foi criado um novo host na interface web do Zabbix.
5. Foi verificado que o host estava habilitado e retornando dados corretamente.
6. Em seguida, foi iniciada a configuração das consultas no Grafana para utilizar as métricas coletadas pelo Zabbix.
7. Após a correção das permissões de acesso, foi realizado o teste de conexão do plugin do Zabbix no Grafana por meio da opção **Save and test**.
8. Por fim, foi criado um dashboard integrado ao Zabbix, contendo indicadores de utilização de CPU, memória RAM, disco e conectividade, além do histórico de desempenho de CPU e RAM.
9. Os cards foram configurados para direcionar o usuário a painéis específicos com informações detalhadas de cada métrica.

## Problemas encontrados e soluções

### 1. Métricas não retornavam dados no Grafana

**Problema:** Após a criação do host no Zabbix e a configuração das consultas no Grafana, as métricas não eram exibidas nos painéis.

**Investigação:** Foi iniciado um processo de troubleshooting em camadas, verificando conectividade por ping, status dos serviços e logs. Essas verificações não indicaram uma falha direta na comunicação ou no funcionamento do agente.

**Causa identificada:** Durante a investigação, foi identificado que o usuário ou grupo de acesso utilizado na integração não possuía a permissão necessária para visualizar o grupo de hosts **Linux servers** no Zabbix.

**Solução:** Foi concedida a permissão necessária ao grupo `Linux servers`. Após o ajuste, o teste de conexão do plugin do Zabbix no Grafana, por meio de **Save and test**, foi concluído com sucesso.

## Resultados

A instalação e configuração do Zabbix Agent na VM Ubuntu Desktop foram concluídas com sucesso.

O host passou a retornar dados corretamente para o Zabbix, permitindo a integração com o Grafana.

Foi desenvolvido um dashboard para acompanhar a utilização de CPU, memória RAM, disco e conectividade, incluindo gráficos históricos de CPU e RAM. Também foram criados cards interativos que direcionam para painéis com informações mais detalhadas de cada recurso monitorado.

---

[← Voltar ao README principal](../README.md) | [Próxima semana →](semana-07-disponibilidade-e-incidentes.md)
