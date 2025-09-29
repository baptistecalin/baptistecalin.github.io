// script.js
// Default state
let currentLang = "en"; // default language
let currentProfile = "software"; // 'quality' or 'software'
let common = {};
let data = {}; // language specific

// DOM refs
const printBtn = document.getElementById("printCV");
const downloadBtn = document.getElementById("downloadBtn");
const langToggle = document.getElementById("langToggle");
const profileToggle = document.getElementById("profileToggle");
const profileTitle = document.getElementById("profileTitle");
const profileSummary = document.getElementById("profileSummary");

const skillsTitle = document.getElementById("skillsTitle");
const skillsList = document.getElementById("skillsList");

const experienceTitle = document.getElementById("experienceTitle");
const experienceList = document.getElementById("experienceList");

// Load common + lang JSON
loadAll = async (lang) => {
  try {
    const [nResp, langResp] = await Promise.all([
      fetch("n.json"),
      fetch(`${lang}.json`),
    ]);
    if (!nResp.ok || !langResp.ok)
      throw new Error("Failed to fetch JSON files");
    common = await nResp.json();
    data = await langResp.json();
    currentLang = lang;
    document.documentElement.lang = lang;
    renderAll();
  } catch (err) {
    console.error(err);
    // minimal fallback text
    profileTitle.textContent = "Baptiste Calin";
    profileSummary.textContent = "";
  }
};

// Utility: unique array
unique = (arr) => {
  return Array.from(new Set(arr));
};

renderList = (label, titleID, listID, itemList) => {
  //DOM refs
  const titleObj = document.getElementById(titleID);
  const listObj = document.getElementById(listID);
  //label
  titleObj.textContent = label;
  //html
  listObj.innerHTML = "";
  if (Array.isArray(itemList)) {
    itemList.forEach((item) => {
      const li = document.createElement("li");
      li.className = "ms-3";
      li.textContent = item;
      listObj.appendChild(li);
    });
  }
};

getDurationFromPeriod = (periodStr, data) => {
  if (!periodStr) return "";

  const [startStr, endStr] = periodStr.split(" - ").map((s) => s.trim());

  const parseDate = (str) => {
    const [month, year] = str.split(" ");
    return new Date(Date.parse(month + " 1, " + year));
  };

  const startDate = parseDate(startStr);
  let endDate;

  if (!endStr || /present|current/i.test(endStr)) {
    endDate = new Date();
  } else {
    endDate = parseDate(endStr);
  }

  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  months += endDate.getMonth() - startDate.getMonth() + 1;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let result = [];
  if (years > 0)
    result.push(years + (years > 1 ? " " + data.yrs : " " + data.yr));
  if (remainingMonths > 0)
    result.push(
      remainingMonths + (remainingMonths > 1 ? " " + data.mos : " " + data.mo)
    );

  return result.join(" ");
};

// Collect profile skills: prefer profile.skills, else union of experience.skills
getProfileSkills = (profileData) => {
  if (Array.isArray(profileData.skills) && profileData.skills.length) {
    return profileData.skills;
  }
  const acc = [];
  if (Array.isArray(profileData.experience)) {
    profileData.experience.forEach((exp) => {
      if (Array.isArray(exp.skills)) acc.push(...exp.skills);
    });
  }
  return unique(acc);
};

