# עצה תומכת — אתר תדמית

אתר תדמית עבור **שושי מיראז** — ייעוץ הוליסטי וליווי רגשי לנשים (גינקוסופיה, סאונת אדים לאגן, טקס סגירת אגן, מעגלי נשים וצמחי מרפא), קרית טבעון.

אתר סטטי (HTML/CSS/JS ללא build step), בנוי עם [Tailwind CSS](https://tailwindcss.com/) (CDN), RTL ועברית מלאה.

## מבנה הפרויקט

```
index.html                   עמוד הבית
about.html                   עליי / על שושי
accessibility.html           הצהרת נגישות
blog.html                    בלוג
friends.html                 חברות/שותפות
privacy.html                 מדיניות פרטיות
terms.html                   תנאי שימוש
service-*.html               עמוד נפרד לכל שירות (הליטות, ליווי רגשי, מעגל נשים, סאונת אדים, סגירת אגן)
accessibility-widget.js      ווידג'ט נגישות מוטבע
photos/                      תמונות האתר (כולל WebP)
brand_assets/                לוגואים ונכסי מותג
_headers                     כללי cache (לפריסה ב-Cloudflare Pages/Netlify)
```

## הרצה מקומית

```bash
node serve.mjs
```

האתר יעלה בכתובת `http://localhost:3000`.

## כלי עזר (Scripts)

| קובץ | תפקיד |
|---|---|
| `serve.mjs` | שרת סטטי מקומי לפיתוח |
| `screenshot.mjs` | צילום מסך של עמוד עם Puppeteer — `node screenshot.mjs http://localhost:3000` |
| `screenshot_sections.mjs` | צילום מסך לפי סקשנים בעמוד |
| `optimize-images.mjs` | המרת תמונות ל-WebP בעזרת sharp |
| `nav_crop.mjs` | חיתוך/עיבוד תמונות לתפריט הניווט |

## התקנה

```bash
npm install
```

תלויות: `puppeteer` (צילומי מסך), `sharp` (אופטימיזציית תמונות).

## נגישות

האתר נבדק ועומד בדרישות **WCAG 2.0 AA** ות"י 5568 (תקן הנגישות הישראלי). ראו `accessibility.html` להצהרת הנגישות המלאה.
