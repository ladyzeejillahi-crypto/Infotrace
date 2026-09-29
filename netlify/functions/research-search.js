const {
    extractText,
    getDocumentProxy
} = require("unpdf");


exports.handler = async function(event) {

    try {

        const query =
            event.queryStringParameters &&
            event.queryStringParameters.q
                ? event.queryStringParameters.q.trim()
                : "";


        if (!query) {

            return {
                statusCode: 400,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    error: "Search query is required."
                })
            };

        }


        /*
        =====================================================
        SEARCH 1 — SEMANTIC SCHOLAR
        =====================================================
        */

        try {

            const semanticURL =
                "https://api.semanticscholar.org/graph/v1/paper/search" +
                "?query=" +
                encodeURIComponent(query) +
                "&limit=10" +
                "&fields=" +
                "title,authors,year,abstract,journal,url,externalIds,openAccessPdf";


            const semanticResponse =
                await fetch(semanticURL);


            if (semanticResponse.ok) {

                const data =
                    await semanticResponse.json();


                const papers =
                    (data.data || [])
                        .map(function(paper) {

                            const authors =
                                (paper.authors || [])
                                    .map(function(author) {
                                        return author.name;
                                    })
                                    .join(", ");


                            let sourceUrl =
                                paper.url || "";


                            if (
                                paper.externalIds &&
                                paper.externalIds.DOI
                            ) {

                                sourceUrl =
                                    "https://doi.org/" +
                                    paper.externalIds.DOI;

                            }


                            let pdfUrl = "";


                            if (
                                paper.openAccessPdf &&
                                paper.openAccessPdf.url
                            ) {

                                pdfUrl =
                                    paper.openAccessPdf.url;

                            }


                            return {

                                title:
                                    paper.title ||
                                    "Untitled research paper",

                                authors:
                                    authors ||
                                    "Author information unavailable",

                                year:
                                    paper.year ||
                                    "Year unavailable",

                                abstract:
                                    paper.abstract ||
                                    "No abstract available.",

                                journal:
                                    paper.journal &&
                                    paper.journal.name
                                        ? paper.journal.name
                                        : "Publication information unavailable",

                                url:
                                    sourceUrl,

                                pdfUrl:
                                    pdfUrl

                            };

                        });


                if (papers.length > 0) {

                    const processed =
                        await processPapers(papers);


                    return {

                        statusCode: 200,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                papers:
                                    processed,

                                source:
                                    "Semantic Scholar"

                            })

                    };

                }

            }

        }
        catch (semanticError) {

            console.log(
                "Semantic Scholar unavailable. Trying OpenAlex.",
                semanticError.message
            );

        }


        /*
        =====================================================
        SEARCH 2 — OPENALEX FALLBACK
        =====================================================
        */

        try {

            const openAlexURL =
                "https://api.openalex.org/works" +
                "?search=" +
                encodeURIComponent(query) +
                "&per-page=10";


            const openAlexResponse =
                await fetch(openAlexURL);


            if (!openAlexResponse.ok) {

                return {

                    statusCode:
                        openAlexResponse.status,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            error:
                                "Academic search services are temporarily unavailable."

                        })

                };

            }


            const openAlexData =
                await openAlexResponse.json();


            const papers =
                (openAlexData.results || [])
                    .map(function(work) {

                        const authors =
                            (work.authorships || [])
                                .map(function(author) {

                                    return author.author &&
                                        author.author.display_name
                                        ? author.author.display_name
                                        : "";

                                })
                                .filter(Boolean)
                                .join(", ");


                        let sourceUrl =
                            work.doi ||
                            work.id ||
                            "";


                        if (
                            work.doi &&
                            work.doi.startsWith(
                                "https://doi.org/"
                            )
                        ) {

                            sourceUrl =
                                work.doi;

                        }


                        const journal =
                            work.primary_location &&
                            work.primary_location.source &&
                            work.primary_location.source.display_name
                                ? work.primary_location.source.display_name
                                : "Publication information unavailable";


                        let pdfUrl = "";


                        if (
                            work.open_access &&
                            work.open_access.oa_url
                        ) {

                            pdfUrl =
                                work.open_access.oa_url;

                        }


                        if (
                            !pdfUrl &&
                            work.primary_location &&
                            work.primary_location.pdf_url
                        ) {

                            pdfUrl =
                                work.primary_location.pdf_url;

                        }


                        return {

                            title:
                                work.title ||
                                "Untitled research paper",

                            authors:
                                authors ||
                                "Author information unavailable",

                            year:
                                work.publication_year ||
                                "Year unavailable",

                            abstract:
                                reconstructAbstract(
                                    work.abstract_inverted_index
                                ),

                            journal:
                                journal,

                            url:
                                sourceUrl,

                            pdfUrl:
                                pdfUrl

                        };

                    });


            const processed =
                await processPapers(papers);


            return {

                statusCode: 200,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        papers:
                            processed,

                        source:
                            "OpenAlex"

                    })

            };

        }
        catch (openAlexError) {

            console.error(
                "OpenAlex error:",
                openAlexError
            );


            return {

                statusCode: 500,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        error:
                            "Unable to search academic sources."

                    })

            };

        }

    }
    catch (error) {

        console.error(
            "Research search error:",
            error
        );


        return {

            statusCode: 500,

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify({

                    error:
                        "Unable to search academic sources."

                })

        };

    }

};
/*
=========================================================
PROCESS PAPERS
=========================================================
*/

