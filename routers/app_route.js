require('dotenv').config()
const express = require('express');
const router = express.Router();
const{authenticateToken} = require('../helper/helper.js')


const {GetAdmin, PostAdmin, GetInvoice, PostUploadPDF, GeneratedPDF, PushtoDB, addComment, cancelInvoiceOption, addPayment, sortingFunction} = require('../controllers/app_controllers');

const {GetCustomers, addCustomer, deleteCustomer, pauseCustomer, unpauseCustomer, getAllCustomerData, editCustomer, getCustomerPage, generateLieferscheinPDF, getLieferscheinNumber, createLieferschein, getRechnungNumber, getLieferscheinItems, getZuschlags, getItems, generateRechnungPDF} = require('../controllers/customer_controller.js');

const {getServicesPage, addService, getAllServiceData, editService, deleteService} = require('../controllers/services_controller.js');

const {getItemsPage, addItem, getAllItemData, deleteItem, editItem} = require('../controllers/items_controller.js');

// Login start
router.get('/', GetAdmin);

router.post('/', PostAdmin);

router.get('/login', GetAdmin);

router.post('/login', PostAdmin);
// Login end

//Invoice start
router.get('/invoice', authenticateToken, GetInvoice)

router.post('/upload', authenticateToken, PostUploadPDF);

router.post('/generate-pdf', authenticateToken, GeneratedPDF)

router.post('/pushtodb', authenticateToken, PushtoDB)

router.post('/submit-comment', authenticateToken, addComment)

router.post('/cancel-invoice', authenticateToken, cancelInvoiceOption)

router.post('/submit-payment', authenticateToken, addPayment)

router.get('/sort', authenticateToken, sortingFunction)
//Invoice end

//customer start
router.get('/customers', authenticateToken, GetCustomers)

router.post('/create-customer', authenticateToken, addCustomer)

router.post('/delete-customer', authenticateToken, deleteCustomer)

router.post('/pause-customer', authenticateToken, pauseCustomer)

router.post('/unpause-customer', authenticateToken, unpauseCustomer)

router.get('/fetch-customer/:id', authenticateToken, getAllCustomerData)

router.post('/edit-customer', authenticateToken, editCustomer)

router.get('/customer/:id', authenticateToken, getCustomerPage)

router.post('/customer-generate-pdf-LF', authenticateToken ,generateLieferscheinPDF)

router.post('/customer-generate-pdf-RECH', authenticateToken ,generateRechnungPDF)

router.post('/fetch-leiferschein-number', authenticateToken, getLieferscheinNumber)

router.post('/create-lieferschein', authenticateToken, createLieferschein)

router.post('/fetch-Rechnung-number', authenticateToken, getRechnungNumber)

router.post('/lieferschein-items', authenticateToken, getLieferscheinItems)

router.post('/zuschlag-details', authenticateToken, getZuschlags)

router.post('/item-details', authenticateToken, getItems)
// customer end

// services start
router.get('/services', authenticateToken, getServicesPage)

router.post('/create-service', authenticateToken, addService)

router.post('/delete-service', authenticateToken, deleteService)

router.get('/fetch-service/:id', authenticateToken, getAllServiceData)

router.post('/edit-service', authenticateToken, editService)
//services end

// items start
router.get('/items', authenticateToken, getItemsPage)

router.post('/create-item', authenticateToken, addItem)

router.post('/delete-item', authenticateToken, deleteItem)

router.get('/fetch-item/:id', authenticateToken, getAllItemData)

router.post('/edit-item', authenticateToken, editItem)
//items end


module.exports = router;