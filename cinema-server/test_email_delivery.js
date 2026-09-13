const emailService = require('./src/services/emailService');

async function testEmailDelivery() {
  console.log('🧪 Bắt đầu kiểm thử gửi Email thực tế qua Gmail SMTP...');
  const testEmail = 'phamduyvo1303@gmail.com';
  const testOtp = '888999';

  console.log(`📧 Sending test OTP to ${testEmail}...`);
  const result = await emailService.sendRegistrationOtpEmail(testEmail, testOtp);
  console.log('📊 Result:', result);
  process.exit(0);
}

testEmailDelivery();
