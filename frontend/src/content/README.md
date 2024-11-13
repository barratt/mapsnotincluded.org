## Contribution Guide

We welcome contributions to help translate the website into different languages! Whether you're a developer or someone interested in contributing translations, here’s how you can help:

---

### For Developers:

1. Copy the file "en.json" in the /locales/ folder and rename it to your target language code (e.g., `zh` for Chinese, `de` for German, `ko` for Korean) You can refer to the BCP 47 standard for valid language and locale codes.
2. Translate each of the entries.
3. Add the language code to the "locales" array in @/i18n.js and update the imports
4. After adding or updating a translation, make sure to test your changes by running the website locally to verify that the translations display correctly.
5. Once you’ve made your changes, submit a pull request for review.

---

### For Non-Developers:

If you're not a developer but would still like to contribute translations, you can leave the translated content as a comment on [this issue](https://github.com/barratt/mapsnotincluded.org/issues/30). One of the contributors will incorporate your translations into the project. You can try to match the structure of the contents in `/frontend/src/content/en` folder so that it is easier for developers to add in the translation.

---

Thank you for helping us make the website accessible to a broader audience!
