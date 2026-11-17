# Semana 03 — Ubuntu Server, SSH e Rede

## Objetivo

Realizar a instalação e configuração do Ubuntu Server LTS em uma máquina virtual, configurar um endereço IP fixo e estabelecer comunicação entre máquinas virtuais por meio de SSH.

## Atividades realizadas

- Instalação do Ubuntu Server LTS.
- Configuração de endereço IP fixo.
- Criação e configuração da máquina virtual no VMware.
- Testes de conectividade com gateway, internet e DNS.
- Configuração de acesso SSH.
- Geração de chaves SSH no Ubuntu Desktop.
- Configuração de autenticação por chave pública no Ubuntu Server.
- Verificação de comunicação entre as máquinas virtuais.

## Procedimentos

1. Foi realizada a instalação do Ubuntu Server LTS e a configuração de um endereço IP fixo.
2. Após a instalação, foi criada e configurada a máquina virtual no VMware.
3. Foram realizados testes de conectividade utilizando o comando `ping`, verificando a comunicação com o gateway, acesso à internet e resolução de DNS.
4. Em seguida, foi iniciado o processo de configuração do SSH para administrar o Ubuntu Server remotamente pelo Windows.
5. Foi gerado um par de chaves SSH a partir da VM Ubuntu Desktop:

```bash
ssh-keygen -t ed25519
```

6. Após a geração das chaves, foi realizada uma tentativa de envio da chave pública para o servidor:

```bash
ssh-copy-id pedro@192.168.146.100
```

7. Durante essa etapa, foi identificado um problema de comunicação entre as máquinas virtuais.
8. Foram realizados testes de conectividade e verificação das rotas de rede. Também foi testada a comunicação no sentido inverso, do Ubuntu Server para o Ubuntu Desktop.
9. Para verificar o recebimento de pacotes ICMP pelo servidor, foi utilizado o comando `tcpdump` na interface de rede `ens33`, enquanto novos testes de ping eram executados no Desktop.
10. Após a confirmação da comunicação, foi possível adicionar a chave pública ao Ubuntu Server e prosseguir com a configuração do acesso SSH.

### Principais comandos utilizados

```bash
ssh-keygen -t ed25519

ssh-copy-id usuario@IP_DO_SERVIDOR

sudo netplan try

sudo ufw allow 22/tcp
sudo ufw enable

systemctl status ssh

journalctl -u ssh --since today
```

## Problemas encontrados e soluções

### 1. Falha no envio da chave SSH

**Problema:** Durante a execução do comando `ssh-copy-id`, foi apresentada uma mensagem informando que a máquina não conseguia alcançar o Ubuntu Server.

**Solução:** Foi iniciado um processo de troubleshooting para verificar a comunicação entre as máquinas virtuais. Foram realizados testes de ping, análise das rotas e verificação do recebimento de pacotes ICMP no servidor por meio do `tcpdump`.

Após os testes, foi confirmada a comunicação entre as máquinas e foi possível adicionar a chave SSH ao servidor.

### 2. Verificação da comunicação de rede

**Problema:** Os primeiros testes indicaram que uma das máquinas virtuais não estava alcançando a outra.

**Solução:** Foram verificadas as rotas e realizados testes nos dois sentidos da comunicação. A captura de pacotes ICMP no servidor ajudou a confirmar o funcionamento da comunicação de rede.

## Resultados

A instalação e configuração do Ubuntu Server LTS foram realizadas, incluindo a definição de endereço IP fixo e os testes de conectividade.

Também foi configurado o acesso SSH por meio de autenticação com chave pública, permitindo administrar o servidor remotamente e estabelecer uma base para as próximas atividades de infraestrutura e monitoramento.

---

[← Voltar ao README principal](../README.md) | [Próxima semana →](semana-04-instalacao-zabbix-server.md)
