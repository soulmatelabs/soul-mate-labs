// src/lib/orb-animations/core/GlobalOrbState.ts
import type { Orb } from './Orb';

class GlobalOrbState {
  private static instance: GlobalOrbState;
  
  // Properties of the main orb that persists across sections
  public position = { x: 0, y: 0 };
  public radius = 0;
  public color = 0xFFFFFF;
  public glowIntensity = 0;
  
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
    this.position = { x: orb.graphics.x, y: orb.graphics.y };
    // Assuming Orb class exposes these or we can infer them
    // For now, just tracking position is the most critical part for continuity
  }
}

export const globalOrbState = GlobalOrbState.getInstance();
