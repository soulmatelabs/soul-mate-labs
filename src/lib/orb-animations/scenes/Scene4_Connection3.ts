import { Container, Application } from 'pixi.js';
import type { SceneController } from '../core/SceneController';
import { Orb } from '../core/Orb';
import { OrbCluster } from '../core/OrbCluster';
import { RippleEffect } from '../core/RippleEffect';
import { globalOrbState } from '../core/GlobalOrbState';
import gsap from 'gsap';

export class Scene4_Connection3 implements SceneController {
    private container: Container;
    private cluster: OrbCluster;
    private rippleEffect: RippleEffect;
    private app: Application | null = null;
    private rippleTimeout: ReturnType<typeof setTimeout> | null = null;
    private isExited: boolean = false;

    constructor() {
        this.container = new Container();
        this.cluster = new OrbCluster();
        this.rippleEffect = new RippleEffect();
        this.container.addChild(this.rippleEffect.container);
        this.container.addChild(this.cluster.container);
    }

    public enter(app: Application) {
        this.isExited = false;
        this.app = app;
        this.container.visible = true;
        this.app.stage.addChild(this.container);
        
        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;
        const targetY = centerY - 100;

        this.cluster.clear();

        // 1. Recover state (3 orbs)
        const mainOrb = new Orb(15, 0x60A5FA, 5);
        const orb2 = new Orb(15, 0xA855F7, 2);
        const orb3 = new Orb(15, 0xEC4899, 2);
        
        // Approx positions from previous scene (Row)
        mainOrb.setPosition(centerX, targetY);
        orb2.setPosition(centerX - 100, targetY);
        orb3.setPosition(centerX + 100, targetY);
        
        this.cluster.addOrb(mainOrb);
        this.cluster.addOrb(orb2);
        this.cluster.addOrb(orb3);

        // 2. Ripple
        const tl = gsap.timeline();
        tl.call(() => {
            if (this.isExited) return;
            this.rippleEffect.emit(mainOrb.container.x, mainOrb.container.y, 0x60A5FA);
            // Delay second ripple slightly
            this.rippleTimeout = setTimeout(() => {
                 if (!this.isExited) {
                    this.rippleEffect.emit(mainOrb.container.x, mainOrb.container.y, 0x60A5FA);
                 }
            }, 300);
        }, [], 0);

        // 3. Attract 3 new orbs
        const newOrbs = [
            new Orb(15, 0x10B981, 2), // Emerald
            new Orb(15, 0xF59E0B, 2), // Amber
            new Orb(15, 0xF97316, 2)  // Orange
        ];
        
        // Spawn them outside the viewport
        newOrbs[0].setPosition(centerX - centerX, targetY - centerY); 
        newOrbs[1].setPosition(centerX, targetY + 1.5 * centerY); 
        newOrbs[2].setPosition(centerX + centerX, targetY - centerY); 
        
        newOrbs.forEach(orb => this.cluster.addOrb(orb));

        tl.to({}, { duration: 1.8 }); // Wait for ripple

        tl.call(() => {
            if (this.isExited) return;
            // Organize all 5 surrounding orbs into an inverted pentagon for perfect symmetry
            // Mapping targets to minimize crossing based on spawn/start positions:
            // 0: Bottom, 1: Bottom-Left, 2: Top-Left, 3: Top-Right, 4: Bottom-Right
            const surroundingOrbs = [
                newOrbs[1], // 0: Bottom (Comes from Bottom)
                orb2,       // 1: Bottom-Left (Comes from Left)
                newOrbs[0], // 2: Top-Left (Comes from Top-Left)
                newOrbs[2], // 3: Top-Right (Comes from Top-Right)
                orb3        // 4: Bottom-Right (Comes from Right)
            ];

            surroundingOrbs.forEach((orb, i) => {
                const angle = (Math.PI * 2 * i) / 5 + Math.PI / 2; // Start at Bottom
                const tx = centerX + Math.cos(angle) * 100;
                const ty = targetY + Math.sin(angle) * 100;
                // Use moveTo with power3.out to ensure they "stop on time" without overshoot collision on desktop
                orb.moveTo(tx, ty, 2.0, 'power3.out');
            });
        });
        
        // 4. Rearrange all 6 into Circle
        tl.to({}, { duration: 1.5 }); // Increased slightly to let pentagon settle
        tl.call(() => {
            if (!this.isExited) this.cluster.arrangeInCircle(centerX, targetY, 50, 1.5);
        });

        // 5. Beaming Sequence ("Conversation")
        tl.to({}, { duration: 1.5 }); // Wait for circle arrangement to settle
        
        tl.call(() => { if (!this.isExited) this.cluster.orbs[0].shine(0.7, 15); }, [], "+=0.1");
        tl.call(() => { if (!this.isExited) this.cluster.orbs[2].shine(0.5, 12); }, [], "+=0.4");
        tl.call(() => { if (!this.isExited) this.cluster.orbs[4].shine(0.5, 12); }, [], "+=0.3");
        tl.call(() => { if (!this.isExited) this.cluster.orbs[1].shine(0.6, 15); }, [], "+=0.5");
        tl.call(() => { if (!this.isExited) this.cluster.orbs[3].shine(0.5, 12); }, [], "+=0.2");
        tl.call(() => { if (!this.isExited) this.cluster.orbs[5].shine(0.5, 12); }, [], "+=0.4");
        tl.call(() => { if (!this.isExited) this.cluster.orbs[0].shine(0.8, 18); }, [], "+=0.6");
    }

    public update(_delta: number) {}

    public exit() {
        this.isExited = true;
        if (this.rippleTimeout) {
            clearTimeout(this.rippleTimeout);
            this.rippleTimeout = null;
        }
        this.cluster.orbs.forEach(orb => gsap.killTweensOf(orb));
        if(this.cluster.orbs.length > 0) {
             globalOrbState.updateStateFromOrb(this.cluster.orbs[0]);
        }
        this.container.visible = false;
        if(this.app) this.app.stage.removeChild(this.container);
    }
}
