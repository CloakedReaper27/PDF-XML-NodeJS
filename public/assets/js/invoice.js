function displayFileName() {
    // Get the selected file
    const fileInput = document.getElementById('fileInputField');
    const fileName = fileInput.files[0] ? fileInput.files[0].name : 'No file selected';
    
    // Display the file name in the div
    document.getElementById('fileNameDisplay').innerText = `Selected file: ${fileName}`;
}
// Opens and closes the popup modal
function openModal() {
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Handle drag and drop functionality
const dropArea = document.getElementById('dropArea');
const fileInputField = document.getElementById('fileInputField');
const browseButton = document.getElementById('browseButton');
const fileInput = document.getElementById('fileInput');
const statusMessage = document.getElementById('statusMessage'); // Add status message for upload success or failure
// Trigger the file input when the user clicks the browse button
// browseButton.addEventListener('click', () => {
//     fileInput.click();
// });

// When the user drags a file over the drop area
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('active');
});

// When the user leaves the drag area
dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('active');
});

// When the user drops a file on the drop area

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('active');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInputField.files = files; // Set the file to the form input field
        statusMessage.textContent = `${files[0].name} ready to upload.`; // Show file name
    }
});

// Handle form submission and file upload
const form = document.getElementById('uploadForm');
form.addEventListener('submit', async  (e) => {
    e.preventDefault();
    // const uploadFilename = document.getElementById('fileInputField').value;

    const fileInputupload = document.getElementById('fileInputField');
    const fileupload = fileInputupload.files[0]; // Get the selected file
    const uploadFilename = fileupload ? fileupload.name : '';

    // Create FormData and add the selected file

    const formData = new FormData(form);
    const file = formData.get('pdfFile');
    formData.append('invoiceName', uploadFilename);
    console.log("Filename = ",uploadFilename);

    if (!file) {
        statusMessage.textContent = 'Please select a PDF file to upload.';
        statusMessage.style.color = 'red';
        return;
    };
    const fileInput = document.getElementById('fileInputField');
    console.log(fileInput.files); // Check if it contains files

    // Send the file using AJAX (Fetch API)
    console.log("File selected!"); // Debugging step

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,  // Send the FormData (which includes the file)
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error("Failed to upload file.");
        }

        
        document.getElementById('statusMessage').innerHTML = `File uploaded successfully.`;
        document.getElementById('statusMessage').style.color = 'green'; // Close the modal on success
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;  // Redirect to the page
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('statusMessage').textContent = 'Error uploading file.';
        document.getElementById('statusMessage').style.color = 'red';
    }
});


// Function to open the ZUGFeRD modal
function openZugferdModal() {
    document.getElementById('zugferdModal').style.display = 'flex';
}

// Function to close the ZUGFeRD modal
function closeZugferdModal() {
    document.getElementById('zugferdModal').style.display = 'none';
}

// Function to Add payment
function addPayment(invoiceNumber) {
    document.getElementById('invoiceNumberPayment').value = invoiceNumber;
    document.getElementById('addPayment').style.display = 'flex';
    document.getElementById('submitPayment').addEventListener("click", submitPayment);

}

function closePayment() {

    document.getElementById('paymentText').value = '';
    document.getElementById('addPayment').style.display = 'none';
}

async function submitPayment() {
    const invoiceNumber = document.getElementById('invoiceNumberPayment').value;
    const totalamount = document.getElementById(`totalmax_${invoiceNumber}`).value;
    const payment = document.getElementById('paymentText').value;
    console.log("Total amount = ", totalamount)


    if (!payment) {
        alert("Please enter a payment.");
        return;
    }

    if (totalamount < payment){
        alert(`Please enter a value equal or under ${totalamount}`);
        return;
    }

    // Send data to backend
    const response = await fetch('/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceNumber, payment, totalamount })
    })
    const data = await response.json();

    if (response.ok) {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;  // Redirect to the page
        }
        console.log(`Payment Updated to invoice ${invoiceNumber}`); // Show success message
    }
}


// Function to Add Comment
function addComment(invoiceNumber) {
    document.getElementById('invoiceNumber').value = invoiceNumber;
    document.getElementById('addComment').style.display = 'flex';
    document.getElementById('submitcomment').addEventListener("click", submitButton);

}

