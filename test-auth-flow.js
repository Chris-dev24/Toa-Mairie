const http = require('http');

// Simulate frontend authentication flow
async function testAuthFlow() {
  console.log('=== Testing Frontend Authentication Flow ===\n');

  try {
    // Step 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@mairie.mg',
      password: 'Admin@123'
    });

    if (!loginResponse.success) {
      console.error('❌ Login failed:', loginResponse.message);
      return;
    }

    console.log('✅ Login successful');
    console.log('   Token received:', loginResponse.token.substring(0, 50) + '...');
    console.log('   User:', loginResponse.user.email, `(${loginResponse.user.role})`);

    const token = loginResponse.token;

    // Step 2: Test token verification
    console.log('\n2. Testing Token Verification...');
    const verifyResponse = await makeRequest('GET', '/api/auth/verify', null, token);

    if (!verifyResponse.success) {
      console.error('❌ Token verification failed:', verifyResponse.message);
      return;
    }

    console.log('✅ Token verification successful');
    console.log('   Verified user:', verifyResponse.user.email);

    // Step 3: Test dashboard access based on role
    console.log('\n3. Testing Dashboard Access...');
    const role = loginResponse.user.role;
    const dashboardPath = getDashboardPath(role);

    console.log(`   User role: ${role}`);
    console.log(`   Dashboard path: ${dashboardPath}`);

    if (dashboardPath) {
      const dashboardResponse = await makeRequest('GET', dashboardPath, null, token);
      if (dashboardResponse.success) {
        console.log(`✅ Dashboard access successful for ${role}`);
      } else {
        console.warn(`⚠️  Dashboard returned error: ${dashboardResponse.message}`);
      }
    } else {
      console.warn(`⚠️  No dashboard endpoint for role: ${role}`);
    }

    // Step 4: Test field agent dashboard
    console.log('\n4. Testing Field Agent Dashboard...');
    const fieldAgentPath = '/api/dashboard/field-agent';
    const fieldAgentResponse = await makeRequest('GET', fieldAgentPath, null, token);

    if (fieldAgentResponse.success) {
      console.log(`✅ Field agent dashboard accessible (data present: ${!!fieldAgentResponse.data})`);
    } else {
      console.error(`❌ Field agent dashboard error: ${fieldAgentResponse.message}`);
    }

    console.log('\n=== ALL TESTS COMPLETED ===');

  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

function getDashboardPath(role) {
  const paths = {
    'ADMIN': '/api/dashboard/admin',
    'DIRECTOR': '/api/dashboard/director',
    'SERVICE_HEAD': '/api/dashboard/service-head',
    'FIELD_AGENT': '/api/dashboard/field-agent',
    'COMMUNICATION': '/api/dashboard/communication'
  };
  return paths[role];
}

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

testAuthFlow();
