module.exports = {
    apps: [
        {
            name: 'kkn-mh',
            script: 'node_modules/.bin/next',
            args: 'start -p 9121',
            cwd: '/DATA/AppData/projek/KKN',
            env: {
                NODE_ENV: 'production',
                PORT: 9121,
                JWT_SECRET: 'kkn-secret-key-2026-mh-001',
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
        },
    ],
};
