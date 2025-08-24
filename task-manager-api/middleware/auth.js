
// function auth(req, res, next) {
//   const authHeader = req.headers['authorization'];

  
//   if (!authHeader) {
//     return res.status(401).json({ error: 'Unauthorized: No token provided' });
//   }

  
//   const token = authHeader.split(' ')[1]; 
//   if (token !== 'secret123') {
//     return res.status(401).json({ error: 'Unauthorized: Invalid token' });
//   }

  
//   req.user = { id: 1, name: 'Abdallah' };

//   next();
// }

// module.exports = auth;
