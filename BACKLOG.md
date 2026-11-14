# Backlog - Crono Scraper

Combinado e não entregue. Item concluído sai daqui (o git é o histórico).

- **CI vermelho só por lint no diff da Cronosoft** (build de 6294346): `web/web.go:606` string "Invalid ID" repetida 3x (goconst, virar constante) e `web/places.go:141` falta linha em branco antes do assign (wsl_v5). Compila e os testes passam; é estilo do golangci do gosom.
- **Testar num Windows de verdade**: `instalar.ps1` e `Abrir Crono Scraper.cmd` nunca rodaram em máquina Windows (o build cruzado compila).
- **Medir volume até captcha**: quantas buscas por dia passam limpas antes do Google pedir captcha; vira o número do aviso "use com moderação" no README.
- **Vídeo do canal com o repo como isca** (fórmula do vídeo do Vagner Mazzeo): roteiro com `/content-creator-cronosoft`, prova ao vivo da busca, prompt de instalação na descrição, escada pro CronoLead e depois pro curso.
