## Contribution Guide
We welcome contributions to help translate the website into different languages! Whether you're a developer or someone interested in contributing translations, here’s how you can help:

---

### For Developers:
1. Folder Structure:
- Navigate to the content folder, where all localization files are stored.
- Create a new folder named after the language code you want to translate (e.g., `zh` for Chinese, `de` for German, `ko` for Korean). You can refer to the BCP 47 standard for valid language and locale codes.
2. Follow the Existing Structure:
- Use the `en` folder (which contains the English translations) as a reference. Make sure your new folder follows the same structure and file names as the `en` folder to ensure consistency across translations.
3. Translation Files:
- Each page or component of the site will have its own javascript file associated within the content folder (e.g., home.js, navbar.js).
- Translate the content in each of these files into the appropriate language, ensuring the structure remains the same (keys must not be altered).
- Make sure you modify `index.js` file to include your translation.
4. Testing:
- After adding or updating a translation, make sure to test your changes by running the website locally to verify that the translations display correctly.
5. Submitting:
- Once you’ve made your changes, submit a pull request for review.

---

### For Non-Developers:
If you're not a developer but would still like to contribute translations, you can leave the translated content as a comment on [this issue](https://github.com/barratt/mapsnotincluded.org/issues/30). One of the contributors will incorporate your translations into the project. You can try to match the structure of the contents in `/frontend/src/content/en` folder so that it is easier for developers to add in the translation.

---

Thank you for helping us make the website accessible to a broader audience!
