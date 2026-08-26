module.exports = { async rewrites() { return { beforeFiles: [{ source: '/', has: [{ type: 'host', value: 'lieinventory.thecourageeconomy.net' }], destination: '/inventory.html' }] }; } };
