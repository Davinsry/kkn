module.exports = {
    apps: [
        {
            name: 'kkn-mh',
            script: 'node_modules/.bin/next',
            args: 'start -p 91210',
            cwd: '/DATA/AppData/projek/KKN',
            env: {
                NODE_ENV: 'production',
                PORT: 91210,
                JWT_SECRET: 'kkn-secret-key-2026-mh-001',
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
        },
    ],
};
