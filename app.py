from flask import Flask, request, render_template, redirect, url_for, flash
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

app = Flask(__name__)
app.secret_key = 'sua-chave-secreta'  # necessário para usar flash messages

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        nome = request.form.get('nome')
        email_contato = request.form.get('email')
        numero = request.form.get('numero')  # Alterado de 'mensagem' para 'numero'
        arquivo = request.files.get('arquivo')
        
        # Configurações do e-mail
        sender_email = "reunedigitalmarketing@gmail.com"      # substitua pelo seu email
        sender_password = "zvtsbnjxxlrlzpuc"                   # substitua pela sua senha ou app password
        receiver_email = "reunedigitalmarketing@gmail.com"     # email para onde enviar o formulário
        
        # Monta a mensagem de e-mail
        subject = f"Novo contato de {nome}"
        body = f"Nome: {nome}\nEmail: {email_contato}\nNúmero: {numero}"  # Atualizado para incluir o número
        
        mensagem_email = MIMEMultipart()
        mensagem_email['From'] = sender_email
        mensagem_email['To'] = receiver_email
        mensagem_email['Subject'] = subject
        mensagem_email.attach(MIMEText(body, 'plain'))
        
        # Se um arquivo foi enviado, anexa-o ao email
        if arquivo:
            filename = arquivo.filename
            attachment = arquivo.read()
            parte = MIMEBase('application', 'octet-stream')
            parte.set_payload(attachment)
            encoders.encode_base64(parte)
            parte.add_header('Content-Disposition', f"attachment; filename={filename}")
            mensagem_email.attach(parte)
        
        # Envia o email usando o servidor SMTP do Gmail
        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, receiver_email, mensagem_email.as_string())
            flash("Mensagem enviada com sucesso!")
        except Exception as e:
            flash("Erro ao enviar a mensagem: " + str(e))
        
        return redirect(url_for('index'))
    
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
