// Add Customer Function Start

document.addEventListener("input", function (event) {
    if (event.target.name === "quantity" || event.target.name === "price") {
        const row = event.target.closest("tr");
        const quantity = parseFloat(row.querySelector('input[name="quantity"]').value) || 0;
        const price = parseFloat(row.querySelector('input[name="price"]').value) || 0;
        const totalField = row.querySelector('input[name="total"]');

        totalField.value = (quantity * price); 
    }
});


// Handles PDF generation Start

function collectAllItemsInfo() {
    const selectedItems = [];

    const sections = document.querySelectorAll('#selectedItemsContainer > div[id^="itemTable_"]');

    sections.forEach(section => {
        const itemId = parseInt(section.id.split('_')[1], 10);

        const rows = section.querySelectorAll('table tr');
        
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].children;
            const name = cells[0].textContent.trim();
            const description = cells[1].textContent.trim();
            const tax = parseFloat(cells[2].textContent) || 0;
            const price = parseFloat(cells[3].textContent) || 0;
            const quantityInput = cells[4].querySelector('input');
            const quantity = parseInt(quantityInput?.value, 10) || 0;
            const total = parseFloat(cells[5].textContent) || 0;

            if (quantity > 0) {
                selectedItems.push({
                    item_id: itemId,
                    name,
                    description,
                    tax,
                    price,
                    quantity,
                    total
                });
            }
        }
    });

    return selectedItems;
}

async function handlePDFSubmit (customer_id) {

    const items = collectAllItemsInfo();

    const payload = {
        RechnungNumber: document.getElementById("RechnungNumber").value,
        RechnungDate: document.getElementById("RechnungDate").value,
        DeliveryDate: document.getElementById("DeliveryDate").value,
        DueDate: document.getElementById("DueDate").value,
        ContractNo: document.getElementById("ContractNo").value,
        OrderNo: document.getElementById("OrderNo").value,
        items,
        customer_id,
    };

    
    console.log("Form submitted!");

    const response = await fetch("/customer-generate-pdf-LF", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
    });

    //  body: JSON.stringify({ RechnungNumber, RechnungDate, DeliveryDate, DueDate, ContractNo, OrderNo, items, customer_id}),
    const data = await response.json();
    console.log(data);
    if (response.ok) {
        
        console.log("New file path:", data.filePath);
        const statusDiv = document.getElementById("status");

        console.log(statusDiv);
        
        const linkOpen = document.createElement("a");
        linkOpen.href = `${data.filePath}?t=${new Date().getTime()}`;
        linkOpen.target = "_blank";
        linkOpen.textContent = "Open PDF";

        const linkDownload = document.createElement("a");
        linkDownload.href = `${data.filePath}?t=${new Date().getTime()}`;
        linkDownload.download = "";
        linkDownload.textContent = "Download PDF";

        // Clear existing content
        statusDiv.innerHTML = "";

        // Append new links
        statusDiv.appendChild(linkOpen);
        statusDiv.appendChild(document.createTextNode(" | "));
        statusDiv.appendChild(linkDownload);

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

// Handles PDF generation End

function AddCustomer() {
    document.getElementById('invoiceModal').style.display = 'flex';
}

function closeCustomer() {
    document.getElementById('invoiceForm').reset();
    document.getElementById('invoiceModal').style.display = 'none';
}

async function handleCustomerSubmit() {
    
    const CustomerLastName = document.getElementById("CustomerLastName").value;
    const CustomerFirstName = document.getElementById("CustomerFirstName").value;
    const CustomerEmail = document.getElementById("CustomerEmail").value;
    const CustomerPhone = document.getElementById("CustomerPhone").value;
    const CustomerAddress = document.getElementById("CustomerAddress").value;
    const CustomerZipcode = document.getElementById("CustomerZipcode").value;
    const CustomerStadt = document.getElementById("CustomerStadt").value;
    const CustomerState = document.getElementById("CustomerState").value;
    const CustomerCountry = document.getElementById("CustomerCountry").value;
    const CustomerIBAN = document.getElementById("CustomerIBAN").value;
    const CustomerBIC = document.getElementById("CustomerBIC").value;

    const response = await fetch("/create-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            CustomerLastName,
            CustomerFirstName,
            CustomerEmail,
            CustomerPhone,
            CustomerAddress,
            CustomerZipcode,
            CustomerStadt,
            CustomerState,
            CustomerCountry,
            CustomerIBAN,
            CustomerBIC 
        }),
    });

    const data = await response.json();
    
    if (response.ok) {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl; 
        }
    }

}
// Add Customer Function End

