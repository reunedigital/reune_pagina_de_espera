const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

// Configuração para interpretar o body das requisições
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração de sessão para usar flash messages
app.use(session({
  secret: 'sua-chave-secreta',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

// Define a pasta de views (pode ser EJS ou outro template engine)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos, se necessário (ex.: CSS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Multer para armazenamento em memória (útil para anexos)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rota GET para renderizar a página (index.ejs, por exemplo)
app.get('/', (req, res) => {
  res.render('index', { message: req.flash('message') });
});

// Rota POST para processar o formulário
app.post('/', upload.single('arquivo'), async (req, res) => {
  try {
    const { nome, email, numero } = req.body; // obtém os campos do formulário
    // req.file conterá o arquivo enviado (se existir)

    // Configuração do transportador SMTP para o Gmail
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // utiliza SSL
      auth: {
        user: 'reunedigitalmarketing@gmail.com', // substitua pelo seu email
        pass: 'zvtsbnjxxlrlzpuc'               // substitua pela sua senha ou app password
      }
    });

    // Monta as opções do email
    let mailOptions = {
      from: 'reunedigitalmarketing@gmail.com',  // remetente
      to: 'reunedigitalmarketing@gmail.com',      // destinatário
      subject: `Novo contato de ${nome}`,
      text: `Nome: ${nome}\nEmail: ${email}\nNúmero: ${numero}`
    };

    // Se houver um arquivo enviado, anexa-o ao email
    if (req.file) {
      mailOptions.attachments = [{
        filename: req.file.originalname,
        content: req.file.buffer
      }];
    }

    // Envia o email
    await transporter.sendMail(mailOptions);
    req.flash('message', 'Mensagem enviada com sucesso!');
  } catch (err) {
    console.error(err);
    req.flash('message', 'Erro ao enviar a mensagem: ' + err.message);
  }
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
