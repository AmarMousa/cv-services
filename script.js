// رقم الواتساب بالصيغة الدولية بدون + (مثال: 201012345678)
const WHATSAPP_NUMBER = "201067103305";

const serviceSelect = document.getElementById("service");
const formatField = document.getElementById("formatField");
const cvFields = document.getElementById("cvFields");
const presFields = document.getElementById("presFields");
const researchFields = document.getElementById("researchFields");

const val = (id) => document.getElementById(id).value.trim();
const radio = (name) => document.querySelector(`input[name="${name}"]:checked`).value;

// إظهار الحقول المناسبة حسب الخدمة
function updateFields() {
  const value = serviceSelect.value;
  const isCV = value.startsWith("CV");
  formatField.hidden = !isCV;
  cvFields.hidden = !isCV;
  presFields.hidden = value !== "بريزنتيشن";
  researchFields.hidden = value !== "بحث";
}
serviceSelect.addEventListener("change", updateFields);
updateFields();

// أزرار "اطلب الآن" في الكروت تختار الخدمة في الفورم
document.querySelectorAll("[data-service]").forEach((btn) => {
  btn.addEventListener("click", () => {
    serviceSelect.value = btn.dataset.service;
    updateFields();
  });
});

// إضافة خبرة / تدريب
const entryTemplate = document.getElementById("entryTemplate");
const lists = {
  experience: document.getElementById("experienceList"),
  internship: document.getElementById("internshipList"),
};

function addEntry(type) {
  const entry = entryTemplate.content.firstElementChild.cloneNode(true);
  entry.querySelector(".entry-role").textContent = type === "experience" ? "المسمى الوظيفي" : "نوع التدريب";
  entry.querySelector(".remove-btn").addEventListener("click", () => entry.remove());
  lists[type].appendChild(entry);
}

document.querySelectorAll("[data-add]").forEach((btn) => {
  btn.addEventListener("click", () => addEntry(btn.dataset.add));
});
addEntry("experience");

// تجميع الخبرات أو التدريبات كنص
function entriesText(type) {
  return [...lists[type].querySelectorAll(".entry")]
    .map((entry) => {
      const get = (cls) => entry.querySelector(cls).value.trim();
      const head = [get(".e-role"), get(".e-company"), get(".e-period")].filter(Boolean).join(" | ");
      const desc = get(".e-desc");
      if (!head && !desc) return "";
      return `• ${head}${desc ? `\n  ${desc.replace(/\n/g, "\n  ")}` : ""}`;
    })
    .filter(Boolean)
    .join("\n");
}

function section(title, body) {
  return body ? `\n\n*${title}:*\n${body}` : "";
}

function cvMessage() {
  const line = (label, v) => (v ? `\n${label}: ${v}` : "");
  let text = "\n\n━━━ بيانات الـ CV ━━━";
  text += "\n*البيانات الشخصية:*";
  text += line("الاسم", val("cvFullName"));
  text += line("المسمى الوظيفي", val("cvJobTitle"));
  text += line("الموبايل", val("cvPhone"));
  text += line("الإيميل", val("cvEmail"));
  text += line("العنوان", val("cvAddress"));
  text += line("LinkedIn", val("cvLinkedin"));
  text += section("نبذة", val("cvSummary"));

  const edu = [
    line("المؤهل", val("cvDegree")),
    line("التخصص", val("cvMajor")),
    line("الكلية والجامعة", val("cvUniversity")),
    line("السنوات", val("cvEduYears")),
    line("التقدير", val("cvGrade")),
    line("GPA", val("cvGpa")),
  ].join("").trim();
  text += section("التعليم", edu);

  text += section("الخبرات العملية", entriesText("experience"));
  text += section("التدريبات", entriesText("internship"));
  text += section("المشاريع", val("cvProjects"));
  text += section("المهارات", val("cvSkills"));
  text += section("الكورسات والشهادات", val("cvCourses"));
  text += section("اللغات", val("cvLanguages"));
  return text;
}

function presMessage() {
  const line = (label, v) => (v ? `\n${label}: ${v}` : "");
  let text = "\n\n━━━ بيانات البريزنتيشن ━━━";
  text += line("الموضوع", val("presTopic"));
  text += line("اللغة", radio("presLang"));
  text += line("عدد الشرائح", val("presSlides"));
  text += line("هيتعرض في", val("presFor"));
  text += section("بيانات أول سلايد", val("presCover"));
  return text;
}

function researchMessage() {
  const line = (label, v) => (v ? `\n${label}: ${v}` : "");
  let text = "\n\n━━━ بيانات البحث ━━━";
  text += line("الموضوع", val("resTopic"));
  text += line("عدد الصفحات", val("pages"));
  text += line("اللغة", radio("resLang"));

  text += section("بيانات الغلاف", `الاسم: ${val("resStudent")}\nالموضوع: ${val("resTopic")}`);
  return text;
}

// التأكد من الخانات المطلوبة في القسم الظاهر
function validateSection(container) {
  let firstInvalid = null;
  container.querySelectorAll("[data-required]").forEach((input) => {
    const empty = !input.value.trim();
    input.classList.toggle("invalid", empty);
    if (empty && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    alert("من فضلك املا الخانات المطلوبة (اللي عليها *)");
    return false;
  }
  return true;
}

document.getElementById("orderForm").addEventListener("input", (e) => e.target.classList.remove("invalid"));

// إرسال الطلب على واتساب
document.getElementById("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const activeSection = [cvFields, presFields, researchFields].find((s) => !s.hidden);
  if (activeSection && !validateSection(activeSection)) return;

  const name = val("name");
  const service = serviceSelect.value;
  const details = val("details");

  let message = `السلام عليكم، أنا ${name}\nعايز أطلب خدمة: ${service}`;

  if (!formatField.hidden) {
    const formats = [...formatField.querySelectorAll("input:checked")].map((c) => c.value);
    if (formats.length) message += `\nصيغة التسليم: ${formats.join(" + ")}`;
  }
  if (activeSection === cvFields) message += cvMessage();
  if (activeSection === presFields) message += presMessage();
  if (activeSection === researchFields) message += researchMessage();
  if (details) message += `\n\n*تفاصيل إضافية:*\n${details}`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
});

// قائمة الموبايل
const navLinks = document.getElementById("navLinks");
document.getElementById("menuBtn").addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => navLinks.classList.remove("open")));

document.getElementById("year").textContent = new Date().getFullYear();