// Edit Customer Function Start
function openEditCustomer(customer_id) {

    fetch(`/fetch-customer/${customer_id}`)
        .then(res => res.json())
        .then(data => {

            const customer = data.customer;

            document.getElementById('CustomerEditedID').value = customer_id;
            document.getElementById('NewCustomerLastName').value = customer.lastname;
            document.getElementById('NewCustomerFirstName').value = customer.firstname;
            document.getElementById('NewCustomerEmail').value = customer.email;
            document.getElementById('NewCustomerPhone').value = customer.phonenumber;
            document.getElementById('NewCustomerAddress').value = customer.address;
            document.getElementById('NewCustomerZipcode').value = customer.zipcode;
            document.getElementById('NewCustomerStadt').value = customer.stadt;
            document.getElementById('NewCustomerState').value = customer.state;
            document.getElementById('NewCustomerCountry').value = customer.country;
            document.getElementById('NewCustomerIBAN').value = customer.IBAN;
            document.getElementById('NewCustomerBIC').value = customer.BIC;

            document.getElementById('CustomerModal').style.display = 'flex';
        })
        .catch(err => {
            console.error('Error fetching customer:', err);
        });
}

function closeEditCustomer() {
    document.getElementById('CustomerForm').reset();
    document.getElementById('CustomerModal').style.display = 'none';
}


async function handleEditedCustomer(){

    const currentUrl = window.location.href;
    const NewCustomerLastName = document.getElementById("NewCustomerLastName").value;
    const NewCustomerFirstName = document.getElementById("NewCustomerFirstName").value;
    const NewCustomerEmail = document.getElementById("NewCustomerEmail").value;
    const NewCustomerPhone = document.getElementById("NewCustomerPhone").value;
    const NewCustomerAddress = document.getElementById("NewCustomerAddress").value;
    const NewCustomerZipcode = document.getElementById("NewCustomerZipcode").value;
    const NewCustomerStadt = document.getElementById("NewCustomerStadt").value;
    const NewCustomerState = document.getElementById("NewCustomerState").value;
    const NewCustomerCountry = document.getElementById("NewCustomerCountry").value;
    const NewCustomerIBAN = document.getElementById("NewCustomerIBAN").value;
    const NewCustomerBIC = document.getElementById("NewCustomerBIC").value;
    const EditedCustomerID = document.getElementById("CustomerEditedID").value;


    const response = await fetch("/edit-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            NewCustomerLastName,
            NewCustomerIBAN,
            NewCustomerFirstName,
            NewCustomerEmail,
            NewCustomerPhone,
            NewCustomerAddress,
            NewCustomerZipcode,
            NewCustomerStadt,
            NewCustomerState,
            NewCustomerCountry,
            NewCustomerBIC,
            EditedCustomerID,
            currentUrl
        }),
    });

    const data = await response.json();
    
    if (response.ok) {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl; 
        }
    }
}
// Edit Customer Function End

// Delete Customer Function Start
async function deleteCustomer(customer_id){

    if (!customer_id){
        customer_id = document.getElementById('CustomerDeleteID').value;
    }

    const response = await fetch("/delete-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            customer_id
        }),
    });

    const data = await response.json();
    
    if (response.ok) {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl; 
        }
    }

}

function openDeleteBigCustomer () {
    document.getElementById('deletebigcustomer').style.display = 'flex';
}

function closeDeleteBigCustomer () {
    document.getElementById('deletebigcustomer').style.display = 'none';
}

function openDeleteCustomers (customer_id) {

    document.getElementById('CustomerDeleteID').value = customer_id;

    document.getElementById('deletebigcustomer').style.display = 'flex';
}

function closeDeleteCustomers () {
    document.getElementById('deletebigcustomer').style.display = 'none';
}
// Delete Customer Function End

// Pause Customer Function Start
async function pauseCustomer(customer_id){

    const currentUrl = window.location.href;

    const response = await fetch("/pause-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            customer_id, currentUrl
        }),
    });

    const data = await response.json();
    
    if (response.ok) {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl; 
        }
    }

}
// Pause Customer Function End

// Unpause Customer Function Start
async function unpauseCustomer(customer_id){

    const currentUrl = window.location.href;

    const response = await fetch("/unpause-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            customer_id, currentUrl
        }),
    });

    const data = await response.json();
    
    if (response.ok) {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl; 
        }
    }

}
// Unpause Customer Function End

// Search Box Start
const searchInput = document.getElementById('searcher');
const table = document.getElementById('customerTable');
const rows = table.getElementsByTagName('tr');

searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase();

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const nameCell = row.querySelector('.bigchild');

        if (nameCell) {
            const fullName = nameCell.textContent.toLowerCase();
            if (fullName.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }
});
// Search Box End

// Back to Customers Page Start
function customersDataOpen() {
    document.getElementById('CustomerData').style.display = 'grid';
}

function customersDataClose() {
    document.getElementById('CustomerData').style.display = 'none';
}

function backToCustomers () {

    window.location.href = '/customers'

};
// Back to Customers Page End

// ----- Lieferschein Customer Page Start -----


function lieferscheinOpen(customer_id) {

    fetch(`/fetch-leiferschein-number`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id })
    })
        .then(res => res.json())
        .then(data => {
            let lieferscheinNumber = 0;
            if (data.result[0].Number > 0){
                lieferscheinNumber = data.result[0].Number;
            }
            

            // ====== Populate Zuschlag Dropdown ======
            const itemContainer = document.getElementById('itemDropdownMenu');
            itemContainer.innerHTML = '';
            
            data.itemsData.forEach(item => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = item.item_id;
                checkbox.id = `item_${item.item_id}`;
                checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    fetchItemsDetails(item.item_id, item.name);
                } else {
                    removeItemTable(item.item_id);
                }
                });
            
                const label = document.createElement('label');
                label.htmlFor = checkbox.id;
                label.textContent = `Item Name: ${item.name}`;
                label.prepend(checkbox);
            
                itemContainer.appendChild(label);
            });

            document.getElementById('RechnungNumber').value = lieferscheinNumber+1;
            document.getElementById('lieferschein').style.display = 'flex';
        })
        .catch(err => {
            console.error('Error fetching customer:', err);
        });

}

function fetchItemsDetails(item_id, name) {
    fetch('/item-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id }),
    })
      .then(res => res.json())
      .then(data => {
        renderItemTable(item_id, data.data, name);
      })
      .catch(err => {
        console.error(`Error fetching Item ${item_id}:`, err);
      });
  }

  function renderItemTable(item_id, items, name) {
    const container = document.getElementById('selectedItemsContainer');

    const section = document.createElement('div');
    section.id = `itemTable_${item_id}`;

    const table = document.createElement('table');
    table.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Beschreibung</th>
        <th>Steuer</th>
        <th>Preis</th>
        <th>Anzahl</th>
        <th>Total</th>
      </tr>
    `;

    items.forEach(item => {
        const row = document.createElement('tr');
        const totalCell = document.createElement('td');
        totalCell.textContent = '0';

        const quantityInput = document.createElement('input');
        quantityInput.required = true;
        quantityInput.type = 'number';
        quantityInput.min = 1;
        quantityInput.value = 0;
        quantityInput.style.width = '60px';

        quantityInput.addEventListener('input', () => {
            const qty = parseInt(quantityInput.value, 10) || 0;
            const total = qty * item.price;
            totalCell.textContent = total.toFixed(2); // format with 2 decimal places
        });

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.description}</td>
            <td>${item.tax}%</td>
            <td>${item.price}</td>
        `;
        const quantityCell = document.createElement('td');
        quantityCell.appendChild(quantityInput);

        row.appendChild(quantityCell);
        row.appendChild(totalCell);
        table.appendChild(row);
    });

    section.appendChild(table);
    container.appendChild(section);
}

function removeItemTable(item_id) {
    const section = document.getElementById(`itemTable_${item_id}`);
    if (section) section.remove();
}

function lieferscheinClose() {
    document.getElementById('lieferscheinForm').reset();
    document.getElementById('lieferschein').style.display = 'none';

    document.getElementById('selectedItemsContainer').innerHTML = '';

    const zuschlagCheckboxes = document.querySelectorAll('#itemDropdownMenu input[type="checkbox"]');
    zuschlagCheckboxes.forEach(cb => cb.checked = false);
}

function collectSelectedItemData() {
    const selectedItems = [];

    const sections = document.querySelectorAll('#selectedItemsContainer > div[id^="itemTable_"]');

    sections.forEach(section => {
        const itemId = parseInt(section.id.split('_')[1], 10);

        const rows = section.querySelectorAll('table tr');
        
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].children;
            const quantityInput = cells[4].querySelector('input');
            const quantity = parseInt(quantityInput?.value, 10) || 0;
            const total = parseFloat(cells[5].textContent) || 0;

            if (quantity > 0) {
                selectedItems.push({
                    item_id: itemId,
                    quantity,
                    total
                });
            }
        }
    });

    return selectedItems;
}

