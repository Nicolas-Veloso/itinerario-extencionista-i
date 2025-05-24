// Configuration
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwVcnN2nt46SWauIOAAk6caHOaMdQw30OqMbVSxzMFxctpMfVXWFu02gto3J84RidKoHA/exec";

// DOM Elements
const modal = document.getElementById("feedback-modal");
const npsScale = document.querySelector(".nps-scale");
const followupSection = document.getElementById("followup-section");
const followupQuestion = document.getElementById("followup-question");
const feedbackText = document.getElementById("feedback-text");

// State
let selectedScore = null;

// Initialize NPS scale buttons
function initNPSScale() {
  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement("button");
    btn.className = "nps-btn";
    btn.textContent = i;
    btn.onclick = () => selectScore(i);
    npsScale.appendChild(btn);
  }
}

// Select NPS score
function selectScore(score) {
  selectedScore = score;
  
  // Update UI
  document.querySelectorAll(".nps-btn").forEach(btn => {
    btn.classList.remove("selected");
    if (parseInt(btn.textContent) === score) {
      btn.classList.add("selected");
    }
  });
  
  // Show follow-up question
  followupSection.classList.remove("hidden");
  followupQuestion.textContent = score <= 6 
    ? "O que podemos fazer para melhorar sua experiência?" 
    : "O que você mais gostou em nossa plataforma?";
}

// Show modal
function showFeedback() {
  modal.style.display = "block";
  document.querySelector(".feedback-trigger").style.display = "none";
  resetForm();
}

// Close modal
function closeFeedback() {
  modal.style.display = "none";
  document.querySelector(".feedback-trigger").style.display = "block";
}

// Reset form
function resetForm() {
  selectedScore = null;
  feedbackText.value = "";
  followupSection.classList.add("hidden");
  document.querySelectorAll(".nps-btn").forEach(btn => {
    btn.classList.remove("selected");
  });
}

// Submit feedback to Google Sheets
async function submitFeedback() {
  if (selectedScore === null) {
    alert("Por favor selecione uma nota");
    return;
  }

  const feedback = feedbackText.value.trim();
  const submitBtn = document.querySelector('#followup-section button');
  const originalBtnText = submitBtn.textContent;

  // Mostra estado de carregamento
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    // Mostra a mensagem de agradecimento IMEDIATAMENTE
    showThankYouMessage();
    
    // Envia os dados para o Google Sheets (em segundo plano)
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: selectedScore,
        feedback: feedback,
        pageUrl: window.location.href
      }),
      mode: 'no-cors'
    });

  } catch (error) {
    console.error("Erro:", error);
    // Mesmo com erro, mantemos a mensagem positiva
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
}

function showThankYouMessage() {
  const modalContent = document.querySelector('.modal-content');
  
  // Cria a mensagem de sucesso
  modalContent.innerHTML = `
    <div class="thank-you-message">
      <span class="close-btn" onclick="closeFeedback()">&times;</span>
      <h2 style="color:#4CAF50; font-size: 3rem;">✓</h2>
      <h3>Obrigado pelo seu feedback!</h3>
      <p>Sua opinião é muito importante para nós.</p>
      <button onclick="closeFeedback()" style="margin-top: 20px; padding: 10px 20px;">Fechar</button>
    </div>
  `;
  
  // Animação de entrada
  const message = document.querySelector('.thank-you-message');
  message.style.animation = 'fadeIn 0.5s ease-out';
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initNPSScale();
  
  // Optional: Show feedback button after 30 seconds
  setTimeout(() => {
    document.querySelector(".feedback-trigger").style.display = "block";
  }, 30000);
});
// No seu script.js, adicione:
function handleTouch(event) {
  event.preventDefault(); // Evita comportamentos padrão do touch
  const touch = event.changedTouches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (element && element.classList.contains('nps-btn')) {
    element.click();
  }
}

// Adicione este evento no seu initNPSScale():
function initNPSScale() {
  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement("button");
    btn.className = "nps-btn";
    btn.textContent = i;
    btn.onclick = () => selectScore(i);
    btn.addEventListener('touchstart', handleTouch, {passive: false});
    npsScale.appendChild(btn);
  }
}