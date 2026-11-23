# CV / Résumé

Place your CV PDF in this directory, e.g.:

```
cv/Amr_Mostafa_CV.pdf
```

Then update `data.js` so the site links to it:

```js
cv: {
  file: "cv/Amr_Mostafa_CV.pdf",
  label: { en: "Download CV", ar: "تحميل السيرة الذاتية" }
}
```

The download button on the site reads `data.cv.file` to generate the link. Keep the filename lowercase and hyphenated for clean URLs.
