module.exports = {
  apps: [{
    name: 'leo-prime-firewall',
    // Use npm start to be resilient to where binaries are installed.
    // Next.js will automatically use the PORT environment variable
    script: 'npm',
    args: 'start',
    cwd: '/var/www/leo-prime-firewall/nextjs_space',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};