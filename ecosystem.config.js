module.exports = {
  apps: [{
    name: 'hospital-review-api',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env_file: '.env',
    watch: false,
    max_memory_restart: '400M',
    restart_delay: 3000,
    log_file: '/home/ubuntu/logs/app.log',
    error_file: '/home/ubuntu/logs/error.log',
  }]
}
