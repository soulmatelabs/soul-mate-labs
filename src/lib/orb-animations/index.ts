import { Application } from 'pixi.js';
import { ScrollOrchestrator } from './orchestrator/ScrollOrchestrator';

let PIXI_INITIALIZED = false;

export async function initOrbAnimations(canvasId: string) {
    if (PIXI_INITIALIZED) return;
    
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
        console.error("[PIXI] Canvas element not found:", canvasId);
        return;
    }

    try {
        const app = new Application();
        await app.init({
            canvas: canvas,
            width: window.innerWidth,
            height: window.innerHeight,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundAlpha: 0, // Transparent background
            resizeTo: window
        });

        console.log("[PIXI] Application initialized successfully", {
            width: app.screen.width,
            height: app.screen.height,
            renderer: app.renderer.type
        });

        new ScrollOrchestrator(app);
        PIXI_INITIALIZED = true;
    } catch (error) {
        console.error("[PIXI] Initialization failed:", error);
    }
}
