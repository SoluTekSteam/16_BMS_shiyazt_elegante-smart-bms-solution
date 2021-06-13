module.exports = {
  apps : [{
    name: 'mqtt-transport-handler',
    cmd: 'mqttTransportHandler.py',
    interpreter: '/home/ubuntu/dev/elegante-smart-bms-solution/env/bin/python'
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
