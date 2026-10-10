# עקרונות עיצוב — אתר שושי מיראז

מסמך תמצית של השפה העיצובית של האתר: צבעים, טיפוגרפיה, רכיבים, ודפוסי layout —
כדי לייצר עמודים/רכיבים חדשים במהירות ובעקביות. זה **לא** מסמך build — לעבודה
בפועל על עמודי נחיתה ראו `design-system/README.md`, ועל עמודי האתר הראשי ראו
`CLAUDE.md` (Build-in-Place System) + skill `new-page-scaffold`.

---

## 1. שתי מערכות עיצוב באתר — ולמה

לאתר אין build step משותף אחד; יש שני "משפחות" עמודים עם שני סטים של טוקנים:

| | **עמודי האתר הראשי** (`index.html`, `about.html`, `service-*.html` וכו') | **עמודי נחיתה** (`course-isha-magalit.html`, `chocolate-landing.html`, עמודים עתידיים) |
|---|---|---|
| מקור טוקנים | מוגדר inline בכל קובץ (זהה בכולם) | `design-system/tokens.css` |
| שם משתנה לחום/טקסט | `--brown-dark/mid/light`, `--text/-mid/-light` | `--text-dark/-mid/-subtle` |
| כתום/אדמדם | אין (הצבעים כאן הם brown/olive/gold בלבד) | `--accent`/`--accent-deep` — **מתחלף לפי נושא** |
| קרם | `--cream`, `--cream-mid`, `--cream-dark` | `--cream-bg`, `--cream-card`, `--cream-deep`, `--cream-light` |
| Serif בכותרות | `Tinos` ראשון, `Cormorant Garamond` fallback | `Cormorant Garamond` ישירות |
| בנייה | build-in-place: עורכים ב-`src/pages/*.html` + `partials/*.html`, ואז `node build-pages.mjs` | קובץ HTML עצמאי אחד, מועתק מ-`landing-page-template.html` |
| Nav/Footer | 3 variants משותפים (`nav-home`/`nav-full`/`nav-legal` + footers מקבילים) | ה-header/footer של העמוד עצמו, לא משותף |

**מסקנה מעשית:** בעת בניית עמוד חדש — קודם תחליטו לאיזו משפחה הוא שייך (עמוד שירות/תוכן קבוע באתר הראשי, מול עמוד נחיתה עצמאי לקמפיין/קורס), ורק אז תבחרו את סט הטוקנים המתאים. אל תערבבו שמות משתנים בין המשפחות.

---

## 2. פלטת צבעים

שתי המשפחות חולקות את אותו "שלד" זהב+זית, אבל עם ניואנס שונה בחום/טקסט. אלה
הערכים **בפועל** מהקוד (לא רק מהתיעוד):

### עמודי האתר הראשי
```
--brown-dark:   #3b2210     --olive-dark:  #586b28     --gold:       #c8a55a
--brown-mid:    #6b4423     --olive-mid:   #7a8c42     --gold-light: #dfc07e
--brown-light:  #9a7252     --olive-light: #aab870
--text:         #2d1e0e     --cream:       #faf4ec
--text-mid:     #6b5040     --cream-mid:   #f2e8d8
--text-light:   #7a6050     --cream-dark:  #e8d5bc
```

### עמודי נחיתה
```
--text-dark:   #2d2410     --olive-dark:  #4a5824     --gold:        #c8a55a
--text-mid:    #5a4e34     --olive-mid:   #6f7f3a     --gold-soft:   #dfc07e
--text-subtle: #85795d     --olive-light: #a3b26a     --gold-on-light: #7a5a1a (AA-safe)
--cream-bg:    #f4ecdc     --accent:      #b5623c ← משתנה לפי נושא (טרקוטה בעמוד הקורס)
--cream-card:  #fbf5e9     --accent-deep: #8f4a2c ← משתנה יחד עם accent
--cream-deep:  #ece0c8
--cream-light: #f8f1e0 (רקע הירו/CTA סופי)
```

**כלל קבוע:** זהב+זית הם צבעי הזהות של האתר — לא משנים אותם בין עמודים. הצבע
היחיד שמתחלף לפי נושא/קמפיין הוא `--accent`/`--accent-deep` בעמודי נחיתה בלבד.
עמודי האתר הראשי לא משתמשים ב-accent כלל.

**גם:** לפי CLAUDE.md — לעולם לא Tailwind palette כברירת מחדל (indigo/blue וכו'), רק הצבעים המוגדרים כאן.

---

## 3. טיפוגרפיה

- **גוף/UI:** `Assistant` (sans) — בכל מקום, בשתי המשפחות.
- **כותרות + טקסט רגשי/ציטוטים:** סריף, אף פעם לא אותו פונט כמו הגוף.
  - עמודי אתר ראשי: `'Tinos', 'Cormorant Garamond', Georgia, serif`
  - עמודי נחיתה: `'Cormorant Garamond', Georgia, serif`
- Google Fonts נטענים גם: `Frank Ruhl Libre`, `Heebo` (זמינים אך לא ליבה — בדקו שימוש בפועל לפני שמסתמכים עליהם).
- **Tracking:** כותרות גדולות — `letter-spacing: -0.03em` (צפוף). Labels/eyebrows — הפוך: `0.18em` (מרווח, uppercase, 11px, weight 700).
- **Line-height גוף:** נדיב, `1.7`–`1.75`.

---

## 4. Spacing / מידות (מ-tokens.css, נכון לשתי המשפחות בפועל)

```
ריווח section:   120px 24px 64px (hero) · 90px 24px (ראשי) · 80px 24px (משני) · 70px 24px (קצר) · 56px 24px (הפסקת עדות בודדת)
Max-width:        680px (טקסט) · 780px (רשימות/מחיר) · 900px (ציר זמן)
                  960px (גריד About) · 1000px (עדויות) · 1100px (תוך ה-hero) · 1170px (תוך ה-header)
Border-radius:    3px (focus outline) · 12–14px (כרטיסים/thumbs) · 16–20px (כרטיסים גדולים)
                  30px (כפתורים/pills) · 50% (עיגול) · 999px (chips)
                  organic blob: 42% 58% 61% 39% / 41% 44% 56% 59%
צללים (soft lift):  0 8px 18px -12px rgba(45,36,16,0.22), 0 2px 6px -2px rgba(111,127,58,0.16)
צללים (hover lift): 0 14px 26px -14px rgba(45,36,16,0.3)
```

**כלל stacking פדינג:** כששני `<section>` צמודים חולקים בדיוק אותו רקע (למשל
שניהם `--cream-bg`), הפדינג הנוגע מצטמצם כך שהפער הכולל יהיה ~70–90px ולא
150px+ (למשל `90px 24px` → `90px 24px 40px` / `40px 24px 90px`). לא חל כששני
הרקעים שונים — זה כבר קורא כהפסקה חזותית.

**כלל CTA בין sections:** לעולם לא לעטוף CTA שמוכנס בין שני sections קיימים
ב-`<section>` חדש עם padding עצמאי — זה נערם עם הפדינג של השכנים ויוצר רווח ענק.

---

## 5. רכיבי ליבה (מ-`components.css`, זמינים ל-copy/paste)

| רכיב | קלאס | הערה |
|---|---|---|
| כותרת section | `.section-label` + `.gold-divider` + `h2` | תמיד השלישייה יחד, ממורכז |
| כפתור ראשי | `.btn-primary` | אנימציית "נשימה" (`btn-breathe`) רצה תמידית עד hover; ה-rgba בצל מקודד ידנית לגוון טרקוטה — לשנות אם ה-accent שונה מהותית |
| כרטיס | `.ds-card` | גרדיאנט לבן→קרם, hover = הרמה 3px |
| תגית | `.ds-chip` | pill קטן, לתוכן משני |
| פריט הטבה | `.perk-item` | pill ירוק-זית שקוף |
| FAQ | `.faq-item` (native `<details>/<summary>`) | אין JS לאקורדיון עצמו |
| ציר זמן מפותל | `.gains-path` + `.gain-row` + `.gain-number` | קורס למובייל: עמודה אחת, ויזואלים מוסתרים מתחת 720px |
| כפתור וואטסאפ צף | `.wa-float` | **חובה בכל עמוד באתר** — קונטרקט: `id="float-whatsapp-link"`, מקשר ל-`wa.me/972528753214` (דסקטופ עובר ל-web.whatsapp.com), נגלה אחרי ~40px גלילה — לא לקשר גלוי לאלמנט ספציפי |
| קרוסלת עדויות | `.testimonial-carousel` + `.testimonial-track` + `testimonial-carousel.js` | קורא את מספר השקפים דינמית מה-DOM, לופ כיוון אחד בלבד |
| Skip link | `.skip-link` | נגישות — קפיצה לתוכן |

מקור אמת לרכיבים: `course-isha-magalit.html` — אם משהו בקובץ הזה לא תואם ל-README, הקובץ הוא הנכון.

---

## 6. אנימציה ואינטראקציה

- **שתי מערכות אנימציה נפרדות, שתיהן תמיד קיימות יחד:**
  1. **Scroll reveal (AOS):** `data-aos="fade-up|fade-right|fade-left|zoom-in"`, עם `data-aos-delay` למדרוג. קצב: משך איטי יחסית + פער ~250ms בין כותרת לתוכן שמתחתיה (לא ביחד).
  2. **Idle micro-animation:** למשל "נשימת" ה-CTA הראשי — רץ ברקע תמיד, לא תלוי בגלילה, נעצר ב-hover.
- **רק** `transform`/`opacity` מונפשים — לעולם לא `transition-all`.
- Easing בסגנון spring: `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- כל אלמנט קליקבילי חייב hover + focus-visible + active. `focus-visible` תמיד: `outline: 3px solid var(--gold-soft); outline-offset: 3px`.
- `prefers-reduced-motion: reduce` מכובד גלובלית (גם AOS `disable` וגם override ב-CSS) — לשמור בכל דף חדש.

---

## 7. תמונות

- Overlay גרדיאנט (`from-black/60`) + שכבת טיפול צבע עם `mix-blend-multiply` על תמונות רקע.
- כל תמונה חדשה: WebP בלבד (לא PNG/JPG גולמי ב-HTML), alt בעברית שמתאר מה **רואים בפועל** בתמונה (לא רק שם השירות) — ראו skill `image-optimize-and-alt`.
- טבלת גדלים לפי קלאס (מ-CLAUDE.md): `circle-img`→420px, `circle-img-lg-wrap`→800px, `detail-hero-img`→1520px, `blog-card-img`→900px, `friend-card-photo`→760px, `hero-bg`→1920px.
- שם קובץ חדש בכל החלפה (cache-busting — יש cache שנה על `/photos/*`).

---

## 8. Do / Don't מהיר

| ✅ Do | ❌ Don't |
|---|---|
| זהב+זית קבועים; accent מתחלף רק בעמודי נחיתה | לצבוע לפי Tailwind ברירת מחדל (indigo/blue) |
| שני פונטים תמיד (sans לגוף, serif לכותרת) | אותו פונט לכותרת וגוף |
| צללים שכבתיים, tinted, opacity נמוך | `shadow-md` שטוח |
| `transform`/`opacity` בלבד באנימציה | `transition-all` |
| hover+focus-visible+active על כל קליקבילי | אלמנט קליקבילי בלי מצב אינטראקטיבי |
| gradient רדיאלי משוכב + גרעין SVG לעומק | רקע flat יחיד |
| מרווחים מהטוקנים הקיימים (סעיף 4) | Tailwind spacing אקראי |
| וואטסאפ float בכל עמוד, נגלה אחרי גלילה | לקשר את הופעתו לאלמנט ספציפי בעמוד |

---

## 9. איך להשתמש במסמך הזה בפועל

- **עמוד נחיתה חדש** → התחילו מ-`design-system/landing-page-template.html`, לא מהאפס. ראו README שם לצעדים המלאים.
- **עמוד חדש באתר הראשי** → skill `new-page-scaffold` + `partials/*.html` + `build-pages.mjs`.
- **רכיב חדש (למשל card type חדש)** → בדקו קודם אם `.ds-card`/`.ds-chip`/`.perk-item` כבר מכסים את הצורך לפני שממציאים קלאס חדש.
- מסמך זה מתאר את המצב **כפי שהוא נכון להיום** (נגזר ישירות מהקוד) — אם הקוד משתנה באופן משמעותי (למשל טוקן חדש נוסף, family שלישית נוצרת), לעדכן כאן בהתאם.
