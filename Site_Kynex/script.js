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

  // Newsletter
  const newsletter = document.getElementById('newsletter');
  if (newsletter) {
    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletter.querySelector('input[type="email"]').value;
      
      // Simular envio (em produção, enviar para servidor)
      console.log('Email registado:', email);
      
      // Feedback ao utilizador
      const btn = newsletter.querySelector('button');
      const originalText = btn.textContent;
      btn.textContent = '✓ Registado!';
      btn.disabled = true;
      
      // Limpar após 2 segundos
      setTimeout(() => {
        newsletter.reset();
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2000);
    });
  }
})();