function closeButton() {

    document.getElementById('commentText').value = '';
    document.getElementById('addComment').style.display = 'none';
}

async function submitButton() {
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const comment = document.getElementById('commentText').value;

    if (!comment) {
        alert("Please enter a comment.");
        return;
    }

    // Send data to backend
    const response = await fetch('/submit-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceNumber, comment })
    })
    const data = await response.json();

    if (response.ok) {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;  // Redirect to the page
        }
        console.log(`Comment Added to invoice ${invoiceNumber}`); // Show success message
    }
}

//Function to Cancel invoice
async function cancelInvoice(invoiceNumber){

    const cancelOption = "Cancelled"
    const response = await fetch('/cancel-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceNumber, cancelOption })
    })
    const data = await response.json();

    if (response.ok) {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;  // Redirect to the page
        }
    }
}


// Write an Invoice
function openInvoiceModal() {
    document.getElementById('invoiceModal').style.display = 'flex';

    // Attach event listener when the modal is opened
    document.getElementById("invoiceForm").addEventListener("submit", handleInvoiceSubmit);
    document.getElementById("submitDB").addEventListener("click", checkbeforesubmit);
}

function closeInvoiceModal() {
    document.getElementById('invoiceForm').reset();
    document.getElementById('invoiceModal').style.display = 'none';
}

async function handleInvoiceSubmit(event) {
    event.preventDefault();
    
    const RechnungNumber = document.getElementById("RechnungNumber").value;
    const RechnungDate = document.getElementById("RechnungDate").value;
    const DeliveryDate = document.getElementById("DeliveryDate").value;
    const BillingPeriodStart = document.getElementById("BillingPeriodStart").value;
    const BillingPeriodEnd = document.getElementById("BillingPeriodEnd").value;
    const DueDate = document.getElementById("DueDate").value;
    const ContractNo = document.getElementById("ContractNo").value;
    const OrderNo = document.getElementById("OrderNo").value;
    const CustomerEmail = document.getElementById("CustomerEmail").value;
    const CustomerName = document.getElementById("CustomerName").value;
    const CustomerAddress = document.getElementById("CustomerAddress").value;
    const CustomerPhone = document.getElementById("CustomerPhone").value;
    const CustomerZipcode = document.getElementById("CustomerZipcode").value;
    const CustomerStadt = document.getElementById("CustomerStadt").value;
    const CustomerCountry = document.getElementById("CustomerCountry").value;
    const CustomerState = document.getElementById("CustomerState").value;

    // const invoiceFullData = invoiceData();
    
    

    const items = [];
    const zusItems = [];
    const rows = document.querySelectorAll("#itemForm tr");
    const zusRows = document.querySelectorAll("#ZusForm tr");

    rows.forEach((row, index) => {
        if (index === 0) return;
        const inputs = row.querySelectorAll("input");
        // Make sure to adjust indices based on your HTML structure
        const item = {
          name: inputs[0].value,
          description: inputs[1].value,
          quantity: inputs[2].value,
          price: inputs[3].value,
          tax: inputs[4].value,
          total: inputs[5].value,
        };
        items.push(item);
      });

    zusRows.forEach((row, index) => {
    if (index === 0) return;
        const inputs = row.querySelectorAll("input");
        // Make sure to adjust indices based on your HTML structure
        const item = {
            ZuschlagDescription: inputs[0].value,
            ZuschlagTax: inputs[1].value,
            ZuschlagTotal: inputs[2].value,
        };
        zusItems.push(item);
    });


    console.log("Form submitted!"); // Debugging step

    const response = await fetch("/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ RechnungNumber, RechnungDate, DeliveryDate, BillingPeriodStart, BillingPeriodEnd, DueDate, ContractNo, OrderNo, items, zusItems, CustomerName, CustomerEmail, CustomerAddress, CustomerPhone, CustomerZipcode, CustomerStadt, CustomerCountry, CustomerState}),
        // body: JSON.stringify({ invoiceFullData, zusItems, items }),
    });

    const data = await response.json();

    if (response.ok) {
        console.log("New file path:", data.filePath); // Debugging log
        const statusDiv = document.getElementById("status");
        
        // Explicitly clear and update status div
        statusDiv.innerHTML = "";  
        statusDiv.innerHTML = `
            <a href="${data.filePath}?t=${new Date().getTime()}" target="_blank">Open PDF</a> | 
            <a href="${data.filePath}?t=${new Date().getTime()}" download>Download PDF</a>
        `;
    }
    // if (response.ok) {
    //     document.getElementById("status").innerHTML = `
    //     <a href="${data.filePath}" target="_blank">Open PDF</a> | 
    //     <a href="${data.filePath}" download>Download PDF</a>
    // `;
    else {
        document.getElementById("status").innerText = "Error generating PDF.";
    }
}

