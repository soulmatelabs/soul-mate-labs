import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';

export class RippleEffect {
  public container: Container;
  private rings: Graphics[] = [];

  constructor() {
    this.container = new Container();
  }

  public emit(x: number, y: number, color: number = 0xFFFFFF) {
    const ring = new Graphics();
    ring.circle(0, 0, 10);
    ring.stroke({ width: 2, color: color, alpha: 0.8 });
    ring.x = x;
    ring.y = y;
    ring.alpha = 0.8;
    
    this.container.addChild(ring);
    this.rings.push(ring);

    gsap.to(ring.scale, {
        x: 20, 
        y: 20, 
        duration: 2, 
        ease: 'power1.out'
    });
    
    gsap.to(ring, {
        alpha: 0,
        duration: 2,
        ease: 'power1.out',
        onComplete: () => {
            this.container.removeChild(ring);
            const index = this.rings.indexOf(ring);
            if (index > -1) this.rings.splice(index, 1);
            ring.destroy();
        }
    });
  }
}