async function processPapers(papers) {

    const processed = [];


    for (const paper of papers) {

        let fullText = "";

        let fullTextAvailable = false;


        /*
        -----------------------------------------
        TRY TO READ THE PDF
        -----------------------------------------
        */

        if (paper.pdfUrl) {

            try {

                const pdfResponse =
                    await fetch(paper.pdfUrl);


                if (pdfResponse.ok) {

                    const contentType =
                        (
                            pdfResponse.headers.get(
                                "content-type"
                            ) || ""
                        ).toLowerCase();


                    /*
                    -----------------------------------------
                    MAKE SURE IT IS ACTUALLY A PDF
                    -----------------------------------------
                    */

                    if (
                        contentType.includes(
                            "application/pdf"
                        )
                    ) {

                        const buffer =
                            await pdfResponse.arrayBuffer();


                        /*
                        -----------------------------------------
                        CREATE PDF DOCUMENT
                        -----------------------------------------
                        */

                        const pdf =
                            await getDocumentProxy(
                                new Uint8Array(buffer)
                            );


                        /*
                        -----------------------------------------
                        EXTRACT PDF TEXT
                        -----------------------------------------
                        */

                        const result =
                            await extractText(
                                pdf,
                                {
                                    mergePages: true
                                }
                            );


                        fullText =
                            typeof result.text === "string"
                                ? result.text
                                : "";


                        if (fullText.trim()) {

                            fullTextAvailable = true;

                        }

                    }

                }

            }
            catch (pdfError) {

                console.log(
                    "Could not read PDF:",
                    paper.pdfUrl,
                    pdfError.message
                );

            }

        }


        processed.push({

            title:
                paper.title,

            authors:
                paper.authors,

            year:
                paper.year,

            abstract:
                paper.abstract,

            journal:
                paper.journal,

            url:
                paper.url,

            pdfUrl:
                paper.pdfUrl,

            fullText:
                fullText,

            fullTextAvailable:
                fullTextAvailable

        });

    }


    return processed;

}


/*
=========================================================
RECONSTRUCT OPENALEX ABSTRACT
=========================================================
*/

function reconstructAbstract(
    invertedIndex
) {

    if (!invertedIndex) {

        return "No abstract available.";

    }


    const words = [];


    Object.keys(
        invertedIndex
    ).forEach(
        function(word) {

            const positions =
                invertedIndex[word];


            positions.forEach(
                function(position) {

                    words[position] =
                        word;

                }
            );

        }
    );


    const abstract =
        words
            .filter(Boolean)
            .join(" ");


    return (
        abstract ||
        "No abstract available."
    );

}