document.addEventListener("input", function (event) {
    if (event.target.name === "quantity" || event.target.name === "price") {
        const row = event.target.closest("tr");
        const quantity = parseFloat(row.querySelector('input[name="quantity"]').value) || 0;
        const price = parseFloat(row.querySelector('input[name="price"]').value) || 0;
        const totalField = row.querySelector('input[name="total"]');

        totalField.value = (quantity * price); 
    }
});


let buttonAdder = document.getElementById('addBtn');
let buttonRemover = document.getElementById('removeBtn');

buttonAdder.addEventListener('click', function (event) {


    // Create a new row
    var table = document.getElementById("itemForm");

    // Correctly calculate index
    var index = table.rows.length; // Includes header row, so no need to subtract 1

    // Create a new row
    var row = table.insertRow(-1);

    row.innerHTML = `
        <td>${index}</td>
        <td><div class="form-group maxwidth">
            <input type="text" name="name" placeholder="Name" required>
        </div></td>
        <td><div class="form-group maxwidth">
            <input type="text" name="description" placeholder="Description" required>
        </div></td>
        <td><div class="form-group maxwidth">
            <input type="text" name="quantity" placeholder="Quantity" required>
        </div></td>
        <td><div class="form-group maxwidth">
            <input type="text" name="price" placeholder="Price (€)" required>
        </div></td>
        <td><div class="form-group maxwidth">
            <input type="text" name="tax" placeholder="Steuer (%)" required>
        </div></td>
        <td><div class="form-group maxwidth">
            <input type="text" name="total" placeholder="Gesamt (€)" required readonly>
        </div></td>
    `;
});

// function invoiceData (){
//     return {
//         RechnungNumber : document.getElementById("RechnungNumber").value,
//         RechnungDate : document.getElementById("RechnungDate").value,
//         DeliveryDate : document.getElementById("DeliveryDate").value,
//         BillingPeriodStart : document.getElementById("BillingPeriodStart").value,
//         BillingPeriodEnd : document.getElementById("BillingPeriodEnd").value,
//         DueDate : document.getElementById("DueDate").value,
//         ContractNo : document.getElementById("ContractNo").value,
//         OrderNo : document.getElementById("OrderNo").value,
//         CustomerEmail : document.getElementById("CustomerEmail").value,
//         CustomerName : document.getElementById("CustomerName").value,
//         CustomerAddress : document.getElementById("CustomerAddress").value,
//         CustomerPhone : document.getElementById("CustomerPhone").value,
//     }
// }

function checkbeforesubmit () {
    const field1 = document.getElementById("RechnungNumber").value.trim();
    const field2 = document.getElementById("RechnungDate").value.trim();
    const field3 = document.getElementById("DeliveryDate").value.trim();
    const field4 = document.getElementById("BillingPeriodStart").value.trim();
    const field5 = document.getElementById("BillingPeriodEnd").value.trim();
    const field6 = document.getElementById("DueDate").value.trim();
    const field7 = document.getElementById("ContractNo").value.trim();
    const field8 = document.getElementById("OrderNo").value.trim();
    const field9 = document.getElementById("CustomerEmail").value.trim();
    const field10 = document.getElementById("CustomerName").value.trim();
    const field11 = document.getElementById("CustomerAddress").value.trim();
    const field12 = document.getElementById("CustomerPhone").value.trim();


    if (!field1 || !field2 || !field3 || !field4 || !field5 || !field6 || !field7 || !field8 || !field9 || !field10 || !field11 || !field12) {
        alert("Please fill out all required fields before applying changes.");
        return;
    }


    const fieldrows = document.querySelectorAll("#itemForm tr");

    fieldrows.forEach(input => {
        if (input.value.trim() === "") {
            alert("Please fill out all required fields before applying changes.");
            return;
        }
    });

    handleDBSubmit();
}

