import { Container, Graphics, Application } from 'pixi.js';
import type { SceneController } from '../core/SceneController';
import { Orb } from '../core/Orb';
import { OrbCluster } from '../core/OrbCluster';
import { globalOrbState } from '../core/GlobalOrbState';
import gsap from 'gsap';

export class Scene1_Catalyst implements SceneController {
    private container: Container;
    private cluster: OrbCluster;
    private app: Application | null = null;
    private centerX: number = 0;
    private centerY: number = 0;

    constructor() {
        this.container = new Container();
        this.cluster = new OrbCluster();
        this.container.addChild(this.cluster.container);
        this.container.visible = false;
    }

    public enter(app: Application) {
        this.app = app;
        this.container.visible = true;
        this.app.stage.addChild(this.container);
        
        this.centerX = app.screen.width / 2;
        this.centerY = app.screen.height / 2;

        const corners = [
            { x: 0, y: 0 },
            { x: app.screen.width, y: 0 },
            { x: app.screen.width, y: app.screen.height },
            { x: 0, y: app.screen.height }
        ];

        this.cluster.clear();
        corners.forEach((corner) => {
            const orb = new Orb(10, 0x60A5FA, 2, 0.5);
            orb.setPosition(corner.x, corner.y);
            this.cluster.addOrb(orb);
        });

        const tl = gsap.timeline();
        
        this.cluster.orbs.forEach((orb, i) => {
             const angle = (Math.PI * 2 * i) / 4 - Math.PI / 4;
             const targetX = this.centerX + Math.cos(angle) * 150;
             const targetY = this.centerY + Math.sin(angle) * 150;
             
             tl.to(orb.container, {
                 x: targetX,
                 y: targetY,
                 duration: 1.5,
                 ease: 'power2.out'
             }, 0);
        });

        tl.call(() => {
             this.cluster.orbs.forEach(orb => {
                 orb.orbitAround({ x: this.centerX, y: this.centerY }, 150, 0.2);
             });
        });

        // Detach one orb after some time (simulated for now, usually triggered by scroll out)
        // For the "travels between sections" part, we might handle the specific exit animation in a separate method called by ScrollTrigger 'onLeave'
    }

    public update(delta: number) {
        // Line drawing logic removed
    }

    public exit() {
        // Transition logic to move the main orb to the global state's "next" position would go here
        // For now, simple cleanup
        if (this.cluster.orbs.length > 0) {
            const mainOrb = this.cluster.orbs[0];
            globalOrbState.updateStateFromOrb(mainOrb);
            globalOrbState.mainOrb = mainOrb; // Keep ref
        }
        
        // We don't destroy or hide immediately if we want smooth transition, but for this architecture:
        this.container.visible = false;
        if(this.app) this.app.stage.removeChild(this.container);
    }
}
