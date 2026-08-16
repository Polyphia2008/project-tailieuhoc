module.exports = {
  apps: [
    {
      name: 'mapdocs',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        NODE_OPTIONS: '--max-old-space-size=768'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_restarts: 10,
      autorestart: true
    }
  ]
}
