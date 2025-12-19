import { ImageFX } from '@rohitaryal/imagefx-api';
import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

interface Binding {
    COOKIE: string;
}

const app = new Hono<{ Bindings: Binding }>();

app.use(cors())
app.use(logger());

app.get("/generate", async (c) => {
    const fx = new ImageFX(c.env.COOKIE);

    let prompt = c.req.query("prompt");
    if (!(prompt?.trim())) {
        return c.text("MISSING PROMPT", 400);
    }

    prompt = decodeURI(prompt);

    const generatedImage = await fx.generateImage(prompt);
    return c.text(generatedImage[0].encodedImage);
});

export default app
