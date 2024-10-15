const {  insertClient,
    updateClient,
    getAllClient,
    getSingleClient,
    deleteClient} = require('../Controllers/ClientController');
const express = require('express');
const router = express.Router();

router.post('/insertClient',insertClient);
router.put('/updateClient',updateClient,);
router.get('/getAllClient',getAllClient);
router.post('/getSingleClient',getSingleClient);
router.delete('/deleteClient',deleteClient);

module.exports=router;
