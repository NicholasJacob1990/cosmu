# GalaxIA Favicon & Brand Icons

## 🎯 Especificações do Favicon

### **Tamanhos Necessários**
```
favicon.ico          - 16x16, 32x32, 48x48 (ICO)
favicon-16x16.png    - 16x16px
favicon-32x32.png    - 32x32px
apple-touch-icon.png - 180x180px
android-chrome.png   - 192x192px
android-chrome-512.png - 512x512px
```

### **Formato do Logo para Favicon**
- **Fundo**: Transparente
- **Cores**: Gradiente GalaxIA ou monocromático
- **Estilo**: Ícone simples e reconhecível
- **Resolução**: Mínimo 512x512px (original)

## 📱 Ícones de App

### **iOS App Icons**
```
ios/
├── icon-20@2x.png     - 40x40px
├── icon-20@3x.png     - 60x60px
├── icon-29@2x.png     - 58x58px
├── icon-29@3x.png     - 87x87px
├── icon-40@2x.png     - 80x80px
├── icon-40@3x.png     - 120x120px
├── icon-60@2x.png     - 120x120px
├── icon-60@3x.png     - 180x180px
└── icon-76.png        - 76x76px
```

### **Android App Icons**
```
android/
├── mipmap-hdpi/icon.png      - 72x72px
├── mipmap-mdpi/icon.png      - 48x48px
├── mipmap-xhdpi/icon.png     - 96x96px
├── mipmap-xxhdpi/icon.png    - 144x144px
└── mipmap-xxxhdpi/icon.png   - 192x192px
```

## 🌐 Web Manifest

### **manifest.json**
```json
{
  "name": "GalaxIA - Cosmic Connections",
  "short_name": "GalaxIA",
  "description": "Plataforma de conexão de talentos com IA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F1118",
  "theme_color": "#0078FF",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🎨 Diretrizes de Design

### **Favicon**
- **Simplicidade**: Ícone reconhecível em 16x16px
- **Contraste**: Alto contraste para visibilidade
- **Cores**: Use cores da paleta GalaxIA
- **Formato**: SVG como fonte, PNG para fallback

### **Ícone de App**
- **Completo**: Representa a marca completa
- **Detalhes**: Visível em 512x512px
- **Simplicidade**: Funciona em 48x48px
- **Cores**: Gradiente GalaxIA

## 📋 Checklist de Implementação

- [ ] Criar logo em SVG (512x512px)
- [ ] Gerar favicon.ico
- [ ] Criar versões PNG (16x16, 32x32, 180x180)
- [ ] Gerar ícones para iOS
- [ ] Gerar ícones para Android
- [ ] Criar manifest.json
- [ ] Testar em diferentes dispositivos
- [ ] Validar com ferramentas online

## 🛠️ Ferramentas Recomendadas

- **Favicon Generator**: realfavicongenerator.net
- **SVG Optimizer**: SVGO
- **Image Compression**: TinyPNG
- **Icon Testing**: favicon.io

## 📝 Notas Importantes

1. **Sempre use SVG como fonte** para escalabilidade
2. **Teste em diferentes fundos** (claro/escuro)
3. **Mantenha consistência** com a identidade visual
4. **Otimize para web** (tamanho de arquivo)
5. **Valide acessibilidade** (contraste adequado)

---

*Última atualização: Dezembro 2024* 