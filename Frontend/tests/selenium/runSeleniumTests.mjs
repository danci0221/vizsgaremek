import { authSuite } from "./auth.test.js";
import { catalogSuite } from "./catalog.test.js";
import { featuresSuite } from "./features.test.js";
import { mapSuite } from "./map.test.js";
import { navSuite } from "./nav.test.js";
import { runAllSuites } from "./suiteRunner.js";

const suites = [authSuite, navSuite, catalogSuite, featuresSuite, mapSuite];

runAllSuites(suites).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
