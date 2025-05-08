function openService() {
    document.getElementById('serviceModal').style.display = 'flex';
}

function closeService() {
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceModal').style.display = 'none';
}

async function handleServiceSubmit() {
    
    const ZuschlagName = document.getElementById("ZuschlagName").value;
    const Beschreibung = document.getElementById("Beschreibung").value;
    const Steuer = document.getElementById("Steuer").value;
    const Preis = document.getElementById("Preis").value;

    const response = await fetch("/create-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            ZuschlagName,
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
function openEditService(service_id) {

    fetch(`/fetch-service/${service_id}`)
        .then(res => res.json())
        .then(data => {

            const service = data.service;

            document.getElementById('ServiceEditedID').value = service_id;
            document.getElementById("NewZuschlagName").value = service.name;
            document.getElementById("NewBeschreibung").value = service.description;
            document.getElementById("NewSteuer").value = service.tax;
            document.getElementById("NewPreis").value = service.price;

            document.getElementById('editServiceModal').style.display = 'flex';
        })
        .catch(err => {
            console.error('Error fetching service:', err);
        });
}

function closeEditCustomer() {
    document.getElementById('editServiceForm').reset();
    document.getElementById('editServiceModal').style.display = 'none';
}


async function handleEditedCustomer(){

    const currentUrl = window.location.href;
    const NewZuschlagName = document.getElementById("NewZuschlagName").value;
    const NewBeschreibung = document.getElementById("NewBeschreibung").value;
    const NewSteuer = document.getElementById("NewSteuer").value;
    const NewPreis = document.getElementById("NewPreis").value;
    const service_id = document.getElementById('ServiceEditedID').value;

    const response = await fetch("/edit-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            NewZuschlagName,
            NewBeschreibung,
            NewSteuer,
            NewPreis,
            service_id,
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
async function deleteService(service_id){

    const response = await fetch("/delete-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            service_id
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