import { State } from "@state-street/state-street";
import "../styles.css";
import { App } from "./App.sst";

const data = {
  name: "{{PROJECT_NAME}}", // shown via the {{name}} State Binding — updates in place, no re-render
  count: 0,
};

const methods = {
  // Mutating state.data re-renders any component that read it (here, <App/>).
  inc: ({ state }: any) => { state.data.count += 1; },
};

new State(`<App/>`, data, { App }, methods);
