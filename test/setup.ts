import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount between tests so queries can't see a previous test's DOM.
afterEach(cleanup);
