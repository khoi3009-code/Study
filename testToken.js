const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODBmNTFjZmI4NzgzODdmMDBlODI0MCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUzMzI2MzQ2LCJleHAiOjE3NTM0MTI3NDZ9.qrj9HkxCsvRlIRSmryPiTa47ligPCTonfvDAgsjrtJo';
const secret = '123';

jwt.verify(token, secret, (err, decoded) => {
  if (err) {
    console.log("❌ Token KHÔNG hợp lệ:", err.message);
  } else {
    console.log("✅ Token HỢP LỆ:", decoded);
  }
});
