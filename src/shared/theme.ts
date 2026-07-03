// Port dari Sukarame/app/lib/config/theme.dart & SukarameWeb/index.html.
// Nilai HARUS sinkron dengan CSS variables di shared/theme.css — pakai ini
// hanya kalau butuh warna/font di JS/TS (mis. meta theme-color, canvas, inline style).
export const colors = {
  bg: '#1A0A00',
  surface: '#3D1400',
  surface2: '#5C2000',

  red: '#D32F2F',
  redLight: '#FF5252',
  redTint: 'rgba(211, 47, 47, 0.18)',

  yellow: '#FFC107',
  yellowLight: '#FFD54F',
  yellowTint: 'rgba(255, 193, 7, 0.15)',

  cream: '#FFF8F0',
  cream2: '#FFE8D0',

  line: 'rgba(211, 47, 47, 0.28)',
  line2: 'rgba(255, 193, 7, 0.5)',
} as const

export const fonts = {
  heading: "'Playfair Display', Georgia, serif",
  body: "'Poppins', system-ui, sans-serif",
  googleFontsUrl:
    'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Poppins:wght@300;400;500;600;700&display=swap',
} as const
