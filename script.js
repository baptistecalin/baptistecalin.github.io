// ===================================
// CONFIG & STATE
// ===================================
const DEFAULT_LANG = "en";
const DEFAULT_PROFILE = "software";

let currentLang = DEFAULT_LANG;
let currentProfile = DEFAULT_PROFILE;
let common = {};
let data = {};

// ===================================
// DOM REFERENCES
// ===================================
const printBtn = document.getElementById("printCV");
const downloadBtn = document.getElementById("downloadBtn");
const langToggle = document.getElementById("langToggle");
const profileToggle = document.getElementById("profileToggle");
const websiteInfo = document.getElementById("websiteInfo");

const profileTitle = document.getElementById("profileTitle");
const profileSummary = document.getElementById("profileSummary");

const skillsTitle = document.getElementById("skillsTitle");
const skillsList = document.getElementById("skillsList");

const experienceTitle = document.getElementById("experienceTitle");
const experienceList = document.getElementById("experienceList");

// ===================================
// DATA LOADING
// ===================================
async function loadAll(lang) {
  try {
    const [nResp, langResp] = await Promise.all([
      fetch("n.json"),
      fetch(`${lang}.json`),
    ]);

    if (!nResp.ok || !langResp.ok) {
      throw new Error("Failed to fetch JSON files");
    }

    common = await nResp.json();
    data = await langResp.json();

    currentLang = lang;
    document.documentElement.lang = lang;

    renderAll();
  } catch (err) {
    console.error(err);
    profileTitle.textContent = "Baptiste Calin";
    profileSummary.textContent = "";
  }
}

// ===================================
// UTILITIES
// ===================================
function unique(arr) {
  return Array.from(new Set(arr));
}

function categorizeSkills(skills, categories) {
  const categorized = {};

  skills.forEach((skillId) => {
    let placed = false;

    categories.forEach((skill) => {
      if (skillId == skill.id) {
        if (!categorized[skill.category]) categorized[skill.category] = [];
        if (!categorized[skill.category].includes(skill.name)) {
          categorized[skill.category].push(skill.name);
          placed = true;
        }
        return;
      }
    });

    if (!placed) {
      if (!categorized.Other) categorized.Other = [];
      categorized.Other.push(skillId);
    }
  });

  return categorized;
}

function getDurationFromPeriod(periodStr, data) {
  if (!periodStr) return "";

  const [startStr, endStr] = periodStr.split(" - ").map((s) => s.trim());

  const parseDate = (str) => {
    const [month, year] = str.split(" ");
    return new Date(Date.parse(`${month} 1, ${year}`));
  };

  const startDate = parseDate(startStr);
  const endDate =
    !endStr || /present|current/i.test(endStr) ? new Date() : parseDate(endStr);

  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  months += endDate.getMonth() - startDate.getMonth() + 1;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  const parts = [];
  if (years > 0) parts.push(`${years} ${years > 1 ? data.yrs : data.yr}`);
  if (remainingMonths > 0) {
    parts.push(
      `${remainingMonths} ${remainingMonths > 1 ? data.mos : data.mo}`
    );
  }

  return parts.join(" ");
}

function getProfileSkills(profileData) {
  const acc = [];
  if (Array.isArray(profileData.experience)) {
    profileData.experience.forEach((exp) => {
      if (Array.isArray(exp.skills)) acc.push(...exp.skills);
    });
  }
  return unique(acc);
}

// ===================================
// RENDER HELPERS
// ===================================
function renderList(label, titleID, listID, itemList) {
  const titleObj = document.getElementById(titleID);
  const listObj = document.getElementById(listID);

  titleObj.textContent = label;
  listObj.innerHTML = "";

  if (!Array.isArray(itemList)) return;

  itemList.forEach((item) => {
    const li = document.createElement("li");
    li.className = "ms-3";
    li.textContent = item.name;
    listObj.appendChild(li);
  });
}

