import { ImageFX } from '@rohitaryal/imagefx-api';
import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono()
const fx = new ImageFX(process.env.COOKIE || "")

app.use(cors())
app.use(logger());

app.get("/generate", async (c) => {
    let prompt = c.req.query("prompt");
    if (!(prompt?.trim())) {
        return c.text("MISSING PROMPT", 400);
    }

    prompt = decodeURI(prompt);

    const generatedImage = await fx.generateImage(prompt);
    return c.text(generatedImage[0].encodedImage);
});

export default app
