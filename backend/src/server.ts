import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.porta, () => {
  console.log(`API do AutoGestão rodando em http://localhost:${config.porta}/api`);
});
