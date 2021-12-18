import exampleTest from './example.spec.js'
const start = performance.now();
const resultDiv = document.createElement("div");
document.querySelector('main').appendChild(resultDiv)
const results = await exampleTest.run()
document.getElementById('tests-loader').hidden = true
const end = performance.now();
const p = document.createElement("p");
p.innerText = `${exampleTest.title}: ${(end - start).toFixed(1)} ms`;
resultDiv.appendChild(p);
results
    .map(({ title, passed, skipped, error }) => {
        if (passed) return { text: `✓ ${title}`, style: "color:teal;" };
        if (skipped)
            return { text: `□ ${title}`, style: "color:orange;" };
        if (!passed)
            return { text: `𐄂 ${title}`, style: "color:red;", error };
    })
    .forEach(({ text, style, error }) => {
        const p = document.createElement("p");
        p.innerText = text;
        p.style = style;
        if (error) {
            const br = document.createElement("br");
            p.appendChild(br);
            const em = document.createElement("em");
            em.innerText = error.message;
            p.appendChild(em);
        }
        resultDiv.appendChild(p);
    });
