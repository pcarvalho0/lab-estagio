# Semana 04 — Instalação do Zabbix Server

## Objetivo

Realizar a instalação e configuração do Zabbix Server 7.0 LTS no Ubuntu Server, preparando o ambiente para monitoramento de infraestrutura por meio de uma interface web.

## Atividades realizadas

- Consulta à documentação oficial do Zabbix.
- Configuração do repositório oficial do Zabbix 7.0 LTS.
- Instalação dos componentes do Zabbix Server.
- Criação do banco de dados `zabbix` no MySQL.
- Configuração da conexão entre o Zabbix Server e o banco de dados.
- Configuração do Apache e PHP para disponibilização da interface web.
- Instalação do pacote de localidades.
- Acesso à interface web do Zabbix.

## Procedimentos

1. Foi consultada a documentação oficial do Zabbix e iniciado o processo de instalação no Ubuntu Server.
2. Foi configurado o repositório oficial do Zabbix 7.0 LTS para Ubuntu.
3. Foram instalados os componentes necessários:

   - `zabbix-server-mysql`: serviço principal do Zabbix.
   - `zabbix-frontend-php`: interface web.
   - `zabbix-apache-conf`: configuração de integração com o Apache.
   - `zabbix-sql-scripts`: scripts para criação do banco de dados.
   - `zabbix-agent`: agente de monitoramento do servidor.

4. Foi criado o banco de dados `zabbix` no MySQL.
5. O arquivo `/etc/zabbix/zabbix_server.conf` foi editado para configurar a senha de acesso ao banco de dados.
6. Foi iniciado o processo de configuração da interface web do Zabbix.
7. Após a correção da integração entre Apache e PHP-FPM, foi realizado um teste local:

```bash
curl -I http://localhost/zabbix/
```

8. Foi instalado o pacote de localidades necessário para atender aos pré-requisitos do instalador:

```bash
sudo apt install locales -y
```

9. Com a instalação concluída, a interface web foi acessada pela VM Ubuntu Desktop e pela máquina física com Windows, utilizando:

```text
http://192.168.146.100/zabbix
```

10. O primeiro acesso foi realizado com o usuário administrativo padrão `Admin`, permitindo visualizar o dashboard principal do Zabbix.

## Problemas encontrados e soluções

### 1. Código-fonte PHP exibido no navegador

**Problema:** Ao acessar o instalador do Zabbix, o navegador exibia o código-fonte PHP em vez de processar e renderizar a página corretamente.

**Causa identificada:** O problema estava relacionado à integração entre o Apache e o PHP-FPM. Também foi identificada uma questão na configuração do arquivo `/etc/apache2/conf-enabled/zabbix.conf`, relacionada à diretiva `ProxyTimeout 300`.

**Solução:** Foi identificada a necessidade de habilitar os módulos de proxy do Apache para permitir o processamento dos arquivos PHP:

```bash
sudo a2enmod proxy proxy_fcgi
```

Após a habilitação, os serviços foram reiniciados:

```bash
sudo systemctl restart php8.5-fpm
sudo systemctl restart apache2
```

Foi realizado um teste local com `curl`, que retornou o código HTTP `302 Found`, redirecionando para a página `setup.php`. A resposta passou a apresentar HTML processado, confirmando o funcionamento da interface.

### 2. Localidade en_US indisponível

**Problema:** Durante a verificação dos pré-requisitos do instalador, foi apresentada uma mensagem informando que a localidade `en_US` não estava disponível no servidor web.

**Solução:** Foi instalado o pacote de localidades:

```bash
sudo apt install locales -y
```

Após a instalação, foi possível prosseguir com as etapas de configuração do Zabbix.

## Resultados

A instalação do Zabbix Server 7.0 LTS foi concluída com sucesso no Ubuntu Server.

A interface web passou a funcionar corretamente e ficou acessível tanto pela VM Ubuntu Desktop quanto pela máquina física com Windows, por meio do endereço IP do servidor.

O dashboard principal do Zabbix apresentou informações do servidor, indicadores de disponibilidade, dados de monitoramento e o mapa geográfico padrão da plataforma.

---

[← Voltar ao README principal](../README.md) | [Próxima semana →](semana-05-instalacao-grafana.md)
