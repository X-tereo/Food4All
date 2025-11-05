fetch('/api/userinfo')
  .then(res => {
    if (!res.ok) throw new Error('Erro na requisição: ' + res.status);
    return res.json();
  })
  .then(data => {
    // Insert as HTML so <br> tags are interpreted
    document.getElementById('userinfo').innerHTML = data.paragraph;
  })
  .catch(err => {
    document.getElementById('userinfo').textContent = 'Erro: ' + err.message;
  });