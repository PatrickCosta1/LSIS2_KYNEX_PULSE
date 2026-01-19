(() => {
  // App Mode Toggle - Updated for toggle-btn
  const modeBtns = document.querySelectorAll('.toggle-btn');
  const modeDisplays = document.querySelectorAll('.mode-display');
  
  if (modeBtns.length > 0) {
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        
        // Remover active de todos os botões
        modeBtns.forEach(b => b.classList.remove('active'));
        // Adicionar active ao botão clicado
        btn.classList.add('active');
        
        // Remover active de todos os displays
        modeDisplays.forEach(display => display.classList.remove('active'));
        // Adicionar active ao display correspondente
        document.querySelector(`.mode-display[data-mode="${mode}"]`).classList.add('active');
        
        // Guardar preferência
        localStorage.setItem('app-mode', mode);
      });
    });
    
    // Carregar modo guardado
    const savedMode = localStorage.getItem('app-mode') || 'day';
    document.querySelector(`.toggle-btn[data-mode="${savedMode}"]`).click();
  }

  // Blur Overlay Toggle - Single overlay that disappears permanently
  const blurOverlay = document.querySelector('.mockup-blur-overlay');
  const eyeButton = document.querySelector('.blur-eye-btn');
  const toggleSwitch = document.querySelector('.toggle-switch');
  
  if (eyeButton && blurOverlay) {
    eyeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      blurOverlay.classList.add('hidden');
      
      // Show toggle switch after blur is removed
      if (toggleSwitch) {
        toggleSwitch.classList.add('visible');
      }
    });
  }

  // Newsletter Netlify Forms com popup de sucesso (funciona em ambas as páginas)
  const newsletterForm = document.querySelector('form[name="newsletter"]');
  const successPopup = document.getElementById('success-popup');
  const closePopup = document.getElementById('close-success-popup');
  if (newsletterForm && successPopup) {
    newsletterForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const formData = new FormData(newsletterForm);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
      .then(() => {
        newsletterForm.reset();
        successPopup.style.display = 'flex';
      })
      .catch(() => {
        alert('Erro ao registar o email.');
      });
    });
  }
  if (closePopup && successPopup) {
    closePopup.addEventListener('click', () => {
      successPopup.style.display = 'none';
    });
  }
})();
