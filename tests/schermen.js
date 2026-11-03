// Schermafbeeldingen op zes breedtes, met controle op horizontaal scrollen en fouten in de console.
// Gebruik: node tests/schermen.js [basis-url] [uitmap buiten de repo] [breedtes]
const { chromium } = require("playwright");
const BASIS = process.argv[2] || "http://127.0.0.1:8765";
const UIT = process.argv[3] || require("os").tmpdir() + "/fiets-schermen";
const BREEDTES = (process.argv[4] || "360,390,768,1024,1366,1920").split(",").map(Number);
const PAGINAS = [["fiets", "/?stil"], ["tekening", "/?stil&stand=tekening"], ["frame", "/?stil&sectie=1"], ["motor", "/?stil&sectie=2"], ["geometrie", "/?stil&sectie=6"], ["uiteen", "/?stil&uiteen&af"], ["stap1", "/?stil&stap=0"], ["stap5", "/?stil&stap=4&af"], ["klaar", "/?stil&klaar"], ["hoe", "/hoe-dit-werkt"], ["kinderen", "/kinderen?stil"], ["onderzoekjes", "/onderzoekjes"], ["oz-spaken", "/onderzoekjes/tel-de-spaken"], ["oz-rondje", "/onderzoekjes/een-rondje-trappen"], ["oz-lampjes", "/onderzoekjes/bel-en-lampjes"], ["oz-band", "/onderzoekjes/lucht-in-de-band"], ["oz-spotten", "/onderzoekjes/fietsen-spotten"], ["oz-bouwen", "/onderzoekjes/bouw-een-fiets"], ["mijn", "/mijn"]];
(async () => {
  require("fs").mkdirSync(UIT, { recursive: true });
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  let problemen = 0;
  for (const b of BREEDTES) {
    const page = await browser.newPage({ viewport: { width: b, height: b < 800 ? 780 : 900 } });
    const fouten = [];
    page.on("pageerror", (e) => fouten.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") fouten.push(m.text()); });
    for (const [naam, pad] of PAGINAS) {
      await page.goto(BASIS + pad, { waitUntil: "load" });
      if (pad.startsWith("/?") || pad.startsWith("/kinderen")) await page.waitForFunction(() => window.__klaar, null, { timeout: 60000 });
      await page.waitForTimeout(2500);
      const breed = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (breed > 0) { problemen++; console.log(`  ${b}px ${naam}: ${breed}px horizontaal scrollen`); }
      await page.screenshot({ path: `${UIT}/${naam}-${b}.png` });
    }
    for (const f of new Set(fouten)) { problemen++; console.log(`  ${b}px fout: ${f.slice(0, 200)}`); }
    await page.close();
  }
  await browser.close();
  console.log(problemen ? `${problemen} problemen` : "geen problemen");
  process.exit(problemen ? 1 : 0);
})();