async function handleDBSubmit() {

    
    const RechnungNumber = document.getElementById("RechnungNumber").value;
    const RechnungDate = document.getElementById("RechnungDate").value;
    const DeliveryDate = document.getElementById("DeliveryDate").value;
    const BillingPeriodStart = document.getElementById("BillingPeriodStart").value;
    const BillingPeriodEnd = document.getElementById("BillingPeriodEnd").value;
    const DueDate = document.getElementById("DueDate").value;
    const ContractNo = document.getElementById("ContractNo").value;
    const OrderNo = document.getElementById("OrderNo").value;
    const CustomerEmail = document.getElementById("CustomerEmail").value;
    const CustomerName = document.getElementById("CustomerName").value;
    const CustomerAddress = document.getElementById("CustomerAddress").value;
    const CustomerPhone = document.getElementById("CustomerPhone").value;
    const CustomerZipcode = document.getElementById("CustomerZipcode").value;
    const CustomerStadt = document.getElementById("CustomerStadt").value;
    const CustomerCountry = document.getElementById("CustomerCountry").value;
    

    const items = [];
    const zusItems = [];
    const rows = document.querySelectorAll("#itemForm tr");
    const zusRows = document.querySelectorAll("#ZusForm tr");

    rows.forEach((row, index) => {
        if (index === 0) return;
        const inputs = row.querySelectorAll("input");
        // Make sure to adjust indices based on your HTML structure
        const item = {
            name: inputs[0].value,
            description: inputs[1].value,
            quantity: inputs[2].value,
            price: inputs[3].value,
            tax: inputs[4].value,
            total: inputs[5].value,
        };
        items.push(item);
      });

    zusRows.forEach((row, index) => {
    if (index === 0) return;
        const inputs = row.querySelectorAll("input");
        // Make sure to adjust indices based on your HTML structure
        const item = {
            ZuschlagDescription: inputs[0].value,
            ZuschlagTax: inputs[1].value,
            ZuschlagTotal: inputs[2].value,
        };
        zusItems.push(item);
    });


    console.log("DB submitted!"); // Debugging step

    const response = await fetch("/pushtodb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ RechnungNumber, RechnungDate, DeliveryDate, BillingPeriodStart, BillingPeriodEnd, DueDate, ContractNo, OrderNo, items, zusItems, CustomerName, CustomerEmail, CustomerAddress, CustomerPhone, CustomerZipcode, CustomerStadt, CustomerCountry}),
    });

    const data = await response.json();
    
    if (response.ok) {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;  // Redirect to the page
        }
    }
};


buttonRemover.addEventListener('click', function (event) {
    const table = document.getElementById("itemForm");
    const rowCount = table.rows.length;
    
    if (rowCount > 2) {
        table.deleteRow(rowCount - 1);
    }
});

//Zus part ---------------------------------------------------------------------------

let zusAdder = document.getElementById('addZus');
let zusRemover = document.getElementById('removeZus');

zusAdder.addEventListener('click', function (event) {


    // Create a new row
    var table = document.getElementById("ZusForm");

    // Correctly calculate index
    var index = table.rows.length; // Includes header row, so no need to subtract 1

    // Create a new row
    var row = table.insertRow(-1);

    row.innerHTML = `
        <td><strong>Zuschlag : </strong></td>
        <td><input type="text" name="ZuschlagDescription" placeholder="Anzahl"></td>
        <td><input type="text" name="ZuschlagTax" placeholder="Steuer (%)"></td>
        <td><input type="text" name="ZuschlagTotal" placeholder="Gesamt (€)"></td>
    `;
});

zusRemover.addEventListener('click', function (event) {
    const table = document.getElementById("ZusForm");
    const rowCount = table.rows.length;
    
    if (rowCount > 2) {
        table.deleteRow(rowCount - 1);
    }
});


