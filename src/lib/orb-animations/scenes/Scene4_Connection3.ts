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

    constructor() {
        this.container = new Container();
        this.cluster = new OrbCluster();
        this.rippleEffect = new RippleEffect();
        this.container.addChild(this.rippleEffect.container);
        this.container.addChild(this.cluster.container);
    }

    public enter(app: Application) {
        this.app = app;
        this.container.visible = true;
        this.app.stage.addChild(this.container);
        
        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;

        this.cluster.clear();

        // 1. Recover state (3 orbs)
        const mainOrb = new Orb(15, 0x60A5FA, 5);
        const orb2 = new Orb(15, 0xA855F7, 2);
        const orb3 = new Orb(15, 0xEC4899, 2);
        
        // Approx positions from previous scene (Row)
        mainOrb.setPosition(centerX, centerY);
        orb2.setPosition(centerX - 100, centerY);
        orb3.setPosition(centerX + 100, centerY);
        
        this.cluster.addOrb(mainOrb);
        this.cluster.addOrb(orb2);
        this.cluster.addOrb(orb3);

        // 2. Ripple
        const tl = gsap.timeline();
        tl.call(() => {
            this.rippleEffect.emit(mainOrb.container.x, mainOrb.container.y, 0x60A5FA);
            // Delay second ripple slightly
            setTimeout(() => {
                 this.rippleEffect.emit(mainOrb.container.x, mainOrb.container.y, 0x60A5FA);
            }, 300);
        }, [], 0);

        // 3. Attract 3 new orbs
        const newOrbs = [
            new Orb(15, 0xF472B6, 2),
            new Orb(15, 0xC084FC, 2),
            new Orb(15, 0x818CF8, 2)
        ];
        
        // Spawn them outside
        newOrbs[0].setPosition(centerX - 300, centerY - 200);
        newOrbs[1].setPosition(centerX, centerY + 300);
        newOrbs[2].setPosition(centerX + 300, centerY - 200);
        
        newOrbs.forEach(orb => this.cluster.addOrb(orb));

        tl.to({}, { duration: 1 }); // Wait for ripple

        tl.call(() => {
            newOrbs.forEach(orb => orb.attractTo({x: centerX, y: centerY}, 1.5));
        });
        
        // 4. Rearrange all 6 into Circle
        tl.to({}, { duration: 1 });
        tl.call(() => {
            this.cluster.arrangeInCircle(centerX, centerY, 150, 1.5);
        });

        // 5. Two orbs pulse in sync
        tl.call(() => {
            mainOrb.pulse();
            orb2.pulse();
        }, [], "+=1.5");

        // 6. Move center pair (Main + Orb2) to center
        tl.call(() => {
            mainOrb.stopOrbit();
            orb2.stopOrbit();
            mainOrb.moveTo(centerX - 30, centerY, 1);
            orb2.moveTo(centerX + 30, centerY, 1);
            
            // Others surround
            const others = this.cluster.orbs.filter(o => o !== mainOrb && o !== orb2);
            others.forEach((o, i) => {
                const angle = (Math.PI * 2 * i) / 4;
                const tx = centerX + Math.cos(angle) * 220;
                const ty = centerY + Math.sin(angle) * 220;
                o.moveTo(tx, ty, 1);
            });
        }, [], "+=1");
    }

    public update(delta: number) {}

    public exit() {
        if(this.cluster.orbs.length > 0) {
             globalOrbState.updateStateFromOrb(this.cluster.orbs[0]);
        }
        this.container.visible = false;
        if(this.app) this.app.stage.removeChild(this.container);
    }
}
