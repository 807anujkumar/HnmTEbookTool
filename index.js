function mergeLessonHeadingsAuto(doc) {
    // Get all h2 elements
    const headings = Array.from(doc.querySelectorAll("h2"));

    for (let i = 0; i < headings.length - 1; i++) {
        const h2_1 = headings[i];
        const h2_2 = headings[i + 1];

        const text1 = h2_1.textContent.trim().toLowerCase();
        const match = text1.match(/^unit \d+: lesson \d+/i); // Match pattern "Unit X: Lesson Y"

        if (match) {
            // Mark both h2 elements as aria-hidden
            h2_1.setAttribute("aria-hidden", "true");
            h2_2.setAttribute("aria-hidden", "true");

            // Create a new <h2> element for the merged content
            const merged = doc.createElement("h2");
            merged.className = "hidden";
            merged.textContent = `${h2_1.textContent.trim()} ${h2_2.textContent.trim()}`;

            // Insert the new merged h2 after the second h2
            h2_2.parentNode.insertBefore(merged, h2_2.nextSibling);

            // Skip the next h2 since it's already merged
            i++;
        }
    }
}
function hidePlanningAndBackground(doc) {
    const targetPhrases = ["math background","Daily Routines","Quick Practice","planning"];
    const paragraphs = doc.querySelectorAll("p");
  
    paragraphs.forEach(p => {
      const text = p.textContent.trim().toLowerCase();
      if (targetPhrases.includes(text)) {
        p.setAttribute("aria-hidden", "true");
      }
    });
  }
