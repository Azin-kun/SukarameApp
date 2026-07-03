// Data menu statis — port dari SukarameWeb (index.html + order.html).
// Sumber referensi harga/nama: Sukarame/supabase/seed/1_catalog.sql.
import { assetUrl } from '../shared/assetUrl'

export interface MenuItem {
  id: string
  name: string
  desc?: string
  price: number
  img?: string
}

export const menuMie: MenuItem[] = [
  {
    id: 'ma-ori',
    name: 'Mie Ayam Original',
    desc: 'Mie kuning segar, ayam cincang berbumbu, kuah kaldu gurih. Klasik yang selalu pas.',
    price: 10000,
    img: assetUrl('/img/mie-ayam-original.webp'),
  },
  {
    id: 'ma-cek',
    name: 'Mie Ayam Ceker',
    desc: 'Mie ayam dengan ceker ayam empuk yang dimasak hingga bumbu meresap sempurna.',
    price: 12000,
    img: assetUrl('/img/mie-ayam-ceker.webp'),
  },
  {
    id: 'ma-bks',
    name: 'Mie Ayam Bakso',
    desc: 'Perpaduan mie ayam dan bakso sapi dalam satu mangkuk — lebih kenyang, lebih puas.',
    price: 13000,
    img: assetUrl('/img/mie-ayam-bakso.webp'),
  },
]

export const menuGoreng: MenuItem[] = [
  {
    id: 'mg-l02',
    name: 'Mie Goreng Level 0–2',
    desc: 'Mie goreng kering berbumbu dengan ayam cincang gurih. Pedas ringan hingga sedang — untuk semua selera.',
    price: 13000,
    img: assetUrl('/img/mie-goreng.webp'),
  },
  {
    id: 'mg-l35',
    name: 'Mie Goreng Level 3–5',
    desc: 'Mie goreng pedas level tinggi — bumbu kaya, rasa nendang, untuk jiwa yang berani. Siap?',
    price: 15000,
    img: assetUrl('/img/mie-goreng-pedas.webp'),
  },
]

export const menuTambahan: MenuItem[] = [
  { id: 'tb-pgs', name: 'Pangsit isi 3', price: 2000 },
  { id: 'tb-bks', name: 'Bakso', price: 2000 },
  { id: 'tb-ckr', name: 'Ceker isi 2', price: 3000 },
]

export const menuMinuman: MenuItem[] = [
  { id: 'mn-teh', name: 'Teh Panas / Es', price: 3000 },
  { id: 'mn-jrk', name: 'Jeruk Panas / Es', price: 4000 },
  { id: 'mn-kpi', name: 'Kopi Hitam', price: 4000 },
  { id: 'mn-gd', name: 'Good Day', price: 4000 },
  { id: 'mn-ntr', name: 'Nutrisari', price: 4000 },
]

export const menuCategories = {
  mie: { label: 'Mie Ayam', items: menuMie },
  goreng: { label: 'Mie Goreng', items: menuGoreng },
  tambahan: { label: 'Tambahan', items: menuTambahan },
  minuman: { label: 'Minuman', items: menuMinuman },
} as const

export type MenuCategoryKey = keyof typeof menuCategories
