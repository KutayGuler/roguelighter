import { createDialog, createMenu } from 'svelte-headlessui';
import type { Agent } from './game';

export interface PlayableAgent extends Agent {
  name: string;
  x: number;
  y: number;
  state: string;
}

export type PlayableAgents = Map<number, PlayableAgent>;

export interface Scene {
  name: string;
  backgrounds: Map<number, string>;
  agents: Map<number, string>;
  portals: Map<number, Portal>;
  width: number;
  height: number;
}

export type AgentAssetUrls = Map<string, { default: string; [key: string]: string }>;
export type BackgroundAssetUrls = Map<string, string>;
export type AssetType = 'backgrounds' | 'agents';
export type EntryTuple = [key: string, path: string, type: AssetType];

export interface RoguelighterProject {
  code: string;
  scenes: Map<number, Scene>;
}

export interface RoguelighterDataFile {
  code: string;
  scenes: Array<[number, Scene]>;
}

export interface PlayableScene extends Omit<Scene, 'agents'> {
  agents: Map<number, PlayableAgent>;
}

export interface Portal {
  to_scene_id: number;
  to_position: number;
}

// UI

export type DialogController = ReturnType<typeof createDialog>;
export type DropdownController = ReturnType<typeof createMenu>;

export type View = 'code' | 'gui' | 'scene' | 'game' | 'logs';
