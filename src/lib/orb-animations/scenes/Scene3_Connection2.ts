import { Container, Application } from 'pixi.js';
import type { SceneController } from '../core/SceneController';
import { Orb } from '../core/Orb';
import { OrbCluster } from '../core/OrbCluster';
import { globalOrbState } from '../core/GlobalOrbState';
import gsap from 'gsap';

export class Scene3_Connection2 implements SceneController {
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
        
        // Add Main Orb
        const mainOrb = new Orb(15, 0x60A5FA, 5);
        if (globalOrbState.position) {
            mainOrb.setPosition(globalOrbState.position.x, globalOrbState.position.y);
        } else {
            mainOrb.setPosition(centerX, centerY);
        }
        this.cluster.addOrb(mainOrb);

        // Add 2 new Orbs
        const orb2 = new Orb(15, 0xA855F7, 2); // Purple
        const orb3 = new Orb(15, 0xEC4899, 2); // Pink
        
        orb2.setPosition(centerX - 100, centerY + 200); // Start off
        orb3.setPosition(centerX + 100, centerY + 200);

        this.cluster.addOrb(orb2);
        this.cluster.addOrb(orb3);

        // Arrange in Row
        const tl = gsap.timeline();
        
        tl.to(mainOrb.container, { x: centerX, y: centerY, duration: 1 });
        tl.to(orb2.container, { x: centerX - 100, y: centerY, duration: 1 }, "<");
        tl.to(orb3.container, { x: centerX + 100, y: centerY, duration: 1 }, "<");

        // Shine Sequence
        tl.call(() => mainOrb.shine(0.5, 10), [], "+=0.2");
        tl.call(() => orb2.shine(0.5, 10), [], "+=0.2");
        tl.call(() => orb3.shine(0.5, 10), [], "+=0.2");
    }

    public update(delta: number) {}

    public exit() {
        if (this.cluster.orbs.length > 0) {
            globalOrbState.updateStateFromOrb(this.cluster.orbs[0]);
        }
        this.container.visible = false;
        if(this.app) this.app.stage.removeChild(this.container);
    }
}
