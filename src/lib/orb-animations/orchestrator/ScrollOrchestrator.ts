import { Application } from 'pixi.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { SceneController } from '../core/SceneController';
import { globalOrbState } from '../core/GlobalOrbState';

gsap.registerPlugin(ScrollTrigger);

type SceneConstructor = new () => SceneController;

export class ScrollOrchestrator {
    private app: Application;
    private sceneInstances: Map<string, SceneController> = new Map();
    private currentScene: SceneController | null = null;
    private tickerTimeout: ReturnType<typeof setTimeout> | null = null;

    // Mapping section IDs to their dynamic import paths
    private sceneModules: Record<string, () => Promise<any>> = {
        'catalyst': () => import('../scenes/Scene1_Catalyst'),
        'connection-01': () => import('../scenes/Scene2_Connection1'),
        'connection-02': () => import('../scenes/Scene3_Connection2'),
        'connection-03': () => import('../scenes/Scene4_Connection3'),
        'connection-04': () => import('../scenes/Scene5_Connection4'),
    };

    constructor(app: Application) {
        this.app = app;
        
        // Ensure engine is paused initially
        this.app.ticker.stop();
        
        // Set default scroller for ScrollTrigger
        ScrollTrigger.defaults({
            scroller: "#scroll-container"
        });

        // Small delay to ensure DOM is ready and styles are applied
        setTimeout(() => {
            this.setupZoneTrigger();
            this.setupTriggers();
            ScrollTrigger.refresh();
            console.log("[PIXI] ScrollOrchestrator JIT initialized");
        }, 200);
        
        // Add update loop
        app.ticker.add((ticker) => {
             if (this.currentScene) {
                 this.currentScene.update(ticker.deltaTime);
             }
        });
    }

    private setupZoneTrigger() {
        ScrollTrigger.create({
            id: 'orb-zone',
            trigger: "#catalyst",
            endTrigger: "#connection-04",
            start: "top 50%",
            end: "bottom 50%",
            onToggle: (self) => {
                if (self.isActive) {
                    this.activateZone();
                } else {
                    this.deactivateZone();
                }
            }
        });
    }

    private activateZone() {
        if (this.tickerTimeout) clearTimeout(this.tickerTimeout);
        
        console.log("[PIXI] Entering Active Zone - Resuming Engine");
        this.app.ticker.start();
        
        const canvas = this.app.canvas as HTMLCanvasElement;
        if (canvas) canvas.style.opacity = '1';
    }

    private deactivateZone() {
        console.log("[PIXI] Leaving Active Zone - Fading Canvas");
        
        const canvas = this.app.canvas as HTMLCanvasElement;
        if (canvas) canvas.style.opacity = '0';

        this.tickerTimeout = setTimeout(() => {
            const st = ScrollTrigger.getById('orb-zone');
            if (st && !st.isActive) {
                console.log("[PIXI] Pausing Engine (Optimization)");
                this.app.ticker.stop();
            }
        }, 850);
    }

    private setupTriggers() {
        Object.keys(this.sceneModules).forEach((sectionId) => {
            const element = document.getElementById(sectionId);
            if (!element) {
                console.warn(`[PIXI] Section #${sectionId} not found for animation trigger.`);
                return;
            }

            ScrollTrigger.create({
                trigger: element,
                start: "top 50%",
                end: "bottom 50%",
                onToggle: (self) => {
                    if (self.isActive) {
                        console.log(`[PIXI] Activating section: ${sectionId}`);
                        this.loadAndSwitchScene(sectionId);
                    }
                }
            });
        });
    }

    private async loadAndSwitchScene(sectionId: string) {
        // 1. Get or Load Current Instance
        let scene = this.sceneInstances.get(sectionId);
        
        if (!scene) {
            console.log(`[PIXI] JIT Loading module for: ${sectionId}`);
            try {
                const module = await this.sceneModules[sectionId]();
                const className = Object.keys(module).find(k => k.startsWith('Scene'));
                if (className) {
                    const SceneClass = module[className] as SceneConstructor;
                    scene = new SceneClass();
                    this.sceneInstances.set(sectionId, scene);
                }
            } catch (error) {
                console.error(`[PIXI] Failed to load scene ${sectionId}:`, error);
                return;
            }
        }

        if (scene) {
            this.switchScene(scene);
            this.prefetchAdjacentScenes(sectionId);
        }
    }

    /**
     * Speculative Pre-fetching: Load adjacent scenes in background
     */
    private prefetchAdjacentScenes(currentId: string) {
        const keys = Object.keys(this.sceneModules);
        const currentIndex = keys.indexOf(currentId);
        
        // Prefetch Next
        if (currentIndex < keys.length - 1) {
            const nextId = keys[currentIndex + 1];
            if (!this.sceneInstances.has(nextId)) {
                console.log(`[PIXI] Speculative prefetch (Next): ${nextId}`);
                this.sceneModules[nextId](); 
            }
        }
        
        // Prefetch Previous
        if (currentIndex > 0) {
            const prevId = keys[currentIndex - 1];
            if (!this.sceneInstances.has(prevId)) {
                console.log(`[PIXI] Speculative prefetch (Prev): ${prevId}`);
                this.sceneModules[prevId]();
            }
        }
    }

    private switchScene(newScene: SceneController) {
        if (this.currentScene === newScene) return;

        if (this.currentScene) {
            console.log("[PIXI] Exiting current scene");
            this.currentScene.exit();
        }

        // Update global state index before entering new scene
        const sections = Object.keys(this.sceneModules);
        const currentIndex = this.currentScene ? sections.indexOf(this.getSectionIdByScene(this.currentScene)) : -1;
        globalOrbState.lastSectionIndex = currentIndex;

        this.currentScene = newScene;
        console.log(`[PIXI] Entering new scene instance`);
        this.currentScene.enter(this.app!);
    }

    private getSectionIdByScene(scene: SceneController): string {
        for (const [id, instance] of this.sceneInstances.entries()) {
            if (instance === scene) return id;
        }
        return '';
    }
}