// Function to Sort
let currentSort = { column: "", order: "asc" };

document.getElementById("sortBtn").addEventListener("click", function () {
    document.getElementById("dropdownMenu").classList.toggle("show");
});

window.addEventListener("click", function (event) {
    if (!event.target.matches("#sortBtn")) {
        document.getElementById("dropdownMenu").classList.remove("show");
    }
});

function sortTable(column) {
    let order = currentSort.column === column && currentSort.order === "asc" ? "desc" : "asc";
    currentSort = { column, order };

    fetch(`/sort?sort=${column}&order=${order}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("table-body");
            tbody.innerHTML = "";

            data.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <tr>
                        <td> ${item.invoiceNumber} </td>
                        <td> ${item.customer_name} </td>
                        <td> ${item.customer_email} </td>
                        <td> ${new Date(item.dueDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} </td>
                        <td> ${item.totalowned}  €</td>
                        <td> ${item.status} </td>
                        <td> ${item.comments === null ? "" :item.comments} </td>
                        <td class="buttonHover">
                            <button onclick="addComment(' ${item.invoiceNumber} ')">Comment</button>
                            <a href="/output/pdfs/Rechnung_${item.invoiceNumber}.pdf" target="_blank">
                                <button>View PDF</button>
                            </a>
                            <a href="/output/pdfs/Rechnung_${item.invoiceNumber}.pdf" download="">
                                <button>Download PDF</button>
                            </a>
                            ${item.status === "Pending" && item.delete_trigger === 0 ?
                                `<button onclick="cancelInvoice('${item.invoiceNumber}')">Cancel Invoice</button>`
                             : ""} 
                             ${item.totalowned != 0 && item.status === "Pending"?
                                `<button onclick="addPayment('${item.invoiceNumber}')">Submit Payment</button>`
                             : ""} 
                            <input type="hidden" id="totalmax_${item.invoiceNumber}" value="${item.totalowned}">

                        </td>
                    </tr>
                `;
                tbody.appendChild(row);
            });

            document.getElementById("dropdownMenu").classList.remove("show"); // Close dropdown after selection
        })
        .catch(error => console.error("Error fetching sorted data:", error));
}

// Function to View JSON for read PDFS
function viewData(invoiceName) {
    document.getElementById('invoiceJSON').value = invoiceName;
    document.getElementById('viewJSON').style.display = 'flex';
    document.getElementById('submitPayment').addEventListener("click", submitPayment);

}

function showJSONData(invoiceJSON) {


        try {
            // Check if it's already a parsed object, if not, parse it
            const parsedData = typeof invoiceJSON === "string" ? JSON.parse(invoiceJSON) : invoiceJSON;
    
            console.log("Parsed JSON:", parsedData);  // Debugging parsed data
    
            let tableHTML = '<table><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>';
    
            // Loop through the JSON object and create table rows for each key-value pair
            for (let [key, value] of Object.entries(parsedData)) {
                // Check if the value is an object or array, to handle nested structures
                if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value, null, 2); // Convert nested objects/arrays to formatted string
                }
    
                // Add the key-value pair as a new row in the table
                tableHTML += `<tr><td>${key}</td><td>${value}</td></tr>`;
            }
    
            tableHTML += '</tbody></table>';  // Closing the table tag
    
            console.log("Generated Table HTML:", tableHTML);  // Debugging the final HTML
    
            // Set the content of the popup
            document.getElementById("invoiceJSON").innerHTML = tableHTML;
    
            // Show the popup
            document.getElementById("viewJSON").style.display = "flex";
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
}
function closeJSONButton() {

    document.getElementById('viewJSON').style.display = 'none';
}



//Table Scroll Adjuster
// document.addEventListener("DOMContentLoaded", function () {
//     let tableBody = document.getElementById("table-body");
//     let rowCount = tableBody.getElementsByTagName("tr").length;
    
//     if (rowCount > 5) {
//         document.querySelector(".table-container").style.overflowY = "auto";
//     } else {
//         document.querySelector(".table-container").style.overflowY = "visible";
//     }
// });