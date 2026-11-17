# Semana 02 — Terminal Linux

## Objetivo

Desenvolver familiaridade com o terminal Linux, explorando comandos básicos e intermediários para navegação, gerenciamento de arquivos e diretórios, administração do sistema e utilização de ferramentas.

## Atividades realizadas

- Exploração inicial do terminal Linux.
- Criação e organização de diretórios.
- Criação, edição, renomeação e movimentação de arquivos.
- Cópia de diretórios para simulação de backup.
- Utilização de editores de texto pelo terminal.
- Consulta e acompanhamento de logs do sistema.
- Atualização de pacotes e instalação de ferramentas.
- Instalação e execução do Python.
- Instalação e abertura do Visual Studio Code pelo terminal.

## Procedimentos

1. Foi iniciado o terminal Linux e realizados testes com comandos básicos, incluindo `pwd`, para identificar o diretório atual.
2. Foi criado o diretório `estudos-linux` utilizando o comando `mkdir`. Em seguida, foram criados níveis adicionais de diretórios utilizando a opção `-p`.
3. Foi criado o arquivo `anotacoes.txt` utilizando `touch` e realizada sua edição e visualização com `cat`.
4. O arquivo foi renomeado utilizando `mv`, passando a se chamar `estudos.txt`.
5. Posteriormente, o arquivo foi movido para o diretório `scripts`, utilizando:

```bash
mv ~/estudos-linux/estudos.txt ~/estudos-linux/scripts/
```

6. Foi realizada uma cópia do diretório `scripts`, incluindo seu conteúdo, para simular um backup:

```bash
cp -r ~/estudos-linux/scripts ~/estudos-linux/scripts-backup
```

7. Foram explorados outros comandos para navegação, gerenciamento de arquivos, consulta de processos e administração do sistema.
8. Foi testado o editor de texto Nano por meio do comando:

```bash
nano ~/estudos-linux/nano.txt
```

9. Foi realizado o acompanhamento dos logs do sistema em tempo real:

```bash
sudo tail -f /var/log/syslog
```

10. Foram atualizados os pacotes do sistema e instalado o utilitário Htop.
11. Por fim, foi realizada a instalação do Python e de seu gerenciador de pacotes, seguida da execução do primeiro código em Python. Também foi instalado o Visual Studio Code e realizado seu acesso pelo terminal.

### Principais comandos utilizados

```bash
ls -la
cd
pwd
mkdir
touch
cp
mv
rm
cat
less
nano
tail -f /var/log/syslog
sudo apt update
sudo apt upgrade
sudo apt install htop
chmod 750 script.sh
ps aux | grep ssh
man comando
comando --help
```

## Problemas encontrados e soluções

Durante as atividades documentadas, não foi registrado nenhum problema técnico específico que impedisse a execução dos procedimentos.

A atividade foi conduzida por meio da exploração prática dos comandos, permitindo compreender suas funções e aplicações na administração do Linux.

## Resultados

Foi desenvolvida familiaridade com o terminal Linux e seus principais comandos de administração.

Foi possível criar e organizar diretórios, manipular arquivos, realizar cópias, consultar logs, atualizar pacotes, instalar ferramentas e executar aplicações pelo terminal.

Também foram realizados os primeiros testes com Python e Visual Studio Code, ampliando o conhecimento sobre o ambiente de desenvolvimento no Linux.

---

[← Voltar ao README principal](../README.md) | [Próxima semana →](semana-03-ubuntu-server-ssh-rede.md)
