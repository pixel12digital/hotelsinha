<?php
/**
 * Hotel Sinhá - Script de Envio de Formulários
 * 
 * TODO: Configurar credenciais de email
 * TODO: Instalar PHPMailer via Composer
 * TODO: Configurar SMTP
 * TODO: Implementar validação de segurança
 * TODO: Adicionar logs de envio
 */

// ========================================
// CONFIGURAÇÕES
// ========================================

// Configurações de email (TODO: configurar)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'seu-email@gmail.com');
define('SMTP_PASSWORD', 'sua-senha-app');
define('SMTP_FROM_EMAIL', 'contato@hotelsinha.com.br');
define('SMTP_FROM_NAME', 'Hotel Sinhá');

// Email de destino
define('TO_EMAIL', 'contato@hotelsinha.com.br');
define('TO_NAME', 'Hotel Sinhá');

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Sanitiza dados de entrada
 */
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

/**
 * Valida email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Valida telefone (formato brasileiro)
 */
function validatePhone($phone) {
    $phone = preg_replace('/[^0-9]/', '', $phone);
    return strlen($phone) >= 10 && strlen($phone) <= 11;
}

/**
 * Gera resposta JSON
 */
function jsonResponse($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// ========================================
// VERIFICAÇÃO DE MÉTODO
// ========================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método não permitido');
}

// ========================================
// VALIDAÇÃO DE DADOS
// ========================================

$name = isset($_POST['name']) ? sanitizeInput($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
$phone = isset($_POST['phone']) ? sanitizeInput($_POST['phone']) : '';
$message = isset($_POST['message']) ? sanitizeInput($_POST['message']) : '';
$subject = isset($_POST['subject']) ? sanitizeInput($_POST['subject']) : 'Contato via Site';

// Validações obrigatórias
if (empty($name)) {
    jsonResponse(false, 'Nome é obrigatório');
}

if (empty($email)) {
    jsonResponse(false, 'Email é obrigatório');
}

if (!validateEmail($email)) {
    jsonResponse(false, 'Email inválido');
}

if (empty($message)) {
    jsonResponse(false, 'Mensagem é obrigatória');
}

// Validação opcional do telefone
if (!empty($phone) && !validatePhone($phone)) {
    jsonResponse(false, 'Telefone inválido');
}

// ========================================
// CONFIGURAÇÃO DO PHPMailer
// ========================================

// TODO: Descomentar quando PHPMailer estiver instalado
/*
require_once 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // Configurações do servidor
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USERNAME;
    $mail->Password = SMTP_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = SMTP_PORT;
    $mail->CharSet = 'UTF-8';

    // Remetente
    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    
    // Destinatário
    $mail->addAddress(TO_EMAIL, TO_NAME);
    
    // Responder para
    $mail->addReplyTo($email, $name);

    // Conteúdo
    $mail->isHTML(true);
    $mail->Subject = $subject . ' - Hotel Sinhá';
    
    // Template do email
    $emailBody = "
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2f5f3b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #2f5f3b; }
            .footer { background-color: #2f5f3b; color: white; padding: 15px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Novo Contato - Hotel Sinhá</h2>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='label'>Nome:</span> {$name}
                </div>
                <div class='field'>
                    <span class='label'>Email:</span> {$email}
                </div>
                <div class='field'>
                    <span class='label'>Telefone:</span> {$phone}
                </div>
                <div class='field'>
                    <span class='label'>Assunto:</span> {$subject}
                </div>
                <div class='field'>
                    <span class='label'>Mensagem:</span><br>
                    " . nl2br($message) . "
                </div>
            </div>
            <div class='footer'>
                <p>Este email foi enviado através do formulário de contato do site Hotel Sinhá.</p>
                <p>Data/Hora: " . date('d/m/Y H:i:s') . "</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $mail->Body = $emailBody;
    
    // Versão texto
    $mail->AltBody = "
    Novo Contato - Hotel Sinhá
    
    Nome: {$name}
    Email: {$email}
    Telefone: {$phone}
    Assunto: {$subject}
    
    Mensagem:
    {$message}
    
    Data/Hora: " . date('d/m/Y H:i:s') . "
    ";

    // Envia o email
    $mail->send();
    
    // Log de sucesso
    error_log("Email enviado com sucesso - Nome: {$name}, Email: {$email}");
    
    jsonResponse(true, 'Mensagem enviada com sucesso! Entraremos em contato em breve.');
    
} catch (Exception $e) {
    // Log de erro
    error_log("Erro ao enviar email: " . $mail->ErrorInfo);
    
    jsonResponse(false, 'Erro ao enviar mensagem. Tente novamente mais tarde.');
}
*/

// ========================================
// PLACEHOLDER (REMOVER QUANDO PHPMailer ESTIVER CONFIGURADO)
// ========================================

// Simula processamento
sleep(1);

// Log dos dados recebidos
error_log("Formulário recebido - Nome: {$name}, Email: {$email}, Telefone: {$phone}, Mensagem: {$message}");

// Resposta de sucesso (placeholder)
jsonResponse(true, 'Mensagem recebida! (PHPMailer não configurado - verifique logs)');

// ========================================
// NOTAS DE IMPLEMENTAÇÃO
// ========================================

/*
TODO: Implementar as seguintes funcionalidades:

1. INSTALAÇÃO DO PHPMailer:
   composer require phpmailer/phpmailer

2. CONFIGURAÇÃO SMTP:
   - Configurar credenciais reais
   - Testar conexão SMTP
   - Configurar autenticação

3. SEGURANÇA:
   - Implementar CAPTCHA
   - Rate limiting
   - Validação CSRF
   - Sanitização avançada

4. LOGS:
   - Log de tentativas de envio
   - Log de erros
   - Monitoramento de spam

5. VALIDAÇÕES:
   - Validação de campos específicos
   - Validação de tamanho de mensagem
   - Filtros anti-spam

6. TEMPLATES:
   - Templates de email personalizados
   - Templates de resposta automática
   - Templates para diferentes tipos de contato

7. INTEGRAÇÃO:
   - Integração com CRM
   - Notificações push
   - Webhook para sistemas externos
*/
?>
