import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiMiPjgTY0E5Lrs2ZQOqR4WVWv76ETbRo",
  authDomain: "hirafiyin.firebaseapp.com",
  databaseURL: "https://hirafiyin-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hirafiyin",
  storageBucket: "hirafiyin.firebasestorage.app",
  messagingSenderId: "484744901673",
  appId: "1:484744901673:web:8abd205006111bdfaf9838"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// عند تحميل الصفحة
window.onload = function() {
  // استرجاع الولاية من قاعدة البيانات
  const wilayaSelect = document.getElementById("wilayaSelect");
  get(ref(db, 'wilayas')).then(snapshot => {
    if (snapshot.exists()) {
      const wilayas = snapshot.val();
      for (const wilaya in wilayas) {
        const option = document.createElement("option");
        option.value = wilaya;
        option.textContent = wilayas[wilaya].name;
        wilayaSelect.appendChild(option);
      }
    }
  });

  // تفعيل الدوائر بناءً على الولاية المحددة
  wilayaSelect.addEventListener('change', function() {
    const daireSelect = document.getElementById("daireSelect");
    daireSelect.innerHTML = '<option value="">-- اختر الدائرة --</option>'; // إفراغ الخيارات السابقة
    if (wilayaSelect.value) {
      const selectedWilaya = wilayaSelect.value;
      get(ref(db, `wilayas/${selectedWilaya}/daieres`)).then(snapshot => {
        if (snapshot.exists()) {
          const daieres = snapshot.val();
          daieres.forEach(daire => {
            const option = document.createElement("option");
            option.value = daire;
            option.textContent = daire;
            daireSelect.appendChild(option);
          });
          daireSelect.disabled = false;
        } else {
          daireSelect.disabled = true;
        }
      });
    }
  });

  // تحميل التخصصات من قاعدة البيانات Firebase
  const specialtySelect = document.getElementById("specialtySelect");
  get(ref(db, 'specialties')).then(snapshot => {
    if (snapshot.exists()) {
      const specialties = snapshot.val();
      specialties.forEach(specialty => {
        const option = document.createElement("option");
        option.value = specialty;
        option.textContent = specialty;
        specialtySelect.appendChild(option);
      });
    }
  });
};

// عند إرسال النموذج
document.getElementById("searchForm").addEventListener('submit', function(e) {
  e.preventDefault();
  const wilaya = document.getElementById("wilayaSelect").value;
  const daire = document.getElementById("daireSelect").value;
  const specialty = document.getElementById("specialtySelect").value;

  if (!wilaya || !daire) {
    alert("يرجى اختيار الولاية والدائرة");
    return;
  }

  // استرجاع الحرفيين بناءً على الولاية والدائرة
  get(ref(db, `artisans/${wilaya}/${daire}`)).then(snapshot => {
    const resultsList = document.getElementById("resultsList");
    const resultsDiv = document.getElementById("results");
    resultsList.innerHTML = ''; // إفراغ النتائج السابقة

    if (snapshot.exists()) {
      snapshot.forEach(childSnapshot => {
        const artisan = childSnapshot.val();
        const artisanDiv = document.createElement("div");
        artisanDiv.classList.add("p-4", "bg-gray-100", "rounded-lg", "shadow-md");
        artisanDiv.innerHTML = `
          <h4 class="font-semibold text-lg">${artisan.name}</h4>
          <p><strong>التخصص:</strong> ${artisan.specialty}</p>
          <p><strong>رابط الصورة:</strong> <a href="${artisan.imageUrl}" target="_blank" class="text-blue-500 hover:underline">عرض الصورة</a></p>
        `;
        resultsList.appendChild(artisanDiv);
      });
      resultsDiv.classList.remove('hidden');
    } else {
      resultsList.innerHTML = '<p>لا توجد نتائج مطابقة.</p>';
      resultsDiv.classList.remove('hidden');
    }
  });
});