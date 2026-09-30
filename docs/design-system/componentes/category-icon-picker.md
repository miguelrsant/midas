# CategoryIconPicker (Escolha de ícone)

> Grade de ícones para a pessoa escolher o ícone de uma categoria. Só ícones da lista curada de [Categorias](../15-categorias.md#ícones-da-personalização), sem cor.

Grupo: Configurações · Componente React: `<CategoryIconPicker />` em `src/components/midas/category-icon-picker.tsx`

## Anatomia

- `fieldset` com `legend` "Ícone" e rádios nativos (`name="icon"`), um por ícone, visualmente escondidos.
- Cada opção é um quadrado de 44px com o ícone de 24px em `tinta` sobre `superficie`, borda `borda`, `radius-md`, 8px entre opções.
- Grupos com subtítulo em `caption` (Casa e contas, Comida, Transporte…), na ordem da tabela da página de categorias.

## Estados

| Estado | Aparência |
| --- | --- |
| Padrão | `superficie`, borda `borda` |
| Hover | `superficie-funda` |
| Foco | Anel 2px `foco`, afastado 2px |
| Selecionado | Fundo `ouro`, borda `ouro`, ícone `sobre-ouro` (o ícone continua; não vira `check`) |

## Acessibilidade

- Cada rádio tem o nome em português do ícone como rótulo ("Cachorro", "Remédio"), escondido visualmente.
- Setas movem entre os ícones (comportamento nativo dos rádios); o grupo inteiro é uma parada de Tab.
- A prévia ao lado ("Como fica: [ícone] Academia") repete a escolha em texto.

## Implementação

- Chaves do Midas (`remedio`, `cachorro`) no valor do rádio; o mapa chave → componente Lucide fica em `src/lib/category-icons.ts`, com imports explícitos (sem importar a biblioteca inteira).
