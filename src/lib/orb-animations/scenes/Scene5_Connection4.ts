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
        const targetY = centerY - 100;

        this.cluster.clear();
        
        // 1. Initial State: 6 orbs in Circle (Radius 50) matching end of Scene 4
        const colors = [0x60A5FA, 0xA855F7, 0xEC4899, 0xF472B6, 0xC084FC, 0x818CF8];
        const orbs: Orb[] = [];
        for (let i = 0; i < 6; i++) {
            const orb = new Orb(15, colors[i], i < 2 ? 5 : 2);
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2; // Offset to start at top
            orb.setPosition(centerX + Math.cos(angle) * 50, targetY + Math.sin(angle) * 50);
            this.cluster.addOrb(orb);
            orbs.push(orb);
        }

        const mainOrb = orbs[0];
        const orb2 = orbs[1];
        const others = orbs.slice(2);

        const tl = gsap.timeline();
        
        // 2. Pulse (Moved from Scene 4)
        tl.call(() => {
            mainOrb.pulse();
            orb2.pulse();
        }, [], "+=0.5");

        // 3. Move center pair and expand others (Moved from Scene 4)
        tl.call(() => {
            mainOrb.moveTo(centerX - 30, targetY, 1.5);
            orb2.moveTo(centerX + 30, targetY, 1.5);
            
            others.forEach((o, i) => {
                const angle = (Math.PI * 2 * i) / 4;
                const tx = centerX + Math.cos(angle) * 100; // 220
                const ty = targetY + Math.sin(angle) * 100; // 220
                o.moveTo(tx, ty, 1.5);
            });
        }, [], "+=1");

        // 4. Move even closer (Existing Scene 5 logic)
        tl.to(mainOrb.container, { x: centerX - 15, y: targetY, duration: 2, ease: 'power2.inOut' }, "+=1.5");
        tl.to(orb2.container, { x: centerX + 15, y: targetY, duration: 2, ease: 'power2.inOut' }, "<");

        // 5. Brightness Increase
        tl.call(() => {
            mainOrb.glowIntensity = 30;
            orb2.glowIntensity = 30;
        }, [], "<+=1");

        // 6. Fade others
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
