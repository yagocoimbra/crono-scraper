# Crono Scraper

Toda prospecção começa com uma lista. Montar essa lista na mão, copiando empresa por empresa do Google Maps pra uma planilha, come uma tarde inteira.

O Crono Scraper faz isso em um minuto. Você digita o nicho e o bairro, ele busca no Google Maps e devolve as empresas num mapa e numa planilha, já separando quem tem celular, quem não tem site e quem só tem rede social.

No primeiro teste, "marcenaria" na Mooca, em São Paulo: 20 empresas em cerca de um minuto, 15 com celular e 8 sem site.

Roda no seu computador. Não precisa de chave, de cartão nem paga por consulta.

---

## Como instalar

### Pelo Claude Code (o jeito mais fácil)

Abra o Claude Code numa pasta qualquer e cole isto:

```
Clona o repositório https://github.com/yagocoimbra/crono-scraper, entra na pasta e segue o CLAUDE.md pra instalar e abrir o Crono Scraper.
```

Ele baixa o código, instala o que faltar e abre a ferramenta no navegador. Funciona no Mac, no Windows e no Linux. Quando ele pedir permissão pra rodar o script de instalação, pode aprovar.

### Na mão

- **Mac ou Linux:** no Terminal, dentro da pasta, `bash instalar.sh` e depois `bash abrir.sh`.
- **Windows:** clique com o botão direito em `instalar.ps1` e escolha "Executar com o PowerShell". Nas próximas vezes, dois cliques em `Abrir Crono Scraper.cmd`.

A primeira busca baixa um navegador próprio (uns 170 MB), então ela demora mais.

---

## Como usar

1. **O que você procura?** O nicho: "dentista", "pet shop", "escritório de advocacia". Vários de uma vez, separe por vírgula.
2. **Onde?** Bairro e cidade.
3. **Quantidade:** até 20, 60, 120 ou 200+ por nicho. Quanto mais, mais demora.
4. **Buscar e-mails:** entra no site de cada empresa atrás de e-mail. Bem mais lento, ligue só quando precisar.
5. Clique em **Buscar empresas**. Os resultados aparecem enquanto a busca anda.

Nos filtros, **Sem site**, **Só rede social**, **Com celular**, **Com e-mail**, nota mínima e número de avaliações. Cada empresa tem link pro WhatsApp (quando é celular), pro Google Maps e pro site.

Os botões:

- **Baixar planilha:** abre direto no Excel, em português, só com o que estiver filtrado.
- **Copiar telefones:** a lista de telefones na área de transferência.
- **Abordar no CronoLead:** a planilha dos celulares filtrados, já no formato que o [CronoLead](https://cronolead.cronosoft.com.br) importa, pra disparar a abordagem no WhatsApp com cadência e atendente de IA.

**Uma dica que a gente mediu:** pra quem vende site, "sem site" é o filtro óbvio. Pra quem vende qualquer outra coisa, na base do CronoLead as empresas **com** site responderam quase o dobro no WhatsApp (20,4% contra 11,3%). Escolha a ponta pelo que você vende.

---

## Como funciona por dentro

Não usa a API oficial do Google Maps, por isso não precisa de chave. O programa abre o Google Maps num navegador invisível, pesquisa "marcenaria em Mooca, São Paulo", rola a lista até o fim, entra na ficha de cada empresa e anota o que está na tela: nome, telefone, site, nota, avaliações, endereço. Depois junta tudo.

Ele depende da página do Google estar organizada do jeito que conhece. Quando o Google muda o layout do Maps, o programa pode parar de achar as informações até o motor ser atualizado.

---

## Limites e cuidados

- **Termos do Google.** Coletar dados do Maps de forma automática vai contra os termos de uso do Google. Na prática, volume alto traz captcha ou bloqueio temporário. Use com moderação: algumas buscas por dia, não centenas.
- **A quantidade é aproximada.** Quem decide quantos resultados aparecem é o Google.
- **LGPD.** Telefone de empresa listado no Google é público, mas a abordagem continua sujeita à LGPD. Se apresente, diga onde achou o contato e tire da lista na hora quem pedir.
- **Sem telemetria.** O projeto original manda estatística de uso. Aqui isso vem desligado.

---

## Créditos

O motor é o [google-maps-scraper](https://github.com/gosom/google-maps-scraper), do Georgios Komninos (gosom), código aberto com licença MIT. O README original está em [README-original.md](README-original.md). Interface em português, correção do Windows e exportação pro CronoLead: [Cronosoft](https://cronosoft.com.br).
