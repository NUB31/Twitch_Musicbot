import setup, { resetServer } from "./helpers/setup";

setup().then(async () => {
  await resetServer();
  console.log("Installation done, you can now launch server.exe");
});
