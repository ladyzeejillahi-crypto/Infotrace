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
         * TRY SEMANTIC SCHOLAR FIRST
         * =====================================================
         */

        try {

            const semanticURL =
                "https://api.semanticscholar.org/graph/v1/paper/search" +
                "?query=" +
                encodeURIComponent(query) +
                "&limit=10" +
                "&fields=title,authors,year,abstract,journal,url,externalIds";


            const semanticResponse =
                await fetch(semanticURL);


            if (semanticResponse.ok) {

                const data =
                    await semanticResponse.json();


                const papers =
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
                                    sourceUrl

                            };

                        }
                    );


                if (papers.length > 0) {

                    return {

                        statusCode: 200,

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            papers: papers,

                            source:
                                "Semantic Scholar"

                        })

                    };

                }

            }

        }
        catch (semanticError) {

            console.log(
                "Semantic Scholar unavailable. Trying OpenAlex."
            );

        }


        /*
         * =====================================================
         * FALLBACK: OPENALEX
         * =====================================================
         */

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


        const papers =
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


                        let sourceUrl =
                            work.doi ||
                            work.id ||
                            "";


                        if (
                            work.doi &&
                            work.doi.startsWith("https://doi.org/")
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
                                sourceUrl

                        };

                    }
                );


        return {

            statusCode: 200,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                papers: papers,

                source:
                    "OpenAlex"

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
                    "Unable to search academic sources."

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

    if (!invertedIndex) {

        return "No abstract available.";

    }


    const words = [];


    Object.keys(invertedIndex)
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
