/* SAVE INFORMATION */

const informationForm =
    document.getElementById("informationForm");

if (informationForm) {

    informationForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const newInformation = {

                title:
                    document.getElementById("title").value,

                information:
                    document.getElementById("information").value,

                source:
                    document.getElementById("source").value,

                location:
                    document.getElementById("location").value,

                reason:
                    document.getElementById("reason").value,

                problem:
                    document.getElementById("problem").value,

                keywords:
                    document.getElementById("keywords").value,

                used:
                    document.getElementById("used").value,

                usage:
                    document.getElementById("usage").value,

                notes:
                    document.getElementById("notes").value,

                date:
                    new Date().toLocaleString()
            };


            let savedInformation =
                JSON.parse(
                    localStorage.getItem("infoTraceData")
                ) || [];


            savedInformation.push(newInformation);


            localStorage.setItem(
                "infoTraceData",
                JSON.stringify(savedInformation)
            );


            alert("Information saved successfully!");


            informationForm.reset();


            window.location.href =
                "my-information.html";

        }
    );

}


/* DASHBOARD */

function loadDashboard() {

    const savedCount =
        document.getElementById("savedCount");

    if (!savedCount) {
        return;
    }


    const usedCount =
        document.getElementById("usedCount");

    const unusedCount =
        document.getElementById("unusedCount");


    const savedInformation =
        JSON.parse(
            localStorage.getItem("infoTraceData")
        ) || [];


    savedCount.textContent =
        savedInformation.length;


    let used = 0;

    let unused = 0;


    savedInformation.forEach(
        function(item) {

            if (item.used === "Yes") {
                used++;
            }

            if (item.used === "No") {
                unused++;
            }

        }
    );


    usedCount.textContent = used;

    unusedCount.textContent = unused;

}


/* SEARCH */

function performSearch() {

    const searchBox =
        document.getElementById("searchBox");

    const searchResults =
        document.getElementById("searchResults");


    if (!searchBox || !searchResults) {
        return;
    }


    const searchTerm =
        searchBox.value
            .toLowerCase()
            .trim();


    const savedInformation =
        JSON.parse(
            localStorage.getItem("infoTraceData")
        ) || [];


    if (searchTerm === "") {

        searchResults.innerHTML =
            "<p>Type something above to search your saved information.</p>";

        return;
    }


    const results =
        savedInformation.filter(
            function(item) {

                return (

                    (item.title || "")
                        .toLowerCase()
                        .includes(searchTerm)

                    ||

                    (item.information || "")
                        .toLowerCase()
                        .includes(searchTerm)

                    ||

                    (item.source || "")
                        .toLowerCase()
                        .includes(searchTerm)

                    ||

                    (item.keywords || "")
                        .toLowerCase()
                        .includes(searchTerm)

                    ||

                    (item.reason || "")
                        .toLowerCase()
                        .includes(searchTerm)

                    ||

                    (item.problem || "")
                        .toLowerCase()
                        .includes(searchTerm)

                );

            }
        );


    if (results.length === 0) {

        searchResults.innerHTML =
            "<p>No matching information found.</p>";

        return;
    }


    searchResults.innerHTML =
        "<h3>" +
        results.length +
        " result(s) found</h3>";


    results.forEach(
        function(item) {

            const card =
                document.createElement("div");

            card.className =
                "info-card";


            const title =
                document.createElement("h3");

            title.textContent =
                item.title || "Untitled";


            const information =
                document.createElement("p");

            information.textContent =
                "Information: " +
                (item.information || "Not provided");


            const source =
                document.createElement("p");

            source.textContent =
                "Source: " +
                (item.source || "Not provided");


            card.appendChild(title);

            card.appendChild(information);

            card.appendChild(source);


            searchResults.appendChild(card);

        }
    );

}


/* SEARCH BOX */

const searchBox =
    document.getElementById("searchBox");

if (searchBox) {

    searchBox.addEventListener(
        "input",
        performSearch
    );

}


/* HISTORY */