function renderSkills(skills, categories, container) {
  const categorized = categorizeSkills(skills, categories);

  Object.entries(categorized).forEach(([cat, skills]) => {
    const row = document.createElement("div");
    row.className = "d-flex align-items-start mb-2";

    // Category column
    const colCategory = document.createElement("div");
    colCategory.className = "me-3 fw-bold";
    colCategory.style.minWidth = "140px";
    colCategory.textContent = cat;
    row.appendChild(colCategory);

    // Skills column
    const colSkills = document.createElement("div");
    colSkills.className = "d-flex flex-wrap gap-2";
    skills.forEach((s) => {
      const span = document.createElement("span");
      span.className = "btn btn-sm btn-outline-secondary disabled";
      span.textContent = s;
      colSkills.appendChild(span);
    });
    row.appendChild(colSkills);

    container.appendChild(row);
  });
}

function renderExperience(experiences, categories) {
  experienceList.innerHTML = "";

  if (!Array.isArray(experiences)) return;

  experiences.forEach((exp) => {
    const card = document.createElement("div");
    card.className = "card mb-3";

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = exp.role;

    const duration =
      currentLang === "en"
        ? ` (${getDurationFromPeriod(exp.period, data)})`
        : "";

    const subTitle = document.createElement("small");
    subTitle.className = "text-muted d-block mb-2";
    subTitle.textContent = `${exp.company} | ${exp.period} | ${exp.location} ${duration}`;

    const desc = document.createElement("p");
    desc.textContent = exp.description || "";

    body.appendChild(title);
    body.appendChild(subTitle);
    body.appendChild(desc);

    if (Array.isArray(exp.skills) && exp.skills.length) {
      const strong = document.createElement("strong");
      strong.textContent = (data.skillsLabelForExperience || "Skills") + ":";
      body.appendChild(strong);

      const ul = document.createElement("ul");
      ul.className = "mt-2";

      const categorized = categorizeSkills(exp.skills, categories);
      Object.entries(categorized).forEach(([cat, skills]) => {
        const li = document.createElement("li");

        const label = document.createElement("strong");
        label.textContent = `${cat}: `;
        li.appendChild(label);

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

// ===================================
// RENDER ALL
// ===================================
function renderAll() {
  // Navbar
  langToggle.textContent = currentLang === "en" ? "FR" : "EN";
  profileToggle.textContent =
    currentProfile === "quality" ? "Software" : "Quality";

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
    data.skills.softSkills
  );

  // Skills
  skillsTitle.textContent = data.skillsTitle || "Skills";
  skillsList.innerHTML = "";

  const profileSkills = getProfileSkills(prof);
  if (profileSkills.length) {
    renderSkills(profileSkills, data.skills.skillsSummary || {}, skillsList);
  }

  // Experience
  experienceTitle.textContent = data.experienceTitle || "Work Experience";
  renderExperience(prof.experience, data.skills.skillsSummary || {});

  // Education & Communication
  renderList(
    data.educationTitle || "Education & Certifications",
    "educationTitle",
    "educationList",
    data.education
  );
  renderList(
    data.communicationTitle || "Communication Skills",
    "communicationTitle",
    "communicationList",
    data.communication
  );
}

// ===================================
// EVENT LISTENERS
// ===================================
langToggle.addEventListener("click", () => {
  const nextLang = currentLang === "en" ? "fr" : "en";
  loadAll(nextLang);
});

profileToggle.addEventListener("click", () => {
  currentProfile = currentProfile === "quality" ? "software" : "quality";
  renderAll();
});

printBtn.addEventListener("click", () => window.print());

downloadBtn.addEventListener("click", () => {
  const fileName = `cv-${currentProfile}-${currentLang}.pdf`;
  const link = document.createElement("a");
  link.href = `assets/cv/${fileName}`;
  link.download = fileName;
  link.click();
});

websiteInfo.addEventListener("click", (e) => {
  alert(data.alreadyThere);
  e.preventDefault();
  return;
});

// ===================================
// INIT
// ===================================
loadAll(DEFAULT_LANG);
