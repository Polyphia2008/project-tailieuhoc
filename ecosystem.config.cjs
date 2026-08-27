module.exports = {
  apps: [
    {
      name: 'mapdocs',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=768',
        NITRO_PORT: '3000',
        HOST: '0.0.0.0'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_restarts: 10,
      min_uptime: 10000,
      restart_delay: 3000,
      autorestart: true,
      kill_timeout: 5000,
      out_file: '/home/user/webapp/logs/out.log',
      error_file: '/home/user/webapp/logs/err.log',
      merge_logs: true
    }
  ]
}
