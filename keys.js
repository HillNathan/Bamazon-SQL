exports.mysql = 
    { password: process.env.ROOT_PASSWORD };

exports.supervisor = 
    { password: process.env.ADMIN_PASSWORD,
      username: process.env.ADMIN_USERNAME };