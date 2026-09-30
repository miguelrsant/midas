import {
  Apple,
  Baby,
  Backpack,
  Banknote,
  Beer,
  Bike,
  BookOpen,
  Briefcase,
  Building,
  Bus,
  Cake,
  Car,
  CarTaxiFront,
  Cat,
  Church,
  Coffee,
  Coins,
  CreditCard,
  Dog,
  Droplets,
  Dumbbell,
  FileText,
  Film,
  Flame,
  Fuel,
  Gamepad2,
  Gift,
  Glasses,
  GraduationCap,
  Hammer,
  HandCoins,
  Heart,
  HeartHandshake,
  House,
  Key,
  Landmark,
  Laptop,
  Lightbulb,
  type LucideIcon,
  Motorbike,
  Music,
  Package,
  PaintRoller,
  Palette,
  ParkingMeter,
  PawPrint,
  PiggyBank,
  Pill,
  Pizza,
  Plane,
  Receipt,
  Sandwich,
  School,
  Scissors,
  Shapes,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Smartphone,
  Sofa,
  Sparkles,
  Stethoscope,
  Store,
  Tent,
  Ticket,
  TrainFront,
  TreePalm,
  TrendingUp,
  Truck,
  Tv,
  Umbrella,
  Users,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
} from "lucide-react";

/**
 * Ícones das categorias (docs/design-system/15-categorias.md#ícones-da-personalização).
 * O banco guarda a chave do Midas, nunca o nome do Lucide. Imports explícitos: só
 * estes ícones entram no pacote.
 */

export interface IconOption {
  key: string;
  Icon: LucideIcon;
  /** Nome em português para o leitor de tela. */
  label: string;
}

export interface IconGroup {
  title: string;
  icons: IconOption[];
}

const o = (key: string, Icon: LucideIcon, label: string): IconOption => ({ key, Icon, label });

export const ICON_GROUPS: readonly IconGroup[] = [
  {
    title: "Categorias prontas",
    icons: [
      o("mercado", ShoppingCart, "Carrinho"),
      o("restaurante", Utensils, "Talheres"),
      o("transporte", Car, "Carro"),
      o("moradia", House, "Casa"),
      o("contas", Receipt, "Recibo"),
      o("saude", Heart, "Coração"),
      o("educacao", BookOpen, "Livro"),
      o("lazer", Ticket, "Ingresso"),
      o("compras", ShoppingBag, "Sacola"),
      o("outros", Shapes, "Formas"),
      o("salario", Briefcase, "Maleta"),
      o("freelance", Laptop, "Notebook"),
      o("vendas", Store, "Loja"),
      o("investimentos", TrendingUp, "Gráfico subindo"),
    ],
  },
  {
    title: "Casa e contas",
    icons: [
      o("predio", Building, "Prédio"),
      o("chave", Key, "Chave"),
      o("sofa", Sofa, "Sofá"),
      o("luz", Lightbulb, "Lâmpada"),
      o("agua", Droplets, "Gotas"),
      o("gas", Flame, "Chama"),
      o("internet", Wifi, "Wi-fi"),
      o("celular", Smartphone, "Celular"),
      o("tv", Tv, "Televisão"),
      o("conserto", Wrench, "Chave inglesa"),
      o("obra", Hammer, "Martelo"),
      o("pintura", PaintRoller, "Rolo de pintura"),
    ],
  },
  {
    title: "Comida",
    icons: [
      o("cafe", Coffee, "Café"),
      o("pizza", Pizza, "Pizza"),
      o("lanche", Sandwich, "Sanduíche"),
      o("bebida", Beer, "Cerveja"),
      o("doce", Cake, "Bolo"),
      o("feira", ShoppingBasket, "Cesta"),
      o("fruta", Apple, "Maçã"),
    ],
  },
  {
    title: "Transporte",
    icons: [
      o("onibus", Bus, "Ônibus"),
      o("metro", TrainFront, "Trem"),
      o("bicicleta", Bike, "Bicicleta"),
      o("moto", Motorbike, "Moto"),
      o("combustivel", Fuel, "Bomba de combustível"),
      o("taxi", CarTaxiFront, "Táxi"),
      o("estacionamento", ParkingMeter, "Parquímetro"),
      o("viagem", Plane, "Avião"),
    ],
  },
  {
    title: "Pessoas e bichos",
    icons: [
      o("bebe", Baby, "Bebê"),
      o("familia", Users, "Pessoas"),
      o("cachorro", Dog, "Cachorro"),
      o("gato", Cat, "Gato"),
      o("pet", PawPrint, "Pata"),
      o("presente", Gift, "Presente"),
      o("doacao", HeartHandshake, "Doação"),
      o("igreja", Church, "Igreja"),
    ],
  },
  {
    title: "Cuidado",
    icons: [
      o("remedio", Pill, "Remédio"),
      o("consulta", Stethoscope, "Estetoscópio"),
      o("academia", Dumbbell, "Haltere"),
      o("cabelo", Scissors, "Tesoura"),
      o("beleza", Sparkles, "Brilhos"),
      o("oculos", Glasses, "Óculos"),
    ],
  },
  {
    title: "Estudo e lazer",
    icons: [
      o("faculdade", GraduationCap, "Capelo"),
      o("escola", School, "Escola"),
      o("material", Backpack, "Mochila"),
      o("musica", Music, "Nota musical"),
      o("jogos", Gamepad2, "Controle de videogame"),
      o("cinema", Film, "Filme"),
      o("arte", Palette, "Paleta"),
      o("acampar", Tent, "Barraca"),
    ],
  },
  {
    title: "Dinheiro e coisas",
    icons: [
      o("poupanca", PiggyBank, "Cofrinho"),
      o("carteira", Wallet, "Carteira"),
      o("cartao", CreditCard, "Cartão"),
      o("dinheiro", Banknote, "Nota de dinheiro"),
      o("emprestimo", HandCoins, "Mão com moedas"),
      o("imposto", Landmark, "Prédio público"),
      o("roupa", Shirt, "Camiseta"),
      o("encomenda", Package, "Pacote"),
      o("mudanca", Truck, "Caminhão"),
      o("seguro", Umbrella, "Guarda-chuva"),
    ],
  },
];

/** Ícones que a pessoa pode escolher (todos os grupos acima). */
export const PICKABLE_ICON_KEYS: ReadonlySet<string> = new Set(
  ICON_GROUPS.flatMap((g) => g.icons.map((i) => i.key)),
);

const CALCULATOR_ICONS: Record<string, LucideIcon> = {
  "calc-decimo-terceiro": Coins,
  "calc-ferias": TreePalm,
  "calc-rescisao": FileText,
  "calc-seguro": Umbrella,
};

const ALL: Map<string, LucideIcon> = new Map([
  ...ICON_GROUPS.flatMap((g) => g.icons.map((i) => [i.key, i.Icon] as const)),
  ...Object.entries(CALCULATOR_ICONS),
]);

export function categoryIcon(key: string): LucideIcon {
  return ALL.get(key) ?? Shapes;
}
