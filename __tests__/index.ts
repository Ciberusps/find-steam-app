import { findSteam } from "../src/index";

test("main", async () => {
  const steamPath = await findSteam();

  console.log({ steamPath });

  expect(steamPath).toBeTruthy();
});
