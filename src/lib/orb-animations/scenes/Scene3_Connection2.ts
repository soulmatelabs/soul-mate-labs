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
    private isExited: boolean = false;

    constructor() {
        this.container = new Container();
        this.cluster = new OrbCluster();
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
        
        // Add Main Orb
        const mainOrb = new Orb(15, 0x60A5FA, 5);
        if (globalOrbState.position) {
            mainOrb.setPosition(globalOrbState.position.x, globalOrbState.position.y);
        } else {
            mainOrb.setPosition(centerX, targetY);
        }
        this.cluster.addOrb(mainOrb);

        // Add 2 new Orbs
        const orb2 = new Orb(15, 0xA855F7, 2); // Purple
        const orb3 = new Orb(15, 0xEC4899, 2); // Pink
        
        orb2.setPosition(centerX - centerX, targetY); // Start off: centerX - 100, target Y + 200
        orb3.setPosition(centerX + centerX, targetY); // centerX + 100, targetY + 200

        this.cluster.addOrb(orb2);
        this.cluster.addOrb(orb3);

        // Arrange in Row
        const tl = gsap.timeline();
        
        tl.to(mainOrb.container, { x: centerX, y: targetY, duration: 1 });
        tl.to(orb2.container, { x: centerX - 100, y: targetY, duration: 1 }, "<");
        tl.to(orb3.container, { x: centerX + 100, y: targetY, duration: 1 }, "<");

        // Shine Sequence
        tl.call(() => { if (!this.isExited) mainOrb.shine(0.5, 10); }, [], "+=0.2");
        tl.call(() => { if (!this.isExited) orb2.shine(0.5, 10); }, [], "+=0.2");
        tl.call(() => { if (!this.isExited) orb3.shine(0.5, 10); }, [], "+=0.2");

        // Add a shorter "conversation" sequence inspired by Scene 4
        tl.call(() => { if (!this.isExited) orb2.shine(0.4, 12); }, [], "+=0.4"); // Orb 2 shines back
        tl.call(() => { if (!this.isExited) mainOrb.shine(0.6, 15); }, [], "+=0.3"); // Main orb responds
        tl.call(() => { if (!this.isExited) orb3.shine(0.4, 12); }, [], "+=0.4"); // Orb 3 joins in
    }

    public update(_delta: number) {}

    public exit() {
        this.isExited = true;
        this.cluster.orbs.forEach(orb => gsap.killTweensOf(orb));
        if (this.cluster.orbs.length > 0) {
            globalOrbState.updateStateFromOrb(this.cluster.orbs[0]);
        }
        this.container.visible = false;
        if(this.app) this.app.stage.removeChild(this.container);
    }
}
