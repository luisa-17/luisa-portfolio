LUISA GONZALES — PORTFOLIO WEBSITE
===================================

How to use
----------
1. Open index.html in any modern browser.
2. Static hosting supports the portfolio and local search. The optional Node server can also serve the portfolio.
   Do not upload server files or .env to a static public directory.
3. The included resume is in assets/docs/Luisa_Gonzales_Resume.pdf.
   Website content and this download match the supplied
   "Luisa Gwyneth Gonzales - Resume.pdf" (updated September 2026).

Customization
-------------
- Main theme colors are at the top of assets/css/style.css.
- Edit portfolio text directly in index.html.
- When updating your resume, replace the PDF and review the overview,
  experience, education, scholarship, projects, skills, leadership,
  volunteering, training, and contact sections in index.html.
- Portrait and logo files are in assets/images/.
- The frontend uses HTML, CSS, and JavaScript; an optional local server uses Node.js.
- Google Fonts are loaded from fonts.googleapis.com; if you need fully offline
  fonts, replace them with system fonts in style.css.

Notes
-----
Lui: offline portfolio guide
-----------------------------
Open index.html directly, or run npm.cmd start for an optional local server.
Lui uses local text matching and conversational templates. No chatbot API,
key, billing, or network request is used. Messages disappear on page refresh.
Say "tell me more" to see further matches for the most recent topic.
Lui is an automated guide, not a person or a generative AI model.
The .env files are no longer used; keep any old keys private.

Adding certificate and volunteering pictures
-------------------------------------------
1. Put certificate images in assets/images/certificates/ and event photos
   in assets/images/volunteering/ (JPG, PNG, or WebP).
2. In index.html, search for CERTIFICATE: or PHOTO:.
3. Replace the image src="assets/images/photo-placeholder.svg" beneath
   that comment with your image path. Each comment suggests a filename.
4. Update alt to describe your certificate or event photo, then save and refresh.
   Certificates show the whole image; event photos crop to fill their frame.

This is an original portfolio implementation inspired by the structure and
interaction patterns of modern dark Bootstrap portfolio templates. It does not
include or redistribute BootstrapMade's proprietary source files or assets.
