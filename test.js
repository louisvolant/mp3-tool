const { Mp3Encoder } = require('lamejs');
const encoder = new Mp3Encoder(1, 44100, 128);
console.log('Encoder created:', encoder);