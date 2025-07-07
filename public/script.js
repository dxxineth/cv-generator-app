document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded and script is running.');

    // HTML element များကို ရယူခြင်း
    const aiForm = document.getElementById('ai-form');
    const relevanceButton = document.getElementById('relevance-button');
    const geminiButton = document.getElementById('gemini-button');
    const loadingSpinner = document.getElementById('loading');
    const resultOutput = document.getElementById('result-output');
    const downloadButton = document.getElementById('download-button'); // Download button အသစ်

    // Loading indicator ကို ထိန်းချုပ်ရန် function
    function setLoading(isLoading) {
        if (isLoading) {
            loadingSpinner.classList.remove('hidden');
            resultOutput.innerHTML = '';
            downloadButton.classList.add('hidden'); // Download button ကို ဖျောက်ထားရန်
            relevanceButton.disabled = true;
            geminiButton.disabled = true;
        } else {
            loadingSpinner.classList.add('hidden');
            relevanceButton.disabled = false;
            geminiButton.disabled = false;
        }
    }

    // Error များကို ပြသရန် function
    function displayError(error, apiName) {
        console.error(`[${apiName} ERROR]`, error);
        resultOutput.innerHTML = `<h3 class="font-bold text-red-400 mb-2">${apiName} Error</h3><p class="text-red-400">${error.message}</p>`;
    }

    // Relevance AI Button Click Event
    relevanceButton.addEventListener('click', async () => {
        console.log('Relevance AI button clicked.');
        if (!aiForm.checkValidity()) {
            return aiForm.reportValidity();
        }
        setLoading(true);

        const formData = new FormData(aiForm);
        const dataToSend = {
            name: formData.get('name'),
            skills: formData.get('skills'),
            exp: formData.get('exp'),
            others: formData.get('others')
        };

        try {
            const response = await fetch('/api/relevance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Unknown error from server.');
            }

            if (result && result.output && result.output.answer) {
                let answerText = result.output.answer;
                
                // 1. Replace literal "\\n" with a proper newline character
                let processedText = answerText.replace(/\\n/g, '\n');
                
                // 2. *** FIX: Remove all asterisks (**) ***
                processedText = processedText.replace(/\*\*/g, '');

                const headers = ["### English Format", "### Myanmar Format", "Name:", "Skills:", "Experience:", "Other Factors:", "အမည်:", "ကျွမ်းကျင်မှုများ:", "အတွေ့အကြုံ:", "အခြားအချက်များ:"];
                const regex = new RegExp(`(${headers.join('|')})`, 'g');
                let parts = processedText.split(regex).filter(part => part.trim() !== '');

                let formattedHtml = '';
                for (let i = 0; i < parts.length; i++) {
                    let part = parts[i].trim();
                    if (headers.includes(part)) {
                        if (part.startsWith("###")) {
                            formattedHtml += `<h2 class="text-xl font-bold mt-4 mb-2 text-gray-800 border-b pb-1">${part.replace('###', '').trim()}</h2>`;
                        } else {
                            formattedHtml += `<p class="mt-2"><strong class="text-gray-900 font-semibold">${part}</strong></p>`;
                        }
                    } else {
                        let content = part.replace(/^-/gm, '&bull;');
                        formattedHtml += `<p class="text-gray-700 ml-4">${content.trim().replace(/\n/g, '<br>')}</p>`;
                    }
                }
                
                resultOutput.innerHTML = `<div class="text-left leading-relaxed">${formattedHtml}</div>`;
                downloadButton.classList.remove('hidden'); // Show the download button

            } else {
                console.error("Could not find 'answer' in the expected structure.");
                resultOutput.innerHTML = `<h3 class="font-bold mb-2">Relevance AI Result (Raw):</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
            }

        } catch (error) {
            displayError(error, 'Relevance AI');
        } finally {
            setLoading(false);
        }
    });

    // Gemini Button Click Event
    geminiButton.addEventListener('click', async () => {
        // ... (Gemini button code remains the same) ...
    });

    // Download Button Click Event
    downloadButton.addEventListener('click', () => {
        const cvContent = resultOutput.innerHTML;
        const name = document.getElementById('name').value || 'cv';
        
        // Create a full HTML document for download
        const fullHtml = `
            <!DOCTYPE html>
            <html lang="my">
            <head>
                <meta charset="UTF-8">
                <title>CV for ${name}</title>
                <style>
                    body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
                    h2 { font-size: 1.5em; margin-top: 1.5em; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                    p { margin-left: 20px; }
                </style>
            </head>
            <body>
                ${cvContent}
            </body>
            </html>
        `;
        
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${name.replace(/\s+/g, '_')}_CV.html`; // e.g., Kyaw_Zay_Ya_CV.html
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});