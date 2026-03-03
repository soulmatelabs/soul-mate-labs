import { Container } from 'pixi.js';
import { Orb } from './Orb';

export class OrbCluster {
    public container: Container;
    public orbs: Orb[] = [];
    
    constructor() {
        this.container = new Container();
    }
    
    public addOrb(orb: Orb) {
        if (!orb || orb.destroyed || !orb.container) {
            console.warn("[PIXI] Attempted to add a destroyed or invalid orb to cluster.");
            return;
        }
        this.orbs.push(orb);
        this.container.addChild(orb.container);
    }
    
    public removeOrb(orb: Orb) {
        const index = this.orbs.indexOf(orb);
        if (index > -1) {
            this.orbs.splice(index, 1);
            this.container.removeChild(orb.container);
        }
    }

    public clear() {
        this.orbs.forEach(orb => {
            orb.destroy();
        });
        this.orbs = [];
    }
    
    public arrangeInCircle(centerX: number, centerY: number, radius: number, duration: number = 1) {
        const count = this.orbs.length;
        const angleStep = (Math.PI * 2) / count;
        
        this.orbs.forEach((orb, i) => {
            const angle = i * angleStep - Math.PI / 2; // Start from top
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            orb.moveTo(x, y, duration);
        });
    }

    public arrangeInRow(startX: number, startY: number, spacing: number, duration: number = 1) {
        this.orbs.forEach((orb, i) => {
            orb.moveTo(startX + i * spacing, startY, duration);
        });
    }
    
    public synchronizePulse() {
        this.orbs.forEach(orb => orb.pulse());
    }

    public stopPulse() {
        this.orbs.forEach(orb => orb.stopPulse());
    }

    public fadeAll(opacity: number, duration: number = 0.5) {
        this.orbs.forEach(orb => orb.fade(opacity, duration));
    }
}
