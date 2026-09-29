const { extractText } = require("unpdf");


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
         * =====================================================
         * SEARCH SEMANTIC SCHOLAR
         * =====================================================
         */

        let papers = [];


        try {

            const semanticURL =
                "https://api.semanticscholar.org/graph/v1/paper/search" +
                "?query=" +
                encodeURIComponent(query) +
                "&limit=10" +
                "&fields=title,authors,year,abstract,journal,url,externalIds,openAccessPdf";


            const response =
                await fetch(semanticURL);


            if (response.ok) {

                const data =
                    await response.json();


                papers =
                    (data.data || []).map(
                        function(paper) {

                            const authors =
                                (paper.authors || [])
                                    .map(
                                        function(author) {
                                            return author.name;
                                        }
                                    )
                                    .join(", ");


                            let sourceUrl =
                                paper.url || "";


                            let pdfUrl = "";


                            if (
                                paper.openAccessPdf &&
                                paper.openAccessPdf.url
                            ) {

                                pdfUrl =
                                    paper.openAccessPdf.url;

                            }


                            if (
                                paper.externalIds &&
                                paper.externalIds.DOI
                            ) {

                                sourceUrl =
                                    "https://doi.org/" +
                                    paper.externalIds.DOI;

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

                        }
                    );

            }

        }
        catch (error) {

            console.log(
                "Semantic Scholar search failed."
            );

        }


        /*
         * =====================================================
         * OPENALEX FALLBACK
         * =====================================================
         */

        if (
            papers.length === 0
        ) {

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
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        error:
                            "Academic search services are temporarily unavailable."

                    })

                };

            }


            const openAlexData =
                await openAlexResponse.json();


            papers =
                (openAlexData.results || [])
                    .map(
                        function(work) {

                            const authors =
                                (work.authorships || [])
                                    .map(
                                        function(author) {

                                            return author.author &&
                                                author.author.display_name
                                                ? author.author.display_name
                                                : "";

                                        }
                                    )
                                    .filter(Boolean)
                                    .join(", ");


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

                        }
                    );

        }


        /*
         * =====================================================
         * TRY TO READ ACCESSIBLE PDF
         * =====================================================
         */

        const readablePapers = [];


        for (
            const paper of papers
        ) {

            let fullText = "";


            if (
                paper.pdfUrl
            ) {

                try {

                    const pdfResponse =
                        await fetch(
                            paper.pdfUrl
                        );


                    if (
                        pdfResponse.ok
                    ) {

                        const contentType =
                            pdfResponse.headers.get(
                                "content-type"
                            ) || "";


                        if (
                            contentType.includes(
                                "pdf"
                            )
                        ) {

                            const buffer =
                                await pdfResponse.arrayBuffer();


                            const result =
                                await extractText(
                                    new Uint8Array(
                                        buffer
                                    )
                                );


                            if (
                                result &&
                                result.text
                            ) {

                                fullText =
                                    result.text;

                            }

                        }

                    }

                }
                catch (pdfError) {

                    console.log(
                        "Could not read PDF:",
                        pdfError.message
                    );

                }

            }


            readablePapers.push({

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
                    fullText.length > 0

            });

        }


        /*
         * =====================================================
         * RETURN RESULTS
         * =====================================================
         */

        return {

            statusCode: 200,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                papers:
                    readablePapers,

                source:
                    "Semantic Scholar / OpenAlex"

            })

        };


    }
    catch (error) {

        console.error(
            "Research search error:",
            error
        );


        return {

            statusCode: 500,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                error:
                    "Unable to search and read academic sources."

            })

        };

    }

};


/*
 * =====================================================
 * REBUILD OPENALEX ABSTRACT
 * =====================================================
 */

function reconstructAbstract(
    invertedIndex
) {

    if (
        !invertedIndex
    ) {

        return "No abstract available.";

    }


    const words = [];


    Object.keys(
        invertedIndex
    )
        .forEach(
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


    return abstract ||
        "No abstract available.";

                    }
