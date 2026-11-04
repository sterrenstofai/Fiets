// Klikt alles door: secties, uit elkaar, donker/tekening, alle bouwstappen, klaar, lampen, toetsen.
// Gebruik: node tests/klikken.js [basis-url]
const { chromium } = require("playwright");
const BASIS = process.argv[2] || "http://127.0.0.1:8765";
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  const fouten = []; p.on("pageerror", (e) => fouten.push(e.message)); p.on("console", (m) => m.type() === "error" && fouten.push(m.text()));
  const controle = (ok, wat) => { if (!ok) fouten.push("mislukt: " + wat); };
  await p.goto(BASIS + "/?stil"); await p.waitForFunction(() => window.__klaar);
  controle(await p.locator('[data-stand="echt"]').getAttribute("aria-pressed") === "true", "donker is standaard");
  for (let i = 0; i < 6; i++) { await p.click("#verder"); await p.waitForTimeout(300); }
  controle((await p.textContent("#inhoud h2")) === "Geometrie", "zeven secties doorlopen");
  await p.click("#uiteenknop"); await p.waitForTimeout(2200);
  controle((await p.locator("#namen .naam").count()) >= 8, "namen bij uit elkaar");
  await p.keyboard.press("e"); await p.waitForTimeout(500);
  controle(await p.locator("#uiteenknop").getAttribute("aria-pressed") === "false", "E zet terug");
  await p.click('[data-stand="tekening"]');
  await p.click("#verder"); await p.waitForTimeout(300);
  controle((await p.textContent("#stapgetal")) === "1", "naar bouwen");
  for (let i = 0; i < 9; i++) { await p.click("#verder"); await p.waitForTimeout(300); }
  controle((await p.textContent("#inhoud h2")).includes("af"), "klaar-scherm");
  controle((await p.textContent("#teller")) === "9/9", "teller 9/9");
  await p.click("#verder"); await p.waitForTimeout(300);
  await p.locator('[data-tik="lampen"]').click();
  await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowLeft");
  // kinderen
  await p.goto(BASIS + "/kinderen?stil"); await p.waitForFunction(() => window.__klaar);
  await p.click("#kindvolgende"); await p.click("#kindvolgende"); await p.waitForTimeout(300);
  controle((await p.textContent("#kindnaam")) === "de bel", "kinderen: naar de bel");
  await p.click("#kindknop");
  // gezien in het echt, teller
  await p.goto(BASIS + "/?stil&sectie=5"); await p.waitForFunction(() => window.__klaar);
  await p.click('[data-gezien="bel"]'); await p.waitForTimeout(200);
  controle((await p.textContent("#mijnteller")) === "1", "teller Mijn fiets");
  await p.goto(BASIS + "/mijn"); controle(await p.locator('[data-k="bel"][aria-pressed="true"]').count() === 1, "bel staat bij Mijn fiets");
  // onderzoekjes: stempel en certificaat
  for (const slug of ["tel-de-spaken", "een-rondje-trappen", "bel-en-lampjes", "lucht-in-de-band", "fietsen-spotten", "bouw-een-fiets"]) {
    await p.goto(BASIS + "/onderzoekjes/" + slug); await p.fill("#notitie", "proef"); await p.click("[data-klaar]");
  }
  await p.goto(BASIS + "/onderzoekjes"); await p.fill("#naam", "Fos");
  const dl = p.waitForEvent("download"); await p.click("[data-cert]"); const d = await dl;
  controle(d.suggestedFilename().includes("fos"), "certificaat gedownload");
  // vliegtuig: schakelaar, onderdelen, uit elkaar, kinderen
  await p.goto(BASIS + "/?stil"); await p.waitForFunction(() => window.__klaar);
  await p.click('.voertuig a[href="/vliegtuig"]'); await p.waitForFunction(() => window.__klaar);
  controle((await p.textContent("#inhoud h2")) === "Het vliegtuig", "vliegtuig geopend via de schakelaar");
  for (let i = 0; i < 6; i++) { await p.click("#verder"); await p.waitForTimeout(250); }
  controle((await p.textContent("#inhoud h2")) === "De cockpit", "zeven onderdelen van het vliegtuig");
  controle((await p.locator("details.weetjes").count()) === 1, "weetjes bij het vliegtuig");
  await p.click("#uiteenknop"); await p.waitForTimeout(2200);
  controle((await p.locator("#namen .naam").count()) >= 6, "vliegtuig uit elkaar met namen");
  await p.goto(BASIS + "/kinderen/vliegtuig?stil"); await p.waitForFunction(() => window.__klaar);
  await p.click("#kindvolgende"); await p.click("#kindvolgende"); await p.waitForTimeout(200);
  controle((await p.textContent("#kindnaam")) === "de motor", "kinderen: de motor");
  await p.click("#kindknop");
  await p.goto(BASIS + "/hoe-dit-werkt"); controle((await p.textContent("h1")).includes("Hoe dit werkt"), "hoe-dit-werkt");
  await b.close();
  console.log(fouten.length ? fouten.join("\n") : "alles doorgeklikt, geen fouten");
  process.exit(fouten.length ? 1 : 0);
})();
