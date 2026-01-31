import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

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

        const readable = tts.toStream(text);

        // Collect audio chunks
        const chunks = [];

        await new Promise((resolve, reject) => {
            readable.on('data', (chunk) => {
                // The stream emits objects with 'audio' property
                if (chunk.audio) {
                    chunks.push(chunk.audio);
                } else if (Buffer.isBuffer(chunk)) {
                    chunks.push(chunk);
                }
            });
            readable.on('end', resolve);
            readable.on('error', reject);
        });

        const audioBuffer = Buffer.concat(chunks);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.length);
        res.send(audioBuffer);

    } catch (error) {
        console.error('Edge TTS Error:', error);
        res.status(500).json({ error: 'TTS generation failed', details: error.message });
    }
}