// Render all visible parts
renderAll = () => {
  // General
  langToggle.textContent = currentLang === "en" ? "FR" : "EN";
  profileToggle.textContent =
    currentProfile === "quality" ? "Software" : "Quality";

  // Navbar
  if (data.navbar) {
    profileToggle.textContent =
      currentProfile === "quality"
        ? data.navbar.softwareProfile
        : data.navbar.qualityProfile || profileToggle.textContent;
    printBtn.textContent = data.navbar.print || printBtn.textContent;
    downloadBtn.textContent = data.navbar.download || downloadBtn.textContent;
  }

  // Header
  const prof = data[currentProfile] || { title: "", summary: "" };
  profileTitle.textContent = prof.title || "";
  profileSummary.innerHTML = prof.summary || "";

  // Soft skills
  renderList(
    data.softSkillsTitle || "Soft Skills",
    "softSkillsTitle",
    "softSkillsList",
    data.softSkills
  );

  // Profile-level skills
  skillsTitle.textContent = data.skillsTitle || "Skills";
  skillsList.innerHTML = "";
  const profileSkills = getProfileSkills(prof);

  if (profileSkills && profileSkills.length) {
    const categories = data.skillsSummary || {};
    const categorized = {};

    // Filter by categories
    profileSkills.forEach((skill) => {
      let found = false;
      for (const [cat, skills] of Object.entries(categories)) {
        if (skills.includes(skill)) {
          if (!categorized[cat]) categorized[cat] = [];
          categorized[cat].push(skill);
          found = true;
          break;
        }
      }
      if (!found) {
        if (!categorized.Other) categorized.Other = [];
        categorized.Other.push(skill);
      }
    });

    // Show by categories
    Object.entries(categorized).forEach(([cat, skills]) => {
      const row = document.createElement("div");
      row.className = "d-flex align-items-start mb-2";

      // Col 1 : category
      const colCategory = document.createElement("div");
      colCategory.className = "me-3 fw-bold";
      colCategory.style.minWidth = "140px";
      colCategory.textContent = cat;
      row.appendChild(colCategory);

      // Col 2 : skills
      const colSkills = document.createElement("div");
      colSkills.className = "d-flex flex-wrap gap-2";
      skills.forEach((s) => {
        const span = document.createElement("span");
        span.className = "btn btn-sm btn-outline-secondary disabled";
        span.textContent = s;
        colSkills.appendChild(span);
      });
      row.appendChild(colSkills);

      skillsList.appendChild(row);
    });
  }

  // Experiences (with per-experience skills grouped by category)
  experienceTitle.textContent = data.experienceTitle || "Work Experience";
  experienceList.innerHTML = "";
  if (Array.isArray(prof.experience)) {
    prof.experience.forEach((exp) => {
      const card = document.createElement("div");
      card.className = "card mb-3";
      const body = document.createElement("div");
      body.className = "card-body";

      const title = document.createElement("h5");
      title.className = "card-title";
      title.textContent = exp.role;

      const time =
        currentLang === "en"
          ? "(" + getDurationFromPeriod(exp.period, data) + ")"
          : "";

      const subTitle = document.createElement("small");
      subTitle.className = "text-muted d-block mb-2";
      subTitle.textContent =
        `${exp.company} | ${exp.period} | ${exp.location} ${time}` || "";

      const desc = document.createElement("p");
      desc.textContent = exp.description || "";

      body.appendChild(title);
      body.appendChild(subTitle);
      body.appendChild(desc);

      // Skills used in this experience (grouped by category)
      if (Array.isArray(exp.skills) && exp.skills.length) {
        const strong = document.createElement("strong");
        strong.textContent = (data.skillsLabelForExperience || "Skills") + ":";
        body.appendChild(strong);

        const categories = data.skillsSummary || {};
        const categorized = {};

        exp.skills.forEach((skill) => {
          let found = false;
          for (const [cat, skills] of Object.entries(categories)) {
            if (skills.includes(skill)) {
              if (!categorized[cat]) categorized[cat] = [];
              categorized[cat].push(skill);
              found = true;
              break;
            }
          }
          if (!found) {
            if (!categorized.Other) categorized.Other = [];
            categorized.Other.push(skill);
          }
        });

        // Show by categories
        const ul = document.createElement("ul");
        ul.className = "mt-2";

        Object.entries(categorized).forEach(([cat, skills]) => {
          const li = document.createElement("li");

          // Col 1 : Category
          const label = document.createElement("strong");
          label.textContent = `${cat}: `;
          li.appendChild(label);

          // Col 2: Skills
          skills.forEach((s) => {
            const span = document.createElement("span");
            span.className =
              "btn btn-sm btn-outline-secondary disabled ms-1 mb-1";
            span.textContent = s;
            li.appendChild(span);
          });

          ul.appendChild(li);
        });

        body.appendChild(ul);
      }

      card.appendChild(body);
      experienceList.appendChild(card);
    });
  }

  // Educations
  renderList(
    data.educationTitle || "Education & Certifications",
    "educationTitle",
    "educationList",
    data.education
  );

  // Communications
  renderList(
    data.communicationTitle || "Communication Skills",
    "communicationTitle",
    "communicationList",
    data.communication
  );
};

// Event listeners
langToggle.addEventListener("click", () => {
  const next = currentLang === "en" ? "fr" : "en";
  loadAll(next);
});

profileToggle.addEventListener("click", () => {
  currentProfile = currentProfile === "quality" ? "software" : "quality";
  renderAll();
});

printBtn.addEventListener("click", function () {
  window.print();
});

downloadBtn.addEventListener("click", function () {
  const fileName = `cv-${currentProfile}-${currentLang}.pdf`;

  const link = document.createElement("a");
  link.href = `assets/cv/${fileName}`; // dossier où tu stockes tes CV
  link.download = fileName;
  link.click();
});

// init
loadAll(currentLang);
