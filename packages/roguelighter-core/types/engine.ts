import { createDialog, createMenu } from 'svelte-headlessui';
import type { Agent } from './game';
import { SvelteMap } from 'svelte/reactivity';

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

// export type AgentAssetUrls = Map<string, { default: string; [key: string]: string }>;
export type AgentAssetUrls = Map<string, string>;
export type BackgroundAssetUrls = Map<string, string>;
export type AssetType = 'backgrounds' | 'agents';
export type EntryTuple = [key: string, path: string, type: AssetType];
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export interface RoguelighterProject {
  name: string;
  code: string;
  scenes: SvelteMap<UUID, Scene>;
}

export interface ParseErrorObject {
  code: string;
  json_string: string;
  error: string;
}

export interface RoguelighterDataFile {
  code: string;
  scenes: Array<[UUID, Scene]>;
}

export interface PlayableScene extends Omit<Scene, 'agents'> {
  agents: Map<number, PlayableAgent>;
}

export interface Portal {
  to_scene_id: UUID;
  to_position: number;
}

// UI

export type DialogController = ReturnType<typeof createDialog>;
export type DropdownController = ReturnType<typeof createMenu>;

export type View = 'code' | 'gui' | 'scene' | 'game' | 'logs';
