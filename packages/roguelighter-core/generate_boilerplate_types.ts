function generate_boilerplate_types({
  assets,
  events,
  variables,
  agent_states,
  user_functions_and_parameters
}: {
  assets: { agents: string; backgrounds: string };
  events: string;
  variables: string;
  agent_states: string;
  user_functions_and_parameters: string;
}) {
  const variable_declarations = `
  let game_data: GameData = {} 
  `;

  const generated_types = `
  type Prettify<T> = {
    [K in keyof T]: T[K];
  } & {};
  type AgentAssets = ${assets.agents};
  type BackgroundAssets = ${assets.backgrounds};
  type EventNames = ${events};
  type VariableNames = ${variables};
  type BackgroundNames = ${assets.backgrounds};
  type AgentStates = ${agent_states};
  type UserFunctionsAndParameters = ${user_functions_and_parameters};
  `;

  // @start
const static_types = ``
// @end

  return generated_types + static_types + variable_declarations;
}
