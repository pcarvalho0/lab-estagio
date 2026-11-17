# Semana 01 — VM Desktop Linux

## Objetivo

Realizar a instalação e configuração do Ubuntu Desktop em uma máquina virtual utilizando VMware Workstation.

## Atividades realizadas

- Instalação do Ubuntu Desktop 26.04.1 LTS.
- Configuração dos recursos da máquina virtual.
- Ajustes de resolução e interface gráfica.
- Instalação do VMware Tools.
- Criação de snapshot da instalação limpa.

## Procedimentos

1. Foi realizada a instalação do Ubuntu Desktop 26.04.1 LTS utilizando o VMware Workstation.
2. Inicialmente, foi utilizada como referência a mesma configuração de recursos adotada anteriormente para a máquina virtual do Linux Mint Desktop.
3. Durante o processo de instalação, foram realizados ajustes nos recursos destinados à máquina virtual para melhorar o desempenho.
4. Após a instalação, foram executados comandos no terminal para atualizar o sistema e instalar as ferramentas de integração do VMware.
5. Após a configuração, foi criado um snapshot denominado **"instalação limpa"**, preservando o estado inicial do sistema operacional.

### Comandos executados

```bash
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop -y
```

## Problemas encontrados e soluções

### 1. Lentidão durante a instalação

**Problema:** Durante a etapa de cópia dos arquivos do Ubuntu Desktop, o processo apresentou lentidão acima do esperado e permaneceu temporariamente travado.

**Solução:** Foram ajustados os recursos destinados à máquina virtual. Após a alteração da configuração, o processo de instalação foi concluído normalmente.

### 2. Problemas na configuração gráfica

**Problema:** Após a instalação, foram identificados problemas relacionados à interface gráfica: a resolução da tela estava reduzida e a Loja de Aplicativos era apresentada com a orientação invertida.

**Solução:** Foram executados os comandos de atualização do sistema e instalação do `open-vm-tools` e `open-vm-tools-desktop`. Após a execução, os problemas de exibição foram solucionados.

## Resultados

A instalação e configuração do Ubuntu Desktop 26.04.1 LTS foram concluídas com sucesso. A máquina virtual passou a apresentar funcionamento gráfico adequado, com os problemas de resolução e orientação corrigidos.

Também foi criado um snapshot da instalação limpa, permitindo preservar o estado inicial do ambiente para futuras restaurações.

Durante a atividade, também foram estudadas as diferenças entre Kernel e distribuição Linux (Distro), compreendendo suas respectivas funções na estrutura de um sistema operacional.

---

[← Voltar ao README principal](../README.md) | [Próxima semana →](semana-02-terminal-linux.md)
