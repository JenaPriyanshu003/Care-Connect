import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { PassThrough } from 'stream';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, voice = 'en-US-JennyNeural' } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

        // Use rawToFile to get audio buffer
        const stream = tts.toStream(text);

        // Pipe the stream and collect data
        const passThrough = new PassThrough();
        const chunks = [];

        return new Promise((resolve, reject) => {
            stream.pipe(passThrough);

            passThrough.on('data', (chunk) => {
                chunks.push(chunk);
            });

            passThrough.on('end', () => {
                const audioBuffer = Buffer.concat(chunks);
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Content-Length', audioBuffer.length);
                res.send(audioBuffer);
                resolve();
            });

            passThrough.on('error', (err) => {
                console.error('Stream Error:', err);
                res.status(500).json({ error: 'TTS stream failed' });
                reject(err);
            });
        });

    } catch (error) {
        console.error('Edge TTS Error:', error);
        res.status(500).json({ error: 'TTS generation failed', details: error.message });
    }
}