let selectedFiles = [];

        document.getElementById("fileInput").addEventListener("change", (e) => {
        selectedFiles = Array.from(e.target.files).filter(file => file.name.endsWith(".xhtml"));
        document.getElementById("logBox").textContent = `📂 ${selectedFiles.length} XHTML files selected.`;
        });

        function log(message) {
        const box = document.getElementById("logBox");
        box.textContent += "\n" + message;
        }

        function addChangeLog(fileName, changeType, before, after) {
        const tableBody = document.querySelector("#changesTable tbody");
        const row = document.createElement("tr");

        const fileCell = document.createElement("td");
        fileCell.textContent = fileName;
        row.appendChild(fileCell);

        const changeTypeCell = document.createElement("td");
        changeTypeCell.textContent = changeType;
        row.appendChild(changeTypeCell);

        const beforeCell = document.createElement("td");
        beforeCell.textContent = before;
        row.appendChild(beforeCell);

        const afterCell = document.createElement("td");
        afterCell.textContent = after;
        row.appendChild(afterCell);

        tableBody.appendChild(row);
        }

        function processFiles() {
        if (selectedFiles.length === 0) {
            alert("Please select a folder with XHTML files.");
            return;
        }

        const zip = new JSZip();
        let processedCount = 0;

        selectedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onload = function (event) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(event.target.result, "application/xhtml+xml");

            let updated = false;
            mergeLessonHeadingsAuto(doc);
            hidePlanningAndBackground(doc);

            // UL.s1 => remove class from UL, add to its LI children
            const uls = doc.querySelectorAll("ul.s1");
            uls.forEach((ul) => {
                const beforeChange = ul.outerHTML;

                ul.removeAttribute("class");
                ul.querySelectorAll(":scope > li").forEach((li) => li.classList.add("s1"));

                const afterChange = ul.outerHTML;
                addChangeLog(file.name, "UL.s1 Modification", beforeChange, afterChange);
                updated = true;
            });

            // OL.s1 => remove class from OL, add to its LI children
            const ols = doc.querySelectorAll("ol.s1");
            ols.forEach((ol) => {
                const beforeChange = ol.outerHTML;

                ol.removeAttribute("class");
                ol.querySelectorAll(":scope > li").forEach((li) => li.classList.add("s1"));

                const afterChange = ol.outerHTML;
                addChangeLog(file.name, "OL.s1 Modification", beforeChange, afterChange);
                updated = true;
            });

            // role attributes for aside and header
            doc.querySelectorAll("aside").forEach(el => {
                el.setAttribute("role", "complementary");
                updated = true;
            });
            doc.querySelectorAll("header").forEach(el => {
                el.setAttribute("role", "banner");
                updated = true;
            });

            // h3 combining logic
            const keywords = ["WARM UP", "PRACTICE", "WE DO", "YOU DO", "I DO", "LEARN"];
            const h3s = Array.from(doc.querySelectorAll("h3"));
            for (let i = 0; i < h3s.length - 1; i++) {
                const text1 = h3s[i].textContent.trim().toUpperCase();
                const text2 = h3s[i + 1].textContent.trim();
                if (keywords.includes(text1)) {
                const beforeChange = h3s[i].outerHTML + h3s[i + 1].outerHTML;

                h3s[i].setAttribute("aria-hidden", "true");
                h3s[i + 1].setAttribute("aria-hidden", "true");

                const combined = `${text1} ${text2}`;
                const newH3 = doc.createElement("h3");
                newH3.setAttribute("class", "hidden");
                newH3.textContent = combined;

                h3s[i + 1].parentNode.insertBefore(newH3, h3s[i + 1].nextSibling);

                const afterChange = newH3.outerHTML;
                addChangeLog(file.name, "H3 Combination", beforeChange, afterChange);
                updated = true;
                i++;
                }
            }
// we add new functionality which help in Accecbility
// New logic: Hide number + heading h3 with keywords, add combined hidden h3
const hideKeywords = [
  "Teaching the Lesson",
  "Differentiated Instruction",
  "Homework",
  "Home or School Activity",
  "Home and School Connection"
];

const allH3s = Array.from(doc.querySelectorAll("h3"));
for (let i = 0; i < allH3s.length - 1; i++) {
  const currentText = allH3s[i].textContent.trim();
  const nextText = allH3s[i + 1]?.textContent.trim();

  if (
    /^\d+$/.test(currentText) && // current is number
    hideKeywords.some(k => nextText?.includes(k)) // next contains keyword
  ) {
    const numH3 = allH3s[i];
    const keywordH3 = allH3s[i + 1];

    const beforeChange = numH3.outerHTML + keywordH3.outerHTML;

    numH3.setAttribute("aria-hidden", "true");
    keywordH3.setAttribute("aria-hidden", "true");

    // create new combined <h3 class="hidden">
    const newH3 = doc.createElement("h3");
    newH3.setAttribute("class", "hidden");
    newH3.textContent = `${currentText} ${nextText}`;

    keywordH3.parentNode.insertBefore(newH3, keywordH3.nextSibling);

    const afterChange = newH3.outerHTML;
    addChangeLog(file.name, "Combined H3 for Keyword Section", beforeChange, afterChange);
    updated = true;

    i++; // skip next
  }
}

  
     // Add aria-hidden="true" to specific <p> tags
            // Add aria-hidden="true" to specific <p> tags and the one just before it
    const mainTag = doc.querySelector("main");
    if (mainTag) {
    const pTags = Array.from(mainTag.querySelectorAll("p"));

    pTags.forEach((p, index) => {
        const pText = p.textContent.replace(/\s+/g, " ").trim();

        // Check if this <p> contains "Teaching the Lesson"
        if (/Teaching the Lesson/.test(pText)) {
        const prev = pTags[index - 1];
        if (prev) {
            const prevText = prev.textContent.replace(/\s+/g, " ").trim();

            // Check if previous <p> only contains a number
            if (/^\d+$/.test(prevText)) {
            // Add aria-hidden to current <p>
            const beforeCurrent = p.outerHTML;
            p.setAttribute("aria-hidden", "true");
            const afterCurrent = p.outerHTML;
            addChangeLog(file.name, `aria-hidden added to <p> (${pText})`, beforeCurrent, afterCurrent);
            updated = true;

            // Add aria-hidden to previous <p>
            const beforePrev = prev.outerHTML;
            prev.setAttribute("aria-hidden", "true");
            const afterPrev = prev.outerHTML;
            addChangeLog(file.name, `aria-hidden added to previous <p> (${prevText})`, beforePrev, afterPrev);
            updated = true;
            }
        }
        }
    });
    }
 const serializer = new XMLSerializer();
            const updatedContent = serializer.serializeToString(doc);
            zip.file(file.webkitRelativePath, updatedContent);

            log(`✅ ${file.webkitRelativePath} processed.`);

            processedCount++;
            if (processedCount === selectedFiles.length) {
                zip.generateAsync({ type: "blob" }).then((blob) => {
                saveAs(blob, "Updated_XHTML_Files.zip");
                log("\n🎉 All files processed. Zip ready to download.");
                });
            }
            };

            reader.readAsText(file);
        });
        }