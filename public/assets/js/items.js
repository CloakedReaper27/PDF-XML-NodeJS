function openItem() {
    document.getElementById('itemModal').style.display = 'flex';
}

function closeItem() {
    document.getElementById('itemForm').reset();
    document.getElementById('itemModal').style.display = 'none';
}

async function handleItemSubmit() {
    
    const ItemName = document.getElementById("ItemName").value;
    const Beschreibung = document.getElementById("Beschreibung").value;
    const Steuer = document.getElementById("Steuer").value;
    const Preis = document.getElementById("Preis").value;

    const response = await fetch("/create-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            ItemName,
            Beschreibung,
            Steuer,
            Preis
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
function openEditItem(item_id) {

    fetch(`/fetch-item/${item_id}`)
        .then(res => res.json())
        .then(data => {

            const item = data.item;

            document.getElementById('ItemEditedID').value = item_id;
            document.getElementById("NewName").value = item.name;
            document.getElementById("NewBeschreibung").value = item.description;
            document.getElementById("NewSteuer").value = item.tax;
            document.getElementById("NewPreis").value = item.price;

            document.getElementById('editItemModal').style.display = 'flex';
        })
        .catch(err => {
            console.error('Error fetching item:', err);
        });
}

function closeEditItem() {
    document.getElementById('editItemForm').reset();
    document.getElementById('editItemModal').style.display = 'none';
}


async function handleEditedItem(){

    const currentUrl = window.location.href;
    const NewName = document.getElementById("NewName").value;
    const NewBeschreibung = document.getElementById("NewBeschreibung").value;
    const NewSteuer = document.getElementById("NewSteuer").value;
    const NewPreis = document.getElementById("NewPreis").value;
    const item_id = document.getElementById('ItemEditedID').value;

    const response = await fetch("/edit-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            NewName,
            NewBeschreibung,
            NewSteuer,
            NewPreis,
            item_id,
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
function openDeleteItem (item_id) {

    document.getElementById('ItemDeleteID').value = item_id;

    document.getElementById('deletethisitem').style.display = 'flex';
}

function closeDeleteItem () {
    document.getElementById('deletethisitem').style.display = 'none';
}
async function deleteItem(){

    const item_id = document.getElementById('ItemDeleteID').value;

    const response = await fetch("/delete-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            item_id
        }),
    });

    const data = await response.json();
    
    if (response.ok) {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl; 
        }
    }

}
// Delete Customer Function End