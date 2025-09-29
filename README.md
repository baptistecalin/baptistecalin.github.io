# Interactive Multilingual CV - Baptiste Calin

This project is an **interactive online CV**, multilingual (EN / FR), with dynamic display of skills, experiences, education, communication, and soft skills. It is designed to be **printable** and responsive.

---

## Features

- **Multilingual**: switch between English and French via a button.
- **Multiple profiles**: Quality / Software, each with its own title and summary.
- **Soft skills**: simple list display.
- **Skills**:
  - Global skills list grouped by **category** with disabled Bootstrap badges.
  - Soft skills displayed as disabled badges.
  - Profile-specific skills displayed as disabled badges.
- **Experiences**:
  - Displays role, company, period, and description.
  - Skills used are grouped by category.
  - Automatic calculation of experience duration (in months and years).
- **Education**: simple list display.
- **Communication**: simple list display.
- **Print-friendly**:
  - Disabled badges appear in black.
  - Text size automatically adjusts for print.
- **Custom header**:
  - Profile photo.
  - Contact info: email, phone, LinkedIn, location.
  - Background image.
- **Favicon** and logo displayed in the navbar.

---

## Project Structure

```
/project-root
│
├─ index.html # Main CV page
├─ style.css  # Custom styles + print styles
├─ script.js  # JS logic for multilingual support and dynamic rendering
├─ fr.json    # French content
├─ en.json    # English content
├─ n.json     # Shared content (section titles, labels)
└─ images/
  └─ ...
```

---

## Usage

1. Open `index.html` in a modern browser.
2. Use the **EN / FR** button to switch languages.
3. Use the **Quality Expert / Software Engineer** button to switch profiles.

---

## Dependencies

- Bootstrap

---

## Author

- Baptiste Calin

---

## License

- Personal project – non-commercial use.
