const authService = require('./src/services/authService');

async function testAuthFlow() {
  console.log('🧪 Starting Auth Service Integration Test...\n');

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPass = 'Password123!';
  const testPhone = '09' + Math.floor(10000000 + Math.random() * 9000000);

  try {
    // 1. Test Register Init (Send OTP)
    console.log('1️⃣ Testing Register Init...');
    const initRes = await authService.registerInit({
      full_name: 'Nguyễn Văn Test',
      email: testEmail,
      phone: testPhone,
      password: testPass,
    });
    console.log('✅ Register Init Result:', initRes.message);

    // 2. Retrieve OTP code directly from email_verifications DB for testing
    const db = require('./src/config/db');
    const [rows] = await db.query('SELECT otp_code FROM email_verifications WHERE email = ? ORDER BY id DESC LIMIT 1', [testEmail]);
    const otpCode = rows[0].otp_code;
    console.log(`🔑 Retrieved test OTP Code: ${otpCode}`);

    // 3. Test Verify Registration OTP
    console.log('\n2️⃣ Testing Verify Registration OTP...');
    const verifyRes = await authService.verifyRegistrationOtp({
      email: testEmail,
      otp_code: otpCode,
    });
    console.log('✅ Verify OTP Success! User ID:', verifyRes.user.id);
    console.log('Token received:', verifyRes.token ? 'YES' : 'NO');

    // 4. Test Login
    console.log('\n3️⃣ Testing Login with Email & Password...');
    const loginRes = await authService.login(testEmail, testPass);
    console.log('✅ Login Success! Logged in as:', loginRes.user.full_name);
    console.log('Access Token:', loginRes.token ? 'YES' : 'NO');
    console.log('Refresh Token:', loginRes.refreshToken ? 'YES' : 'NO');

    // 5. Test Refresh Token
    console.log('\n4️⃣ Testing Refresh Token...');
    const refreshRes = await authService.refreshToken(loginRes.refreshToken);
    console.log('✅ Refresh Token Success! New Access Token:', refreshRes.accessToken ? 'YES' : 'NO');

    // 6. Test Google Auth
    console.log('\n5️⃣ Testing Google Auth...');
    const googleId = 'google_id_' + Date.now();
    const googleEmail = `google_user_${Date.now()}@gmail.com`;
    const googleRes = await authService.googleAuth({
      google_id: googleId,
      email: googleEmail,
      full_name: 'Khách Hàng Google Test',
      avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
    });
    console.log('✅ Google Auth Success! User ID:', googleRes.user.id, 'Email:', googleRes.user.email);

    // 7. Test Forgot Password & Reset Password
    console.log('\n6️⃣ Testing Forgot Password OTP...');
    const forgotRes = await authService.forgotPassword(testEmail);
    console.log('✅ Forgot Password Msg:', forgotRes.message);

    const [resetRows] = await db.query('SELECT otp_code FROM password_resets WHERE email = ? ORDER BY id DESC LIMIT 1', [testEmail]);
    const resetOtp = resetRows[0].otp_code;
    console.log(`🔑 Retrieved Reset OTP Code: ${resetOtp}`);

    const newPass = 'NewPassword456!';
    const resetRes = await authService.resetPassword({
      email: testEmail,
      otp_code: resetOtp,
      new_password: newPass,
    });
    console.log('✅ Reset Password Result:', resetRes.message);

    // Verify login with new password
    const newLoginRes = await authService.login(testEmail, newPass);
    console.log('✅ Login with NEW password Success!');

    console.log('\n🎉 ALL AUTH INTEGRATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test Failed:', error.message, error);
    process.exit(1);
  }
}

testAuthFlow();
