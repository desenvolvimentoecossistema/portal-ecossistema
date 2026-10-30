export const portalFonts=[
 {family:'Cabin',href:'/fonts/Cabin/Cabin-variable-ea743dde.woff2',weight:'400 700'},
 {family:'Montserrat',href:'/fonts/Montserrat/Montserrat-variable-5a05eb46.woff2',weight:'100 900'}
];
export const portalFontFaceCSS=portalFonts.map(font=>`@font-face{font-family:${font.family};src:url('${font.href}') format('woff2');font-style:normal;font-weight:${font.weight};font-display:block}`).join('\n');
export const portalFontPreloadsHTML=portalFonts.map(font=>`<link rel="preload" href="${font.href}" as="font" type="font/woff2" crossorigin="anonymous" fetchpriority="high">`).join('');
