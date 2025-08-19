import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { generateAndSaveCVs } from "../src/services/generate-cvs";

const NUM_CVS = 25;

generateAndSaveCVs(NUM_CVS).then(() => {
  console.log("Done!");
});