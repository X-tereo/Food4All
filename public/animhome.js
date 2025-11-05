const leftImg = document.querySelector('.imagem-esquerda');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }else {
  entry.target.classList.remove('show');
}
    });
  }, { threshold: 0.3 });
  observer.observe(leftImg);

  const rightImg = document.querySelector('.imagem-direita img');
  const rotationSpeed = 0.3;

  window.addEventListener('scroll', () => {
    const rotation = window.scrollY * rotationSpeed;
    rightImg.style.transform = `rotate(${rotation}deg)`;
  });