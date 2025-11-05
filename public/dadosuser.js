 fetch('/api/username')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro na requisição: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        if (data.username) {
          document.getElementById('welcome').textContent = `Olá, ${data.username} o que deseja comprar hoje?`;
        } else {
          document.getElementById('welcome').textContent = 'Erro ao resgatar dados do usuário.';
        }
      })
      .catch(err => {
        document.getElementById('welcome').textContent = 'Erro: ' + err.message;
      });