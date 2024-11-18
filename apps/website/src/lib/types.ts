import type {
  AgentAssetUrls,
  BackgroundAssetUrls,
  GameData,
  RoguelighterProject
} from 'roguelighter-core';

export interface TutorialJson {
  title: string;
  solution_tuples: Array<[key: string, answer: string]>;
  solution_object: GameData;
  project: RoguelighterProject;
  agent_asset_urls: AgentAssetUrls;
  bg_asset_urls: BackgroundAssetUrls;
  next?: string;
  prev?: string;
}

// interface Tutorial {
//   header: string;
//   description: string;
//   project: RoguelighterProject;
//   solution: GameData;
//   solution_tuple: [string, any];
//   agent_asset_urls: AgentAssetUrls;
//   bg_asset_urls: BackgroundAssetUrls;
// }
