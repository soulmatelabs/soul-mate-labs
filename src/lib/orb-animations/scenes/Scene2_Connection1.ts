import { Container, Application, Assets, Sprite, Color, ColorMatrixFilter } from 'pixi.js';
import type { SceneController } from '../core/SceneController';
import { Orb } from '../core/Orb';
import { globalOrbState } from '../core/GlobalOrbState';
import gsap from 'gsap';

// Path to the SVG asset
import handsOutline from '../../../assets/hands-outline.svg';

export class Scene2_Connection1 implements SceneController {
    private container: Container;
    private mainOrb: Orb | null = null;
    private app: Application | null = null;
    private handsSprite: Sprite | null = null;
    private animationTimeline: gsap.core.Timeline | null = null;
    private isExited: boolean = false;

    constructor() {
        this.container = new Container();
    }

    public async enter(app: Application) {
        this.isExited = false;
        this.app = app;
        this.container.visible = true;
        this.app.stage.addChild(this.container);

        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;
        const targetY = centerY - 100;

        // 1. Initialize Orb
        if (globalOrbState.mainOrb && !globalOrbState.mainOrb.destroyed) {
            // An orb was passed from the previous scene, let's reuse it.
            this.mainOrb = globalOrbState.mainOrb;
            // Clear the global reference to prevent accidental reuse.
            globalOrbState.mainOrb = null;
            // Kill any previous tweens on this reused orb
            gsap.killTweensOf(this.mainOrb);
        } else {
            // Fallback: create a new orb if none was passed.
            this.mainOrb = new Orb(
                globalOrbState.radius || 15, 
                0x4B5563, // Neutral Gray
                0.3       // Dim
            );
        }

        // Reset properties to Scene 2's initial state
        this.mainOrb.color = 0x4B5563;
        this.mainOrb.glowIntensity = 0.3;
        this.mainOrb.radius = 15; // Match transition target size
        this.mainOrb.setPosition(centerX, targetY);
        this.mainOrb.pulse();
        
        // Add the orb immediately to prevent flashing while assets load
        this.container.addChild(this.mainOrb.container);

        // 2. Load Hands Sprite
        try {
            const texture = await Assets.load(handsOutline.src);
            
            // Safety: If scene exited while loading, stop here
            if (this.isExited || !this.app) return;

            this.handsSprite = new Sprite(texture);
            this.handsSprite.anchor.set(0.5);
            
            // Scaled to 80% of viewport height
            const targetScale = (app.screen.height * 0.8) / 864;
            this.handsSprite.scale.set(targetScale);
            
            // Start state: Center of viewport, invisible
            this.handsSprite.alpha = 0;
            // "start at center ... move up by around 20%"
            const endY = (app.screen.height * 0.5) - (app.screen.height * 0.2);
            this.handsSprite.position.set(centerX + 5, endY);
            
            // Use a color matrix to convert black SVG to a specific gray color.
            // This is because sprite.tint does not work when filters are applied.
            const filter = new ColorMatrixFilter();
            const r = 0x3A / 255;
            const g = 0x3A / 255;
            const b = 0x3A / 255;
            filter.matrix = [
                0, 0, 0, 0, r,
                0, 0, 0, 0, g,
                0, 0, 0, 0, b,
                0, 0, 0, 1, 0
            ];
            this.handsSprite.filters = [filter];
            
            // Add hands underneath the orb.
            this.container.addChildAt(this.handsSprite, 0);

            // 3. Define Animation State Proxy
            const animState = {
                color: "#4B5563",
                glow: 0.3,
                handY: endY,
                handAlpha: 0
            };

            const sectionEl = document.getElementById('connection-01');
            const handsDelay = sectionEl?.dataset.animationDelay ? 
                parseFloat(sectionEl.dataset.animationDelay) / 1000 : 0.5;
            const handsDuration = sectionEl?.dataset.handsDuration ? 
                parseFloat(sectionEl.dataset.handsDuration) / 1000 : 4.0;

            this.animationTimeline = gsap.timeline({ 
                delay: handsDelay,
                onUpdate: () => {
                    if (this.mainOrb && !this.mainOrb.destroyed && this.app && !this.isExited) { 
                        this.mainOrb.color = new Color(animState.color).toNumber();
                        this.mainOrb.glowIntensity = animState.glow;
                        
                        if (this.handsSprite) {
                            this.handsSprite.y = animState.handY;
                            this.handsSprite.alpha = animState.handAlpha;
                        }
                    }
                }
            });

            // Phase 1: Alpha goes from 0 to 0.70 while orb is still gray
            this.animationTimeline.to(animState, {
                handAlpha: 0.50,
                duration: handsDuration,
                ease: "power2.out" 
            });

            // Phase 2: Orb transition to color (and alpha keeps increasing to 1.0)
            this.animationTimeline.to(animState, {
                color: "#60A5FA", 
                glow: 15,         
                handAlpha: 1.0, 
                duration: 2.5,
                ease: "power1.inOut" 
            });

            // Post-arrival breathing glow
            this.animationTimeline.to(animState, {
                glow: 25,
                duration: 2,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });

        } catch (error) {
            console.error("[PIXI] Failed to load hands SVG:", error);
        }
    }

    public update(delta: number) {
    }

    public exit() {
        this.isExited = true;
        if (this.animationTimeline) {
            this.animationTimeline.kill();
            this.animationTimeline = null;
        }

        if (this.mainOrb) {
            gsap.killTweensOf(this.mainOrb);
            if (!this.mainOrb.destroyed) {
                globalOrbState.updateStateFromOrb(this.mainOrb);
                globalOrbState.mainOrb = this.mainOrb;
            } else {
                this.mainOrb = null;
                globalOrbState.mainOrb = null;
            }
        }
        
        this.container.visible = false;
        if(this.app) this.app.stage.removeChild(this.container);
        this.app = null; 
        
        if (this.handsSprite) {
            this.handsSprite.destroy();
            this.handsSprite = null;
        }
    }
}
