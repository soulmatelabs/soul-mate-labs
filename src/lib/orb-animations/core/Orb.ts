import { Graphics, Container, Color, BlurFilter } from 'pixi.js';
import { GlowFilter } from 'pixi-filters';
import gsap from 'gsap';

export class Orb {
  public container: Container;
  public graphics: Graphics;
  public glowFilter: GlowFilter;
  public blurFilter: BlurFilter;

  private _radius: number;
  private _color: number;
  private _glowIntensity: number;
  private _pulseSpeed: number;
  private _pulseTimeline: gsap.core.Timeline | null = null;
  private _orbitTimeline: gsap.core.Timeline | null = null;

  constructor(radius: number, color: number, glowIntensity: number = 2, pulseSpeed: number = 1) {
    this._radius = radius;
    this._color = color;
    this._glowIntensity = glowIntensity;
    this._pulseSpeed = pulseSpeed;

    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    // Initialize filters
    this.glowFilter = new GlowFilter({ distance: 15, outerStrength: glowIntensity, color: color });
    this.blurFilter = new BlurFilter({ strength: 0.5 });
    // this.container.filters = [this.glowFilter, this.blurFilter]; // Applying to container

    this.draw();
  }

  private draw() {
    this.graphics.clear();
    this.graphics.circle(0, 0, this._radius);
    this.graphics.fill({ color: this._color });
    this.container.filters = [this.glowFilter, this.blurFilter]; // Re-apply to ensure they are active
  }

  public get radius() { return this._radius; }
  public set radius(v: number) { this._radius = v; this.draw(); }

  public get color() { return this._color; }
  public set color(v: number) { 
      this._color = v; 
      this.glowFilter.color = v; // Update glow color too
      this.draw(); 
  }

  public get glowIntensity() { return this._glowIntensity; }
  public set glowIntensity(v: number) { 
      this._glowIntensity = v; 
      this.glowFilter.outerStrength = v;
  }

  public pulse() {
    if (this._pulseTimeline) this._pulseTimeline.kill();
    
    this._pulseTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    this._pulseTimeline.to(this.graphics.scale, {
      x: 1.1,
      y: 1.1,
      duration: 1 / this._pulseSpeed,
      ease: 'sine.inOut'
    });
    this._pulseTimeline.to(this, {
        glowIntensity: this._glowIntensity * 1.5,
        duration: 1 / this._pulseSpeed,
        ease: 'sine.inOut'
    }, "<");
  }
  
  public stopPulse() {
    if (this._pulseTimeline) {
        this._pulseTimeline.kill();
        this._pulseTimeline = null;
        gsap.to(this.graphics.scale, { x: 1, y: 1, duration: 0.5 });
        gsap.to(this, { glowIntensity: this._glowIntensity, duration: 0.5 });
    }
  }

  public shine(duration: number = 0.5, intensity: number = 5) {
      gsap.to(this, {
          glowIntensity: intensity,
          duration: duration / 2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out'
      });
  }

  public moveTo(x: number, y: number, duration: number = 1, ease: string = 'power2.inOut') {
    return gsap.to(this.container, {
      x,
      y,
      duration,
      ease
    });
  }

  public orbitAround(target: {x: number, y: number}, radius: number, speed: number = 1) {
    // Determine current angle relative to target
    const dx = this.container.x - target.x;
    const dy = this.container.y - target.y;
    let angle = Math.atan2(dy, dx);
    
    // We animate a proxy object 'angle' property
    const proxy = { angle: angle };
    
    if (this._orbitTimeline) this._orbitTimeline.kill();
    
    this._orbitTimeline = gsap.timeline({ repeat: -1, ease: 'none' });
    this._orbitTimeline.to(proxy, {
        angle: angle + Math.PI * 2,
        duration: 5 / speed,
        ease: 'none',
        onUpdate: () => {
            this.container.x = target.x + Math.cos(proxy.angle) * radius;
            this.container.y = target.y + Math.sin(proxy.angle) * radius;
        }
    });
  }
  
  public stopOrbit() {
      if(this._orbitTimeline) {
          this._orbitTimeline.kill();
          this._orbitTimeline = null;
      }
  }

  public fade(opacity: number, duration: number = 0.5) {
    return gsap.to(this.container, {
      alpha: opacity,
      duration
    });
  }

  public attractTo(target: {x: number, y: number}, duration: number = 1) {
      return this.moveTo(target.x, target.y, duration, 'back.out(1.2)');
  }
  
  public setPosition(x: number, y: number) {
      this.container.x = x;
      this.container.y = y;
  }
}
