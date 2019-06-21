module.exports = {
  apps : [{
    name   : "multiserver",
    script : "./server.js",
    instances  : 6,
    exec_mode  : "cluster",
    max_memory_restart : "550M"
  }]
}