function loadHistory() {

    const historyList =
        document.getElementById("historyList");


    if (!historyList) {
        return;
    }


    const savedInformation =
        JSON.parse(
            localStorage.getItem("infoTraceData")
        ) || [];


    if (savedInformation.length === 0) {

        historyList.innerHTML =
            "<p>No information has been saved yet.</p>";

        return;
    }


    historyList.innerHTML = "";


    savedInformation
        .slice()
        .reverse()
        .forEach(
            function(item) {

                const card =
                    document.createElement("div");

                card.className =
                    "info-card";


                const title =
                    document.createElement("h3");

                title.textContent =
                    item.title || "Untitled";


                const date =
                    document.createElement("p");

                date.textContent =
                    "Saved on: " +
                    (item.date || "Not available");


                const source =
                    document.createElement("p");

                source.textContent =
                    "Source: " +
                    (item.source || "Not provided");


                const keywords =
                    document.createElement("p");

                keywords.textContent =
                    "Keywords: " +
                    (item.keywords || "Not provided");


                card.appendChild(title);

                card.appendChild(date);

                card.appendChild(source);

                card.appendChild(keywords);


                historyList.appendChild(card);

            }
        );

}


/* INFORMATION DETAILS */

function loadInformationDetails() {

    const details =
        document.getElementById(
            "informationDetails"
        );


    if (!details) {
        return;
    }


    const selectedIndex =
        localStorage.getItem(
            "selectedInfoIndex"
        );


    const id =
        parseInt(
            selectedIndex,
            10
        );


    const savedInformation =
        JSON.parse(
            localStorage.getItem(
                "infoTraceData"
            )
        ) || [];


    if (
        isNaN(id) ||
        !savedInformation[id]
    ) {

        details.innerHTML =
            "<h2>Information Not Found</h2>" +
            "<p>Please go back to My Information and select an information record.</p>";

        return;
    }


    const item =
        savedInformation[id];


    details.innerHTML = "";


    const title =
        document.createElement("h2");

    title.textContent =
        item.title || "Untitled";


    details.appendChild(title);


    addDetail(
        details,
        "Information",
        item.information
    );


    addDetail(
        details,
        "Source",
        item.source
    );


    addDetail(
        details,
        "Where found",
        item.location
    );


    addDetail(
        details,
        "Why saved",
        item.reason
    );


    addDetail(
        details,
        "Problem being solved",
        item.problem
    );


    addDetail(
        details,
        "Topics / Keywords",
        item.keywords
    );


    addDetail(
        details,
        "Used",
        item.used
    );


    addDetail(
        details,
        "How it was used",
        item.usage
    );


    addDetail(
        details,
        "Additional Notes",
        item.notes
    );


    addDetail(
        details,
        "Date Saved",
        item.date
    );


    /* BUTTON CONTAINER */

    const buttons =
        document.createElement("div");

    buttons.className =
        "action-buttons";


    /* EDIT BUTTON */

    const editButton =
        document.createElement("button");

    editButton.textContent =
        "✏️ Edit Information";

    editButton.className =
        "main-button";


    editButton.addEventListener(
        "click",
        function() {

            editInformation(id);

        }
    );


    /* DELETE BUTTON */

    const deleteButton =
        document.createElement("button");

    deleteButton.textContent =
        "🗑️ Delete Information";

    deleteButton.className =
        "delete-button";


    deleteButton.addEventListener(
        "click",
        function() {

            deleteInformation(id);

        }
    );


    buttons.appendChild(editButton);

    buttons.appendChild(deleteButton);


    details.appendChild(buttons);

}


/* ADD DETAIL */

function addDetail(
    container,
    label,
    value
) {

    const section =
        document.createElement("div");


    section.className =
        "context-line";


    const heading =
        document.createElement("strong");


    heading.textContent =
        label;


    const paragraph =
        document.createElement("p");


    paragraph.textContent =
        value || "Not provided";


    section.appendChild(heading);

    section.appendChild(paragraph);


    container.appendChild(section);

}


/* EDIT INFORMATION */

