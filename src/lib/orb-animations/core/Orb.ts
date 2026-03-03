import { Graphics, Container, BlurFilter } from 'pixi.js';
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
  private _destroyed: boolean = false;

  constructor(radius: number, color: number, glowIntensity: number = 2, pulseSpeed: number = 1) {
    this._radius = radius;
    this._color = color;
    this._glowIntensity = glowIntensity;
    this._pulseSpeed = pulseSpeed;

    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    // Initialize filters with softer default spread
    this.glowFilter = new GlowFilter({ 
        distance: 20, 
        outerStrength: glowIntensity, 
        color: color,
        alpha: 0.6 // Softer starting alpha
    });
    this.blurFilter = new BlurFilter({ strength: 0.5 });

    this.draw();
  }

  private draw() {
    if (this._destroyed || !this.graphics) return;
    this.graphics.clear();
    
    // Spherical Look
    // Main Body
    this.graphics.circle(0, 0, this._radius);
    this.graphics.fill({ color: this._color });
    
    // Subtle white border for definition
    this.graphics.stroke({ 
        width: 1, 
        color: 0xFFFFFF, 
        alpha: 0.3,
        alignment: 1 // Outer stroke
    });

    // Specular Highlight (Inner "Sheen")
    this.graphics.circle(-this._radius * 0.3, -this._radius * 0.3, this._radius * 0.25);
    this.graphics.fill({ color: 0xFFFFFF, alpha: 0.4 });

    this.container.filters = [this.glowFilter, this.blurFilter];
  }

  public get radius() { return this._radius; }
  public set radius(v: number) { 
      if (this._destroyed) return;
      this._radius = v; 
      this.draw(); 
  }

  public get color() { return this._color; }
  public set color(v: number) { 
      if (this._destroyed) return;
      this._color = v; 
      this.glowFilter.color = v;
      this.draw(); 
  }

  public get glowIntensity() { return this._glowIntensity; }
  public set glowIntensity(v: number) { 
      if (this._destroyed) return;
      this._glowIntensity = v; 
      this.glowFilter.outerStrength = v;
  }

  // New property for light spread
  public get glowDistance() { return this.glowFilter.distance; }
  public set glowDistance(v: number) { 
      if (this._destroyed) return;
      this.glowFilter.distance = v; 
  }

  public get destroyed() { return this._destroyed; }

  public pulse() {
    if (this._destroyed) return;
    if (this._pulseTimeline) this._pulseTimeline.kill();
    
    this._pulseTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    
    // Focus on "radiating" light rather than scaling the orb itself
    this._pulseTimeline.to(this, {
        glowDistance: 40,      // Increase spread (shadow spread)
        glowIntensity: 3,     // Moderate strength
        duration: 1.5 / this._pulseSpeed,
        ease: 'sine.inOut'
    });
    
    this._pulseTimeline.to(this.glowFilter, {
        alpha: 0.4,           // Subtle opacity change
        duration: 1.5 / this._pulseSpeed,
        ease: 'sine.inOut'
    }, "<");
  }
  
  public stopPulse() {
    if (this._pulseTimeline) {
        this._pulseTimeline.kill();
        this._pulseTimeline = null;
    }
    if (!this._destroyed) {
        gsap.to(this, { 
            glowDistance: 20, 
            glowIntensity: this._glowIntensity, 
            duration: 0.5 
        });
        gsap.to(this.glowFilter, { alpha: 0.6, duration: 0.5 });
    }
  }

  public shine(duration: number = 0.5, intensity: number = 5) {
      if (this._destroyed) return;
      // Beaming harder leverages more spread and higher alpha
      gsap.to(this, {
          glowDistance: 60,         // Broad spread for irradiated look
          glowIntensity: intensity / 2, // Lower relative intensity to avoid "border" look
          duration: duration / 2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out'
      });
      
      gsap.to(this.glowFilter, {
          alpha: 0.9,               // Much more solid light during beam
          duration: duration / 2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out'
      });
  }

  public moveTo(x: number, y: number, duration: number = 1, ease: string = 'power2.inOut') {
    if (this._destroyed) return null;
    return gsap.to(this.container, { x, y, duration, ease });
  }

  public orbitAround(target: {x: number, y: number}, radius: number, speed: number = 1) {
    if (this._destroyed) return;
    const dx = this.container.x - target.x;
    const dy = this.container.y - target.y;
    let angle = Math.atan2(dy, dx);
    const proxy = { angle: angle };
    if (this._orbitTimeline) this._orbitTimeline.kill();
    this._orbitTimeline = gsap.timeline({ repeat: -1, ease: 'none' });
    this._orbitTimeline.to(proxy, {
        angle: angle + Math.PI * 2,
        duration: 5 / speed,
        ease: 'none',
        onUpdate: () => {
            if (this._destroyed) return;
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
    if (this._destroyed) return null;
    return gsap.to(this.container, { alpha: opacity, duration });
  }

  public attractTo(target: {x: number, y: number}, duration: number = 1) {
      if (this._destroyed) return null;
      return this.moveTo(target.x, target.y, duration, 'back.out(1.2)');
  }
  
  public setPosition(x: number, y: number) {
      if (this._destroyed) return;
      this.container.x = x;
      this.container.y = y;
  }

  public destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    // Kill any ongoing animations to prevent them from targeting a destroyed object.
    this.stopPulse();
    this.stopOrbit();
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.container);
    gsap.killTweensOf(this.graphics);

    // Destroy the PixiJS container and its children.
    this.container.destroy({ children: true, texture: true });
    
    // Explicitly nullify to prevent memory leaks and catch misuse
    (this as any).graphics = null;
    (this as any).container = null;
    (this as any).glowFilter = null;
    (this as any).blurFilter = null;
  }
}
