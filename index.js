

//Setup do servidor Node.js

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const porta = 3000;

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({
    secret: 'food4allfood4u',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.static("public"));

const urlMongo = 'mongodb+srv://rm14093_db_user:IsPuhBw9KJSg5KDV@food4all.riy0qv0.mongodb.net/?retryWrites=true&w=majority&appName=Food4All';
const nomeBanco = 'F4ADB';

app.get('/registro', (req, res) => {
    res.sendFile(__dirname + '/views/registro.html');
});

app.get('/api/username', async (req, res) => {
  if (!req.session.email) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const cliente = new MongoClient(urlMongo, { useUnifiedTopology: true });

  try {
    await cliente.connect();
    const banco = cliente.db(nomeBanco);
    const colecaoUsuarios = banco.collection('usuarios');

    const usuarioExistente = await colecaoUsuarios.findOne({ email: req.session.email });

    if (usuarioExistente) {
      
      res.json({ username: usuarioExistente.nome });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (erro) {
    console.error("Erro na rota /api/username:", erro);
    res.status(500).json({ error: 'Erro ao acessar banco: ' + erro.message });
  } finally {
    try {
      await cliente.close(); // Ensure client is closed after response
    } catch (closeErro) {
      console.error("Erro ao fechar cliente Mongo:", closeErro);
    }
  }
});

app.get('/api/userinfo', async (req, res) => {
  if (!req.session.email) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const cliente = new MongoClient(urlMongo, { useUnifiedTopology: true });

  try {
    await cliente.connect();
    const banco = cliente.db(nomeBanco);
    const colecaoUsuarios = banco.collection('usuarios');

    const usuario = await colecaoUsuarios.findOne(
      { email: req.session.email },
      { projection: { prompt: 0, senha: 0, _id: 0 } }
    );

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Format with line breaks
    const info = `
Nome: ${usuario.nome || '-'}<br>
Email: ${usuario.email || '-'}<br>
Altura: ${usuario.altura || '-'} cm<br>
Peso: ${usuario.peso || '-'} kg<br>
Peso alvo: ${usuario.pesoalvo || '-'} kg<br>
Restrições alimentares: ${usuario.restricao || '-'}
    `;

    res.json({ paragraph: info.trim() });
  } catch (erro) {
    console.error("Erro na rota /api/userinfo:", erro);
    res.status(500).json({ error: 'Erro ao acessar banco: ' + erro.message });
  } finally {
    try {
      await cliente.close();
    } catch (closeErro) {
      console.error("Erro ao fechar cliente Mongo:", closeErro);
    }
  }
});


app.post('/registro', async (req, res) => {
    if(req.body.senha==req.body.confsenha){
        const cliente = new MongoClient(urlMongo, { useUnifiedTopology: true });
    try{
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const usuarioExistente = await colecaoUsuarios.findOne({ email: req.body.email });

        if (usuarioExistente){
            res.send('Usuário com este email já existe! Tente outro email ou faça login.')
        } else {
            const senhaCriptografada = await bcrypt.hash(req.body.senha, 10);
            const peso = req.body.peso;
            const altura = req.body.altura;
            const restricao = req.body.restdiet;
            const pesoalvo = req.body.pesoalvo;
            const promptIA = `
            Baseado nos dados do usuário:
            - Altura: ${altura} cm
            - Peso: ${peso} kg
            - Peso alvo: ${pesoalvo} kg
            - Restrições alimentares: ${restricao}

            Gere um plano de dieta detalhado e recomendações de estilo de vida que ajudem o usuário a alcançar seu peso alvo. Inclua tipos de dieta (exemplo: keto, low-carb, alto-proteína) e sugestões de mudanças no estilo de vida (exemplo: exercícios, horários de sono, etc.).`;
            await colecaoUsuarios.insertOne({
                email: req.body.email,
                senha: senhaCriptografada,
                nome: req.body.usuario,
                altura: altura,
                peso: peso,
                restricao: restricao,
                pesoalvo: pesoalvo,
                prompt: promptIA
            });
            res.redirect('/login');
        }
    } catch (erro) {
        res.send('Erro ao registrar o usuário.');
    } finally {
        cliente.close();
    }
    }else{
        alert('Senhas não coincidem!');
        res.redirect('/registro');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', async (req, res) => {
    const cliente = new MongoClient(urlMongo, { useUnifiedTopology: true });
    try {
        await cliente.connect();
        const banco = cliente.db(nomeBanco);
        const colecaoUsuarios = banco.collection('usuarios');

        const email = await colecaoUsuarios.findOne({ email: req.body.email });

        if(email && await bcrypt.compare(req.body.senha, email.senha)){
            req.session.email = req.body.email;
            res.redirect('/dashboard');
        }else{
            res.redirect('/erro');
        }
    }catch(erro){
        res.send('Erro ao realizar login.' + erro);
    }finally{
        cliente.close();
    }
    console.log;
});

function protegerRota(req, res, proximo){
    if (req.session.email){
        proximo();
    }else{
        res.redirect('/login');
    }
}

app.get('/dashboard', protegerRota, (req, res) => {
    res.sendFile(__dirname + '/views/dash.html');
});

app.get('/perfil',protegerRota, (req, res) => {
    res.sendFile(__dirname + '/views/perfil.html');
});

app.get('/carrinho',protegerRota, (req, res) => {
    res.sendFile(__dirname + '/views/carrinho.html');
});

app.get('/vazio',protegerRota, (req, res) => {
    res.sendFile(__dirname + '/views/carrinhovazio.html');
});

app.get('/erro', (req, res) => {
    res.sendFile(__dirname + '/views/erro.html')
});

app.get('/sair', (req, res) => {
    req.session.destroy((err) => {
        if (err){
            return res.send('Erro ao sair!');
        }
        res.redirect('/');
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/home.html');
    req.session.destroy((err) => {
        if (err){
            return res.send('Erro ao sair!');
        }
    });
});

app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});