//# sourceMappingURL=math.js.map

console.log("Content script loaded.");


function parseLatex(latex) {
    latex = latex.replaceAll("\\cdot", "*")
        .replaceAll("\\left(", "(")
        .replaceAll("\\right)", ")")
        .replace(/\\sqrt\{([^}]+)\}/g, '($1)^0.5')
        .replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, '($2)^(1/$1)')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
        .replaceAll(" ", "")
        .replaceAll("{", "")
        .replaceAll("}", "")
        .replaceAll("°", "deg")
        .replaceAll("\\", "")
        .replaceAll(" ", "")


    console.log(latex)
    try {
        let result = math.evaluate(latex);
        if (!isNaN(result)) result = Math.round(result * 1000) / 1000
        console.log(result);
        return result;
    } catch (err) {
        console.log("Invalid expression")
    }
}


function addAltEnterListener() {
    if (!document.getElementsByTagName("iframe")[0]) return;
    let iframe = document.getElementsByTagName("iframe")[0].contentDocument;
    const richTextEditor = iframe.querySelector('.answer.rich-text-editor');
    if (!richTextEditor) return;
    const mathEditor = richTextEditor.querySelector(".math-editor-equation-field.mq-editable-field.mq-math-mode")
    if (mathEditor && !mathEditor.hasAltEnterListener) {
        console.log("found an element")
        mathEditor.hasAltEnterListener = true;

        richTextEditor.addEventListener('keydown', function (event) {
            if (event.altKey && event.key === 'Enter') {
                const latexEditor = iframe.querySelector('.math-editor textarea.math-editor-latex-field');
                let selectedText = iframe.getSelection().toString();
                console.log("SELECTED", selectedText);
                const parsedLatex = parseLatex(selectedText);
                console.log("COMPUTED", parsedLatex)
                if (parsedLatex == undefined) return
                selectedText = selectedText.replaceAll(" ", "");
                latexEditor.value = latexEditor.value.replace(selectedText, parsedLatex);
                latexEditor.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (event.key === '=') {
                setTimeout(() => {
                    const latexEditor = iframe.querySelector('.math-editor textarea.math-editor-latex-field');
                    let expression = latexEditor.value.split("=")[latexEditor.value.split("=").length - 2]
                    const parsedLatex = parseLatex(expression);
                    if (parsedLatex == undefined) return;


                    let t = document.createElement("span")
                    t.style.fontFamily = "auto";
                    t.style.color = "#a8a8a8";
                    richTextEditor.querySelector(".mq-root-block.mq-hasCursor").appendChild(t)
                    t.innerText = parsedLatex;

                    richTextEditor.addEventListener('keydown', function (event) {
                        t.remove();
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            latexEditor.value = latexEditor.value + parsedLatex;
                            latexEditor.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }, { once: true });
                    console.log("Added listener");

                }, 100)
            }
        });

    }
}

setInterval(addAltEnterListener, 500);
