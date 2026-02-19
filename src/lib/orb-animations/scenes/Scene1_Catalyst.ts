import { Container, Application } from 'pixi.js';
import type { SceneController } from '../core/SceneController';
import { Orb } from '../core/Orb';
import { OrbCluster } from '../core/OrbCluster';
import { globalOrbState } from '../core/GlobalOrbState';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export class Scene1_Catalyst implements SceneController {
    private container: Container;
    private cluster: OrbCluster;
    private app: Application | null = null;
    private centerX: number = 0;
    private centerY: number = 0;
    private rotationTimeline: gsap.core.Timeline | null = null;
    private combinationTimeline: gsap.core.Timeline | null = null;
    private scrollTimeline: gsap.core.Timeline | null = null;
    private isOrbiting: boolean = false;
    private combinationStarted: boolean = false;

    constructor() {
        this.container = new Container();
        this.cluster = new OrbCluster();
        this.container.addChild(this.cluster.container);
        this.container.visible = false;
    }

    public enter(app: Application) {
        if (globalOrbState.mainOrb) {
            // Scene 1 doesn't use the single orb from the previous scene,
            // so we must destroy it to prevent it from becoming a ghost.
            globalOrbState.mainOrb.destroy(); // Assuming Orb has a destroy method
            globalOrbState.mainOrb = null;
        }

        this.app = app;
        this.container.visible = true;
        this.app.stage.addChild(this.container);
        
        this.centerX = app.screen.width / 2;
        this.centerY = app.screen.height / 2;

        const isScrollUp = globalOrbState.lastSectionIndex === 1; // connection-01 is index 1
        // Increase orb space to 3/4 the viewport's height
        const radius = app.screen.height * 0.375;
        const rotationSpeed = 6; // 6 seconds per rotation
        
        this.cluster.clear();
        this.combinationStarted = false;
        
        // Define cardinal angles (West, North, East, South)
        const baseAngles = [Math.PI, -Math.PI / 2, 0, Math.PI / 2];

        // Calculation for Cardinal Alignment at Auto-Scroll trigger:
        const catalystEl = document.getElementById('catalyst');
        const autoScrollMs = catalystEl?.dataset.autoScrollMs ? parseFloat(catalystEl.dataset.autoScrollMs) : 9000;
        const animDelayMs = catalystEl?.dataset.animationDelay ? parseFloat(catalystEl.dataset.animationDelay) : 2000;
        const stayDuration = (autoScrollMs - animDelayMs) / 1000;

        const startRotation = isScrollUp ? 0 : -(stayDuration * (Math.PI * 2) / rotationSpeed);

        this.cluster.container.alpha = isScrollUp ? 1 : 0;

        baseAngles.forEach((angle, i) => {
            // Orbs are gray (0x4B5563) and lack beams (low glowIntensity)
            const orb = new Orb(10, 0x4B5563, 0.3, 0.5);
            
            if (isScrollUp && i === 1) {
                // North orb starts from global position (it was blue, will be gray now)
                orb.setPosition(globalOrbState.position.x, globalOrbState.position.y);
            } else {
                const currentAngle = angle + startRotation;
                const startX = this.centerX + Math.cos(currentAngle) * radius;
                const startY = this.centerY + Math.sin(currentAngle) * radius;
                orb.setPosition(startX, startY);
            }
            
            this.cluster.addOrb(orb);
        });

        // Start orbiting and setup triggers
        this.startOrbiting(radius, rotationSpeed, startRotation, stayDuration);

        if (isScrollUp) {
            const northOrb = this.cluster.orbs[1];
            gsap.to(northOrb.container, {
                alpha: 1,
                duration: 1,
                ease: 'power2.out'
            });
        } else {
            const customDelay = animDelayMs / 1000;

            gsap.to(this.cluster.container, {
                alpha: 1,
                duration: 1.5,
                delay: customDelay,
                ease: 'sine.inOut'
            });
        }
    }

    private startOrbiting(radius: number, speed: number, startRotation: number, stayDuration: number) {
        if (this.isOrbiting) return;
        this.isOrbiting = true;

        const proxy = { 
            rotation: startRotation,
            radius: radius,
            combination: 0,
            centerY: this.centerY
        };
        const baseAngles = [Math.PI, -Math.PI / 2, 0, Math.PI / 2];
        
        if (this.rotationTimeline) this.rotationTimeline.kill();

        this.rotationTimeline = gsap.timeline({
            repeat: -1,
            onUpdate: () => {
                const northAngle = baseAngles[1] + proxy.rotation;
                const northX = this.centerX + Math.cos(northAngle) * proxy.radius;
                const northY = this.centerY + Math.sin(northAngle) * proxy.radius;

                this.cluster.orbs.forEach((orb, i) => {
                    const angle = baseAngles[i] + proxy.rotation;
                    const targetX = this.centerX + Math.cos(angle) * proxy.radius;
                    const targetY = this.centerY + Math.sin(angle) * proxy.radius;
                    
                    // Combine logic: interpolate between target position and north position
                    orb.container.x = gsap.utils.interpolate(targetX, northX, proxy.combination);
                    orb.container.y = gsap.utils.interpolate(targetY, northY, proxy.combination);
                    
                    if (i !== 1) {
                        orb.container.alpha = 1 - proxy.combination;
                    }
                });
            }
        });

        this.rotationTimeline.to(proxy, {
            rotation: startRotation + Math.PI * 2,
            duration: speed,
            ease: 'none'
        });

        const northOrb = this.cluster.orbs[1];

        // 1. Time-based combination sequence right before auto-scroll
        this.combinationTimeline = gsap.timeline({
            delay: stayDuration - 0.2, // 1.5
            onStart: () => { this.combinationStarted = true; }
        });

        this.combinationTimeline.to(proxy, {
            combination: 1,
            radius: 0,
            centerY: this.centerY - 100, // Target position for next scene
            duration: 1.5,
            ease: 'power2.inOut'
        });
        if (northOrb) {
            this.combinationTimeline.to(northOrb, {
                radius: 15,
                duration: 1.5,
                ease: 'power2.inOut'
            }, "<");
        }

        // 2. Scroll-based combination (scrub)
        this.scrollTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#catalyst",
                start: "top top",
                end: "bottom top",
                scrub: 0.5,
                onEnterBack: () => {
                    // Allow scrub to take control when coming back
                    this.combinationStarted = false;
                }
            }
        });

        this.scrollTimeline.to(proxy, {
            combination: 1,
            radius: 0,
            centerY: this.centerY - 100,
            duration: 1,
            ease: 'none',
            immediateRender: false
        });
        if (northOrb) {
            this.scrollTimeline.to(northOrb, {
                radius: 15,
                duration: 1,
                ease: 'none',
                immediateRender: false
            }, "<");
        }
    }

    public update(delta: number) {
    }

    public exit() {
        if (this.rotationTimeline) {
            this.rotationTimeline.kill();
            this.rotationTimeline = null;
        }
        if (this.combinationTimeline) {
            this.combinationTimeline.kill();
            this.combinationTimeline = null;
        }
        if (this.scrollTimeline) {
            if (this.scrollTimeline.scrollTrigger) {
                this.scrollTimeline.scrollTrigger.kill();
            }
            this.scrollTimeline.kill();
            this.scrollTimeline = null;
        }
        this.isOrbiting = false;

        // Transitions: The North orb (index 1) becomes the main orb
        if (this.cluster.orbs.length >= 2) {
            const northOrb = this.cluster.orbs[1];
            // Ensure it's gray for the state update
            northOrb.color = 0x4B5563;
            northOrb.glowIntensity = 0.3;
            
            globalOrbState.updateStateFromOrb(northOrb);
            globalOrbState.mainOrb = northOrb;
        }
        
        this.container.visible = false;
        if(this.app) this.app.stage.removeChild(this.container);
    }
}