async function handleLieferDBSubmit(customer_id){

    const currentUrl = window.location.href;

    const ItemData = collectSelectedItemData();

    const payload = {
        lieferscheinNumber: document.getElementById("RechnungNumber").value,
        lieferscheinDate: document.getElementById("RechnungDate").value,
        lieferscheinDeliveryDate: document.getElementById("DeliveryDate").value,
        lieferscheinDueDate: document.getElementById("DueDate").value,
        lieferscheinContractNo: document.getElementById("ContractNo").value,
        lieferscheinOrderNo: document.getElementById("OrderNo").value,
        ItemData,
        customer_id,
    };


    const response = await fetch("/create-lieferschein", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({payload}),
    });

    const data = await response.json();
    
    if (response.ok) {
        window.location.href = currentUrl;
    }
}



function backToCustomers () {
    window.location.href = '/customers'
};


// Handles Adding and Removing Items Start
function buttonAdder() {

    var table = document.getElementById("itemForm");
    var index = table.rows.length;
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
};

function buttonRemover() {
    const table = document.getElementById("itemForm");
    const rowCount = table.rows.length;
    
    if (rowCount > 2) {
        table.deleteRow(rowCount - 1);
    }
};
// Handles Adding and Removing Items

// ----- Lieferschein Customer Page End -----

// ----- Rechnung Form Customer Page Start -----

function RechnungOpen(customer_id) {

    fetch('/fetch-Rechnung-number', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id })
    })
        .then(res => res.json())
        .then(data => {
            let RechnungNumber = 0;
            if (data.result[0].Number > 0){
                RechnungNumber = data.result[0].Number;
            }
            

            // ====== Populate Lieferschein Dropdown ======
            
            const container = document.getElementById('lieferscheinDropdownMenu');
            container.innerHTML = '';
          
            data.lieferANDZusData[0].forEach(item => {
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.value = item.lieferschein_id;
              checkbox.id = `lieferschein_${item.lieferschein_id}`;
              checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                    fetchLieferscheinItems(item.lieferschein_id, item.lieferscheinNumber, customer_id);
                    } else {
                    removeLieferscheinItemsTable(item.lieferschein_id);
                    }
                });
          
              const label = document.createElement('label');
              label.htmlFor = checkbox.id;
              label.textContent = `Lieferschein Nummer: ${item.lieferscheinNumber}`;
              label.prepend(checkbox);
          
              container.appendChild(label);
            });

            // ====== Populate Zuschlag Dropdown ======
            const zuschlagContainer = document.getElementById('zuschlagDropdownMenu');
            zuschlagContainer.innerHTML = '';
            
            data.lieferANDZusData[1].forEach(item => {
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.value = item.Zuschlag_id;
              checkbox.id = `zuschlag_${item.Zuschlag_id}`;
              checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                  fetchZuschlagDetails(item.Zuschlag_id);
                } else {
                  removeZuschlagTable(item.Zuschlag_id);
                }
              });
            
              const label = document.createElement('label');
              label.htmlFor = checkbox.id;
              label.textContent = `Zuschlag Name: ${item.zuschlag_name}`;
              label.prepend(checkbox);
            
              zuschlagContainer.appendChild(label);
            });
        
            document.getElementById('RealRechnungNumber').value = RechnungNumber+1;

            document.getElementById('Rechnung').style.display = 'flex';
        })
        .catch(err => {
            console.error('Error fetching customer:', err);
        });

}

function fetchZuschlagDetails(zuschlag_id) {
    fetch('/zuschlag-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zuschlag_id }),
    })
      .then(res => res.json())
      .then(data => {
        renderZuschlagTable(zuschlag_id, data.data);
      })
      .catch(err => {
        console.error(`Error fetching Zuschlag ${zuschlag_id}:`, err);
      });
  }

