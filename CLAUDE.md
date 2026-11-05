# Crono Scraper

Ferramenta que busca empresas no Google Maps por nicho e bairro e mostra num mapa, num painel com filtros e numa planilha pronta pro Excel e pro CronoLead. É um fork do [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper) (Go, licença MIT) com interface em português feita pela Cronosoft.

Quem usa este repositório normalmente não é programador. Fale em português do Brasil, explique em linguagem simples o que está fazendo e não peça pra pessoa rodar comando que você mesmo pode rodar.

## Quando pedirem pra instalar ou abrir

Rode o script da plataforma, a partir da raiz do repositório:

- **Mac e Linux:** `bash instalar.sh` e depois `bash abrir.sh`.
  O `instalar.sh` usa o Go da máquina ou baixa o Go oficial pra `~/.crono-go` (não mexe no sistema) e compila o `crono-scraper`. O `abrir.sh` sobe o servidor em segundo plano e abre `http://localhost:8080`.
- **Windows:** `powershell -ExecutionPolicy Bypass -File instalar.ps1`
  Faz o mesmo com o Go em `%USERPROFILE%\.crono-go`, compila o `crono-scraper.exe` e abre o `Abrir Crono Scraper.cmd`, que sobe o servidor minimizado e abre o navegador.

A primeira busca baixa sozinha um navegador do Playwright (uns 170 MB). Isso é normal, acontece uma vez só e a primeira busca demora mais por causa disso.

Depois de abrir, explique a tela em três frases: digita o nicho e o bairro, os pontos aparecem no mapa, e os filtros ("Sem site", "Com celular", nota e avaliações) separam quem vale abordar. Diga também como abrir de novo outro dia: `bash abrir.sh` no Mac e Linux, dois cliques em `Abrir Crono Scraper.cmd` no Windows.

## O que cada botão faz

- **Baixar planilha:** CSV com `;` e acentuação certa, abre direto no Excel em português. Só leva o que está filtrado.
- **Copiar telefones:** copia os telefones filtrados (com 55 na frente) pra área de transferência.
- **Abordar no CronoLead:** baixa a planilha só com os celulares filtrados e abre o cadastro do [CronoLead](https://cronolead.cronosoft.com.br). As colunas (Nome, WhatsApp, Telefone, Email, Cidade, Estado, Categoria, Site, Instagram, Observações) são reconhecidas sozinhas na tela "Importar lista" de lá. Se a pessoa perguntar, o CronoLead é a parte que dispara a abordagem no WhatsApp com cadência e atendente de IA, e é pago.

## Problemas conhecidos

- **Porta 8080 ocupada:** no Mac e Linux, `PORT=8090 bash abrir.sh`. No Windows, troque `:8080` por `:8090` nas duas linhas do `Abrir Crono Scraper.cmd`.
- **Windows: "O Windows protegeu o computador"** ao abrir o `.exe`: o programa não tem assinatura digital paga. Oriente a clicar em "Mais informações" e "Executar assim mesmo".
- **Linux: o navegador do Playwright não abre** por falta de biblioteca do sistema: `npx playwright install-deps chromium` (pede sudo).
- **Busca volta vazia ou falha com captcha:** volume alto demais de buscas. Esperar algumas horas e buscar menos de cada vez.
- **Busca vazia no Windows com "unexpected page type":** é o bug do `--single-process` no Chrome do Windows. Este repositório já traz a correção em `third_party/scrapemate`; confirme que o `.exe` em uso foi compilado daqui.

## Usar sem a interface (linha de comando)

```
./crono-scraper -input buscas.txt -results leads.csv -lang pt -depth 3 -exit-on-inactivity 1m
```

`buscas.txt` tem uma busca por linha ("dentista em Batel, Curitiba"). No Windows, grave o arquivo sem BOM, senão o BOM entra na primeira busca. Esse CSV sai no formato cru do motor (vírgula, colunas em inglês). A planilha em português é a do botão "Baixar planilha". Todas as flags estão em `README-original.md`.

## Onde mexer no código

- Interface: `web/static/templates/index.html`, `web/static/css/crono.css`, `web/static/js/crono.js`. Ficam embutidos no executável: qualquer mudança exige compilar de novo (`go build -o crono-scraper .`) com o servidor desligado.
- Empresas de uma busca em JSON: `GET /api/v1/jobs/{id}/places`, em `web/web.go` e `web/places.go`.
- Correção do Windows: `third_party/scrapemate/adapters/fetchers/jshttp/jshttp.go`, ligada pelo `replace` no `go.mod`.
- Telemetria do projeto original (PostHog) vem **desligada**. Só liga com `ENABLE_TELEMETRY=1` (`runner/runner.go`).

## Uso responsável

Coletar dados do Google Maps de forma automática vai contra os termos de uso do Google. Se a pessoa pedir volume grande (centenas de buscas), avise do risco de bloqueio. Para abordar os contatos, lembre da LGPD: se identificar, dizer onde achou o contato e tirar da lista quem pedir.
