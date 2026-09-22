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

        const apiUrl =
            "https://api.semanticscholar.org/graph/v1/paper/search" +
            "?query=" +
            encodeURIComponent(query) +
            "&limit=10" +
            "&fields=title,authors,year,abstract,journal,url,externalIds";

        const response = await fetch(apiUrl);

        if (!response.ok) {

            return {
                statusCode: response.status,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "Academic search service returned an error."
                })
            };

        }

        const data = await response.json();

        const papers = (data.data || []).map(function(paper) {

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

        });

        return {

            statusCode: 200,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                papers: papers
            })

        };

    } catch (error) {

        console.error(error);

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
