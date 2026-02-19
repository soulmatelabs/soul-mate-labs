// src/lib/orb-animations/core/GlobalOrbState.ts
import type { Orb } from './Orb';

class GlobalOrbState {
  private static instance: GlobalOrbState;
  
  // Properties of the main orb that persists across sections
  public position = { x: 0, y: 0 };
  public radius = 0;
  public color = 0xFFFFFF;
  public glowIntensity = 0;
  public lastSectionIndex: number = -1;
  
  // Reference to the active main orb instance in the current scene (optional)
  public mainOrb: Orb | null = null;

  private constructor() {}

  public static getInstance(): GlobalOrbState {
    if (!GlobalOrbState.instance) {
      GlobalOrbState.instance = new GlobalOrbState();
    }
    return GlobalOrbState.instance;
  }

  public updateStateFromOrb(orb: Orb) {
    this.position = { 
      x: orb.container.x, 
      y: orb.container.y 
    };
    this.radius = orb.radius;
    this.color = orb.color;
    this.glowIntensity = orb.glowIntensity;
  }
}

export const globalOrbState = GlobalOrbState.getInstance();
