import { Container, Application } from 'pixi.js';
import type { SceneController } from '../core/SceneController';
import { Orb } from '../core/Orb';
import { OrbCluster } from '../core/OrbCluster';
import { globalOrbState } from '../core/GlobalOrbState';
import gsap from 'gsap';

export class Scene5_Connection4 implements SceneController {
    private container: Container;
    private cluster: OrbCluster;
    private app: Application | null = null;

    constructor() {
        this.container = new Container();
        this.cluster = new OrbCluster();
        this.container.addChild(this.cluster.container);
    }

    public enter(app: Application) {
        this.app = app;
        this.container.visible = true;
        this.app.stage.addChild(this.container);
        
        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;

        this.cluster.clear();
        
        // Recreate state: 2 center orbs, 4 surrounding
        const mainOrb = new Orb(15, 0x60A5FA, 5);
        const orb2 = new Orb(15, 0xA855F7, 5);
        
        mainOrb.setPosition(centerX - 30, centerY);
        orb2.setPosition(centerX + 30, centerY);
        
        this.cluster.addOrb(mainOrb);
        this.cluster.addOrb(orb2);

        const others: Orb[] = [];
        for(let i=0; i<4; i++) {
             const o = new Orb(15, 0xFFFFFF, 2); // Colors varied usually
             const angle = (Math.PI * 2 * i) / 4;
             const tx = centerX + Math.cos(angle) * 220;
             const ty = centerY + Math.sin(angle) * 220;
             o.setPosition(tx, ty);
             others.push(o);
             this.cluster.addOrb(o);
        }

        const tl = gsap.timeline();
        
        // Move closer
        tl.to(mainOrb.container, { x: centerX - 15, duration: 2, ease: 'power2.inOut' });
        tl.to(orb2.container, { x: centerX + 15, duration: 2, ease: 'power2.inOut' }, "<");

        // Brightness Increase
        tl.call(() => {
            mainOrb.glowIntensity = 30;
            orb2.glowIntensity = 30;
        }, [], "<+=1");

        // Fade others
        tl.call(() => {
            others.forEach(o => o.fade(0.2, 1));
        }, [], "<");
    }

    public update(delta: number) {}

    public exit() {
        this.container.visible = false;
        if(this.app) this.app.stage.removeChild(this.container);
    }
}
