// src/lib/orb-animations/core/SceneController.ts
import type { Application } from 'pixi.js';

export interface SceneController {
  enter(app: Application): void;
  update(delta: number): void;
  exit(): void;
  // Cleanup method if needed
  destroy?(): void;
}
