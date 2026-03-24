# Na Pele do Outro - Guia de Publicação

Este projeto é um simulador de empatia urbana desenvolvido para rodar diretamente no navegador utilizando **HTML5**, **CSS3**, **THREE.js** (para 3D) e **Web Audio API** (para áudio procedural).

---

## 🚀 Como Rodar Localmente

Devido ao uso de **Módulos ES6** (`import` / `export`), o navegador exige que os arquivos sejam servidos por um servidor HTTP (não funciona abrindo o arquivo `.html` diretamente).

### Opção 1: Usando Node.js (Recomendado)
Se você já tiver o Node.js instalado, abra o terminal na pasta do projeto e use:

```bash
# Iniciar o servidor de desenvolvimento
npx vite
```
Acesse `http://localhost:5173` no seu navegador.

---

## 🌐 Como Hospedar no GitHub Pages

O projeto foi estruturado para ser **100% estático**, o que significa que ele roda perfeitamente no **GitHub Pages** sem nenhuma alteração.

### Passo a Passo:
1. **Crie um Repositório** no GitHub.
2. **Envie os arquivos** (tudo o que está nesta pasta `na-pele-do-outro`) para o repositório.
3. No GitHub, vá em **Settings (Configurações)** -> **Pages**.
4. Em *Build and deployment*, selecione a branch `main` (ou `master`) e a pasta `/ (root)`.
5. Clique em **Save**.
6. Após alguns minutos, seu jogo estará online em `https://seu-usuario.github.io/nome-do-repositorio`.

---

## 🎧 Imersão
- O jogo utiliza **Áudio Procedural espacial** para simular sons de motores e batimentos cardíacos.
- O uso de **Fones de Ouvido** é altamente recomendado para sentir os efeitos de "abafamento" e "tensão" de cada papel.
