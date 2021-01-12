module.exports = {
  apps : [{
    name: 'theguild',
    script: 'server.js',
    watch: false,
    time: true, 
    exp_backoff_restart_delay: 100,
    restart_delay: 60000
  }],
};
