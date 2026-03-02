const pplListEl = document.querySelector(".js-pplList");

fetch("./data/ppls.json")
  .then((r) => r.json()) // load json
  .then((data) => {
    // normalize top-level shape: object -> array of {id, ...person}
    let pplArray = [];
    if (Array.isArray(data)) {
      pplArray = data.map((p, i) =>
        p && p.id ? p : { id: p && p.id ? p.id : String(i), ...p },
      );
    } else if (data && typeof data === "object") {
      pplArray = Object.entries(data).map(([id, person]) => ({
        id,
        ...person,
      }));
    }

    // sort by `bir` ascending (lower bir first)
    pplArray.sort((a, b) => {
      const av =
        a && typeof a === "object" && a.bir != null ? Number(a.bir) : Infinity;
      const bv =
        b && typeof b === "object" && b.bir != null ? Number(b.bir) : Infinity;
      return av - bv;
    });

    pplListEl.innerHTML = "";
    pplListEl.style.position = "relative";

    // create SVG overlay for lines
    let svg = document.getElementById("ppl-lines-svg");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("id", "ppl-lines-svg");
      svg.style.position = "absolute";
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
      pplListEl.appendChild(svg);
    }

    // render people as items with data-id so we can connect them
    pplArray.forEach((person) => {
      const li = document.createElement("div");
      li.style.cursor = "pointer";
      li.classList.add("pp-card");
      li.setAttribute("data-id", person.id || "");
      li.style.display = "inline-block";
      li.style.margin = "6px";
      li.style.padding = "8px";
      li.style.border = "1px solid #ccc";
      li.style.borderRadius = "4px";
      li.textContent =
        (person.n || "") +
          (person.fa && person.fa.d ? " " + person.fa.d : "") ||
        person.id ||
        "Unknown";

      li.addEventListener("click", () => {
        if (typeof dP === "function") dP(person);
        else console.warn("display function dP not found", person);
      });

      pplListEl.appendChild(li);
    });

    // draw lines connecting to fa and mo
    function drawConnections() {
      const rect = pplListEl.getBoundingClientRect();
      svg.setAttribute("width", rect.width);
      svg.setAttribute("height", rect.height);
      svg.innerHTML = "";

      pplArray.forEach((p) => {
        const src = pplListEl.querySelector(`[data-id="${p.id}"]`);
        if (!src) return;
        ["fa", "mo"].forEach((field) => {
          const rel = p[field] && p[field].id;
          if (!rel) return;
          const tgt = pplListEl.querySelector(`[data-id="${rel}"]`);
          if (!tgt) return;
          const sRect = src.getBoundingClientRect();
          const tRect = tgt.getBoundingClientRect();
          const x1 = sRect.left + sRect.width / 2 - rect.left; // center bottom of source
          const y1 = sRect.top + sRect.height - rect.top; // bottom of source
          const x2 = tRect.left + tRect.width / 2 - rect.left; // center top of target
          const y2 = tRect.top - rect.top; // top of target
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line",
          );
          line.setAttribute("x1", x1);
          line.setAttribute("y1", y1);
          line.setAttribute("x2", x2);
          line.setAttribute("y2", y2);
          line.setAttribute("stroke", field === "fa" ? "#1e90ff" : "#ff4500");
          line.setAttribute("stroke-width", "2");
          svg.appendChild(line);
        });
      });
    }

    setTimeout(drawConnections, 50);
    window.addEventListener("resize", () => setTimeout(drawConnections, 100));
  });
function dP(p) {
  const d = window.ppls;
  //const m = d?.[p] || {};

  const display = document.createElement("div");
  display.classList.add("person");
  display.id = "pdisplay";
  document.body.appendChild(display);
  const sex = p.m === true ? "&#128104; " : "&#128105; ";
  const fat = p.n ? p.n + " " + p.fa.d : "";
  const t = p.t ? p.t : "";
  const tit = p.tit ? p.tit : "";
  const bro = p.bro
    ? p.bro
        .map((item) => `<li onclick="console.log(${item})">${item.d}</li>`)
        .join("")
    : "";
  const kid = p.kid ? p.kid.map((item) => `<li>${item.d}</li>`).join("") : "";
  const part = p.part
    ? p.part.map((item) => `<li>${item.d}</li>`).join("")
    : "";
  const land = p.anow ? p.anow.l : "";
  //const root = p.aroo ? p.aroo.d : "";
  //const bir = p.abir ? p.abir.d : "";
  const info = p.info ? p.info.map((item) => `<li>${item}</li>`).join("") : "";

  display.innerHTML = `
  <div onclick="de()" class="x">X</div>
  <h3>${sex}</h3>
  <h2> ${t} ${tit} ${fat}  </h2>
  <h3> ኣሕዋት</h3>
  <h4 class= "bro">${bro}</h4>
  <h3>መጻምድቲ</h3>
  <h4 class= "bro"> ${part} </h4>
  <h3>ቆልዑ</h3>  
  <h4 class= "bro">${kid} </h4> 
  <div class= "pdetails">       
  <h4>አድራሻ</h4>
  <ul>${land}</ul>
   
  <h4>ሓበሬታ</h4>
  <ul>${info}</ul>
  </div>
  <button class="xbtn" onclick="de()">Close</button>
  `;
  // console.log(d);
  // console.log(d[p]);
}

function de() {
  const display = document.getElementById("pdisplay");
  if (display) {
    display.remove();
  }
}
