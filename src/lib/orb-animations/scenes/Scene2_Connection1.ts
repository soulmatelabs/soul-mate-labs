import { Container, Sprite, Assets, Application } from 'pixi.js';
import type { SceneController } from '../core/SceneController';
import { Orb } from '../core/Orb';
import { globalOrbState } from '../core/GlobalOrbState';
import gsap from 'gsap';

export class Scene2_Connection1 implements SceneController {
    private container: Container;
    private mainOrb: Orb | null = null;
    private app: Application | null = null;

    constructor() {
        this.container = new Container();
    }

    public async enter(app: Application) {
        this.app = app;
        this.container.visible = true;
        this.app.stage.addChild(this.container);

        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;

        if (globalOrbState.mainOrb) {
             this.mainOrb = new Orb(
                 globalOrbState.mainOrb.radius, 
                 globalOrbState.mainOrb.color, 
                 globalOrbState.mainOrb.glowIntensity
             );
             // Start from wherever the previous scene left it (in global coords)
             // Ideally we tween from that position to the new one
             this.mainOrb.setPosition(globalOrbState.position.x, globalOrbState.position.y);
        } else {
             this.mainOrb = new Orb(15, 0x60A5FA, 5);
             this.mainOrb.setPosition(centerX, -50);
        }
        
        this.container.addChild(this.mainOrb.container);

        // Animate to position
        this.mainOrb.moveTo(centerX, centerY - 50, 1.5, 'power2.out');
        this.mainOrb.pulse();

        // Hands would go here
        
        // Increase glow
        gsap.to(this.mainOrb, {
            glowIntensity: 20,
            duration: 3,
            delay: 1
        });
    }

    public update(delta: number) {
    }

    public exit() {
        if (this.mainOrb) {
            globalOrbState.updateStateFromOrb(this.mainOrb);
        }
        this.container.visible = false;
        if(this.app) this.app.stage.removeChild(this.container);
    }
}
