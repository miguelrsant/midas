# Mármore e texturas

O mármore é o material do Midas. Ele aparece como **textura** em poucas superfícies de destaque e, no resto do app, como **cor**: o token `marmore` é o fundo de todas as telas.

## As duas texturas

| Arquivo | Tema | Descrição | Dimensões |
| --- | --- | --- | --- |
| [`public/texturas/marmore-calacatta.webp`](../../public/texturas/marmore-calacatta.webp) | Calacatta (claro) | Branco quente com veios cinza e um veio dourado. | 1600 × 1000px, WebP |
| [`public/texturas/marmore-portoro.webp`](../../public/texturas/marmore-portoro.webp) | Portoro (escuro) | Marrom quase preto com veios dourados. | 1600 × 1000px, WebP |

As duas foram **geradas por código para o Midas**, sem fotos de terceiros, então não há questão de direitos de imagem. Cada arquivo tem entre 10 e 20 KB.

### Como foram feitas

- Ruído fractal (fBm) com deformação de domínio (*domain warping*) desenha os veios, que se dobram como no mármore de verdade.
- O cálculo é feito em ponto flutuante do começo ao fim e renderizado com superamostragem de 2×: com 8 bits nas etapas intermediárias, os veios saíam serrilhados.
- A paleta de cada textura parte dos tokens do tema (`marmore`, `veio`, `ouro`), então a textura e a interface combinam.
- Os scripts ficam no material de design, fora do repositório do app. Se um dia for preciso gerar de novo (outra proporção, outro tamanho), use os mesmos scripts, para manter o desenho dos veios.

## Onde o mármore aparece

**No máximo uma superfície com textura por tela**, sempre um ponto de destaque:

| Lugar | Classe | Como |
| --- | --- | --- |
| Fundo da entrada, do cadastro e da recuperação de senha | `md-marmore-pleno` | Textura inteira, sem véu. O texto fica todo dentro do cartão `superficie`. |
| Cartão de saldo ([BalanceCard](componentes/balance-card.md)) | `md-marmore` | Textura sob o `veu`, dentro do cartão. |
| Conquista do mês ([Achievement](componentes/achievement.md)) | `md-marmore` | Textura sob o `veu`, dentro do cartão. |

Nos dias em que a conquista aparece no painel, ela fica com o mármore, e o cartão de saldo usa `superficie` lisa. Nos outros dias, o mármore é do cartão de saldo.

**Nunca** use a textura atrás de listas, formulários longos, gráficos, diálogos, menus, tabelas ou texto corrido. Os veios competem com a leitura e com os dados.

## A regra do véu

**Texto nunca fica direto sobre a textura.** Ou o texto está dentro de um cartão `superficie` (caso do `md-marmore-pleno`), ou está sobre o `veu`, uma camada semitransparente da cor da superfície (caso do `md-marmore`).

| Token | Calacatta | Portoro |
| --- | --- | --- |
| `veu` | `rgba(253,251,247,0.76)` | `rgba(34,25,18,0.8)` |

Com o véu, o contraste continua acima do mínimo em qualquer ponto da textura (pior caso medido):

| Texto | Calacatta + véu | Portoro + véu |
| --- | --- | --- |
| `tinta` | 13,02 | 10,19 |
| `tinta-suave` | 5,72 | 5,90 |
| `ouro-texto` | 5,02 | 7,03 |
| `renda` | 5,49 | 6,07 |
| `gasto` | 5,13 | 5,26 |

Não reduza a opacidade do véu para "mostrar mais o mármore": esses números deixam de valer.

## Implementação

A textura do tema fica numa variável, e as duas classes a usam:

```css
:root { --textura: url("/texturas/marmore-calacatta.webp"); }
[data-theme="dark"] { --textura: url("/texturas/marmore-portoro.webp"); }

/* Cartão com mármore sob o véu: saldo e conquista */
.md-marmore {
  background:
    linear-gradient(var(--veu), var(--veu)),
    var(--textura) center / cover no-repeat,
    var(--superficie);
}

/* Fundo inteiro de mármore: entrada, cadastro, recuperação de senha */
.md-marmore-pleno {
  background: var(--textura) center / cover no-repeat, var(--marmore);
}
```

- A cor sólida no fim (`var(--superficie)` ou `var(--marmore)`) é a reserva enquanto a imagem carrega ou se ela falhar: a tela nunca fica sem fundo.
- `background-size: cover` e `center`: a textura não se repete nem estica. Em telas largas, o recorte muda, e está tudo bem: mármore não tem "lado certo".
- O tema claro é o padrão, também sem JavaScript; a troca de `--textura` acontece só com `data-theme="dark"` (veja [Tokens](14-tokens.md)).
- Na tela de entrada, que fica sempre no tema claro, pré-carregue a textura Calacatta, a maior imagem da tela: `<link rel="preload" as="image" href="/texturas/marmore-calacatta.webp">`.

Em Tailwind, use as classes do sistema (`md-marmore`, `md-marmore-pleno`) declaradas no CSS global. Não reescreva o `background` em utilitários soltos em cada componente.

## Casos especiais

### Alto contraste (modo de cores forçadas)

No modo de alto contraste do Windows, o sistema troca as cores, e a textura só atrapalha. Tire a imagem:

```css
@media (forced-colors: active) {
  .md-marmore, .md-marmore-pleno { background-image: none; }
}
```

### Impressão

Relatórios impressos (resumo do mês, resultado de uma calculadora) saem sem textura e sem sombra:

```css
@media print {
  .md-marmore, .md-marmore-pleno { background: none; }
  .md-card { box-shadow: none; border: 1px solid #8a7a68; }
}
```

### Economia de dados

As texturas são pequenas (menos de 20 KB). Não é preciso escondê-las em conexões lentas; se um dia houver uma versão maior, respeite `prefers-reduced-data` quando o navegador oferecer.

## Faça e evite

| Faça | Evite |
| --- | --- |
| Uma superfície de mármore por tela, no ponto de destaque. | Mármore em dois cartões da mesma tela. |
| Texto sempre sobre `superficie` ou sobre o `veu`. | Texto, ícones ou o logo direto sobre os veios. |
| Usar as classes `md-marmore` e `md-marmore-pleno`. | Recriar o fundo com utilitários em cada componente. |
| Deixar uma cor sólida de reserva atrás da imagem. | Tela branca enquanto a textura carrega. |
| Usar as texturas geradas para o Midas. | Fotos de mármore da internet (direitos, peso, cores fora da paleta). |
| Tirar a textura no alto contraste e na impressão. | Esquecer os modos especiais. |
