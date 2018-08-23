const huiqinzi = {
  name: 'huiqinzi-srv',
  script: 'build/www.js',
  watch: false,
  cwd: "/opt/workspace/huiqinzi-srv"
}

module.exports = {
  apps: [
    huiqinzi
  ],
  max_restarts: 1000000
};