function editInformation(id) {

    const savedInformation =
        JSON.parse(
            localStorage.getItem(
                "infoTraceData"
            )
        ) || [];


    const item =
        savedInformation[id];


    if (!item) {

        alert("Information not found.");

        return;
    }


    const details =
        document.getElementById(
            "informationDetails"
        );


    details.innerHTML = "";


    const heading =
        document.createElement("h2");


    heading.textContent =
        "Edit Information";


    details.appendChild(heading);


    const form =
        document.createElement("form");


    form.id =
        "editForm";


    createEditField(
        form,
        "Title",
        "editTitle",
        item.title,
        "input"
    );


    createEditField(
        form,
        "Information",
        "editInformation",
        item.information,
        "textarea"
    );


    createEditField(
        form,
        "Source",
        "editSource",
        item.source,
        "input"
    );


    createEditField(
        form,
        "Where did you find it?",
        "editLocation",
        item.location,
        "input"
    );


    createEditField(
        form,
        "Why did you save it?",
        "editReason",
        item.reason,
        "textarea"
    );


    createEditField(
        form,
        "What problem were you solving?",
        "editProblem",
        item.problem,
        "textarea"
    );


    createEditField(
        form,
        "Topics / Keywords",
        "editKeywords",
        item.keywords,
        "input"
    );


    /* USED */

    const usedLabel =
        document.createElement("label");

    usedLabel.textContent =
        "Did you eventually use this information?";


    const usedSelect =
        document.createElement("select");

    usedSelect.id =
        "editUsed";


    const emptyOption =
        document.createElement("option");

    emptyOption.value = "";

    emptyOption.textContent =
        "Select an option";


    const yesOption =
        document.createElement("option");

    yesOption.value = "Yes";

    yesOption.textContent =
        "Yes";


    const noOption =
        document.createElement("option");

    noOption.value = "No";

    noOption.textContent =
        "No";


    usedSelect.appendChild(emptyOption);

    usedSelect.appendChild(yesOption);

    usedSelect.appendChild(noOption);


    usedSelect.value =
        item.used || "";


    form.appendChild(usedLabel);

    form.appendChild(usedSelect);


    createEditField(
        form,
        "How did you use it?",
        "editUsage",
        item.usage,
        "textarea"
    );


    createEditField(
        form,
        "Additional Notes",
        "editNotes",
        item.notes,
        "textarea"
    );


    const saveButton =
        document.createElement("button");


    saveButton.type =
        "submit";


    saveButton.textContent =
        "Save Changes";


    saveButton.className =
        "main-button";


    form.appendChild(saveButton);


    details.appendChild(form);


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            savedInformation[id] = {

                title:
                    document.getElementById(
                        "editTitle"
                    ).value,

                information:
                    document.getElementById(
                        "editInformation"
                    ).value,

                source:
                    document.getElementById(
                        "editSource"
                    ).value,

                location:
                    document.getElementById(
                        "editLocation"
                    ).value,

                reason:
                    document.getElementById(
                        "editReason"
                    ).value,

                problem:
                    document.getElementById(
                        "editProblem"
                    ).value,

                keywords:
                    document.getElementById(
                        "editKeywords"
                    ).value,

                used:
                    document.getElementById(
                        "editUsed"
                    ).value,

                usage:
                    document.getElementById(
                        "editUsage"
                    ).value,

                notes:
                    document.getElementById(
                        "editNotes"
                    ).value,

                date:
                    item.date

            };


            localStorage.setItem(
                "infoTraceData",
                JSON.stringify(
                    savedInformation
                )
            );


            alert(
                "Information updated successfully!"
            );


            loadInformationDetails();

        }
    );

}


/* CREATE EDIT FIELD */

function createEditField(
    form,
    labelText,
    id,
    value,
    type
) {

    const label =
        document.createElement("label");


    label.textContent =
        labelText;


    let field;


    if (type === "textarea") {

        field =
            document.createElement("textarea");

    } else {

        field =
            document.createElement("input");

        field.type =
            "text";

    }


    field.id = id;

    field.value =
        value || "";


    form.appendChild(label);

    form.appendChild(field);

}


/* DELETE INFORMATION */

function deleteInformation(id) {

    const savedInformation =
        JSON.parse(
            localStorage.getItem(
                "infoTraceData"
            )
        ) || [];


    if (!savedInformation[id]) {

        alert(
            "Information not found."
        );

        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this information?"
        );


    if (!confirmDelete) {
        return;
    }


    savedInformation.splice(
        id,
        1
    );


    localStorage.setItem(
        "infoTraceData",
        JSON.stringify(
            savedInformation
        )
    );


    localStorage.removeItem(
        "selectedInfoIndex"
    );


    alert(
        "Information deleted successfully!"
    );


    window.location.href =
        "my-information.html";

}


/* START THE SYSTEM */

loadDashboard();

loadHistory();

loadInformationDetails();