function renderZuschlagTable(zuschlag_id, items) {
    const container = document.getElementById('selectedZuschlagContainer');
  
    const section = document.createElement('div');
    section.id = `zuschlagTable_${zuschlag_id}`;
    section.innerHTML = `<h4>Zuschlag ID: ${zuschlag_id}</h4>`;
  
    const table = document.createElement('table');
    table.innerHTML = `
      <tr>
        <th>Name</th>
        <th>description</th>
        <th>Steuer</th>
        <th>Preis</th>
      </tr>
    `;
  
    items.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.zuschlag_name}</td>
        <td>${item.description}</td>
        <td>${item.tax}</td>
        <td>${item.price}</td>
      `;
      table.appendChild(row);
    });
  
    section.appendChild(table);
    container.appendChild(section);
  }
  
function removeZuschlagTable(zuschlag_id) {
    const section = document.getElementById(`zuschlagTable_${zuschlag_id}`);
    if (section) section.remove();
}
function Rechnungclose() {
    document.getElementById('RechnungForm').reset();
    document.getElementById('Rechnung').style.display = 'none';

    document.getElementById('selectedLieferscheinItemsContainer').innerHTML = '';
    document.getElementById('selectedZuschlagContainer').innerHTML = '';

    const lieferscheinCheckboxes = document.querySelectorAll('#lieferscheinDropdownMenu input[type="checkbox"]');
    lieferscheinCheckboxes.forEach(cb => cb.checked = false);

    const zuschlagCheckboxes = document.querySelectorAll('#zuschlagDropdownMenu input[type="checkbox"]');
    zuschlagCheckboxes.forEach(cb => cb.checked = false);
}


function fetchLieferscheinItems(lieferschein_id, lieferscheinNumber, customer_id) {

    fetch(`/lieferschein-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id, lieferschein_id }),
    })
        .then(res => res.json())
        .then(data => {
            renderLieferscheinItemsTable(lieferschein_id, lieferscheinNumber, data.items);
        })
        .catch(err => {
            console.error(`Error fetching items for Lieferschein ${lieferschein_id}:`, err);
        });
}

function toggleDropdown(menuId) {
    const dropdown = document.getElementById(menuId);
    if (dropdown) dropdown.classList.toggle('open');
}

function renderLieferscheinItemsTable(id, number, items) {
    const container = document.getElementById('selectedLieferscheinItemsContainer');
    
    const section = document.createElement('div');
    section.id = `lieferscheinTable_${id}`;
    section.innerHTML = `<h4>Lieferschein #${number}</h4>`;

    const table = document.createElement('table');
    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Beschreibung</th>
            <th>Anzahl</th>
            <th>Preis</th>
            <th>Steuer</th>
            <th>Gesamt</th>
        </tr>
    `;

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
            <td>${item.tax}</td>
            <td>${item.total}</td>
        `;
        table.appendChild(row);
    });

    section.appendChild(table);
    container.appendChild(section);
}

function removeLieferscheinItemsTable(id) {
    const section = document.getElementById(`lieferscheinTable_${id}`);
    if (section) section.remove();
}

// Rechnung PDF generation start

function collectSelectedIDs() {
    const lieferscheinIDs = [];
    const zuschlagIDs = [];

    document.querySelectorAll('#selectedLieferscheinItemsContainer > div[id^="lieferscheinTable_"]')
        .forEach(div => {
            const id = div.id.split('_')[1];
            if (id) lieferscheinIDs.push(parseInt(id));
        });

    document.querySelectorAll('#selectedZuschlagContainer > div[id^="zuschlagTable_"]')
        .forEach(div => {
            const id = div.id.split('_')[1];
            if (id) zuschlagIDs.push(parseInt(id));
        });

    return {
        lieferscheinIDs,
        zuschlagIDs
    };
}

async function submitPDFRechnung(customer_id) {

    const selected = collectSelectedIDs();
        
    const payload = {
        RealRechnungNumber: document.getElementById("RealRechnungNumber").value,
        RechnungDeliveryDate: document.getElementById("RechnungDeliveryDate").value,
        RechnungDueDate: document.getElementById("RechnungDueDate").value,
        RechnungContractNo: document.getElementById("RechnungContractNo").value,
        RechnungOrderNo: document.getElementById("RechnungOrderNo").value,
        lieferschein_id: selected.lieferscheinIDs,
        zuschlag_id: selected.zuschlagIDs,
        customer_id
    }

    const response = await fetch("/customer-generate-pdf-RECH", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(data);
    if (response.ok) {
        
        console.log("New file path:", data.filePath);
        const statusDiv = document.getElementById("Rechnungstatus");

        console.log(statusDiv);
        
        const linkOpen = document.createElement("a");
        linkOpen.href = `${data.filePath}?t=${new Date().getTime()}`;
        linkOpen.target = "_blank";
        linkOpen.textContent = "Open PDF";

        const linkDownload = document.createElement("a");
        linkDownload.href = `${data.filePath}?t=${new Date().getTime()}`;
        linkDownload.download = "";
        linkDownload.textContent = "Download PDF";

        // Clear existing content
        statusDiv.innerHTML = "";

        // Append new links
        statusDiv.appendChild(linkOpen);
        statusDiv.appendChild(document.createTextNode(" | "));
        statusDiv.appendChild(linkDownload);

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


// Rechnung PDF generation end







// ----- Rechnung From Customer Page End -----