<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Research Discovery - InfoTrace</title>

    <link
        rel="stylesheet"
        href="style.css"
    >

    <link
        rel="stylesheet"
        href="design.css"
    >

    <style>

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f4f8f5;
            color: #173b2b;
        }

        .research-container {
            width: 92%;
            max-width: 1000px;
            margin: 30px auto;
        }

        .top-bar {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
        }

        .back-btn {
            text-decoration: none;
            background: white;
            color: #176b45;
            padding: 10px 15px;
            border-radius: 8px;
            font-weight: bold;
            border: 1px solid #dce9df;
        }

        .intro {
            background: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .intro h1 {
            margin-top: 0;
            color: #176b45;
        }

        .search-box {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        label {
            display: block;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 7px;
        }

        input,
        textarea,
        select {
            width: 100%;
            box-sizing: border-box;
            padding: 12px;
            border: 1px solid #cfded4;
            border-radius: 8px;
            font-size: 15px;
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        .search-btn {
            margin-top: 20px;
            width: 100%;
            padding: 13px;
            border: none;
            border-radius: 8px;
            background: #176b45;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        }

        .search-btn:disabled {
            background: #8aa99a;
            cursor: not-allowed;
        }

        #status {
            margin-top: 20px;
            padding: 12px;
            border-radius: 8px;
            display: none;
        }

        .loading {
            background: #eef6f1;
            color: #176b45;
            display: block !important;
        }

        .error {
            background: #fff0f0;
            color: #a12626;
            display: block !important;
        }

        .results {
            margin-top: 25px;
        }

        .paper {
            background: white;
            padding: 22px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .paper h2 {
            margin-top: 0;
            color: #176b45;
        }

        .paper-meta {
            color: #66776d;
            font-size: 14px;
            line-height: 1.6;
        }

        .abstract {
            margin-top: 15px;
            line-height: 1.6;
        }

        .requested {
            margin-top: 20px;
            padding: 18px;
            background: #f0f8f3;
            border-left: 4px solid #176b45;
            border-radius: 6px;
        }

        .requested h3 {
            margin-top: 0;
            color: #176b45;
        }

        .extracted-text {
            white-space: pre-wrap;
            line-height: 1.7;
        }

        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
        }

        .action-btn {
            display: inline-block;
            padding: 10px 14px;
            border-radius: 7px;
            text-decoration: none;
            border: none;
            cursor: pointer;
            font-weight: bold;
        }

        .source-btn {
            background: #eaf3ed;
            color: #176b45;
        }

        .download-btn {
            background: #176b45;
            color: white;
        }

        .save-btn {
            background: #dcefe3;
            color: #176b45;
        }

        .unavailable {
            background: #fff8e8;
            border-left: 4px solid #d69e2e;
            padding: 15px;
            margin-top: 15px;
            border-radius: 6px;
        }

        .no-results {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
        }

        @media (max-width: 600px) {

            .research-container {
                width: 94%;
            }

            .actions {
                flex-direction: column;
            }

            .action-btn {
                text-align: center;
            }

        }

    </style>

</head>


<body>


<div class="research-container">


    <div class="top-bar">

        <a
            href="dashboard.html"
            class="back-btn"
        >
            ← Dashboard
        </a>

    </div>


    <div class="intro">

        <h1>
            🔎 Research Discovery
        </h1>

        <p>
            Search academic research, read accessible full-text papers,
            find the information you need, and save useful findings
            directly to InfoTrace.
        </p>

        <p>
            The system will try to find an accessible PDF. If the full
            document is available, InfoTrace will read the document and
            search it for the information you requested.
        </p>

    </div>


    <div class="search-box">

        <label for="researchTopic">
            Research Topic
        </label>

        <input
            type="text"
            id="researchTopic"
            placeholder="e.g. Information literacy and academic performance among undergraduates"
        >


        <label for="researchNeed">
            What exactly do you want from the research?
        </label>

        <textarea
            id="researchNeed"
            placeholder="e.g. Find the effects of information literacy on academic performance."
        ></textarea>


        <label for="researchSection">
            Where will you use the information?
        </label>

        <input
            type="text"
            id="researchSection"
            placeholder="e.g. Literature Review"
        >


        <button
            type="button"
            class="search-btn"
            id="searchButton"
        >
            🔍 Search, Read & Extract
        </button>


        <div id="status"></div>

    </div>


    <div
        id="results"
        class="results"
    ></div>


</div>


<script>

    const searchButton =
        document.getElementById(
            "searchButton"
        );


    const statusBox =
        document.getElementById(
            "status"
        );


    const results =
        document.getElementById(
            "results"
        );


    searchButton.addEventListener(
        "click",
        searchResearch
    );


    async function searchResearch() {

        const topic =
            document.getElementById(
                "researchTopic"
            ).value.trim();


        const need =
            document.getElementById(
                "researchNeed"
            ).value.trim();


        const section =
            document.getElementById(
                "researchSection"
            ).value.trim();


        if (
            !topic ||
            !need
        ) {

            showError(
                "Please enter the research topic and what you want to find."
            );

            return;

        }


        searchButton.disabled =
            true;


        searchButton.innerText =
            "🔎 Searching and reading...";


        results.innerHTML =
            "";


        showLoading(
            "Searching academic sources and checking available full-text papers..."
        );


        try {

            const response =
                await fetch(
                    "/.netlify/functions/research-search?q=" +
                    encodeURIComponent(topic)
                );


            const data =
                await response.json();


            if (
                !response.ok
            ) {

                throw new Error(
                    data.error ||
                    "Academic search failed."
                );

            }


            hideStatus();


            if (
                !data.papers ||
                data.papers.length === 0
            ) {

                results.innerHTML =
                    `
                    <div class="no-results">
                        <h3>No research found</h3>
                        <p>
                            Try using different or broader search terms.
                        </p>
                    </div>
                    `;

                return;

            }


            data.papers.forEach(
                function(paper) {

                    displayPaper(
                        paper,
                        need,
                        section
                    );

                }
            );

        }
        catch (error) {

            showError(
                error.message ||
                "Unable to search academic sources."
            );

        }
        finally {

            searchButton.disabled =
                false;

            searchButton.innerText =
                "🔍 Search, Read & Extract";

        }

    }


    function displayPaper(
        paper,
        request,
        section
    ) {

        const article =
            document.createElement(
                "article"
            );


        article.className =
            "paper";


        const extracted =
            extractRequestedInformation(
                paper.fullText ||
                "",
                request
            );


        let html = "";


        html +=
            "<h2>" +
            escapeHTML(
                paper.title
            ) +
            "</h2>";


        html +=
            `
            <div class="paper-meta">
                <strong>Authors:</strong>
                ${escapeHTML(paper.authors || "Unavailable")}
                <br>

                <strong>Year:</strong>
                ${escapeHTML(String(paper.year || "Unavailable"))}
                <br>

                <strong>Publication:</strong>
                ${escapeHTML(paper.journal || "Unavailable")}
            </div>
            `;


        if (
            paper.fullTextAvailable
        ) {

            html +=
                `
                <div class="requested">

                    <h3>
                        🎯 Requested Information
                    </h3>

                    <div class="extracted-text">
                        ${escapeHTML(extracted)}
                    </div>

                </div>
                `;

        }
        else {

            html +=
                `
                <div class="unavailable">

                    <strong>
                        📖 Full text could not be accessed
                    </strong>

                    <p>
                        This result does not currently provide
                        an accessible PDF that InfoTrace can read.
                    </p>

                </div>
                `;

        }


        if (
            paper.abstract &&
            paper.abstract !==
            "No abstract available."
        ) {

            html +=
                `
                <div class="abstract">

                    <strong>
                        Abstract
                    </strong>

                    <p>
                        ${escapeHTML(
                            paper.abstract
                        )}
                    </p>

                </div>
                `;

        }


        html +=
            `
            <div class="actions">
            `;


        if (
            paper.url
        ) {

            html +=
                `
                <a
                    href="${escapeAttribute(paper.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="action-btn source-btn"
                >
                    🔗 View Source
                </a>
                `;

        }


        if (
            paper.pdfUrl
        ) {

            html +=
                `
                <a
                    href="${escapeAttribute(paper.pdfUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="action-btn download-btn"
                >
                    📥 Open / Download PDF
                </a>
                `;

        }


        html +=
            `
                <button
                    type="button"
                    class="action-btn save-btn"
                >
                    💾 Save to InfoTrace
                </button>

            </div>
            `;


        article.innerHTML =
            html;


        const saveButton =
            article.querySelector(
                ".save-btn"
            );


        saveButton.addEventListener(
            "click",
            function() {

                saveResearch(
                    paper,
                    extracted,
                    request,
                    section
                );

                saveButton.innerText =
                    "✅ Saved to InfoTrace";

                saveButton.disabled =
                    true;

            }
        );


        results.appendChild(
            article
        );

                }
    function extractRequestedInformation(
        text,
        request
    ) {

        if (!text) {

            return "No full-text content was available for extraction.";

        }


        const cleanText =
            text
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        const sentences =
            cleanText.split(
                /(?<=[.!?])\s+/
            );


        const requestWords =
            request
                .toLowerCase()
                .replace(
                    /[^a-z0-9\s]/g,
                    ""
                )
                .split(
                    /\s+/
                )
                .filter(
                    function(word) {

                        return word.length > 4;

                    }
                );


        const keywords = [];


        requestWords.forEach(
            function(word) {

                if (
                    !keywords.includes(word)
                ) {

                    keywords.push(word);

                }

            }
        );


        const requestLower =
            request.toLowerCase();


        if (
            requestLower.includes("problem") ||
            requestLower.includes("challenge") ||
            requestLower.includes("barrier") ||
            requestLower.includes("difficulty")
        ) {

            keywords.push(
                "problem",
                "challenge",
                "barrier",
                "difficulty",
                "limitation",
                "lack",
                "poor",
                "inadequate",
                "constraint"
            );

        }


        if (
            requestLower.includes("effect") ||
            requestLower.includes("impact") ||
            requestLower.includes("influence")
        ) {

            keywords.push(
                "effect",
                "impact",
                "influence",
                "relationship",
                "associated",
                "increase",
                "decrease",
                "improve"
            );

        }


        if (
            requestLower.includes("cause") ||
            requestLower.includes("factor")
        ) {

            keywords.push(
                "cause",
                "factor",
                "because",
                "due to",
                "contribute"
            );

        }


        if (
            requestLower.includes("recommend") ||
            requestLower.includes("solution")
        ) {

            keywords.push(
                "recommend",
                "recommendation",
                "suggest",
                "should",
                "need to",
                "propose"
            );

        }


        if (
            requestLower.includes("gap")
        ) {

            keywords.push(
                "research gap",
                "gap",
                "limited",
                "little research",
                "few studies",
                "understudied",
                "remains unclear"
            );

        }


        const matches =
            sentences.filter(
                function(sentence) {

                    const lower =
                        sentence.toLowerCase();


                    return keywords.some(
                        function(keyword) {

                            return lower.includes(
                                keyword
                            );

                        }
                    );

                }
            );


        const uniqueMatches = [];


        matches.forEach(
            function(sentence) {

                if (
                    !uniqueMatches.includes(
                        sentence
                    )
                ) {

                    uniqueMatches.push(
                        sentence
                    );

                }

            }
        );


        if (
            uniqueMatches.length === 0
        ) {

            return (
                "No directly matching passage was found in the accessible full text. " +
                "Try making your request more specific or use different keywords."
            );

        }


        return uniqueMatches
            .slice(0, 8)
            .join("\n\n");

    }


    function saveResearch(
        paper,
        extracted,
        request,
        section
    ) {

        let saved =
            JSON.parse(
                localStorage.getItem(
                    "infoTraceData"
                )
            ) || [];


        const record = {

            id:
                Date.now(),

            title:
                paper.title,

            information:
                extracted,

            source:
                paper.url ||
                paper.pdfUrl ||
                "Academic research source",

            location:
                paper.pdfUrl
                    ? "Academic PDF"
                    : "Academic database",

            reason:
                "Research Discovery",

            problem:
                request,

            keywords:
                request,

            used:
                "No",

            usage:
                section ||
                "Research",

            notes:
                "Extracted by InfoTrace Research Discovery from an accessible full-text research document.\n\n" +
                "Authors: " +
                (paper.authors || "Unavailable") +
                "\n\nYear: " +
                (paper.year || "Unavailable") +
                "\n\nPDF: " +
                (paper.pdfUrl || "Not available"),

            date:
                new Date().toLocaleString()

        };


        saved.push(
            record
        );


        localStorage.setItem(
            "infoTraceData",
            JSON.stringify(
                saved
            )
        );


        alert(
            "Research information saved successfully to InfoTrace."
        );

    }


    function showLoading(
        message
    ) {

        statusBox.className =
            "loading";

        statusBox.innerText =
            message;

    }


    function showError(
        message
    ) {

        statusBox.className =
            "error";

        statusBox.innerText =
            message;

    }


    function hideStatus() {

        statusBox.style.display =
            "none";

        statusBox.className =
            "";

        statusBox.innerText =
            "";

    }


    function escapeHTML(
        value
    ) {

        return String(
            value || ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function escapeAttribute(
        value
    ) {

        return escapeHTML(
            value
        );

    }

</script>


</body>

</html>
