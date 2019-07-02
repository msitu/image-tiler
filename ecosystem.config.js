module.exports = {
  apps : [{
    name: 'multiserver',
    cwd: 'server/',
    script: 'index.js',
    instances: 6,
    exec_mode: 'cluster',
    max_memory_restart: '550M',
    watch: ['server'],
    watch_delay: 1000
  }]
}
